require("dotenv").config({ path: ".env.local" });

const { PrismaClient, UserRole } = require("@prisma/client");
const prisma = new PrismaClient();
const userId = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim();
const email = "carlos@waystar.is";

if (!userId) {
  console.error("ADMIN_EMAILS is not set");
  process.exit(1);
}

async function ensureAdmin() {
  await prisma.profile.upsert({
    where: { userId },
    update: {
      role: UserRole.SUPER_ADMIN,
      email,
      firstName: "Carlos",
    },
    create: {
      userId,
      role: UserRole.SUPER_ADMIN,
      firstName: "Carlos",
      email,
    },
  });
  console.log(`Ensured super admin for userId=${userId}`);
}

ensureAdmin()
  .catch((error) => {
    console.error("Failed to ensure admin profile", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
