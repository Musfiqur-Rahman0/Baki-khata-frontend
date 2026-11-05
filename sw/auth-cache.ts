import { AUTH_URL, CACHEABLE_API_PATH, PRIVATE_CACHE } from "./config";

export async function cacheAuthResponse(response: Response) {
  const payload = await response.clone().json();

  const userId = payload?.data?.id;

  if (typeof userId !== "string") return;
  if (!userId) {
    console.error("User ID not found in auth response payload");
    return;
  }

  const existingUserId = await getCachedUserId();

  if (existingUserId && existingUserId !== userId) {
    await caches.delete(PRIVATE_CACHE);
  }

  const cache = await caches.open(PRIVATE_CACHE);
  await cache.put(AUTH_URL, response);
}

export async function getCachedUserId(): Promise<string | null> {
  const cache = await caches.open(PRIVATE_CACHE);
  const cachedResponse = await cache.match(AUTH_URL);
  if (!cachedResponse) return null;
  const payload = await cachedResponse.json();
  const userId = payload?.data?.user?.id;
  return typeof userId === "string" ? userId : null;
}

export async function clearCachedLedgerData() {
  const cache = await caches.open(PRIVATE_CACHE);
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter(
        (request) =>
          CACHEABLE_API_PATH.test(new URL(request.url).pathname) &&
          new URL(request.url).href !== AUTH_URL,
      )
      .map((request) => cache.delete(request)),
  );
}
