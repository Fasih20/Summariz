import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLecture = mutation({
  args: { email: v.string(), summary: v.optional(v.string()), createdAt: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lectures", args);
  },
});

export const getLectures = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("lectures").filter(q => q.eq(q.field("email"), args.email)).collect();
  },
});

export const getLecturesByEmail = query({
    args: {
      email: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('lectures')
        .filter(q => q.eq(q.field('email'), args.email))
        .collect();
    },
  });

export const getLectureById = query({
  args: { id: v.id("lectures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateLecture = mutation({
  args: { id: v.id("lectures"), summary: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      summary: args.summary,
    });
  },
});
