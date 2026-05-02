import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'ios' | 'android' | 'desktop-chromium' | 'desktop-firefox' | 'desktop-safari' | 'other';

let savedPrompt: BeforeInstallPromptEvent | null = null;
let installedByBrowser = false;
let listenersStarted = false;
const subscribers = new Set<() => void>();

const notifySubscribers = () => subscribers.forEach((subscriber) => subscriber());

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
};

const startInstallListeners = () => {
  if (typeof window === 'undefined' || listenersStarted) return;
  listenersStarted = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    savedPrompt = e as BeforeInstallPromptEvent;
    notifySubscribers();
  });

  window.addEventListener('appinstalled', () => {
    installedByBrowser = true;
    savedPrompt = null;
    notifySubscribers();
  });
};

const detectPlatform = (): InstallPlatform => {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && 'ontouchend' in document);
  if (isIOS) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/firefox/.test(ua)) return 'desktop-firefox';
  if (/safari/.test(ua) && !/chrome|chromium|edg/.test(ua)) return 'desktop-safari';
  if (/chrome|chromium|edg/.test(ua)) return 'desktop-chromium';
  return 'other';
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(savedPrompt);
  const [isInstalled, setIsInstalled] = useState(() => isStandalone() || installedByBrowser);
  const [platform] = useState<InstallPlatform>(detectPlatform);

  useEffect(() => {
    startInstallListeners();

    const syncInstallState = () => {
      setDeferredPrompt(savedPrompt);
      setIsInstalled(isStandalone() || installedByBrowser);
    };

    subscribers.add(syncInstallState);
    syncInstallState();

    return () => {
      subscribers.delete(syncInstallState);
    };
  }, []);

  const install = async () => {
    const prompt = savedPrompt || deferredPrompt;
    if (!prompt) return false;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    savedPrompt = null;
    if (outcome === 'accepted') installedByBrowser = true;
    notifySubscribers();
    return outcome === 'accepted';
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    install,
    platform,
    needsManualInstructions: !deferredPrompt && !isInstalled,
  };
};
