import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import {del, put} from "@vercel/blob";
import { getMetadata} from "video-metadata-thumbnails";
//same a simage upload with minor tweaks

// this api :
//uploadvideo
//response  comes bacck with public_id
//thru this public id store everything in database
//everything means the durations etc...

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log("Connected to Prisma"))
  .catch((e) => console.log("Error connecting to Prisma", e));

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResults {
  public_id: string;
  [key: string]: any;
  bytes: number;
  duration?: number;
}

//video--> we need to calculate the compressed size
export async function POST(request: NextRequest) {
  let blobUrl = "";
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //good habit in saas product --> check for errors if there are no envs
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentiasl not found" },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    //name it according to frontend
    //add more field since its a video
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const blob = await put(`temp-videos/${file.name}`,file,{
      access:"public"
    })
    blobUrl = blob.url


    // const bytes = await file.arrayBuffer();
    // const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResults>(
      (resolve, reject) => {
         cloudinary.uploader.upload(
          blob.url,
          {
            resource_type: "video",
            folder: "next-cloudinary-videos",
            transformation: [{ quality: "auto", fetch_format: "mp4" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResults);
          }
        );
      }
    );

    await del(blobUrl);

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      },
    });
    console.log("The result object is: ", result);

    console.log("Video uploaded successfully", video);

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("Upload video failed", error.message);
    console.error(error.stack);
    
    // Attempt to delete the temporary file if it exists and an error occurred
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (deleteError) {
        console.error("Failed to delete temporary file:", deleteError);
      }
    }

    return NextResponse.json(
      { error: "Error uploading video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}