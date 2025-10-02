import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  updatedAt: string;
  stock: number;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
}

export interface Transaction {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  riderId?: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
}

interface MarketplaceState {
  products: Product[];
  transactions: Transaction[];
  pendingApprovals: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  selectedTransaction: Transaction | null;
  pagination: {
    products: { page: number; total: number; limit: number };
    transactions: { page: number; total: number; limit: number };
  };
}

const initialState: MarketplaceState = {
  products: [],
  transactions: [],
  pendingApprovals: [],
  loading: false,
  error: null,
  selectedProduct: null,
  selectedTransaction: null,
  pagination: {
    products: { page: 1, total: 0, limit: 10 },
    transactions: { page: 1, total: 0, limit: 10 },
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (params: { page?: number; limit?: number; status?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/marketplace/products', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'marketplace/fetchTransactions',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/marketplace/transactions', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  'marketplace/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/marketplace/products?status=pending');
      return response.data.products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }
);

export const approveProduct = createAsyncThunk(
  'marketplace/approveProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/marketplace/products/${productId}/approve`);
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve product');
    }
  }
);

export const rejectProduct = createAsyncThunk(
  'marketplace/rejectProduct',
  async ({ productId, reason }: { productId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/marketplace/products/${productId}/reject`, { reason });
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject product');
    }
  }
);

export const suspendProduct = createAsyncThunk(
  'marketplace/suspendProduct',
  async ({ productId, reason }: { productId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/marketplace/products/${productId}/suspend`, { reason });
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to suspend product');
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination.products = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination.transactions = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Pending Approvals
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.pendingApprovals = action.payload;
      })
      // Approve Product
      .addCase(approveProduct.fulfilled, (state, action) => {
        const productId = action.payload.id;
        state.pendingApprovals = state.pendingApprovals.filter(p => p.id !== productId);
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex] = action.payload;
        }
      })
      // Reject Product
      .addCase(rejectProduct.fulfilled, (state, action) => {
        const productId = action.payload.id;
        state.pendingApprovals = state.pendingApprovals.filter(p => p.id !== productId);
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex] = action.payload;
        }
      })
      // Suspend Product
      .addCase(suspendProduct.fulfilled, (state, action) => {
        const productIndex = state.products.findIndex(p => p.id === action.payload.id);
        if (productIndex !== -1) {
          state.products[productIndex] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedProduct, setSelectedTransaction } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
