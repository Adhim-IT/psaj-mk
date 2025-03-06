const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  // Data Users
  const usersData = await Promise.all([
    {
      id: uuidv4(),
      name: "Admin",
      email: "admin@teencode.com",
      email_verified_at: new Date(),
      password: await hashPassword("admin123"), // Hash password
      remember_token: null,
      image: "https://example.com/admin.jpg",
      role_id: "cm7wzebij0000fgngw776djak",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Mentor",
      email: "mentor123@teencode.com",
      email_verified_at: new Date(),
      password: await hashPassword("mentor"), // Hash password
      remember_token: null,
      image: "https://example.com/mentor.jpg",
      role_id: "cm7wzebj10002fgngkkc6rkdk",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Writer User",
      email: "writer@teencode.com",
      email_verified_at: new Date(),
      password: await hashPassword("writer123"), // Hash password
      remember_token: null,
      image: "https://example.com/writer.jpg",
      role_id: "cm7wzebj60003fgngf5yl85ka",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // Insert Users
  for (const user of usersData) {
    console.log("Inserting user:", user);
    await prisma.user.create({
      data: user,
    });
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
