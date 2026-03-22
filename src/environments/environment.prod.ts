// SECURITY: API keys and secrets should be injected via CI/CD environment
// variables at build time, not committed to source control.
// Example: replace placeholders using `envsubst` or Angular's fileReplacements.

export const environment = {
  production: true,
  apiUrl: 'https://api.unsplash.com/',
  clientID: 'UNSPLASH_CLIENT_ID',
  accessKey: 'UNSPLASH_ACCESS_KEY',
  encryptionKey: 'APP_ENCRYPTION_KEY'
};
