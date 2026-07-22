import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialautopty.app',
  appName: 'AI Marketing Creator',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://ia-community-manager-rust.vercel.app',
    cleartext: false
  }
};

export default config;