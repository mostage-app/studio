import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
// AWS_REGION is automatically set by Lambda runtime
const S3_REGION =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-central-1";

// Initialize S3 client
const s3Client = new S3Client({ region: S3_REGION });

interface UploadRequest {
  image: string; // base64 encoded image
  filename: string;
  contentType: string;
}

/**
 * Lambda handler for image upload
 * Accepts JSON with base64 encoded image
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Check bucket name
    if (!S3_BUCKET_NAME) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "S3 bucket not configured" }),
      };
    }

    // Check authentication
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    let requestData: UploadRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    // Validate required fields
    if (
      !requestData.image ||
      !requestData.filename ||
      !requestData.contentType
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing required fields: image, filename, contentType",
        }),
      };
    }

    // Decode base64 image
    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(requestData.image, "base64");
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Invalid base64 image data" }),
      };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (imageBuffer.length > maxSize) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "File size exceeds 2MB limit" }),
      };
    }

    // Validate file type
    const validMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validMimeTypes.includes(requestData.contentType)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.",
        }),
      };
    }

    // Generate unique file key
    const fileExtension = requestData.filename.split(".").pop() || "jpg";
    const fileKey = `images/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      Body: imageBuffer,
      ContentType: requestData.contentType,
      CacheControl: "max-age=31536000", // 1 year cache
    });

    await s3Client.send(putCommand);

    // Generate public URL
    const imageUrl = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${fileKey}`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        url: imageUrl,
        key: fileKey,
      }),
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};
