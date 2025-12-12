import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Search, Shield, AlertTriangle, Download, 
  Server, Activity, ChevronDown, FileJson, FileText, 
  Home, Github, Linkedin, Mail, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { RiskDistributionChart, PortsChart, StatCard, FindingsTable } from "@/components/ReconWidgets";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { useNavigate, useLocation } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReconLogo } from "@/components/ReconLogo";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [domain, setDomain] = useState(location.state?.domain || "");
  const [securityTrailsKey, setSecurityTrailsKey] = useState("");
  const [shodanKey, setShodanKey] = useState("");
  const [currentScanId, setCurrentScanId] = useState<Id<"scans"> | null>(null);
  
  const startScan = useMutation(api.api_recon.startScan);
  const scan = useQuery(api.api_recon.getScan, currentScanId ? { scanId: currentScanId } : "skip");
  const subdomains = useQuery(api.api_recon.getSubdomains, currentScanId ? { scanId: currentScanId } : "skip");

  // Auto-start scan if domain is passed from landing page and not yet started
  useEffect(() => {
    if (location.state?.domain && !currentScanId) {
      // Optional: Auto-start logic could go here, but usually better to let user confirm/add keys
    }
  }, [location.state, currentScanId]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    try {
      const id = await startScan({ 
        domain,
        securityTrailsKey: securityTrailsKey || undefined,
        shodanKey: shodanKey || undefined
      });
      setCurrentScanId(id);
      toast.success("Scan started", { description: `Analyzing ${domain}...` });
    } catch (error) {
      toast.error("Failed to start scan", { description: String(error) });
    }
  };

  const generatePDF = () => {
    if (!scan || !subdomains) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Bug Bounty Recon Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Domain: ${scan.domain}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Risk Score: ${scan.riskScore || "N/A"}`, 20, 49);
    
    doc.text("Summary:", 20, 60);
    doc.text(`- Total Subdomains: ${scan.subdomainCount || 0}`, 25, 67);
    doc.text(`- High Risk Findings: ${scan.highRiskCount || 0}`, 25, 74);
    doc.text(`- Medium Risk Findings: ${scan.mediumRiskCount || 0}`, 25, 81);
    
    doc.text("Critical Findings:", 20, 95);
    let y = 105;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subdomains.filter((s: any) => s.risk === "High").forEach((sub: any) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`- ${sub.subdomain} (${sub.ip || "No IP"})`, 25, y);
      y += 7;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sub.exposures.forEach((exp: any) => {
        doc.setTextColor(200, 0, 0);
        doc.text(`  ! Exposed: ${exp.path}`, 30, y);
        doc.setTextColor(0, 0, 0);
        y += 7;
      });
    });
    
    doc.save(`${scan.domain}-recon-report.pdf`);
    toast.success("Report downloaded");
  };

  const downloadJSON = () => {
    if (!scan || !subdomains) return;
    const data = { scan, subdomains };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scan.domain}-recon.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON report downloaded");
  };

  const downloadMarkdown = () => {
    if (!scan || !subdomains) return;
    let md = `# Bug Bounty Recon Report: ${scan.domain}\n\n`;
    md += `Date: ${new Date().toLocaleDateString()}\n`;
    md += `Risk Score: ${scan.riskScore || "N/A"}\n\n`;
    md += `## Summary\n`;
    md += `- Total Subdomains: ${scan.subdomainCount || 0}\n`;
    md += `- High Risk Findings: ${scan.highRiskCount || 0}\n`;
    md += `- Medium Risk Findings: ${scan.mediumRiskCount || 0}\n\n`;
    md += `## Critical Findings\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subdomains.filter((s: any) => s.risk === "High").forEach((sub: any) => {
      md += `### ${sub.subdomain}\n`;
      md += `- IP: ${sub.ip || "N/A"}\n`;
      if (sub.exposures.length > 0) {
        md += `- Exposures:\n`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sub.exposures.forEach((exp: any) => {
          md += `  - ${exp.path} (HTTP ${exp.status})\n`;
        });
      }
      md += `\n`;
    });
    
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scan.domain}-recon.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown report downloaded");
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0c29] text-white overflow-x-hidden font-sans selection:bg-purple-500/30">
      {/* Global Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <ReconLogo size={32} />
                <div>
                  <h1 className="font-bold text-lg tracking-tight leading-none">ReconFlow</h1>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider hidden sm:block leading-none mt-1">Pipeline Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Shield className="h-4 w-4 text-white/50" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
          
          {/* Input Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
          >
            <form onSubmit={handleScan} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input 
                    placeholder="Enter domain (e.g., example.com)" 
                    className="h-12 pl-12 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 border-none"
                  disabled={!domain || (scan?.status === "processing" || scan?.status === "pending")}
                >
                  {scan?.status === "processing" ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Activity className="mr-2 h-5 w-5" />}
                  Start Recon
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 ml-1">SecurityTrails API Key (Optional)</label>
                  <Input 
                    placeholder="Enter key..." 
                    className="bg-black/20 border-white/10 text-white/80 text-sm h-10"
                    type="password"
                    value={securityTrailsKey}
                    onChange={(e) => setSecurityTrailsKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 ml-1">Shodan API Key (Optional)</label>
                  <Input 
                    placeholder="Enter key..." 
                    className="bg-black/20 border-white/10 text-white/80 text-sm h-10"
                    type="password"
                    value={shodanKey}
                    onChange={(e) => setShodanKey(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/30 text-center uppercase tracking-wider">
                Keys are optional if configured in environment variables
              </p>
            </form>
          </motion.div>

          {/* Results Section */}
          {scan && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Scan Status Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/40 uppercase tracking-wider">Scan Results</span>
                    <span className="text-xl font-bold text-white">{scan.domain}</span>
                  </div>
                  <Badge variant="outline" className={`
                    capitalize border-0 px-3 py-1
                    ${scan.status === "completed" ? "bg-green-500/20 text-green-300" : 
                      scan.status === "failed" ? "bg-red-500/20 text-red-300" : 
                      "bg-yellow-500/20 text-yellow-300"}
                  `}>
                    {scan.status}
                  </Badge>
                </div>

                {scan.status === "completed" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1635] border-white/10 text-white backdrop-blur-xl">
                      <DropdownMenuItem onClick={generatePDF} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                        <FileText className="mr-2 h-4 w-4" /> PDF Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadMarkdown} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                        <FileText className="mr-2 h-4 w-4" /> Markdown Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadJSON} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                        <FileJson className="mr-2 h-4 w-4" /> JSON Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {scan.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  {scan.error}
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Subdomains" 
                  value={scan.subdomainCount || 0} 
                  icon={Server}
                  color="text-blue-400"
                  bg="bg-blue-500/10"
                />
                <StatCard 
                  title="High Risk" 
                  value={scan.highRiskCount || 0} 
                  icon={AlertTriangle}
                  color="text-red-400"
                  bg="bg-red-500/10"
                />
                <StatCard 
                  title="Medium Risk" 
                  value={scan.mediumRiskCount || 0} 
                  icon={Activity}
                  color="text-yellow-400"
                  bg="bg-yellow-500/10"
                />
                <StatCard 
                  title="Overall Risk" 
                  value={scan.riskScore || "N/A"} 
                  icon={Shield}
                  color={
                    scan.riskScore === "High" ? "text-red-400" : 
                    scan.riskScore === "Medium" ? "text-yellow-400" : "text-green-400"
                  }
                  bg={
                    scan.riskScore === "High" ? "bg-red-500/10" : 
                    scan.riskScore === "Medium" ? "bg-yellow-500/10" : "bg-green-500/10"
                  }
                />
              </div>

              {/* Data Visualization Row */}
              {subdomains && subdomains.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RiskDistributionChart stats={{
                    subdomainCount: scan.subdomainCount || 0,
                    highRiskCount: scan.highRiskCount || 0,
                    mediumRiskCount: scan.mediumRiskCount || 0,
                    lowRiskCount: scan.lowRiskCount || 0
                  }} />
                  <PortsChart subdomains={subdomains} />
                </div>
              ) : (
                <div className="p-12 rounded-2xl border border-white/10 bg-white/5 text-center text-white/40">
                  No data available yet.
                </div>
              )}

              {/* Critical Findings Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-purple-400" />
                  Critical Findings
                </h3>
                {subdomains && subdomains.length > 0 ? (
                  <FindingsTable subdomains={subdomains} />
                ) : (
                  <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-center text-white/40">
                    No critical findings detected.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer Contact Strip */}
        <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <ReconLogo size={32} />
              <div>
                <h4 className="font-bold text-sm text-white">ReconFlow</h4>
                <p className="text-xs text-white/40">Automated Recon for Bug Bounty Hunters</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/in/nshul17/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://github.com/LousyCake" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Github className="h-4 w-4" />
              </a>
              <a href="mailto:nshul.shukla@gmail.com" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}