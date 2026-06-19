/**
 * One-time admin seeding script
 * Run once with: npx ts-node scripts/seed-admin.ts
 * Then just login with ADMIN_EMAIL and ADMIN_PASSWORD from .env.local
 */

import { auth } from "../lib/auth";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  console.log(`🌱 Seeding admin account: ${adminEmail}`);

  try {
    // Try to create admin user
    const response = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: "Admin",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.message?.includes("already exists")) {
        console.log("✅ Admin account already exists");
      } else {
        throw new Error(error.message || "Failed to create admin");
      }
    } else {
      console.log("✅ Admin account created successfully!");
    }

    console.log("\n📝 Admin Login Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n✨ You can now login immediately!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
