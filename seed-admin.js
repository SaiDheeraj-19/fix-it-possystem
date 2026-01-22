const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Users to create (using environment variables for security)
    const users = [
        {
            name: 'Dinesh',
            email: process.env.ADMIN_EMAIL || 'admin@fixit.com',
            password: process.env.ADMIN_PASSWORD || 'ChangeMeDirectlyInDB!123',
            role: 'ADMIN'
        },
        {
            name: 'tech',
            email: 'tech@fixit.com',
            password: process.env.TECH_PASSWORD || 'DevOnlyPass!456',
            role: 'ADMIN'
        },
        {
            name: 'staff',
            email: 'staff@fixit.com',
            password: process.env.STAFF_PASSWORD || 'StaffOnlyPass!789',
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
