import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

// Installable app: register the service worker on the web only (the native
// Capacitor shell already ships the assets).
if (import.meta.env.PROD && 'serviceWorker' in navigator && !(window as any).Capacitor?.isNativePlatform?.()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is optional — never block the app */
    });
  });
}

// Native shell: apply the status-bar theme (no-op on the web).
if ((window as any).Capacitor?.isNativePlatform?.()) {
  import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) => StatusBar.setStyle({ style: Style.Dark }).catch(() => {}))
    .catch(() => {});
  import('@capacitor/splash-screen')
    .then(({ SplashScreen }) => SplashScreen.hide().catch(() => {}))
    .catch(() => {});
  // Android hardware back: walk the router history, exit only at the root.
  import('@capacitor/app')
    .then(({ App: NativeApp }) =>
      NativeApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else NativeApp.exitApp();
      })
    )
    .catch(() => {});
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
