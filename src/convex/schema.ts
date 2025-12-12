import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Recon Pipeline Tables
    scans: defineTable({
      domain: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      riskScore: v.optional(v.union(v.literal("High"), v.literal("Medium"), v.literal("Low"))),
      subdomainCount: v.optional(v.number()),
      highRiskCount: v.optional(v.number()),
      mediumRiskCount: v.optional(v.number()),
      lowRiskCount: v.optional(v.number()),
      userId: v.optional(v.id("users")),
      error: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    subdomains: defineTable({
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
    }).index("by_scan", ["scanId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;