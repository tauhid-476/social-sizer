"use client"
import React,{useState} from 'react'
import axios from "axios"
import { useRouter } from 'next/navigation'
//just to redirect to home page once uploading is done
const UploadVideo = () => {
  const router = useRouter();
  const[file,setFile] = useState<File |null>(null);
  const [title,setTitle] = useState("")
  const[description,setDescription] = useState("")
  const[isUploading,setIsUploading] = useState(false)

  //max file size of 60 mb
   const MAX_FILE_SIZE = 60 * 1024 * 1024;
   //upload video is a form
   //design the handleSubmmit function
   const handleSubmit = async (e: React.FormEvent)=>{
    e.preventDefault();

    if(!file) return;

    if(file.size > MAX_FILE_SIZE){
    alert("File is too large. Max file size is 60MB");
    return;
    }


    //steps --> get alll the data from the form
    //send the data to the api
    //get the response
    //display in the frontend

     setIsUploading(true);
     const formData = new FormData();
     formData.append("file", file);
     formData.append("title", title);
     formData.append("description", description);
     formData.append("originalSize",file.size.toString());

     try {
      const response = await axios.post("/api/video-upload",formData)

      if(response.status===200){
        alert("Video uploaded successfully");
      }
      router.push("/")
     //check for 200 response
     } catch (error) {
      console.log("Error uploding video",error);
     }finally{
      setIsUploading(false);
     }
   }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Upload Video</h1> 
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='label'>
            <span className=' label-text'>
              Title
            </span>
          </label>
          <input
           type="text"
           value={title}
           onChange={(e)=> setTitle(e.target.value)}
           className='input input-bordered w-full'
           required
           />
        </div>

        <div>
          <label className='description'>
            <span className=' label-text'>
              Description
            </span>
          </label>
          <textarea 
          value={description}
          onChange={(e)=> setDescription(e.target.value)}
          className='textarea textarea-bordered w-full'
          />
        </div>

        <div>
          <label className='label'>
            <span className=' label-text'>
              Video File
            </span>
          </label>
          <input
           type="file"
           accept="video/*"
           onChange={(e)=>setFile(e.target.files?.[0] || null)}
           className='file-input file-input-primary w-full'
           required
           />
        </div>

        <button
        type='submit'
        className='btn btn-primary'
        disabled={isUploading}
        >
          {isUploading ? "Uploading...":"Uplaod Video"}
        </button>
        
      </form>     
    </div>
  )
}

export default UploadVideo