import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests to the backend server without the /api prefix
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/role': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/academicYear': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/studentProfile': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/employeeProfile': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/dengueMonitoring': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/studentMedical': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/medicineInventory': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/clinicVisit': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/employeeMedical': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/feedingProgram': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/deworming': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/passwordReset': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // ... add more routes as needed
    },
  },
});