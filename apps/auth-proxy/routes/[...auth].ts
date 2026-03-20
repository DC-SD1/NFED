import { eventHandler } from "h3";

// eslint-disable-next-line @typescript-eslint/require-await
export default eventHandler(async () => {
  // Auth proxy is no longer needed as we're using Clerk
  return { message: "Auth proxy disabled - using Clerk authentication" };
});
