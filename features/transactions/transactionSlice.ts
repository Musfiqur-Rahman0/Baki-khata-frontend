import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, queryString } from "@/lib/api/client";
import type { LedgerTransaction } from "@/features/customers/customerSlice";

export type ApiTransaction = LedgerTransaction & { customer?: { id?: string; name: string; phone: string } };
export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (filters: { customerId?: string; type?: "CREDIT" | "PAYMENT"; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiRequest<ApiTransaction[]>(`/transactions${queryString({ ...filters, page: filters.page ?? 1, limit: filters.limit ?? 100 })}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "লেনদেন লোড করা যায়নি");
    }
  },
);

export const fetchAllTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const first = await apiRequest<ApiTransaction[]>("/transactions?page=1&limit=100");
      const all = [...first.data];
      const pages = first.meta?.pagination?.totalPages ?? 1;
      for (let page = 2; page <= pages; page += 1) {
        const next = await apiRequest<ApiTransaction[]>(`/transactions?page=${page}&limit=100`);
        all.push(...next.data);
      }
      return all;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "লেনদেন লোড করা যায়নি");
    }
  },
);

export const createTransactionRecord = createAsyncThunk(
  "transactions/create",
  async (input: { customerId: string; type: "CREDIT" | "PAYMENT"; amount: number | string; note?: string | null; date?: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<ApiTransaction>("/transactions", {
        method: "POST", body: JSON.stringify(input),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "লেনদেন সংরক্ষণ করা যায়নি");
    }
  },
);
type TransactionState = { loading: boolean; creating: boolean; error: string | null };
const initialState: TransactionState = { loading: false, creating: false, error: null };
const transactionSlice = createSlice({
  name: "transactions", initialState, reducers: { clearTransactionError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchAllTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllTransactions.fulfilled, (state) => { state.loading = false; })
      .addCase(fetchAllTransactions.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? action.error.message ?? "লেনদেন লোড করা যায়নি"); })
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTransactions.fulfilled, (state) => { state.loading = false; })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? action.error.message ?? "লেনদেন লোড করা যায়নি"); })
      .addCase(createTransactionRecord.pending, (state) => { state.creating = true; state.error = null; })
      .addCase(createTransactionRecord.fulfilled, (state) => { state.creating = false; })
      .addCase(createTransactionRecord.rejected, (state, action) => { state.creating = false; state.error = String(action.payload ?? action.error.message ?? "লেনদেন সংরক্ষণ করা যায়নি"); });
  },
});
export const { clearTransactionError } = transactionSlice.actions;
export default transactionSlice.reducer;
