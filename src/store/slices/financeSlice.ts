import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface AccountReceivable {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  description: string;
  relatedOrderId?: string;
  relatedServiceId?: string;
}

export interface AccountPayable {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'professional' | 'rider' | 'supplier';
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  description: string;
  relatedOrderId?: string;
  relatedServiceId?: string;
  relatedDeliveryId?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense' | 'refund' | 'commission';
  amount: number;
  description: string;
  category: string;
  relatedId?: string;
  relatedType?: 'order' | 'service' | 'delivery' | 'dispute';
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface FinancialSummary {
  totalReceivables: number;
  overdueReceivables: number;
  totalPayables: number;
  overduePayables: number;
  netCashFlow: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

interface FinanceState {
  accountsReceivable: AccountReceivable[];
  accountsPayable: AccountPayable[];
  transactions: FinancialTransaction[];
  financialSummary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
  pagination: {
    receivables: { page: number; total: number; limit: number };
    payables: { page: number; total: number; limit: number };
    transactions: { page: number; total: number; limit: number };
  };
}

const initialState: FinanceState = {
  accountsReceivable: [],
  accountsPayable: [],
  transactions: [],
  financialSummary: null,
  loading: false,
  error: null,
  pagination: {
    receivables: { page: 1, total: 0, limit: 10 },
    payables: { page: 1, total: 0, limit: 10 },
    transactions: { page: 1, total: 0, limit: 10 },
  },
};

// Async thunks
export const fetchAccountsReceivable = createAsyncThunk(
  'finance/fetchAccountsReceivable',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/finance/accounts-receivable', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts receivable');
    }
  }
);

export const fetchAccountsPayable = createAsyncThunk(
  'finance/fetchAccountsPayable',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/finance/accounts-payable', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts payable');
    }
  }
);

export const fetchFinancialTransactions = createAsyncThunk(
  'finance/fetchFinancialTransactions',
  async (params: { page?: number; limit?: number; type?: string; dateRange?: { start: string; end: string } }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/finance/transactions', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial transactions');
    }
  }
);

export const fetchFinancialSummary = createAsyncThunk(
  'finance/fetchFinancialSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/finance/summary');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial summary');
    }
  }
);

export const markReceivableAsPaid = createAsyncThunk(
  'finance/markReceivableAsPaid',
  async ({ receivableId, paymentDetails }: { receivableId: string; paymentDetails: any }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/finance/accounts-receivable/${receivableId}/pay`, paymentDetails);
      return response.data.receivable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark receivable as paid');
    }
  }
);

export const markPayableAsPaid = createAsyncThunk(
  'finance/markPayableAsPaid',
  async ({ payableId, paymentDetails }: { payableId: string; paymentDetails: any }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/finance/accounts-payable/${payableId}/pay`, paymentDetails);
      return response.data.payable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark payable as paid');
    }
  }
);

export const createReceivable = createAsyncThunk(
  'finance/createReceivable',
  async (receivableData: Omit<AccountReceivable, 'id' | 'createdAt' | 'status'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/finance/accounts-receivable', receivableData);
      return response.data.receivable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create receivable');
    }
  }
);

export const createPayable = createAsyncThunk(
  'finance/createPayable',
  async (payableData: Omit<AccountPayable, 'id' | 'createdAt' | 'status'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/finance/accounts-payable', payableData);
      return response.data.payable;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payable');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts Receivable
      .addCase(fetchAccountsReceivable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountsReceivable.fulfilled, (state, action) => {
        state.loading = false;
        state.accountsReceivable = action.payload.receivables;
        state.pagination.receivables = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchAccountsReceivable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Accounts Payable
      .addCase(fetchAccountsPayable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountsPayable.fulfilled, (state, action) => {
        state.loading = false;
        state.accountsPayable = action.payload.payables;
        state.pagination.payables = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchAccountsPayable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Financial Transactions
      .addCase(fetchFinancialTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination.transactions = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchFinancialTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Financial Summary
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.financialSummary = action.payload;
      })
      // Mark Receivable as Paid
      .addCase(markReceivableAsPaid.fulfilled, (state, action) => {
        const receivableIndex = state.accountsReceivable.findIndex(r => r.id === action.payload.id);
        if (receivableIndex !== -1) {
          state.accountsReceivable[receivableIndex] = action.payload;
        }
      })
      // Mark Payable as Paid
      .addCase(markPayableAsPaid.fulfilled, (state, action) => {
        const payableIndex = state.accountsPayable.findIndex(p => p.id === action.payload.id);
        if (payableIndex !== -1) {
          state.accountsPayable[payableIndex] = action.payload;
        }
      })
      // Create Receivable
      .addCase(createReceivable.fulfilled, (state, action) => {
        state.accountsReceivable.unshift(action.payload);
      })
      // Create Payable
      .addCase(createPayable.fulfilled, (state, action) => {
        state.accountsPayable.unshift(action.payload);
      });
  },
});

export const { clearError } = financeSlice.actions;
export default financeSlice.reducer;
