import { useCallback } from "react";

export function useGeolocation() {
  const requestLocation = useCallback(
    (): Promise<GeolocationPosition | null> => {
      if (!("geolocation" in navigator)) {
        return Promise.resolve(null);
      }
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    },
    []
  );

  return { requestLocation };
}

