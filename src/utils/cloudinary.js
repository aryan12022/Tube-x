import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        //upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })//file uploaded
        // console.log("File is uploaded on clodinary", response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove locally saved file as upload failed
        return null;
    }
}
const deleteFromCloudinary = async (publicUrl) => {
    try {
        console.log(publicUrl)
        let public_id = ''
        for (let i = publicUrl.length; i >= 0; i--) {
            if (publicUrl[i] === '.') {
                for (let j = i - 1; publicUrl[j] !== '/'; j--) {
                    public_id = publicUrl[j] + public_id;
                }
                break;
            }
        }
        console.log(public_id)
        const response = await cloudinary.uploader.destroy(public_id);
        console.log(response)
        return response;
    } catch (error) {
        console.log(error?.message || "Problem in deleteFromCloudinary Function !!")
    }
}
export { uploadOnCloudinary, deleteFromCloudinary }