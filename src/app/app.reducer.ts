import { Dispatch } from "redux";
import { authAPI, TaskType, todolistsAPI } from "api/todolists-api";
import { authActions } from "features/auth/auth.reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";
import { handleServerNetworkError } from "utils/error-utils";

const initialState = {
  status: "idle" as RequestStatusType,
  error: null as string | null,
  isInitialized: false
};

export type AppInitialStateType = typeof initialState;
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error;
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status;
    },
    // setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
    //   state.isInitialized = action.payload.isInitialized;
    // }
  },
  extraReducers: (builder)=> {
    builder.addCase(initializeApp.fulfilled, (state, action)=> {
      state.isInitialized = action.payload.isInitialized;
    })
}
});

export const appReducer = slice.reducer;
export const appActions = slice.actions;


const initializeApp = createAppAsyncThunk<{ isInitialized: boolean }
  >("app/initializeApp", async (arg, thunkAPI) => {
      const { dispatch, rejectWithValue } = thunkAPI;
      try {
        const res = await authAPI.me();
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
        } else {
        }
        return { isInitialized: true }
      } catch
        (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
      }

    }
  )
;
// export const initializeAppTC = () => (dispatch: Dispatch) => {
//   authAPI.me().then((res) => {
//     if (res.data.resultCode === 0) {
//       dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
//     } else {
//     }
//
//     dispatch(appActions.setAppInitialized({ isInitialized: true }));
//   });
// };

export const appThunk = {initializeApp}