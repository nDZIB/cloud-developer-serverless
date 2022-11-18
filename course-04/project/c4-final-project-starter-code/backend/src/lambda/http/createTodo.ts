import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { buildTodo, createTodo } from '../../helpers/todos'
import { TodoItem } from '../../models/TodoItem'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const todo: TodoItem = buildTodo(newTodo, getUserId(event));
    const savedTodo = await createTodo(todo);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: savedTodo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
