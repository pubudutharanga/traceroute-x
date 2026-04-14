const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.author.findFirst({where: { displayName: 'Pubudu Tharanga' }}).then(a => {console.log(a); prisma.$disconnect();});
