import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('TodosAccess');
AWSXRay.setLogger(logger);
const XAWS = AWSXRay.captureAWS(AWS);

const docClient: DocumentClient = createDynamoDBClient();
const todosTable = process.env.TODOS_TABLE;

export async function save(todo: TodoItem): Promise<TodoItem> {
   await docClient.put({
     TableName: todosTable,
     Item: todo
   }).promise()

   logger.info('Created new todo', {payload: todo});
   return todo
}

export async function update(todoId: string, userId: string, data: UpdateTodoRequest): Promise<void> {
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

export async function updateAttatchment (url: string, todoId: string, userId): Promise<any> {
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

export async function remove (todoId: string, userId: string): Promise<void> {
 await docClient.delete({
   TableName: todosTable,
   Key:{
     userId: userId,
     todoId: todoId
   }
 }).promise();

 logger.info('Todo deleted', {id: todoId});
}

export async function getAll(userId: string): Promise<TodoItem[]> {
   const response = await docClient.query({
       TableName: todosTable,
       KeyConditionExpression: 'userId = :userId',
       ExpressionAttributeValues: {
           ':userId': userId
       }
   }).promise();

   return response.Items as TodoItem[];
}

function createDynamoDBClient() {
  console.log('Creating a local DynamoDB instance')  
  return new XAWS.DynamoDB.DocumentClient()
}