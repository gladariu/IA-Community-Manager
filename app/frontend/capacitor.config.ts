import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialautopty.app',
  appName: 'IA Community Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://ia-community-manager-rust.vercel.app',
    cleartext: false
  }
};

export default config;