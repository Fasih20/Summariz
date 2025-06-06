import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lectures: defineTable({
    email: v.string(),
    summary: v.optional(v.string()),
    createdAt: v.number(),
  }),
});