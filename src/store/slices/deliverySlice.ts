import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface DeliveryRequest {
  id: string;
  orderId: string;
  riderId?: string;
  clientId: string;
  sellerId: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  assignedAt?: string;
  deliveryFee: number;
  distance: number;
  riderName?: string;
  clientName: string;
  sellerName: string;
  trackingNumber: string;
  notes?: string;
}

export interface RiderLocation {
  riderId: string;
  riderName: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  lastUpdated: string;
}

interface DeliveryState {
  deliveryRequests: DeliveryRequest[];
  availableRiders: RiderLocation[];
  unassignedDeliveries: DeliveryRequest[];
  loading: boolean;
  error: string | null;
  selectedDelivery: DeliveryRequest | null;
  pagination: {
    page: number;
    total: number;
    limit: number;
  };
}

const initialState: DeliveryState = {
  deliveryRequests: [],
  availableRiders: [],
  unassignedDeliveries: [],
  loading: false,
  error: null,
  selectedDelivery: null,
  pagination: {
    page: 1,
    total: 0,
    limit: 10,
  },
};

// Async thunks
export const fetchDeliveryRequests = createAsyncThunk(
  'delivery/fetchDeliveryRequests',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/delivery/requests', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery requests');
    }
  }
);

export const fetchAvailableRiders = createAsyncThunk(
  'delivery/fetchAvailableRiders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/delivery/riders/available');
      return response.data.riders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available riders');
    }
  }
);

export const fetchUnassignedDeliveries = createAsyncThunk(
  'delivery/fetchUnassignedDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/delivery/requests?status=pending&unassigned=true');
      return response.data.requests;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unassigned deliveries');
    }
  }
);

export const assignRiderToDelivery = createAsyncThunk(
  'delivery/assignRiderToDelivery',
  async ({ deliveryId, riderId }: { deliveryId: string; riderId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/delivery/requests/${deliveryId}/assign`, { riderId });
      return response.data.delivery;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign rider');
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ deliveryId, status, notes }: { deliveryId: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/delivery/requests/${deliveryId}/status`, { status, notes });
      return response.data.delivery;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update delivery status');
    }
  }
);

export const trackDelivery = createAsyncThunk(
  'delivery/trackDelivery',
  async (deliveryId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/delivery/requests/${deliveryId}/track`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track delivery');
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDelivery: (state, action: PayloadAction<DeliveryRequest | null>) => {
      state.selectedDelivery = action.payload;
    },
    updateRiderLocation: (state, action: PayloadAction<RiderLocation>) => {
      const riderIndex = state.availableRiders.findIndex(r => r.riderId === action.payload.riderId);
      if (riderIndex !== -1) {
        state.availableRiders[riderIndex] = action.payload;
      } else {
        state.availableRiders.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Delivery Requests
      .addCase(fetchDeliveryRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryRequests = action.payload.requests;
        state.pagination = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchDeliveryRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Available Riders
      .addCase(fetchAvailableRiders.fulfilled, (state, action) => {
        state.availableRiders = action.payload;
      })
      // Fetch Unassigned Deliveries
      .addCase(fetchUnassignedDeliveries.fulfilled, (state, action) => {
        state.unassignedDeliveries = action.payload;
      })
      // Assign Rider to Delivery
      .addCase(assignRiderToDelivery.fulfilled, (state, action) => {
        const deliveryIndex = state.deliveryRequests.findIndex(d => d.id === action.payload.id);
        if (deliveryIndex !== -1) {
          state.deliveryRequests[deliveryIndex] = action.payload;
        }
        state.unassignedDeliveries = state.unassignedDeliveries.filter(d => d.id !== action.payload.id);
      })
      // Update Delivery Status
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const deliveryIndex = state.deliveryRequests.findIndex(d => d.id === action.payload.id);
        if (deliveryIndex !== -1) {
          state.deliveryRequests[deliveryIndex] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedDelivery, updateRiderLocation } = deliverySlice.actions;
export default deliverySlice.reducer;
