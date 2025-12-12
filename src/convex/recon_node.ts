"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper to fetch subdomains from SecurityTrails
async function fetchSubdomains(domain: string, apiKey: string) {
  const response = await fetch(
    `https://api.securitytrails.com/v1/domain/${domain}/subdomains`,
    {
      headers: {
        APIKEY: apiKey,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`SecurityTrails API Error: ${response.statusText}`);
  }
  const data = await response.json();
  return (data.subdomains as string[]).map((s: any) => `${s}.${domain}`);
}

// Helper to fetch IP and ports from Shodan
async function fetchShodanData(host: string, apiKey: string) {
  try {
    // First resolve DNS
    const dnsRes = await fetch(
      `https://api.shodan.io/dns/resolve?hostnames=${host}&key=${apiKey}`
    );
    if (!dnsRes.ok) return null;
    const dnsData = await dnsRes.json();
    const ip = dnsData[host];

    if (!ip) return null;

    // Then get host details
    const hostRes = await fetch(
      `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`
    );
    if (!hostRes.ok) return { ip, ports: [], services: [], isp: "Unknown" };
    
    const hostData = await hostRes.json();
    return {
      ip,
      ports: hostData.ports || [],
      services: hostData.data?.map((d: any) => d.product || d.port.toString()) || [],
      isp: hostData.isp || "Unknown",
    };
  } catch (e) {
    console.error(`Shodan error for ${host}:`, e);
    return null;
  }
}

// Helper to check HTTP exposures
async function checkExposures(subdomain: string) {
  const paths = [
    { path: "/.git/", risk: "High" },
    { path: "/.env", risk: "High" },
    { path: "/backup.zip", risk: "High" },
    { path: "/db.sql", risk: "High" },
    { path: "/config.php", risk: "High" },
  ];

  const exposures = [];
  
  // We'll try both http and https
  const protocols = ["https://", "http://"];

  for (const p of paths) {
    let found = false;
    for (const proto of protocols) {
      if (found) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const res = await fetch(`${proto}${subdomain}${p.path}`, {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.status === 200) {
          exposures.push({
            path: p.path,
            risk: p.risk as "High" | "Medium" | "Low",
            status: 200,
          });
          found = true;
        }
      } catch (e) {
        // Ignore connection errors
      }
    }
  }
  return exposures;
}

export const performRecon = action({
  args: {
    domain: v.string(),
    securityTrailsKey: v.optional(v.string()),
    shodanKey: v.optional(v.string()),
    scanId: v.id("scans"),
  },
  handler: async (ctx, args) => {
    const { domain, scanId } = args;
    const securityTrailsKey = args.securityTrailsKey || process.env.SECURITYTRAILS_API_KEY;
    const shodanKey = args.shodanKey || process.env.SHODAN_API_KEY;

    if (!securityTrailsKey) {
      await ctx.runMutation(internal.recon_db.updateScanStatus, {
        scanId,
        status: "failed",
        error: "Missing SecurityTrails API Key",
      });
      return;
    }

    try {
      await ctx.runMutation(internal.recon_db.updateScanStatus, {
        scanId,
        status: "processing",
      });

      // Step 1: Subdomains
      const subdomains = await fetchSubdomains(domain, securityTrailsKey);
      
      // Limit to first 20 for "Easy Version" / Demo purposes to avoid timeouts/rate limits
      const limitedSubdomains = subdomains.slice(0, 20); 
      // Add the root domain too
      if (!limitedSubdomains.includes(domain)) limitedSubdomains.unshift(domain);

      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;

      // Process each subdomain
      for (const sub of limitedSubdomains) {
        // Step 2: Shodan
        let shodanData = null;
        if (shodanKey) {
          shodanData = await fetchShodanData(sub, shodanKey);
        }

        // Step 3: Exposures
        const exposures = await checkExposures(sub);

        // Calculate Risk
        let risk: "High" | "Medium" | "Low" = "Low";
        if (exposures.length > 0) risk = "High";
        else if (shodanData && shodanData.ports.length > 0) risk = "Medium";

        if (risk === "High") highRiskCount++;
        else if (risk === "Medium") mediumRiskCount++;
        else lowRiskCount++;

        // Save Subdomain Result
        await ctx.runMutation(internal.recon_db.saveSubdomainResult, {
          scanId,
          subdomain: sub,
          ip: shodanData?.ip,
          isp: shodanData?.isp,
          ports: shodanData?.ports || [],
          services: shodanData?.services || [],
          exposures,
          risk,
        });
      }

      // Step 4: Finalize
      let overallRisk: "High" | "Medium" | "Low" = "Low";
      if (highRiskCount > 0) overallRisk = "High";
      else if (mediumRiskCount > 0) overallRisk = "Medium";

      await ctx.runMutation(internal.recon_db.completeScan, {
        scanId,
        riskScore: overallRisk,
        subdomainCount: limitedSubdomains.length,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
      });

    } catch (error: any) {
      await ctx.runMutation(internal.recon_db.updateScanStatus, {
        scanId,
        status: "failed",
        error: error.message || "Unknown error occurred",
      });
    }
  },
});