import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createScan = internalMutation({
  args: { domain: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scans", {
      domain: args.domain,
      status: "pending",
      userId: args.userId,
    });
  },
});

export const updateScanStatus = internalMutation({
  args: {
    scanId: v.id("scans"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, {
      status: args.status,
      error: args.error,
    });
  },
});

export const saveSubdomainResult = internalMutation({
  args: {
    scanId: v.id("scans"),
    subdomain: v.string(),
    ip: v.optional(v.string()),
    isp: v.optional(v.string()),
    ports: v.array(v.number()),
    services: v.array(v.string()),
    exposures: v.array(
      v.object({
        path: v.string(),
        risk: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
        status: v.number(),
      })
    ),
    risk: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("subdomains", args);
  },
});

export const completeScan = internalMutation({
  args: {
    scanId: v.id("scans"),
    riskScore: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
    subdomainCount: v.number(),
    highRiskCount: v.number(),
    mediumRiskCount: v.number(),
    lowRiskCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, {
      status: "completed",
      riskScore: args.riskScore,
      subdomainCount: args.subdomainCount,
      highRiskCount: args.highRiskCount,
      mediumRiskCount: args.mediumRiskCount,
      lowRiskCount: args.lowRiskCount,
    });
  },
});
