import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "password",
      authorize: async (params, ctx) => {
        const flow = params.flow as string;
        const phone = params.phone as string;
        const secret = params.password as string;

        if (flow === "signUp") {
          if (!secret) throw new Error("Missing password");
          if (secret.length < 6) throw new Error("Password must be at least 6 characters");
          const { user } = await createAccount(ctx, {
            provider: "password",
            account: { id: phone, secret },
            profile: { email: phone, phone },
          });
          return { userId: user._id };
        }

        if (flow === "signIn") {
          if (!secret) throw new Error("Missing password");
          const retrieved = await retrieveAccount(ctx, {
            provider: "password",
            account: { id: phone, secret },
          });
          if (!retrieved) throw new Error("Invalid credentials");
          return { userId: retrieved.user._id };
        }

        throw new Error('Invalid flow param, must be "signUp" or "signIn"');
      },
      crypto: {
        hashSecret: hashPassword,
        verifySecret: async (password, hash) => {
          const computed = await hashPassword(password);
          return computed === hash;
        },
      },
    }),
  ],
});
