import { createSerwistRoute } from "@serwist/turbopack";

export const dynamic = "force-static";
export const dynamicParams = false;

export const { GET, generateStaticParams } = createSerwistRoute({
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
});
