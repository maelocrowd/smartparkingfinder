// export async function apiGet<T>(url: string, token?: string): Promise<T> {
//   const res = await fetch(url, {
//     headers: token
//       ? {
//           Authorization: `Bearer ${token}`
//         }
//       : undefined
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || res.statusText);
//   }
//   return (await res.json()) as T;
// }

// export async function apiPost<T>(
//   url: string,
//   body: unknown
// ): Promise<T> {
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(body)
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || res.statusText);
//   }
//   return (await res.json()) as T;
// }

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8000";

function buildUrl(path: string) {
  // allow passing full URLs too
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export async function apiGet<T>(
  url: string,
  token?: string
): Promise<T> {
  const res = await fetch(buildUrl(url), {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return (await res.json()) as T;
}

export async function apiPost<T>(
  url: string,
  body: unknown,
  token?: string
): Promise<T> {
  const res = await fetch(buildUrl(url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return (await res.json()) as T;
}