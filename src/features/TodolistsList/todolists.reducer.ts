import { todolistsAPI, TodolistType } from "api/todolists-api";
import { appActions, RequestStatusType } from "app/app.reducer";
import { handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolists } from "common/actions/common.actions";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const initialState: TodolistDomainType[] = [];

const slice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    // removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
    //   const index = state.findIndex((todo) => todo.id === action.payload.id);
    //   if (index !== -1) state.splice(index, 1);
    //   // return state.filter(tl => tl.id !== action.payload.id)
    // },
    // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
    //   const newTodolist: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
    //   state.unshift(newTodolist);
    // },
    // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
    //   const todo = state.find((todo) => todo.id === action.payload.id);
    //   if (todo) {
    //     todo.title = action.payload.title;
    //   }
    // },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const todo = state.find((todo) => todo.id === action.payload.id);
      if (todo) {
        todo.filter = action.payload.filter;
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
      const todo = state.find((todo) => todo.id === action.payload.id);
      if (todo) {
        todo.entityStatus = action.payload.entityStatus;
      }
    }
    // setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
    //   return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    //   // return action.payload.forEach(t => ({...t, filter: 'active', entityStatus: 'idle'}))
    // }
  },
  extraReducers: (builder) => {
    builder.addCase(clearTasksAndTodolists, () => {
      return [];
    })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
      })
      .addCase(removeTodolists.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) state.splice(index, 1);
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        const newTodolist: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
        state.unshift(newTodolist);
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const todo = state.find((todo) => todo.id === action.payload.id);
        if (todo) {
          todo.title = action.payload.title;
        }
      });
  }
});


// thunks

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, undefined
>("todo/fetchTodolist", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await todolistsAPI
      .getTodolists();
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    return { todolists: res.data };

  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});
// export const fetchTodolistsTC = (): AppThunk => {
//   return (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     todolistsAPI
//       .getTodolists()
//       .then((res) => {
//         dispatch(todolistsActions.setTodolists({ todolists: res.data }));
//         dispatch(appActions.setAppStatus({ status: "succeeded" }));
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch);
//       });
//   };
// };
const removeTodolists = createAppAsyncThunk<{ id: string }, { id: string }
>("todo/removeTodolists", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.id, entityStatus: "loading" }));
    const res = await todolistsAPI.deleteTodolist(arg.id);
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    return { id: arg.id };
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});
// export const removeTodolistTC = (id: string): AppThunk => {
//   return (dispatch) => {
//     //изменим глобальный статус приложения, чтобы вверху полоса побежала
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//     dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }));
//     todolistsAPI.deleteTodolist(id).then((res) => {
//       dispatch(todolistsActions.removeTodolist({ id }));
//       //скажем глобально приложению, что асинхронная операция завершена
//       dispatch(appActions.setAppStatus({ status: "succeeded" }));
//     });
//   };
// };
const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }
>("todo/addTodolist", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    const res = await todolistsAPI.createTodolist(arg.title);
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    return { todolist: res.data.data.item };
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});
// export const addTodolistTC = (title: string): AppThunk => {
//   return (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     todolistsAPI.createTodolist(title).then((res) => {
//       dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
//       dispatch(appActions.setAppStatus({ status: "succeeded" }));
//     });
//   };
// };

const changeTodolistTitle = createAppAsyncThunk<{ id: string, title: string }, { id: string, title: string }
  >("todo/changeTodolistTitle", async (arg, thunkAPI) => {
      const { dispatch, rejectWithValue } = thunkAPI;
      try {
        const res = await todolistsAPI.updateTodolist(arg.id, arg.title);
        return { id: arg.id, title: arg.title };
      } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
      }
    }
  )
;
// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//   return (dispatch) => {
//     todolistsAPI.updateTodolist(id, title).then((res) => {
//       dispatch(todolistsActions.changeTodolistTitle({ id, title }));
//     });
//   };
// };

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistThunk = { fetchTodolists, removeTodolists, addTodolist, changeTodolistTitle };

// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
