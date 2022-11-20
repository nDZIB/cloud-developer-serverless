import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('Attatchments');
AWSXRay.setLogger(logger);

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export function buildFileDownloadUrl(key: string) {
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
}

export async function deleteAttatchment(key: string): Promise<void> {
    await s3.deleteObject({
        Bucket: bucketName,
        Key: key
    }).promise();
}

export async function createAttachmentPresignedUrl(attatchmentId: string): Promise<string> {
    logger.info('Generating upload url', {attatchmentId: attatchmentId});
    return getUploadUrl(attatchmentId);
}

function getUploadUrl(attatchmentId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attatchmentId,
        Expires: urlExpiration
    })
}