import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalProfessionals: number;
  totalRiders: number;
  activeUsers: number;
  totalOrders: number;
  totalServices: number;
  totalDeliveries: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingDisputes: number;
  activeDeliveries: number;
}

export interface UserAnalytics {
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  userRetentionRate: number;
  mostActiveUsers: Array<{
    id: string;
    name: string;
    type: string;
    activityScore: number;
  }>;
}

export interface RevenueAnalytics {
  dailyRevenue: Array<{ date: string; amount: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  revenueByCategory: Array<{ category: string; amount: number; percentage: number }>;
  topEarningProfessionals: Array<{
    id: string;
    name: string;
    earnings: number;
    services: number;
  }>;
}

export interface ServiceAnalytics {
  totalServices: number;
  completedServices: number;
  cancelledServices: number;
  averageRating: number;
  popularCategories: Array<{ category: string; count: number; percentage: number }>;
  serviceCompletionRate: number;
}

export interface DeliveryAnalytics {
  totalDeliveries: number;
  completedDeliveries: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  topPerformingRiders: Array<{
    id: string;
    name: string;
    deliveries: number;
    rating: number;
  }>;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  userAnalytics: UserAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  serviceAnalytics: ServiceAnalytics | null;
  deliveryAnalytics: DeliveryAnalytics | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  userAnalytics: null,
  revenueAnalytics: null,
  serviceAnalytics: null,
  deliveryAnalytics: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchUserAnalytics = createAsyncThunk(
  'analytics/fetchUserAnalytics',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/users', { params: dateRange });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user analytics');
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/revenue', { params: dateRange });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchServiceAnalytics = createAsyncThunk(
  'analytics/fetchServiceAnalytics',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/services', { params: dateRange });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service analytics');
    }
  }
);

export const fetchDeliveryAnalytics = createAsyncThunk(
  'analytics/fetchDeliveryAnalytics',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/delivery', { params: dateRange });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery analytics');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Analytics
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.userAnalytics = action.payload;
      })
      // Fetch Revenue Analytics
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics = action.payload;
      })
      // Fetch Service Analytics
      .addCase(fetchServiceAnalytics.fulfilled, (state, action) => {
        state.serviceAnalytics = action.payload;
      })
      // Fetch Delivery Analytics
      .addCase(fetchDeliveryAnalytics.fulfilled, (state, action) => {
        state.deliveryAnalytics = action.payload;
      });
  },
});

export const { clearError, setDateRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
