import fs from "node:fs";
import path from "node:path";

function ensureExport500() {
  const exportDir = path.join(process.cwd(), ".next/export");
  const filePath = path.join(exportDir, "500.html");

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      "<!DOCTYPE html><html lang=\"en\"><head><meta charSet=\"utf-8\"><title>Server Error</title></head><body><h1>500 - Server Error</h1><p>Something went wrong.</p></body></html>"
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack(config, { isServer }) {
    if (!isServer) {
      // Exclude problematic modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      return config;
    }

    // Ignore tensorflow and mapbox for server builds (not needed for student workflow)
    config.externals = config.externals || [];
    config.externals.push({
      '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
      '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
    });

    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("EnsureExport500Plugin", () => {
          ensureExport500();
        });
      },
    });
    
    // Ignore HTML files in node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.html$/,
      include: /node_modules/,
      use: 'null-loader',
    });
    
    return config;
  },
};

export default nextConfig;
