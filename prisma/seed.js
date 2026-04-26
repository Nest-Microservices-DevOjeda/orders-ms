const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const order = await prisma.order.create({
    data: {
      totalAmount: '79.90',
      totalItems: 2,
      status: 'PENDING',
      paid: false,
      items: {
        create: [
          {
            productId: 1,
            quantity: 1,
            price: '49.90',
          },
          {
            productId: 2,
            quantity: 1,
            price: '30.00',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log(`Seed completed: order ${order.id} with ${order.items.length} items.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
