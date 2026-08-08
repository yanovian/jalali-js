import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['jalali-js', '@jalali-js/i18n', '@jalali-js/react'],
  // This app's workspace dependencies (packages/core, packages/i18n) are consumed straight
  // from TypeScript source, using explicit .js specifiers for their relative imports (the
  // correct, required style under Node's own NodeNext module resolution, since those packages
  // are also meant to run directly under plain Node, with no bundler). webpack's
  // extensionAlias is the standard fix for a bundler to still resolve a ".js" specifier to the
  // ".ts" file that actually exists on disk.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
