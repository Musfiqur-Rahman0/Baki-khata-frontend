import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import customerReducer from "@/features/customers/customerSlice";
import transactionReducer from "@/features/transactions/transactionSlice";
import aiReducer from "@/features/ai/aiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      customers: customerReducer,
      transactions: transactionReducer,
      ai: aiReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
