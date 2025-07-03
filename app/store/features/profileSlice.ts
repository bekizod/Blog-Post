import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

interface ProfileState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string | null } };
      if (!auth.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(
        'https://course-start.onrender.com/user/profile',
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string | null } };
      if (!auth.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.put(
        'https://course-start.onrender.com/user/profile',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Update failed');
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
      }
      toast.error('An unknown error occurred');
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.user = null;
      state.error = null;
    },
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;