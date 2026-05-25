import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url: databaseUrl, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@hearvoip.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      },
    });
    console.log("Admin user created: admin@hearvoip.com / admin123");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
