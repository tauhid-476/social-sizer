import { v2 as cloudinary} from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
//additional check that only loggedin users can have access to this functionality



// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  //cuz this is going to be used  on the client side too
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
  //while these two are strictly for backend(api)
});

interface CloudinaryUploadResults {
  //always it return just like_id in mongodb
  public_id: string;
  [key: string]: any
  //allows the interface to accept any additional properties with a string key and a value of any type (any).
}

export async function POST(request:NextRequest){

  const {userId} = auth();
  if(!userId){
    return NextResponse.json({error: "Unauthorized"}, {status: 401})
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    //name it according to frontend
    //frontend --> append
    //backend--> get
    

    if(!file){
      return NextResponse.json({error: "File not found"}, {status: 400})
    }

    //Three steps

    //study more.
    //Fixed two steps 
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    //The ArrayBuffer object is used to represent a generic raw binary data buffer. It is an array of bytes, 
    //Buffer is widely used in Node.js because of its efficiency with binary data, making it perfect for tasks like streaming file uploads, reading and writing files(their sizes), and interacting with streams or network sockets.


    //now third step is just to upload

    const result = await new Promise<CloudinaryUploadResults>(
      (resolve, reject)=>{
       const uploadStream = cloudinary.uploader.upload_stream(
          //which folder to store in on cloudinary website
          {
            folder: "next-cloudinary-images",
            timestamp: Math.floor(new Date().getTime() / 1000),
          },
          (error, result)=>{
            if(error) reject(error);
            else resolve(result as CloudinaryUploadResults)
          }
        )
        uploadStream.end(buffer)
        //no more data 
      }
    )

    return NextResponse.json({publicId: result.public_id},{status: 200})

  } catch (error) {
    console.log("Cloudinary Upload image failed",error);
    return NextResponse.json({error: "Error uploading image"}, {status: 500}) 
  }
}


