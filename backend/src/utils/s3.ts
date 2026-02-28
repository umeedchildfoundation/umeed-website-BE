import chalk from 'chalk';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// We initialize the client inside a function or lazily so that it doesn't throw if env variables are not present during build Time
let s3Client: S3Client | null = null;

const getS3Client = () => {
    if (s3Client) return s3Client;

    const region = process.env.AWS_REGION || 'ap-south-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
        console.warn(chalk.yellow('AWS credentials are not properly configured.'));
    }

    s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId: accessKeyId || '',
            secretAccessKey: secretAccessKey || '',
        },
    });

    return s3Client;
};

/**
 * Uploads a file buffer to AWS S3 and returns the public file URL.
 * 
 * @param fileBuffer - The file data as a Buffer
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file (e.g., 'image/png')
 * @param folder - Goal folder in bucket (e.g., 'uploads')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFileToS3 = async (
    fileBuffer: Buffer, 
    fileName: string, 
    mimeType: string,
    folder: string = 'uploads'
): Promise<string> => {
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const region = process.env.AWS_REGION || 'ap-south-1';

        if (!bucketName) {
            throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
        }

        const ext = path.extname(fileName);
        const uniqueFileName = `${folder}/${uuidv4()}${ext}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: mimeType,
            // ACL: 'public-read' // Uncomment if bucket ACL is enabled and you need it
        });

        const client = getS3Client();
        await client.send(command);

        // Construct the public URL
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
        return fileUrl;
    } catch (error) {
        console.error(chalk.red('Error uploading file to S3:'),  error);
        throw new Error('Failed to upload file to S3');
    }
};

/**
 * Deletes a file from AWS S3 using its public URL.
 * 
 * @param fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} True if successfully deleted
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<boolean> => {
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const region = process.env.AWS_REGION || 'ap-south-1';

        if (!bucketName) {
            throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
        }

        // We assume the URL format is: https://{bucketName}.s3.{region}.amazonaws.com/{key}
        // or https://{bucketName}.s3.amazonaws.com/{key}
        const bucketUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
        let key = '';

        if (fileUrl.startsWith(bucketUrl)) {
            key = fileUrl.replace(bucketUrl, '');
        } else {
            // A fallback for S3 URLs that might not include the region
            const fallbackUrl = `https://${bucketName}.s3.amazonaws.com/`;
            if (fileUrl.startsWith(fallbackUrl)) {
                key = fileUrl.replace(fallbackUrl, '');
            } else {
                console.warn(chalk.yellow('File URL does not match current S3 bucket or format. Cannot delete.'));
                return false;
            }
        }

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const client = getS3Client();
        await client.send(command);
        return true;
    } catch (error) {
        console.error(chalk.red('Error deleting file from S3:'),  error);
        throw new Error('Failed to delete file from S3');
    }
};
