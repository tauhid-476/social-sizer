"use client"
import VideoCard from '@/components/VideoCard'
import { Video } from '@/types'
import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'


const Home = () => {
  const[videos, setVideos] = useState<Video[]>([])
  const[isLoading, setIsLoading] = useState(true)
  const[error, setError] = useState<string | null>(null)

  const getAllVideos = useCallback(async()=>{
    try {
      setIsLoading(true)
      const response = await axios.get("/api/videos")
      if(Array.isArray(response.data)){
        setVideos(response.data)
      }else{
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.log("Error showing videos fend",error);
      setError("Error showing videos")
    }finally{
      setIsLoading(false);
    }
  },[])

  useEffect(()=>{
    getAllVideos();
  },[getAllVideos])

  const handleDownload = useCallback((url: string, title: string) => {
    
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${title}.mp4`);
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}, [])

    if(isLoading){
      return <div>Loading...</div>
    }
    return (
      <div className="container mx-auto p-4 mt-0">
        <h1 className="text-2xl font-bold mb-4">Recent Uploads on SocialSizer </h1>
        {videos.length === 0 ? (
          <div className="text-center text-lg text-gray-500">
            No videos available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {
              videos.map((video) => (
                  <VideoCard
                      key={video.id}
                      video={video}
                      onDownload={handleDownload}
                  />
              ))
            }
          </div>
        )}
        
      </div>
    );
}

export default Home