/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        net: false,
        tls: false,
      };
    }
    // These are optional peer deps of wallet libs that we never use.
    // IgnorePlugin makes the missing-module warning vanish without
    // breaking the bundle (the libs gate their use behind a try/catch).
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino-pretty|@react-native-async-storage\/async-storage)$/,
      }),
    );
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /node_modules\/(ox|viem)\// },
    ];
    return config;
  },
};

export default nextConfig;
