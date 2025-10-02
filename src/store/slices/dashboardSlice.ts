import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/axios';

// Types
export interface DashboardOverview {
  totalUsers: number;
  totalOrders: number;
  activeDeliveries: number;
  monthlyRevenue: number;
  totalClients: number;
  totalProfessionals: number;
  totalRiders: number;
}

export interface DashboardActivity {
  id: string | number;
  type: string;
  description: string;
  time: string;
  status: 'success' | 'failed' | 'pending' | 'processing';
}

export interface TopPerformer {
  id: string | number;
  name: string;
  type: 'Professional' | 'Rider' | string;
  rating: number;
  earnings: string | number;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  totaljobs?: number;
}

// Paginated response types
interface Paginated<T> {
  rows: T[];
  count: number;
}

interface DashboardState {
  overview: DashboardOverview | null;
  activities: Paginated<DashboardActivity> | null;
  topPerformers: TopPerformer[]; // not paginated from your response
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  overview: null,
  activities: null,
  topPerformers: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/admin/dashboard/overview');
      const data = response.data.data;

      const mapped: DashboardOverview = {
        totalUsers: data.totalUsers,
        totalOrders: data.activeOrders,
        activeDeliveries: data.activeDeliveries,
        monthlyRevenue: data.monthlyRevenue,
        totalClients: data.clients,
        totalProfessionals: data.professionals,
        totalRiders: data.riders,
      };

      return mapped;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard overview');
    }
  }
);

export const fetchDashboardActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (
    { status, page, limit }: { status: string; page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get('/api/admin/dashboard/activities', {
        params: { status, page, limit },
      });
      const { rows, count } = response.data.data;

      const mapped: DashboardActivity[] = rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        description: row.action,
        time: row.createdAt,
        status: row.status,
      }));

      return { rows: mapped, count };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard activities');
    }
  }
);

export const fetchTopPerformers = createAsyncThunk(
    'dashboard/fetchTopPerformers',
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiClient.get('/api/admin/dashboard/top-performers');
        const rows = response.data.data; // plain array
  
        const mapped: TopPerformer[] = rows.map((item: any) => ({
          id: item.profile.id,
          name: `${item.profile?.firstName || ''} ${item.profile?.lastName || ''}`.trim(),
          role: item.role,
          rating: Number(item.avgRating || 0),
          totaljobs: item.profile?.totalJobs || 0,
          avatar: item.profile?.avatar || null,
          email:item?.email || null,    
          phone:item?.phone || null,
          status:item?.status || null,
          userid:item.id || null
        }));
        console.log(mapped, 'mapped')
  
        return mapped; // just array
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch top performers');
      }
    }
  );

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action: PayloadAction<DashboardOverview>) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Activities
      .addCase(fetchDashboardActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardActivities.fulfilled, (state, action: PayloadAction<Paginated<DashboardActivity>>) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchDashboardActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Top Performers
      .addCase(fetchTopPerformers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopPerformers.fulfilled, (state, action: PayloadAction<TopPerformer[]>) => {
        state.loading = false;
        state.topPerformers = action.payload;
      })
      .addCase(fetchTopPerformers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
