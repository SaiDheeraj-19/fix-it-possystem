const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('dineshceo@fixit-3', 10);
    
    const admin = await prisma.user.upsert({
        where: { email: 'dinesh@fixit.com' },
        update: {},
        create: {
            name: 'Dinesh',
            email: 'dinesh@fixit.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/verified:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
