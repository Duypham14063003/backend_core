import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import AppDataSource from './data-source';
import { User } from '../modules/users/entities/user.entity';
import { Gift } from '../modules/gifts/entities/gift.entity';
import { UserRole } from '../common/constants/roles.enum';

const logger = new Logger('Seed');

async function runSeed(): Promise<void> {
  logger.log('🌱 Starting database seeding...');
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const giftRepository = AppDataSource.getRepository(Gift);

  // 1. Seed Admin User
  const adminEmail = 'admin@example.com';
  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123@', 10);
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      isActive: true,
      points: 9999,
    });
    await userRepository.save(admin);
    logger.log(`✓ Seeded Admin: ${adminEmail} (password: Admin123@)`);
  } else {
    logger.log(`- Admin already exists: ${adminEmail}`);
  }

  // 2. Seed Standard User
  const userEmail = 'user@example.com';
  const existingUser = await userRepository.findOne({ where: { email: userEmail } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('User123@', 10);
    const user = userRepository.create({
      email: userEmail,
      password: hashedPassword,
      fullName: 'John Doe',
      role: UserRole.USER,
      isActive: true,
      points: 500,
    });
    await userRepository.save(user);
    logger.log(`✓ Seeded User: ${userEmail} (password: User123@)`);
  } else {
    logger.log(`- User already exists: ${userEmail}`);
  }

  // 3. Seed Gifts
  const sampleGifts = [
    {
      code: 'GIFT-MUG-001',
      title: 'Premium Ceramic Mug',
      description: 'Elegant heat-resistant ceramic mug with company logo',
      pointsRequired: 100,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      isActive: true,
    },
    {
      code: 'GIFT-TSHIRT-002',
      title: 'Developer Cotton T-Shirt',
      description: '100% organic cotton comfortable t-shirt for developers',
      pointsRequired: 250,
      stockQuantity: 30,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
      isActive: true,
    },
    {
      code: 'GIFT-BACKPACK-003',
      title: 'Waterproof Laptop Backpack',
      description: 'Durable anti-theft 15.6 inch laptop backpack',
      pointsRequired: 500,
      stockQuantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      isActive: true,
    },
    {
      code: 'GIFT-HEADPHONES-004',
      title: 'Wireless Noise Cancelling Headphones',
      description: 'High fidelity audio with 30-hour battery life',
      pointsRequired: 1000,
      stockQuantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      isActive: true,
    },
    {
      code: 'GIFT-DISCOUNT-005',
      title: 'VIP 20% Discount Voucher',
      description: 'Exclusive 20% discount on all store merchandise',
      pointsRequired: 50,
      stockQuantity: 100,
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      isActive: false, // Inactive gift to test filters
    },
  ];

  for (const giftData of sampleGifts) {
    const existingGift = await giftRepository.findOne({ where: { code: giftData.code } });
    if (!existingGift) {
      const gift = giftRepository.create(giftData);
      await giftRepository.save(gift);
      logger.log(`✓ Seeded Gift: ${giftData.code} - ${giftData.title}`);
    }
  }

  await AppDataSource.destroy();
  logger.log('✨ Seeding completed successfully!');
}

void runSeed();
