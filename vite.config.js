import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE ?? './';

  return {
    // Por defecto genera una salida portable para abrirla en local.
    // Si se despliega en una ruta fija, sobreescribe con `VITE_BASE=/indumentaria/`.
    base,
    plugins: [react(), tailwindcss()],
  };
});
