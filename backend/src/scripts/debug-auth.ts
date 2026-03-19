import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password.js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function debugLogin() {
  const email = 'admin@medpark.com';
  const plainPassword = 'Admin@0502';
  
  console.log(`🔍 Debugging login for: ${email}`);
  console.log(`🔑 Testing password: ${plainPassword}`);
  console.log(`🌶️ PEPPER_SECRET configured: ${process.env.PEPPER_SECRET ? 'YES' : 'NO'}`);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error('❌ User not found in database!');
    return;
  }

  console.log('✅ User found in DB.');
  console.log(`📦 Stored Hash: ${user.passwordHash}`);

  try {
    const isMatch = await comparePassword(plainPassword, user.passwordHash);
    if (isMatch) {
      console.log('✨ SUCCESS: Password matches hash with current pepper!');
    } else {
      console.error('❌ FAILURE: Password does NOT match hash.');
    }
  } catch (error) {
    console.error('💥 ERROR during comparison:', error);
  }
}

debugLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
