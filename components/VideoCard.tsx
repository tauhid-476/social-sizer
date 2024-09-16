import React,{useState, useEffect, useCallback} from 'react'
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'
import {filesize} from 'filesize'
import { Download, Clock, FileDown, FileUp, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Video } from '@/types'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; 


//to get relative time like 6 days ago etc...
dayjs.extend(relativeTime);

interface VideoCardProps{
  video: Video
  onDownload: (url:string,title:string) => void;
  onDelete: (id:string) => void;

}
const VideoCard: React.FC<VideoCardProps> = ({video, onDownload, onDelete})=> {

  const[isHovered,setIsHovered] = useState(false)
  const[previewError,setPreviewError] = useState(false)

  //Always remember:cloudinary response in form of publicId


  //get thumbnail.SInce we are calling the hooks provided by cloudinaru use useCallback
  // this method will take a public id from the video and will give response
  const getThumbnailUrl = useCallback((publicId: string)=>{
    return getCldImageUrl({
      src: publicId,
      width:400,
      height:225,
      crop:"fill",
      gravity:"auto",
      format:"jpg",
      quality:"auto",
      assetType:"video"
    })
  },[])

  //same for video

  const getFullVideoUrl = useCallback((publicId: string)=>{
    return getCldVideoUrl({
      src: publicId,
      width:1920,
      height:1080,
    })
  },[])


  const getPreviewVideoUrl = useCallback((publicId: string)=>{
    return getCldVideoUrl({
      src: publicId,
      width:400,
      height:225,
      //for preview same as thumbnail
      rawTransformations:
      ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
      //max segment->divides the whole video into 9 parts
    })
  },[])

  const formatSize = useCallback((size:number)=>{
    return filesize(size)
  },[])


  const formatDuration  = useCallback((seconds:number)=>{
    const minutes = Math.round(seconds/60)
    const remainingSeconds = Math.round(seconds%60)
    return `${minutes}:${remainingSeconds.toString().padStart(2,'0')}`
    //if only one number make it of two nuber by adding 0 in front
    //two numbers with 0 at first
  //console.log(formatDuration(125)); // Output: "2:05"
  },[])

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize))*100
  )

  //check when someone hover 

  useEffect (()=>{
    setPreviewError(false)
  },[isHovered])

  const handlePreviewError = ()=>{
    setPreviewError(true)
  }

  return (
    <div
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-600"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* //figure to group images and video .A semantic tag
          if hovered check for preview error ? show error : show video
          else show classic thumbnail
          
          */}
          <figure className="aspect-video relative">
            {isHovered ? (
              previewError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-red-500">Preview not available</p>
                </div>
              ) : (
                <video
                  src={getPreviewVideoUrl(video.publicId)}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                  onError={handlePreviewError}
                />
              )
            ) : (
              <Image
                src={getThumbnailUrl(video.publicId)}
                alt={video.title}
                className="w-full h-full object-cover"
                width={400}
                height={225}
              />
            )}
            {/* duration */}
            <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
              <Clock size={16} className="mr-1" />
              {formatDuration(video.duration)}
            </div>
          </figure>
          <div className="card-body p-4">
            <h2 className="card-title text-lg font-bold">{video.title}</h2>
            <p className="text-sm text-base-content opacity-70 mb-4">
              {video.description}
            </p>
            <p className="text-sm text-base-content opacity-70 mb-4">
              Uploaded {dayjs(video.createdAt).fromNow()}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <FileUp size={18} className="mr-2 text-primary" />
                <div>
                  <div className="font-semibold">Original</div>
                  <div>{formatSize(Number(video.originalSize))}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FileDown size={18} className="mr-2 text-secondary" />
                <div>
                  <div className="font-semibold">Compressed</div>
                  <div>{formatSize(Number(video.compressedSize))}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold">
            Compression:{" "}
            <span className="text-accent">{compressionPercentage}%</span>
          </div>
          <div className="flex space-x-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title)}
            >
              <Download size={16} />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="btn btn-error btn-sm">
                  <Trash2 size={16} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent  className='bg-black text-white border-slate-600'>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the video.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='hover:bg-black-500'>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(video.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
