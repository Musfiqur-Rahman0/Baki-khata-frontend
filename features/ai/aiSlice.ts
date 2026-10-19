import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api/client";

export type AiDraftTransaction = {
  customerName: string; type: "CREDIT" | "PAYMENT"; amount: string; note?: string | null; date?: string | null;
  confidence?: number; needsClarification?: boolean; clarificationReason?: string | null;
  customerMatches?: { id: string; name: string; phone: string }[];
  suggestedCustomerId?: string | null; customerMatchStatus?: "exact" | "not_found" | "ambiguous";
  customerId?: string;
};
export type AiParseResult = { status: string; sourceText: string; transactions: AiDraftTransaction[]; questions: string[]; notice?: string };
export const parseAiTransactions = createAsyncThunk(
  "ai/parse",
  async (text: string, { rejectWithValue }) => {
    try { return (await apiRequest<AiParseResult>("/ai/parse-transaction", { method: "POST", body: JSON.stringify({ text }) })).data; }
    catch (error) { return rejectWithValue(error instanceof Error ? error.message : "AI এন্ট্রি বিশ্লেষণ করা যায়নি"); }
  },
);
export const confirmAiTransactions = createAsyncThunk(
  "ai/confirm",
  async (transactions: { customerId: string; type: "CREDIT" | "PAYMENT"; amount: string; note?: string | null; date?: string }[], { rejectWithValue }) => {
    try { return (await apiRequest<{ savedCount: number; transactions: unknown[] }>("/ai/confirm-transaction", { method: "POST", body: JSON.stringify({ transactions }) })).data; }
    catch (error) { return rejectWithValue(error instanceof Error ? error.message : "AI লেনদেন সংরক্ষণ করা যায়নি"); }
  },
);
type AiState = { parsing: boolean; saving: boolean; error: string | null };
const initialState: AiState = { parsing: false, saving: false, error: null };
const aiSlice = createSlice({
  name: "ai", initialState, reducers: { clearAiError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(parseAiTransactions.pending, (state) => { state.parsing = true; state.error = null; })
      .addCase(parseAiTransactions.fulfilled, (state) => { state.parsing = false; })
      .addCase(parseAiTransactions.rejected, (state, action) => { state.parsing = false; state.error = String(action.payload ?? action.error.message ?? "AI এন্ট্রি ব্যর্থ হয়েছে"); })
      .addCase(confirmAiTransactions.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(confirmAiTransactions.fulfilled, (state) => { state.saving = false; })
      .addCase(confirmAiTransactions.rejected, (state, action) => { state.saving = false; state.error = String(action.payload ?? action.error.message ?? "লেনদেন সংরক্ষণ ব্যর্থ হয়েছে"); });
  },
});
export const { clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
