/**
 * Flash-Sale Concurrency & Race Condition Verification Script
 * 
 * Simulates high-throughput concurrent checkout attempts against a limited-stock product
 * to verify database transaction isolation and inventory lock integrity.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runConcurrencyStressTest() {
  console.log('\n======================================================');
  console.log('⚡ PULSECOMMERCE CONCURRENCY & RACE CONDITION TEST ⚡');
  console.log('======================================================\n');

  // 1. Create an isolated flash-sale product with exactly 5 units
  const category = await prisma.category.findFirst();
  if (!category) {
    console.error('❌ Please run `npm run prisma:seed` first!');
    process.exit(1);
  }

  const testProduct = await prisma.product.create({
    data: {
      name: `RTX 5090 Prototype [TEST-${Date.now()}]`,
      slug: `rtx-5090-test-${Date.now()}`,
      description: 'Concurrency stress test artifact item',
      price: 1999.99,
      stock: 5, // ONLY 5 AVAILABLE!
      categoryId: category.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800']),
    },
  });

  console.log(`📦 Created Test Flash Product: "${testProduct.name}"`);
  console.log(`📊 Initial Stock Count: ${testProduct.stock} units\n`);

  const CONCURRENT_USERS = 25;
  console.log(`🚀 Spawning ${CONCURRENT_USERS} concurrent purchase requests simultaneously...`);

  // Simple atomic reservation simulation
  async function attemptPurchase(userId) {
    const sessionId = `sim_session_${userId}_${Date.now()}`;
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check active locks
        const activeLocks = await tx.inventoryLock.aggregate({
          where: {
            productId: testProduct.id,
            status: 'HELD',
            expiresAt: { gt: new Date() },
          },
          _sum: { quantity: true },
        });

        const heldQty = activeLocks._sum.quantity || 0;
        const available = testProduct.stock - heldQty;

        if (available < 1) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        // Lock 1 unit
        await tx.inventoryLock.create({
          data: {
            productId: testProduct.id,
            quantity: 1,
            sessionId: sessionId,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            status: 'HELD',
          },
        });

        return { success: true, sessionId };
      });

      const elapsed = Date.now() - startTime;
      return { userId, success: true, elapsed };
    } catch (err) {
      const elapsed = Date.now() - startTime;
      return { userId, success: false, reason: err.message, elapsed };
    }
  }

  // Execute all requests concurrently using Promise.all
  const promises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    promises.push(attemptPurchase(i));
  }

  const results = await Promise.all(promises);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n--- 📈 TEST RESULTS SUMMARY ---');
  console.log(`Total Requests Processed : ${results.length}`);
  console.log(`Successful Reservations  : ${successful.length} (Expected: 5)`);
  console.log(`Rejected (Out of Stock)  : ${failed.length} (Expected: ${CONCURRENT_USERS - 5})`);

  // Verify inventory locks
  const totalLocks = await prisma.inventoryLock.count({
    where: { productId: testProduct.id, status: 'HELD' },
  });

  console.log(`Active Inventory Locks   : ${totalLocks}`);

  if (successful.length === 5 && totalLocks === 5) {
    console.log('\n✅ TEST PASSED: Zero race conditions detected. Inventory perfectly protected!');
  } else {
    console.error('\n❌ TEST FAILED: Concurrency violation detected!');
  }

  // Cleanup test product
  await prisma.inventoryLock.deleteMany({ where: { productId: testProduct.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });

  await prisma.$disconnect();
}

runConcurrencyStressTest().catch(console.error);
