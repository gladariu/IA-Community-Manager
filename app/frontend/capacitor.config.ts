import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialautopty.app',
  appName: 'IA Community Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    url: 'http://10.42.200.135:3000',
    cleartext: true
  }
};

export default config;