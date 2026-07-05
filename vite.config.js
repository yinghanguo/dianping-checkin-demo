import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // NO_SSL=1 时以 http 启动(预览工具不信任自签证书)
  plugins: [react(), ...(process.env.NO_SSL ? [] : [basicSsl()])],
  base: '/dianping-checkin-demo/',
  server: {
    host: true,
  },
})
