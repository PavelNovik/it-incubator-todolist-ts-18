import { TodolistDomainType, todolistsReducer, todolistThunk } from "features/TodolistsList/todolists.reducer";
import { tasksReducer, TasksStateType } from "features/TodolistsList/tasksReducer";
import { TodolistType } from "api/todolists-api";

test("ids should be equals", () => {
  const startTasksState: TasksStateType = {};
  const startTodolistsState: Array<TodolistDomainType> = [];

  let todolist: TodolistType = {
    title: "new todolist",
    id: "any id",
    addedDate: "",
    order: 0
  };

  const action = todolistThunk.addTodolist.fulfilled({ todolist }, "requestId", { title: todolist.title });

  const endTasksState = tasksReducer(startTasksState, action);
  const endTodolistsState = todolistsReducer(startTodolistsState, action);

  const keys = Object.keys(endTasksState);
  const idFromTasks = keys[0];
  const idFromTodolists = endTodolistsState[0].id;

  expect(idFromTasks).toBe(action.payload.todolist.id);
  expect(idFromTodolists).toBe(action.payload.todolist.id);
});
