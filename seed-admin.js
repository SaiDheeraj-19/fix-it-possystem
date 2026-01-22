const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Users to create
    const users = [
        {
            name: 'Dinesh',
            email: 'dinesh@fixit.com',
            password: 'dineshceo@fixit-3',
            role: 'ADMIN'
        },
        {
            name: 'tech',
            email: 'tech@fixit.com',
            password: 'tech@fixit',
            role: 'ADMIN'
        },
        {
            name: 'tstaff',
            email: 'tstaff@fixit.com',
            password: 'tstaff@fixit',
            role: 'STAFF'
        }
    ];

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                password: hashedPassword,
                role: u.role,
                name: u.name
            },
            create: {
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
            },
        });
        console.log(`User ${u.role} created/verified: ${user.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
