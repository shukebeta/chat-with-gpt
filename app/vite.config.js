import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    resolve: {
      alias: {
        "@ffmpeg/ffmpeg": "./src/stub.js",
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "formatjs",
              {
                idInterpolationPattern: "[sha512:contenthash:base64:6]",
                ast: true,
              },
            ],
          ],
        },
      }),
      comlink(),
    ],
    worker: {
      plugins: [comlink()],
    },
  };
});
