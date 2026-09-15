/// <reference lib="webworker" />

import { Serwist, CacheFirst, StaleWhileRevalidate } from "serwist";

const serwist = new Serwist({
  precacheEntries: [
    ...(self.__SW_MANIFEST ?? []),
    { url: "/", revision: "app-shell" },
    { url: "/offline.html", revision: "offline-page" },
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          {
            cacheDidUpdate: async () => undefined,
          },
        ],
      }),
    },
    {
      matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|ico|webp|manifest\.json)$/i,
      handler: new CacheFirst({
        cacheName: "images",
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/",
        matcher({ request }) {
          return request.destination === "document" || request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();