import { prisma } from "./lib/prisma.js";
import { hashPassword } from "./utils/password.js";

async function main() {
    const hashObj = await hashPassword("letmein");

    console.log(hashObj)
    // Create a new user with a post
    const user = await prisma.user.create({
        data: {
            name: "John",
            email: "john@prisma.io",
            password: hashObj.hashedPassword.toString('hex'),
            salt: hashObj.salt.toString('hex'),
        },
    });
    console.log("Created user:", user);

    // Fetch all users with their posts
    const allUsers = await prisma.user.findMany({
        include: {
            posts: true,
        },
    });
    console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });