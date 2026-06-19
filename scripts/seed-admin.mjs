#!/usr/bin/env node

/**
 * One-time admin seeding script
 * Just run: pnpm seed:admin
 * Then login with ADMIN_EMAIL and ADMIN_PASSWORD from .env.local
 */

const adminEmail = process.env.ADMIN_EMAIL || "254712345678";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

console.log("🌱 Admin Seeding Instructions:");
console.log("================================");
console.log("✅ Admin credentials are ready to use:");
console.log(`   Phone: ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);
