import { betterAuth } from "better-auth";
import { ConvexAdapter } from "better-auth/adapters/convex";
import { credential } from "better-auth/plugins";

/**
 * BetterAuth configuration for Bet Flow
 * Authentication: Phone Number + Password ONLY
 * No email authentication
 */
export const auth = betterAuth({
  database: new ConvexAdapter(),
  appName: "Bet Flow",
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],

  // Disable email/password - using phone + password only
  emailAndPassword: {
    enabled: false,
  },

  // Phone + Password credential authentication plugin
  plugins: [
    credential({
      async fields() {
        return {
          phone: {
            label: "Phone",
            inputType: "text",
          },
          password: {
            label: "Password",
            inputType: "password",
          },
        };
      },
      async authorize(ctx, data) {
        // Get phone and password from request
        const phone = data.phone as string;
        const password = data.password as string;

        if (!phone || !password) {
          return null;
        }

        // Find user by phone
        const user = await ctx.adapter.findUserByEmail(phone); // Using email field mapping for phone lookup

        if (!user) {
          return null;
        }

        // Get account with password
        const account = await ctx.adapter.findAccount({
          userId: user.id,
          providerId: "credential",
        });

        if (!account || !account.password) {
          return null;
        }

        // Verify password (BetterAuth handles hashing)
        const isPasswordValid = await ctx.adapter.verifyPassword(
          password,
          account.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
      async signUpFields() {
        return {
          name: {
            label: "Full Name",
            inputType: "text",
          },
          phone: {
            label: "Phone Number",
            inputType: "tel",
          },
          password: {
            label: "Password",
            inputType: "password",
          },
        };
      },
      async signUp(ctx, data) {
        const name = data.name as string;
        const phone = data.phone as string;
        const password = data.password as string;

        if (!name || !phone || !password) {
          throw new Error("Name, phone, and password are required");
        }

        // Create user (using phone as identifier)
        const user = await ctx.adapter.createUser({
          email: phone, // Store phone in email field for compatibility
          emailVerified: false,
          name,
          image: null,
        });

        // Create account with password
        await ctx.adapter.createAccount({
          userId: user.id,
          providerId: "credential",
          providerAccountId: phone,
          password,
        });

        return user;
      },
    }),
  ],

  // User fields configuration
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: true,
      },
      phoneVerified: {
        type: "boolean",
        required: false,
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update every day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // CORS configuration
  cors: {
    origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    credentials: true,
    maxAge: 60 * 60 * 24,
  },

  // Account linking
  accountLinking: {
    enabled: false,
  },

  // Create user on sign up
  createUserOnSignUp: true,
});

export type Session = typeof auth.$Inferred.Session;
export type User = typeof auth.$Inferred.User;
