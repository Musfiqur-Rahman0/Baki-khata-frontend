const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(/\/+$/, "");
let refreshInFlight: Promise<boolean> | null = null;

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: { pagination?: { page: number; limit: number; total: number; totalPages: number } };
  error?: { message?: string };
};

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        throw new Error(
          "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। API চালু আছে কি না পরীক্ষা করুন।",
        );
      }

      let payload: ApiEnvelope<unknown>;
      try {
        payload = (await response.json()) as ApiEnvelope<unknown>;
      } catch {
        throw new Error("সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।");
      }

      return response.ok && payload.success === true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function fetchApi(
  path: string,
  options: RequestInit,
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(
      "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। API চালু আছে কি না পরীক্ষা করুন।",
    );
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  let response = await fetchApi(path, options);
  if (response.status === 401 && path !== "/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetchApi(path, options);
    }
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error("সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।");
  }

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.error?.message ?? "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
  }
  return payload;
}

export function queryString(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const result = params.toString();
  return result ? `?${result}` : "";
}
