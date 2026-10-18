"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { loadCurrentUser } from "@/features/auth/authSlice";
import { makeStore, type AppStore } from "@/lib/redux/store";

type StoreProviderProps = {
  children: ReactNode;
};

export default function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(loadCurrentUser());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
