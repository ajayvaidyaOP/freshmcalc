import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native wrappers for the Play Store (Android) and App Store (iOS).
 *
 * Default: the app ships the built React bundle inside the shell and calls the
 * hosted API (VITE_API_BASE from `.env.native`). This is what the stores
 * expect — a self-contained app, not a remote website wrapper.
 *
 * Optional live reload while developing against a dev server:
 *   CAP_SERVER_URL=http://192.168.1.20:5173 npx cap sync android
 */
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.freshmcalc.app',
  appName: 'FreshmCalc',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a2519',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a2519',
  },
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
        androidScheme: 'https',
        iosScheme: 'https',
      }
    : {
        androidScheme: 'https',
        iosScheme: 'https',
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0a2519',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a2519',
      overlaysWebView: false,
    },
  },
};

export default config;
