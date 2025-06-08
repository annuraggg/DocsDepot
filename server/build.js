import { build } from "esbuild";
import { resolve } from "path";

try {
  await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "esm",
    outdir: "dist",
    sourcemap: true,

    external: [
      "@emailjs/nodejs",
      "@hono/node-server",
      "archiver",
      "bcrypt",
      "chalk",
      "cors",
      "date-fns",
      "dotenv",
      "hono",
      "jsonwebtoken",
      "mongoose",
      "mongodb",
      "multer",
      "node-gyp",
      "ora",
      "pino",

      "timers",
      "fs",
      "path",
      "crypto",
      "http",
      "https",
      "url",
      "util",
      "events",
      "stream",
      "buffer",
      "os",
      "child_process",
    ],

    alias: {
      "@shared-types": resolve("../common/types"),
    },

    metafile: true,

    loader: {
      ".ts": "ts",
      ".tsx": "tsx",
    },

    tsconfig: "./tsconfig.json",

    outbase: "src",

    plugins: [
      {
        name: "node-externals",
        setup(build) {
          const nodeBuiltins = [
            "assert",
            "buffer",
            "child_process",
            "cluster",
            "crypto",
            "dgram",
            "dns",
            "events",
            "fs",
            "http",
            "https",
            "net",
            "os",
            "path",
            "querystring",
            "readline",
            "stream",
            "string_decoder",
            "timers",
            "tls",
            "tty",
            "url",
            "util",
            "v8",
            "vm",
            "zlib",
          ];

          build.onResolve({ filter: /^(node:)?[a-z_]+$/ }, (args) => {
            const moduleName = args.path.replace(/^node:/, "");
            if (nodeBuiltins.includes(moduleName)) {
              return { path: args.path, external: true };
            }
          });

          build.onResolve({ filter: /\.node$/ }, (args) => ({
            path: args.path,
            external: true,
          }));
        },
      },
    ],
  });

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
