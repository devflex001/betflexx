/**
 * Admin seeding script (TypeScript version).
 * For the ESM .mjs version, use: pnpm seed:admin
 *
 * This script registers the admin user via the custom auth API.
 */

async function seedAdmin() {
  const adminPhone = process.env.ADMIN_EMAIL || "254712345678";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log(`🌱 Seeding admin account: ${adminPhone}`);

  try {
    const response = await fetch(`${appUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: adminPhone, password: adminPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 409) {
        console.log("✅ Admin account already exists — skipping registration.");
      } else {
        throw new Error(error.message || "Failed to create admin");
      }
    } else {
      console.log("✅ Admin account created successfully!");
    }

    console.log("\n📝 Admin Login Credentials:");
    console.log(`   Phone:    ${adminPhone}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n✨ You can now login immediately!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
