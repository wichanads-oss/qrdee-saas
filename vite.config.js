// vite.config.js
// ============================================================
// GitHub Pages deploy ไปที่:
//   https://USERNAME.github.io/REPO_NAME/
//
// 🔧 เปลี่ยน REPO_NAME ให้ตรงกับชื่อ repository ของคุณ
//    เช่น repo ชื่อ "qr-order" → base: "/qr-order/"
//    ถ้าใช้ custom domain → base: "/"
// ============================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/qrdee-saas/",// 🔧 เปลี่ยนเป็นชื่อ repo ของคุณ
  build: {
    outDir: "dist",
    rollupOptions: {
      input: { main: "./index.html" },
    },
  },
});
