import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";



const prisma = new PrismaClient();
///for deleteting a video
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//get all the videos
export async function GET(request: NextRequest) {
  try {
     const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc"}
     })

     return NextResponse.json(videos)

  } catch (error) {
    return NextResponse.json({error: "Error fetching videos"}, {status: 500})
  }finally{
    await prisma.$disconnect();
  }
}

export async function DELETE(request:Request){
  try {
    //check users
    //cgeck credentiasl
    //get the video id whic has to be deleted
    //fetch the video and delete
    //first destroy from cloudinary and
    //delete it from the databse

    const userId =  auth();
    if(!userId){
      return NextResponse.json({error:"Unauthorized"},{status:401})
    }

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

    const {searchParams} = new URL(request.url);
    const videoId = searchParams.get("id");

    if(!videoId){
      return NextResponse.json({error:"Video Id not found"},{status:404})
    }

    const video = await prisma.video.findUnique({
      where:{id: videoId}
    })

    if(!video){
      return NextResponse.json({error:"Video not found"},{status:404})
    }

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(video.publicId, { resource_type: "video" }, (error, result) => {
        if (error) reject(error);
        else resolve();
      });
    });

    await prisma.video.delete({
      where: { id: videoId}
    })
    
    console.log("Video deleted successfully");

    return NextResponse.json({message:"Video deleted successfully"},{status:200})
    

  } catch (error: any) {
    console.error("Delete video failed", error.message);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Error deleting video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}