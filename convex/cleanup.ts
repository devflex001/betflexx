import { mutation } from "./_generated/server";

/**
 * Cleanup: Remove all old user-scoped data
 * Run this once after schema migration to clear incompatible documents
 */
export const cleanupOldData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all wallets (old ones with userId)
    const wallets = await ctx.db.query("wallets").collect();
    for (const wallet of wallets) {
      await ctx.db.delete(wallet._id);
    }

    // Clear all bets (old ones with userId)
    const bets = await ctx.db.query("bets").collect();
    for (const bet of bets) {
      await ctx.db.delete(bet._id);
    }

    // Clear all transactions (old ones with userId)
    const transactions = await ctx.db.query("transactions").collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    return {
      walletsDeleted: wallets.length,
      betsDeleted: bets.length,
      transactionsDeleted: transactions.length,
    };
  },
});
