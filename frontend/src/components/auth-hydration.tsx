"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

/** Garantit la réhydratation du store auth au chargement client. */
export function AuthHydration() {
  useEffect(() => {
    const finish = () => useAuthStore.setState({ hasHydrated: true });

    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      finish();
    });

    useAuthStore.persist.rehydrate();

    return unsub;
  }, []);

  return null;
}
