/**
 * TraceRoute X — Database Seed Script
 * =====================================
 * Creates the initial SUPER_ADMIN account.
 * Run with: pnpm db:seed
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ---- Create Super Admin ----
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!"
  const hashedPassword = await bcrypt.hash(superAdminPassword, 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@traceroutex.com" },
    update: {},
    create: {
      email: "admin@traceroutex.com",
      name: "Super Admin",
      username: "superadmin",
      passwordHash: hashedPassword,
      provider: "CREDENTIALS",
      role: "SUPER_ADMIN",
      isActive: true,
      author: {
        create: {
          displayName: "Admin",
          slug: "admin",
          bio: "Site administrator",
        },
      },
    },
  })

  console.log(`✅ Super Admin created: ${superAdmin.email} (${superAdmin.username})`)

  console.log("\n🎉 Seed completed successfully!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`  Super Admin login:  superadmin / ${superAdminPassword}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("⚠️  Change this password after first login!\n")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
