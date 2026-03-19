// Cloudflare Workers provides environment variables via the global process.env when nodejs_compat is enabled.
// We use getters to ensure variables are always read from the current environment.
const getEnv = (key, fallback = '') => {
    if (typeof process !== 'undefined' && process.env[key]) {
        return process.env[key];
    }
    return fallback;
};
export const env = {
    get PORT() { return 3333; },
    get DATABASE_URL() {
        const url = getEnv('DATABASE_URL');
        // Remove problematic 'channel_binding' which can cause issues in Edge runtimes
        return url.replace(/[&?]?channel_binding=[^&]*/, '');
    },
    get JWT_SECRET() { return getEnv('JWT_SECRET', 'medpark-fallback-secret'); },
    get JWT_EXPIRES_IN() { return getEnv('JWT_EXPIRES_IN', '24h'); },
    get DEFAULT_PASSWORD() { return getEnv('DEFAULT_PASSWORD', 'Mud@1234'); },
    get PEPPER_SECRET() { return getEnv('PEPPER_SECRET', 'medpark-fallback-pepper'); },
};
