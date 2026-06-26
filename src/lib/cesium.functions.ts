import { createServerFn } from "@tanstack/react-start";

export const getCesiumConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    return { token: process.env.CESIUM_ION_TOKEN || null };
  });
