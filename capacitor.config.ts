import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.polarier.auto',
  appName: 'Polarier Auto',
  webDir: 'dist',
  server: {
    cleartext: false
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
