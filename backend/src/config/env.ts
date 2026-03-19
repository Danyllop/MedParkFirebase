// Cloudflare Workers provides environment variables via the global process.env when nodejs_compat is enabled.
// For Hono, it's best to use c.env in the handler, but for shared services, process.env is a common fallback.

export const env = {
  PORT: 3333,
  DATABASE_URL: (typeof process !== 'undefined' ? process.env.DATABASE_URL : '') || '',
  JWT_SECRET: (typeof process !== 'undefined' ? process.env.JWT_SECRET : '') || 'medpark-fallback-secret',
  JWT_EXPIRES_IN: (typeof process !== 'undefined' ? process.env.JWT_EXPIRES_IN : '') || '24h',
  DEFAULT_PASSWORD: (typeof process !== 'undefined' ? process.env.DEFAULT_PASSWORD : '') || 'Mud@1234',
  PEPPER_SECRET: (typeof process !== 'undefined' ? process.env.PEPPER_SECRET : '') || 'medpark-fallback-pepper',
};
