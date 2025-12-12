import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const startScan = mutation({
  args: {
    domain: v.string(),
    securityTrailsKey: v.optional(v.string()),
    shodanKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the scan record
    const scanId = await ctx.db.insert("scans", {
      domain: args.domain,
      status: "pending",
    });

    // Schedule the action
    // Cast to any to avoid type error before generation
    await ctx.scheduler.runAfter(0, (internal as any).recon_node.performRecon, {
      domain: args.domain,
      scanId,
      securityTrailsKey: args.securityTrailsKey,
      shodanKey: args.shodanKey,
    });

    return scanId;
  },
});

export const getScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scanId);
  },
});

export const getSubdomains = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subdomains")
      .withIndex("by_scan", (q) => q.eq("scanId", args.scanId))
      .collect();
  },
});

export const getRecentScans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scans").order("desc").take(5);
  },
});