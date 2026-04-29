import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.polarier.auto',
  appName: 'Polarier Auto',
  webDir: 'dist',
  server: {
    url: 'https://polarier-auto-production.up.railway.app',
    cleartext: true
  },
  plugins: {
    App: {
      urlScheme: 'polarier'
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowNavigation: [
      '*.supabase.co'
    ]
  }
};

export default config;
