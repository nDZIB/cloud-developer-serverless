import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'

// import { createAttachmentPresignedUrl } from '../../helpers/todos'
// import { getUserId } from '../utils'
import { buildFileDownloadUrl, createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'
import { setTodoAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const attatchmentId = uuid.v4();
    const url: string = await createAttachmentPresignedUrl(attatchmentId);

    const fileAccessUrl = buildFileDownloadUrl(attatchmentId);
    await setTodoAttachmentUrl(fileAccessUrl, todoId, getUserId(event));
  
    return {
      statusCode: 200,
      body: JSON.stringify({uploadUrl: url})
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
