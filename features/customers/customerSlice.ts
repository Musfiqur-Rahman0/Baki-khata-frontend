import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, queryString } from "@/lib/api/client";

export type ApiCustomer = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CustomerBalance = { creditTotal: string; paymentTotal: string; due: string };
export type CustomerWithBalance = { customer: ApiCustomer; balance: CustomerBalance };
export type LedgerTransaction = {
  id: string; customerId: string; type: "CREDIT" | "PAYMENT"; amount: string;
  note: string | null; date: string; createdAt?: string;
};
export type CustomerLedger = {
  customer: { id: string; name: string; phone: string; archivedAt?: string | null };
  balance: CustomerBalance;
  transactions: LedgerTransaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const fetchAllCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const first = await apiRequest<CustomerWithBalance[]>("/customers?page=1&limit=100");
      const all = [...first.data];
      const pages = first.meta?.pagination?.totalPages ?? 1;
      for (let page = 2; page <= pages; page += 1) {
        const next = await apiRequest<CustomerWithBalance[]>(`/customers?page=${page}&limit=100`);
        all.push(...next.data);
      }
      return all;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার লোড করা যায়নি");
    }
  },
);

export const createCustomerRecord = createAsyncThunk(
  "customers/create",
  async (input: { name: string; phone: string; address?: string | null; note?: string | null }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<CustomerWithBalance>("/customers", {
        method: "POST", body: JSON.stringify(input),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার যোগ করা যায়নি");
    }
  },
);

export const updateCustomerRecord = createAsyncThunk(
  "customers/update",
  async ({ id, ...input }: { id: string; name?: string; phone?: string; address?: string | null; note?: string | null }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<CustomerWithBalance>(`/customers/${encodeURIComponent(id)}`, {
        method: "PATCH", body: JSON.stringify(input),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার আপডেট করা যায়নি");
    }
  },
);

export const fetchCustomerLedger = createAsyncThunk(
  "customers/ledger",
  async ({ customerId, page = 1, limit = 20 }: { customerId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<CustomerLedger>(`/transactions/customer/${encodeURIComponent(customerId)}${queryString({ page, limit })}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার লেজার লোড করা যায়নি");
    }
  },
);

export const archiveCustomerRecord = createAsyncThunk(
  "customers/archive",
  async (customerId: string, { rejectWithValue }) => {
    try {
      await apiRequest(`/customers/${encodeURIComponent(customerId)}`, { method: "DELETE" });
      return customerId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার আর্কাইভ করা যায়নি");
    }
  },
);

export const restoreCustomerRecord = createAsyncThunk(
  "customers/restore",
  async (customerId: string, { rejectWithValue }) => {
    try {
      await apiRequest(`/customers/${encodeURIComponent(customerId)}/restore`, { method: "POST" });
      return customerId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "কাস্টমার পুনরুদ্ধার করা যায়নি");
    }
  },
);

type CustomerState = { loading: boolean; error: string | null };
const initialState: CustomerState = { loading: false, error: null };
const customerSlice = createSlice({
  name: "customers", initialState, reducers: { clearCustomerError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchAllCustomers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllCustomers.fulfilled, (state) => { state.loading = false; })
      .addCase(fetchAllCustomers.rejected, (state, action) => { state.loading = false; state.error = String(action.payload ?? action.error.message ?? "কাস্টমার লোড করা যায়নি"); })
      .addCase(createCustomerRecord.rejected, (state, action) => { state.error = String(action.payload ?? action.error.message ?? "কাস্টমার যোগ করা যায়নি"); })
      .addCase(updateCustomerRecord.rejected, (state, action) => { state.error = String(action.payload ?? action.error.message ?? "কাস্টমার আপডেট করা যায়নি"); });
  },
});
export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
