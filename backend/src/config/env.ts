import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3333', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'medpark-fallback-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD || 'Mud@1234',
};
