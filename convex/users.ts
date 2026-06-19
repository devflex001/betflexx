import { query } from "./_generated/server";

async function getAuthUserId(ctx: any) {
  return await ctx.auth.getUserIdentity().then((identity: any) => identity?.subject);
}

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});
