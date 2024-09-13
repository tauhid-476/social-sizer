"use client"
import React, { useEffect, useState, useRef } from 'react'
import { CldImage } from 'next-cloudinary'
import axios from 'axios';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait(4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header(3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover(205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;


export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  //first useEffext when someone changes the ratio of the image
  //allow transforming only when image exists
  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage])

  //upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //input 
    const file = e.target.files?.[0];
    if (!file) return
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    //get in backend and append in frontend

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setUploadedImage(data.publicId);
      //cloudinary returns public_id

    } catch (error) {
      console.log(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  //now downloading image
  //on our frontend side we are designing in such a way that when user download the image of ratio for example instagram portrait (4:5) the file will be save with the name as:
  //instagram_portrait_4_5.png
  //basically a customized file name
  const handleDownload = () => {
    //remeber we need the reference of the image we want to download.Thats why we have refHook
    //the download button should have the reference that which image must be downloaded

    //blob-->binary large object short form
    if (!imageRef.current) return;

    //fetch method to that image
    //first convert it into a binary data object
    //then download the image

    //The createObjectURL() static method of the URL interface creates a string containing a URL representing the object given in the parameter.
    fetch(imageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a");
        console.log("Image url is",url);
        console.log("Link to download it",link);
      
        link.href = url;
        link.download = `${selectedFormat
          .replace(/\s+/g, "_")
          .toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
  }
  return (
    <div className='container mx-auto p-4 max-w-4xl min-h-screen bg-black'>
      <h1 className='text-center text-3xl font-bold mb-6'>Social Media Image Generator</h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload Image</h2>
          <div className="form-control">
            <label htmlFor="" className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className='file-input file-input-bordered file-input-primary w-full'
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className='progress progress-primary w-full' ></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className='card-title mb-4'>Select Social Media Format</h2>
              <div className="form-control">
                <select
                  value={selectedFormat}
                  className='select select-primary w-full'
                  onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity='auto'
                    //most imp gravity and referece
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

