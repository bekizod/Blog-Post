// src/store/authSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  validationErrors: null,
};

interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    accessToken: string;
  };
  errors?: Record<string, string>;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>('https://course-start.onrender.com/auth/login', {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === 'error') {
        if (response.data.errors) {
          return rejectWithValue({
            validationErrors: response.data.errors,
            message: response.data.message,
          });
        }
        return rejectWithValue({ message: response.data.message });
      }

      const token = response.data.data?.accessToken;
      if (!token) {
        return rejectWithValue({ message: 'No token received' });
      }

      // Store token in cookie (expires in 1 day)
      Cookies.set('auth_token', token, { expires: 1, secure: true, sameSite: 'strict' });

      toast.success(response.data.message);
      return token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as LoginResponse;
        if (responseData?.errors) {
          return rejectWithValue({
            validationErrors: responseData.errors,
            message: responseData.message,
          });
        }
        return rejectWithValue({ message: responseData?.message || 'Login failed' });
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      Cookies.remove('auth_token');
      state.token = null;
      state.isAuthenticated = false;
      toast.success('Logged out successfully');
    },
    initializeAuth(state) {
      const token = Cookies.get('auth_token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
    clearErrors(state) {
      state.error = null;
      state.validationErrors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error = payload?.message || 'Login failed';
        state.validationErrors = payload?.validationErrors || null;
        
        if (payload?.message) {
          toast.error(payload.message);
        }
      });
  },
});

export const { logout, initializeAuth, clearErrors } = authSlice.actions;
export default authSlice.reducer;