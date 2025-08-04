import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1f5ca170347c44f09320f88dbbc7cb34',
  appName: 'smartmed',
  webDir: 'dist',
  server: {
    url: "https://1f5ca170-347c-44f0-9320-f88dbbc7cb34.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2b9a7c",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;