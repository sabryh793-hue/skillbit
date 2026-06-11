import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


export const uploadToCloudinary = async (file: Express.Multer.File, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder , resource_type:"auto" },//'auto'  → accepts everything ✅ (image, video, PDF, doc...)
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(file.buffer)
  })
}