declare const self: ServiceWorkerGlobalScope;

export const CACHE_VERSION = "baki-khata-v1";
export const ASSET_CACHE = `${CACHE_VERSION}-assets`;
export const PAGE_CACHE = `${CACHE_VERSION}-pages`;
export const PRIVATE_CACHE = `${CACHE_VERSION}-private`;
export const OFFLINE_URL = "/offline.html";
export const APP_ROUTES = ["/", "/store", "/auth", "/demo-store", "/onbording"];
export const CORE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/pwa-icon.svg",
];

export const AUTH_URL = new URL("/api/v1/auth/me", self.location.origin).href;
export const CACHEABLE_API_PATH =
  /^\/api\/v1\/(auth\/me|customers(?:\/.*)?|transactions(?:\/.*)?)$/;
export const TRANSACTION_CREATE_PATH = /^\/api\/v1\/transactions\/?$/;
