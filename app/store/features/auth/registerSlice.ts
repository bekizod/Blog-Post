import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

interface RegisterState {
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  registeredUser: {
    id: number | null;
    email: string | null;
    userName: string | null;
  } | null;
}

const initialState: RegisterState = {
  loading: false,
  error: null,
  validationErrors: null,
  registeredUser: null,
};

interface RegisterResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    id: number;
    email: string;
    userName: string;
  };
  errors?: Record<string, string>;
  error?: string;
  statusCode?: number;
}

export const registerUser = createAsyncThunk(
  'register/user',
  async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post<RegisterResponse>(
        'https://course-start.onrender.com/auth/register',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'error' || response.data.error) {
        if (response.data.errors) {
          return rejectWithValue({
            validationErrors: response.data.errors,
            message: response.data.message,
          });
        }
        return rejectWithValue({
          message: response.data.message || 'Registration failed',
        });
      }

      toast.success(response.data.message);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as RegisterResponse;
        if (responseData?.errors) {
          return rejectWithValue({
            validationErrors: responseData.errors,
            message: responseData.message,
          });
        }
        return rejectWithValue({
          message: responseData?.message || 'Registration failed',
        });
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    clearRegisterErrors(state) {
      state.error = null;
      state.validationErrors = null;
    },
    resetRegisterState(state) {
      state.loading = false;
      state.error = null;
      state.validationErrors = null;
      state.registeredUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.validationErrors = null;
        state.registeredUser = action.payload || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error = payload?.message || 'Registration failed';
        state.validationErrors = payload?.validationErrors || null;
        
        if (payload?.message) {
          toast.error(payload.message);
        }
      });
  },
});

export const { clearRegisterErrors, resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;