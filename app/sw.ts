/// <reference lib="webworker" />

import { Serwist, CacheFirst, StaleWhileRevalidate } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
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
});

serwist.addEventListeners();