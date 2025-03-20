const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log("Seeding database...");

  // Step 1: Insert roles first
  const rolesData = [
    { id: "cm7wzebij0000fgngw776djak", name: "Admin" },
    { id: "cm7wzebj10002fgngkkc6rkdk", name: "Mentor" },
    { id: "cm7wzebj60003fgngf5yl85ka", name: "Writer" },
    { id: "cm7wzebiv0001fgnglebnmv99", name: "Student" },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log("Roles inserted!");

  // Step 2: Insert Users
  const usersData = await Promise.all([
    {
      id: uuidv4(),
      name: "Admin",
      email: "admin@teencode.com",
      email_verified_at: new Date(),
      password: await hashPassword("admin123"),
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
      password: await hashPassword("mentor"),
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
      password: await hashPassword("writer123"),
      remember_token: null,
      image: "https://example.com/writer.jpg",
      role_id: "cm7wzebj60003fgngf5yl85ka",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  for (const user of usersData) {
    console.log("Inserting user:", user);
    await prisma.user.create({ data: user });

    // Insert Mentor if the role matches
    if (user.role_id === "cm7wzebj10002fgngkkc6rkdk") {
      await prisma.mentors.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          username: user.email.split("@")[0],
          name: user.name,
          profile_picture: user.image,
          gender: "male",
          phone: "08123456789",
          city: "Jakarta",
          specialization: "Web Development",
          bio: "Experienced mentor in web development",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // Insert Writer if the role matches
    if (user.role_id === "cm7wzebj60003fgngf5yl85ka") {
      await prisma.writers.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          username: user.email.split("@")[0],
          name: user.name,
          profile_picture: user.image,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
