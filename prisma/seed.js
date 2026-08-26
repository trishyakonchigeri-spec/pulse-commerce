const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PulseCommerce database seed (INR / Indian Rupees)...');

  // 1. Clean existing records
  await prisma.webhookEvent.deleteMany();
  await prisma.inventoryLock.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPass123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pulsecommerce.dev',
      name: 'Sarah Connor (Admin)',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: 'alex@pulsecommerce.dev',
      name: 'Alex Vance',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  console.log('✅ Users seeded (Admin & Customer created)');

  // 3. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Keyboards & Peripherals',
        slug: 'keyboards-peripherals',
        description: 'CNC Aluminum mechanical keyboards, optical switches, and ultra-lightweight mice.',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Audiophile & Sound',
        slug: 'audiophile-sound',
        description: 'Planar magnetic headphones, high-resolution DACs, and studio reference monitors.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
    }),
    prisma.category.create({
      data: {
        name: 'GPUs & Computing',
        slug: 'gpus-computing',
        description: 'Enthusiast graphics accelerators, custom cooling components, and compute hardware.',
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Monitors & Displays',
        slug: 'monitors-displays',
        description: 'Ultra-wide QD-OLED panels, calibrated color accuracy, and high refresh rates.',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
      },
    }),
  ]);

  const [catKeyboards, catAudio, catGpu, catDisplays] = categories;

  // 4. Create Products with Indian Rupee (INR) Pricing
  const flashSaleEndTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

  const productsData = [
    {
      name: 'ApexPro 75% Custom Mechanical Keyboard',
      slug: 'apexpro-75-mechanical-keyboard',
      headline: 'CNC Gasket-Mounted Wireless Board with Hot-Swap Kailh Switches',
      description: 'Engineered from a single block of aerospace-grade aluminum. Features tri-mode wireless (2.4GHz / Bluetooth 5.3 / USB-C), per-key RGB, sound-dampening IXPE foam, and pre-lubed stabilizer bars.',
      price: 19999,
      originalPrice: 24999,
      stock: 7, // Flash sale low stock
      rating: 4.9,
      reviewCount: 42,
      badge: 'LIMITED DROP',
      isFeatured: true,
      isFlashSale: true,
      flashSaleEndsAt: flashSaleEndTime,
      categoryId: catKeyboards.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
      ]),
      specs: JSON.stringify({
        'Case Material': 'CNC 6063 Anodized Aluminum',
        'Mounting Style': 'Gasket Mount with Poron Dampeners',
        'Connectivity': '2.4GHz Wireless, Bluetooth 5.3, USB-C',
        'Battery Life': 'Up to 240 Hours (RGB Off)',
        'Polling Rate': '1000Hz (Wireless & Wired)',
        'Weight': '1.75 kg',
      }),
    },
    {
      name: 'TitanRTX 4090 OC 24GB Liquid Ultra',
      slug: 'titanrtx-4090-liquid-ultra',
      headline: 'Extreme 4K/8K GPU with Integrated 360mm Closed-Loop Radiator',
      description: 'The pinnacle of graphical fidelity and neural rendering performance. Features 16,384 CUDA cores, 24GB of ultra-fast GDDR6X VRAM, and an integrated copper cold-plate liquid cooling system.',
      price: 169999,
      originalPrice: 189999,
      stock: 4, // Very limited flash sale!
      rating: 5.0,
      reviewCount: 19,
      badge: 'FLASH SALE',
      isFeatured: true,
      isFlashSale: true,
      flashSaleEndsAt: flashSaleEndTime,
      categoryId: catGpu.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
      ]),
      specs: JSON.stringify({
        'CUDA Cores': '16,384',
        'VRAM': '24GB GDDR6X (384-bit)',
        'Boost Clock': '2,670 MHz',
        'Cooling': 'AIO 360mm Aluminum Radiator + Triple ARGB Fans',
        'TDP': '450W (16-pin PCIe 5.0 12VHPWR)',
        'Outputs': '3x DisplayPort 1.4a, 2x HDMI 2.1a',
      }),
    },
    {
      name: 'QuantumFlow Studio Planar Headphones',
      slug: 'quantumflow-planar-headphones',
      headline: 'Open-Back Audiophile Monitors with Ultra-Thin Nanometer Diaphragms',
      description: 'Delivering unmatched acoustic clarity, wide soundstage, and sub-bass extension down to 10Hz. Handcrafted real walnut earcups and breathable lambskin memory foam headband.',
      price: 39999,
      originalPrice: 47999,
      stock: 9,
      rating: 4.8,
      reviewCount: 31,
      badge: 'TOP RATED',
      isFeatured: true,
      isFlashSale: true,
      flashSaleEndsAt: flashSaleEndTime,
      categoryId: catAudio.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ]),
      specs: JSON.stringify({
        'Transducer Type': 'Planar Magnetic (100mm Diaphragm)',
        'Acoustic Design': 'Open-Back Studio Reference',
        'Frequency Response': '10 Hz – 50 kHz',
        'Impedance': '32 Ohms (Easy to Drive)',
        'THD': '< 0.05% @ 1kHz, 100dB SPL',
        'Cable': 'Silver-Plated Monocrystalline Copper (4.4mm Balanced + 3.5mm)',
      }),
    },
    {
      name: 'VisionMaster 34" QD-OLED Curved Display',
      slug: 'visionmaster-34-qd-oled',
      headline: '1800R Quantum Dot OLED Gaming & Production Monitor (240Hz, 0.03ms)',
      description: 'Infinite contrast ratio with true blacks and 99.3% DCI-P3 cinematic color spectrum. Features USB-C 90W Power Delivery, integrated KVM switch, and custom graphene heatsink.',
      price: 84999,
      originalPrice: 99999,
      stock: 14,
      rating: 4.9,
      reviewCount: 68,
      badge: 'BESTSELLER',
      isFeatured: true,
      isFlashSale: false,
      categoryId: catDisplays.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
        'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800',
      ]),
      specs: JSON.stringify({
        'Screen Size': '34-inch Ultrawide (21:9)',
        'Resolution': '3440 x 1440 (UWQHD)',
        'Panel Type': 'Quantum Dot OLED (Anti-Glare Coating)',
        'Refresh Rate': '240 Hz',
        'Response Time': '0.03ms GtG',
        'HDR': 'VESA DisplayHDR True Black 400',
      }),
    },
    {
      name: 'AeroGlide Carbon Precision Mouse',
      slug: 'aeroglide-carbon-mouse',
      headline: '39g Pure Carbon Fiber Shell with 8000Hz Optical Sensor',
      description: 'The world’s lightest high-rigidity carbon fiber gaming mouse. Zero flex, optical switches rated for 90 million clicks, and pure PTFE skate feet.',
      price: 11999,
      originalPrice: 14499,
      stock: 22,
      rating: 4.7,
      reviewCount: 54,
      badge: 'POPULAR',
      isFeatured: false,
      isFlashSale: false,
      categoryId: catKeyboards.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
      ]),
      specs: JSON.stringify({
        'Weight': '39 grams',
        'Sensor': 'PixArt 3395 (30,000 DPI)',
        'Polling Rate': '8000 Hz True Wireless',
        'Battery Life': 'Up to 90 Hours',
      }),
    },
    {
      name: 'AcousticCore Pro Audio Interface',
      slug: 'acousticcore-pro-interface',
      headline: 'Dual-Channel XLR/TRS Preamp with 32-Bit Float 192kHz DAC',
      description: 'Ultra-low noise floor microphone preamps with +75dB of clean gain. Built-in hardware DSP compressor, equalizer, and real-time zero-latency headphone monitoring.',
      price: 24999,
      stock: 18,
      rating: 4.8,
      reviewCount: 23,
      isFeatured: false,
      isFlashSale: false,
      categoryId: catAudio.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      ]),
      specs: JSON.stringify({
        'Preamps': '2x Discrete Class-A Ultra-Clean (+75dB Gain)',
        'Conversion': '32-Bit Float / 192 kHz',
        'Dynamic Range': '130 dB',
        'Inputs': '2x XLR Combo, 2x Line In, MIDI In/Out',
      }),
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({ data: item });

    // Seed realistic reviews
    await prisma.review.create({
      data: {
        productId: product.id,
        userName: 'Rohan Sharma',
        rating: 5,
        comment: 'Top-tier build quality and rapid delivery in Bengaluru! The packaging and finish are phenomenal.',
      },
    });

    await prisma.review.create({
      data: {
        productId: product.id,
        userName: 'Priya Iyer',
        rating: 5,
        comment: 'Exceeded expectations. Benchmark performance and acoustic clarity are industry leading.',
      },
    });
  }

  console.log(`✅ Seeded ${productsData.length} premium tech products & reviews with INR pricing`);

  // 5. Seed an Initial Order for Analytics
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    const subtotal = firstProduct.price;
    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const order = await prisma.order.create({
      data: {
        orderNumber: 'PLS-INIT-9841',
        userId: demoCustomer.id,
        status: 'DELIVERED',
        subtotal: subtotal,
        tax: tax,
        shipping: 0.0,
        total: total,
        isPaid: true,
        paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        shippingAddress: JSON.stringify({
          name: 'Alex Vance',
          street: '42 MG Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560038',
          country: 'India',
        }),
        items: {
          create: {
            productId: firstProduct.id,
            title: firstProduct.name,
            price: firstProduct.price,
            quantity: 1,
            image: JSON.parse(firstProduct.images)[0],
          },
        },
      },
    });
    console.log('✅ Seeded demo completed order in INR:', order.orderNumber);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
