import { authAPI, LoginParamsType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appActions } from "app/app.reducer";
import { clearTasksAndTodolists } from "common/actions/common.actions";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
    })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = false;
      });
  }
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;

// thunks

const login = createAppAsyncThunk<undefined, { data: LoginParamsType }
>("auth/login", async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await authAPI
        .login(arg.data);

      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch
      (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }

  }
);
// export const loginTC =
//   (data: LoginParamsType): AppThunk =>
//     (dispatch) => {
//       dispatch(appActions.setAppStatus({ status: "loading" }));
//       authAPI
//         .login(data)
//         .then((res) => {
//           if (res.data.resultCode === 0) {
//             dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//           } else {
//             handleServerAppError(res.data, dispatch);
//           }
//         })
//         .catch((error) => {
//           handleServerNetworkError(error, dispatch);
//         });
//     };

const logout = createAppAsyncThunk("auth/logout", async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await authAPI
        .logout();

      if (res.data.resultCode === 0) {
        dispatch(clearTasksAndTodolists());
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch
      (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }

  }
);

// export const logoutTC = (): AppThunk => (dispatch) => {
//   dispatch(appActions.setAppStatus({ status: "loading" }));
//   authAPI
//     .logout()
//     .then((res) => {
//       if (res.data.resultCode === 0) {
//         dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
//         dispatch(clearTasksAndTodolists());
//         dispatch(appActions.setAppStatus({ status: "succeeded" }));
//       } else {
//         handleServerAppError(res.data, dispatch);
//       }
//     })
//     .catch((error) => {
//       handleServerNetworkError(error, dispatch);
//     });
// };

export const authThunk = { login, logout };