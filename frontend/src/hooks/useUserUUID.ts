import { useEffect, useState } from "react";

const KEY = "parking_app_uuid";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (not perfect but acceptable here)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useUserUUID(): string | null {
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    let existing = localStorage.getItem(KEY);
    if (!existing) {
      existing = generateUUID();
      localStorage.setItem(KEY, existing);
    }
    setUuid(existing);
  }, []);

  return uuid;
}

