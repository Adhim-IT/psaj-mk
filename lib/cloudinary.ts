import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export async function uploadImage(base64Image: string) {
  try {
    // Remove the data:image/jpeg;base64, part if it exists
    const base64Data = base64Image.includes("base64,") ? base64Image.split("base64,")[1] : base64Image

    const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
      folder: "tools",
      resource_type: "image",
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

// Extract public_id from Cloudinary URL
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs typically look like:
    // https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public_id.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

// Delete image from Cloudinary
export async function deleteImage(url: string) {
  try {
    const publicId = getPublicIdFromUrl(url)
    if (!publicId) return

    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
  }
}

