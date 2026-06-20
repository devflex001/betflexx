import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Migration: Remove userId fields from wallets, bets, and transactions
 * Since the system now runs without authentication, all user-specific fields are removed.
 */
export const migrateRemoveUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    // Migrate wallets: remove userId field
    const wallets = await ctx.db.query("wallets").collect();
    let walletsUpdated = 0;
    for (const wallet of wallets) {
      if ("userId" in wallet) {
        await ctx.db.patch(wallet._id, {
          balance: wallet.balance,
        });
        walletsUpdated++;
      }
    }

    // Migrate bets: remove userId field
    const bets = await ctx.db.query("bets").collect();
    let betsUpdated = 0;
    for (const bet of bets) {
      if ("userId" in bet) {
        const { userId, ...rest } = bet as any;
        await ctx.db.replace(bet._id, rest);
        betsUpdated++;
      }
    }

    // Migrate transactions: remove userId field
    const transactions = await ctx.db.query("transactions").collect();
    let transactionsUpdated = 0;
    for (const transaction of transactions) {
      if ("userId" in transaction) {
        const { userId, ...rest } = transaction as any;
        await ctx.db.replace(transaction._id, rest);
        transactionsUpdated++;
      }
    }

    return {
      walletsUpdated,
      betsUpdated,
      transactionsUpdated,
    };
  },
});
