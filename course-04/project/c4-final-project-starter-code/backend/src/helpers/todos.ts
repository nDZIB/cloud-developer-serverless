import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import {save, update, remove, getAll, updateAttatchment} from './todosAcess';

const logger = createLogger('ToDos');

export function buildTodo(newTodo: CreateTodoRequest, userId: string): TodoItem {
   const todo = {
        todoId: uuid.v4(),
        userId: userId,
        createdAt: new Date().toISOString(),
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: ""
       }
       return todo;
}

export async function createTodo (newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todo = buildTodo(newTodo, userId);
    await save(todo);
    return todo
}

export async function updateTodo(todoId: string, userId: string, data: UpdateTodoRequest): Promise<void> {
  update(todoId, userId, data);
  logger.info('Successfully updated todo', {fields: data, todo: todoId});
}

export async function setTodoAttachmentUrl (url: string, todoId: string, userId): Promise<any> {
    await updateAttatchment(url, todoId, userId);
    return url;
}

export async function deleteTodo (todoId: string, userId: string): Promise<void> {
  await remove(todoId, userId);
  logger.info('Todo deleted', {id: todoId});
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const items = await getAll(userId);
    return items;
}