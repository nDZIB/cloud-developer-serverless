import {createDynamoDBClient} from './todosAcess';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import * as createError from 'http-errors'

const todosTable = process.env.TODOS_TABLE;
const docClient: DocumentClient = createDynamoDBClient();
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

export async function createTodo (todo: TodoItem): Promise<TodoItem> {
    await docClient.put({
      TableName: todosTable,
      Item: todo
    }).promise()

    logger.info('Created new todo', {payload: todo});
    return todo
}

export async function updateTodo(todoId: string, userId: string, data: UpdateTodoRequest): Promise<void> {
  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    },
    UpdateExpression: 'set #tn = :todoName, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#tn': 'name'
    },
    ExpressionAttributeValues: {
        ':todoName': data.name,
        ':dueDate': data.dueDate,
        ':done': data.done
    }
  }).promise()

  logger.info('Successfully updated todo', {fields: data, todo: todoId});
}

export async function setTodoAttachmentUrl (url: string, todoId: string, userId): Promise<any> {
    await docClient.update({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
          ':url': url
      }
    }).promise()

    return url;
}

export async function deleteTodo (todoId: string, userId: string): Promise<void> {
  await docClient.delete({
    TableName: todosTable,
    Key:{
      userId: userId,
      todoId: todoId
    }
  }).promise();

  logger.info('Todo deleted', {id: todoId});
}


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const response = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    logger.info('User requested todos', {userId: userId});

    return response.Items as TodoItem[];
}