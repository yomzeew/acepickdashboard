import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Dispute {
  id: string;
  type: 'service' | 'marketplace' | 'delivery';
  relatedId: string; // serviceRequestId, transactionId, or deliveryId
  complainantId: string;
  complainantName: string;
  complainantType: 'client' | 'professional' | 'rider';
  respondentId: string;
  respondentName: string;
  respondentType: 'client' | 'professional' | 'rider';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  refundAmount?: number;
  evidence: DisputeEvidence[];
  adminNotes?: string;
  assignedAdminId?: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  type: 'image' | 'document' | 'chat_log' | 'call_log' | 'transaction_record';
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface DisputeState {
  disputes: Dispute[];
  selectedDispute: Dispute | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    total: number;
    limit: number;
  };
  filters: {
    status: string;
    type: string;
    priority: string;
  };
}

const initialState: DisputeState = {
  disputes: [],
  selectedDispute: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    status: 'all',
    type: 'all',
    priority: 'all',
  },
};

// Async thunks
export const fetchDisputes = createAsyncThunk(
  'disputes/fetchDisputes',
  async (params: { page?: number; limit?: number; status?: string; type?: string; priority?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/disputes', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch disputes');
    }
  }
);

export const fetchDisputeById = createAsyncThunk(
  'disputes/fetchDisputeById',
  async (disputeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/disputes/${disputeId}`);
      return response.data.dispute;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dispute');
    }
  }
);

export const updateDisputeStatus = createAsyncThunk(
  'disputes/updateDisputeStatus',
  async ({ disputeId, status, adminNotes }: { disputeId: string; status: string; adminNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/disputes/${disputeId}/status`, { status, adminNotes });
      return response.data.dispute;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update dispute status');
    }
  }
);

export const resolveDispute = createAsyncThunk(
  'disputes/resolveDispute',
  async (
    { disputeId, resolution, refundAmount, adminNotes }: { 
      disputeId: string; 
      resolution: string; 
      refundAmount?: number; 
      adminNotes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/disputes/${disputeId}/resolve`, {
        resolution,
        refundAmount,
        adminNotes,
      });
      return response.data.dispute;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve dispute');
    }
  }
);

export const addDisputeEvidence = createAsyncThunk(
  'disputes/addDisputeEvidence',
  async (
    { disputeId, evidence }: { disputeId: string; evidence: { type: string; file: File; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('type', evidence.type);
      formData.append('file', evidence.file);
      if (evidence.description) {
        formData.append('description', evidence.description);
      }

      const response = await axios.post(`/api/disputes/${disputeId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.evidence;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add evidence');
    }
  }
);

export const assignDisputeToAdmin = createAsyncThunk(
  'disputes/assignDisputeToAdmin',
  async ({ disputeId, adminId }: { disputeId: string; adminId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/disputes/${disputeId}/assign`, { adminId });
      return response.data.dispute;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign dispute');
    }
  }
);

const disputeSlice = createSlice({
  name: 'disputes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDispute: (state, action: PayloadAction<Dispute | null>) => {
      state.selectedDispute = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        type: 'all',
        priority: 'all',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Disputes
      .addCase(fetchDisputes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisputes.fulfilled, (state, action) => {
        state.loading = false;
        state.disputes = action.payload.disputes;
        state.pagination = {
          page: action.payload.page,
          total: action.payload.total,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dispute By ID
      .addCase(fetchDisputeById.fulfilled, (state, action) => {
        state.selectedDispute = action.payload;
      })
      // Update Dispute Status
      .addCase(updateDisputeStatus.fulfilled, (state, action) => {
        const disputeIndex = state.disputes.findIndex(d => d.id === action.payload.id);
        if (disputeIndex !== -1) {
          state.disputes[disputeIndex] = action.payload;
        }
        if (state.selectedDispute?.id === action.payload.id) {
          state.selectedDispute = action.payload;
        }
      })
      // Resolve Dispute
      .addCase(resolveDispute.fulfilled, (state, action) => {
        const disputeIndex = state.disputes.findIndex(d => d.id === action.payload.id);
        if (disputeIndex !== -1) {
          state.disputes[disputeIndex] = action.payload;
        }
        if (state.selectedDispute?.id === action.payload.id) {
          state.selectedDispute = action.payload;
        }
      })
      // Add Dispute Evidence
      .addCase(addDisputeEvidence.fulfilled, (state, action) => {
        if (state.selectedDispute) {
          state.selectedDispute.evidence.push(action.payload);
        }
      })
      // Assign Dispute to Admin
      .addCase(assignDisputeToAdmin.fulfilled, (state, action) => {
        const disputeIndex = state.disputes.findIndex(d => d.id === action.payload.id);
        if (disputeIndex !== -1) {
          state.disputes[disputeIndex] = action.payload;
        }
        if (state.selectedDispute?.id === action.payload.id) {
          state.selectedDispute = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedDispute, setFilters, clearFilters } = disputeSlice.actions;
export default disputeSlice.reducer;
