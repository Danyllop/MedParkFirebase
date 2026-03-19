// In Cloudflare Workers (Module Workers), environment variables are passed to the handler.
// To avoid refactoring all files to use c.env, we use a global registry that is 
// populated by a middleware on the first request.

let globalEnv: any = {};

/**
 * Injected by a middleware in server.ts
 */
export function setGlobalEnv(env: any) {
  if (env) {
    globalEnv = { ...globalEnv, ...env };
  }
}

const getVal = (key: string, fallback: string = ''): string => {
  return globalEnv[key] || (typeof process !== 'undefined' ? process.env[key] : '') || fallback;
};

export const env = {
  get PORT() { return 3333; },
  get DATABASE_URL() { 
    const url = getVal('DATABASE_URL');
    // Remove problematic 'channel_binding' which can cause issues in Edge runtimes
    return url.replace(/[&?]?channel_binding=[^&]*/, '');
  },
  get JWT_SECRET() { return getVal('JWT_SECRET', 'medpark-fallback-secret'); },
  get JWT_EXPIRES_IN() { return getVal('JWT_EXPIRES_IN', '24h'); },
  get DEFAULT_PASSWORD() { return getVal('DEFAULT_PASSWORD', 'Mud@1234'); },
  get PEPPER_SECRET() { return getVal('PEPPER_SECRET', 'medpark-fallback-pepper'); },
};
