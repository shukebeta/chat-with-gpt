import { 
    S3,
    PutObjectCommand,
    GetObjectCommand,
    StorageClass, // Import the StorageClass type
} from "@aws-sdk/client-s3";
import type { Readable } from 'stream';
import ObjectStore from "./index";

const bucket = process.env.S3_BUCKET;

const s3 = new S3({
    region: process.env.DEFAULT_S3_REGION,
});

export default class S3ObjectStore extends ObjectStore {
    public async get(key: string) {
        const params = {
            Bucket: bucket,
            Key: key,
        };
        const data = await s3.send(new GetObjectCommand(params));
        return await readStream(data.Body as Readable);
    }

    public async put(key: string, value: string, contentType: string) {
        const params = {
            Bucket: bucket,
            Key: key,
            Body: value,
            ContentType: contentType,
            StorageClass: "INTELLIGENT_TIERING" as StorageClass, // Cast to StorageClass type
        };
        await s3.send(new PutObjectCommand(params));
    }
}

async function readStream(stream: Readable) {
    const chunks: Buffer[] = []; // Type the chunks array to Buffer for better type safety
    for await (const chunk of stream) {
        chunks.push(chunk as Buffer); // Ensure the chunk is treated as a Buffer
    }
    return Buffer.concat(chunks).toString('utf8');
}
