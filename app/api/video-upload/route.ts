//same a simage upload with minor tweaks
import { v2 as cloudinary} from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

// this api :
//uploadvideo
//response  comes bacck with public_id
//thru this public id store everything in database
//everything means the durations etc...

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET

});

interface CloudinaryUploadResults {
  public_id: string;
  [key: string]: any
  bytes: number;
  duration?: number;
}
//video--> we need to calculate the compressed size
export async function POST(request: NextRequest) {
  try {

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    //good habit in saas product --> check for errors if there are no envs
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json({ error: "Cloudinary credentiasl not found" }, { status: 500 })
    }



    const formData = await request.formData();

    //name it according to frontend
    //add more field since its a video
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 })
    }


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);


    const result = await new Promise<CloudinaryUploadResults>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: "video",
            folder: "next-cloudinary-videos",
            transformation: [
              {quality: "auto",fetch_format:"mp4",}
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as CloudinaryUploadResults)
          }
        )
        uploadStream.end(buffer)
      }
    )

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      }
    })
    console.log("The result object is: ",result);
    
    console.log("Video uploaded successfully", video);
    
    return NextResponse.json(video)

  } catch (error) {
    console.log("Upload video failed", error);
    return NextResponse.json({ error: "Error uploading video" }, { status: 500 })
  }finally{
    await prisma.$disconnect();
  }

}


