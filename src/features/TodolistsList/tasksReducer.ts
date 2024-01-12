import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api";
import { AppDispatch, AppRootStateType, AppThunk } from "app/store";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appActions } from "app/app.reducer";
import { todolistsActions } from "features/TodolistsList/todolists.reducer";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolists } from "common/actions/common.actions";
import type { Dispatch } from "redux";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      const tasks = state[action.payload.todolistId];
      const index = tasks.findIndex((t) => t.id === action.payload.taskId);
      if (index !== -1) tasks.splice(index, 1);
    },
    // addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
    //   const tasks = state[action.payload.task.todoListId];
    //   tasks.unshift(action.payload.task);
    // },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        model: UpdateDomainTaskModelType;
        todolistId: string;
      }>
    ) => {
      const tasks = state[action.payload.todolistId];
      const index = tasks.findIndex((t) => t.id === action.payload.taskId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...action.payload.model };
      }
    }
    // setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
    //   state[action.payload.todolistId] = action.payload.tasks;
    // }
  },
  extraReducers: (builder) => {
    builder
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id];
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = [];
        });
      })
      .addCase(clearTasksAndTodolists, () => {
        return {};
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId];
        tasks.unshift(action.payload.task);
      });
    // .addCase(fetchTasks.rejected, (state, action)=> {})
  }
});


// thunks

// export type AsyncThunkConfig = {
//   state?: unknown
//   dispatch?: Dispatch
//   extra?: unknown
//   rejectValue?: unknown
//   serializedErrorType?: unknown
//   pendingMeta?: unknown
//   fulfilledMeta?: unknown
//   rejectedMeta?: unknown
// }

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string
  // {  state: AppRootStateType,
  // dispatch: AppDispatch,
  // rejectValue: null}
>("tasks/fetchTasks", async (todolistId: string, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));

    const res = await todolistsAPI.getTasks(todolistId);

    const tasks = res.data.items;

    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    // dispatch(tasksActions.setTasks({ tasks, todolistId }));
    return { tasks, todolistId };
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }

});
// export const fetchTasksTC =
//   (todolistId: string): AppThunk =>
//     (dispatch) => {
//       dispatch(appActions.setAppStatus({ status: "loading" }));
//       todolistsAPI.getTasks(todolistId).then((res) => {
//         const tasks = res.data.items;
//         dispatch(tasksActions.setTasks({ tasks, todolistId }));
//         dispatch(appActions.setAppStatus({ status: "succeeded" }));
//       });
//     };

export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
    (dispatch) => {
      todolistsAPI.deleteTask(todolistId, taskId).then(() => {
        dispatch(tasksActions.removeTask({ taskId, todolistId }));
      });
    };

const addTask = createAppAsyncThunk<{ task: TaskType }, { title: string; todolistId: string }>(
  `${slice.name}/addTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await todolistsAPI.createTask(arg.todolistId, arg.title);
      if (res.data.resultCode === 0) {
        const task = res.data.data.item;
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { task };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

// export const addTask = createAppAsyncThunk<any, any>(`${slice.name}/addTask`, async (arg, thunkAPI) => {
//   const { dispatch, rejectWithValue } = thunkAPI;
//   try {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     const res = await todolistsAPI
//       .createTask(todolistId, title);
//
//     if (res.data.resultCode === 0) {
//       const task = res.data.data.item;
//       dispatch(tasksActions.addTask({ task }));
//       dispatch(appActions.setAppStatus({ status: "succeeded" })
//     } else {
//       handleServerAppError(res.data, dispatch);
//     }
//   } catch (e) {
//     handleServerNetworkError(e, dispatch);
//     return rejectWithValue(null);
//   }
//   }
//   )
// export const addTaskTC =
//   (title: string, todolistId: string): AppThunk =>
//     (dispatch) => {
//       dispatch(appActions.setAppStatus({ status: "loading" }));
//       todolistsAPI
//         .createTask(todolistId, title)
//         .then((res) => {
//           if (res.data.resultCode === 0) {
//             const task = res.data.data.item;
//             dispatch(tasksActions.addTask({ task }));
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//           } else {
//             handleServerAppError(res.data, dispatch);
//           }
//         })
//         .catch((error) => {
//           handleServerNetworkError(error, dispatch);
//         });
//     };
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
    (dispatch, getState) => {
      const state = getState();
      const task = state.tasks[todolistId].find((t) => t.id === taskId);
      if (!task) {
        //throw new Error("task not found in the state");
        console.warn("task not found in the state");
        return;
      }

      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...domainModel
      };

      todolistsAPI
        .updateTask(todolistId, taskId, apiModel)
        .then((res) => {
          if (res.data.resultCode === 0) {
            dispatch(tasksActions.updateTask({ taskId, model: domainModel, todolistId }));
          } else {
            handleServerAppError(res.data, dispatch);
          }
        })
        .catch((error) => {
          handleServerNetworkError(error, dispatch);
        });
    };

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask };


// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};