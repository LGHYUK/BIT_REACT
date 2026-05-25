import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serviceKey = env.VITE_BUS_SERVICE_KEY ?? "";

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // getStationByUid (arsId → 도착정보 포함 반환) — 실제 동작 확인된 API
        "/api/station": {
          target: "http://ws.bus.go.kr",
          changeOrigin: true,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api\/station/, "/api/rest/stationinfo");
            const sep = newPath.includes("?") ? "&" : "?";
            return `${newPath}${sep}ServiceKey=${serviceKey}`;
          },
        },
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  };
});