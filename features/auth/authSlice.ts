import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const BUSINESS_TYPES = [
  "GROCERY",
  "PHARMACY",
  "CLOTHING_TAILORING",
  "ELECTRONICS",
  "RESTAURANT_CAFE",
  "OTHER",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type AuthUser = {
  id: string;
  name: string;
  shopName: string;
  businessType: BusinessType;
  phone: string | null;
};

type LoginInput = {
  phone: string;
  pin: string;
};

type RegistrationInput = LoginInput & {
  name: string;
  shopName: string;
  businessType: BusinessType;
};

type AuthResponse = {
  success: true;
  data: {
    user: AuthUser;
  };
};

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

function isAuthResponse(value: unknown): value is AuthResponse {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    return false;
  }

  const data = value.data;
  if (
    !("success" in value) ||
    value.success !== true ||
    typeof data !== "object" ||
    data === null ||
    !("user" in data)
  ) {
    return false;
  }

  const user = data.user;
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    typeof user.id === "string" &&
    "name" in user &&
    typeof user.name === "string" &&
    "shopName" in user &&
    typeof user.shopName === "string" &&
    "businessType" in user &&
    typeof user.businessType === "string" &&
    BUSINESS_TYPES.some((type) => type === user.businessType) &&
    "phone" in user &&
    (typeof user.phone === "string" || user.phone === null)
  );
}

function getErrorMessage(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return null;
  }

  const error = value.error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
}

async function requestAuth(
  endpoint: "login" | "register",
  body: LoginInput | RegistrationInput,
): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
    );
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new Error("সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody) ??
        (endpoint === "login"
          ? "লগইন করা যায়নি। দেওয়া তথ্য যাচাই করে আবার চেষ্টা করুন।"
          : "নিবন্ধন করা যায়নি। দেওয়া তথ্য যাচাই করে আবার চেষ্টা করুন।"),
    );
  }

  if (!isAuthResponse(responseBody)) {
    throw new Error("সার্ভার থেকে সঠিক ব্যবহারকারীর তথ্য পাওয়া যায়নি।");
  }

  return responseBody.data.user;
}

export const login = createAsyncThunk<
  AuthUser,
  LoginInput,
  { rejectValue: string }
>("auth/login", async (input, thunkApi) => {
  try {
    return await requestAuth("login", input);
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "লগইন করা যায়নি। আবার চেষ্টা করুন।",
    );
  }
});

export const register = createAsyncThunk<
  AuthUser,
  RegistrationInput,
  { rejectValue: string }
>("auth/register", async (input, thunkApi) => {
  try {
    return await requestAuth("register", input);
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "নিবন্ধন করা যায়নি। আবার চেষ্টা করুন।",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.error = action.payload ?? "লগইন করা যায়নি। আবার চেষ্টা করুন।";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.error = action.payload ?? "নিবন্ধন করা যায়নি। আবার চেষ্টা করুন।";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
