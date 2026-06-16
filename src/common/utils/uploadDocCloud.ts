import imagekit from "../../config/imageKit";

export const uploadToImageKit = async (file: Express.Multer.File) => {
    try {

        const result = await imagekit.upload({
            file: file.buffer.toString("base64"),
            fileName: `doc_${Date.now()}_${file.originalname}`,
            folder: "/hotel_documents",
            useUniqueFileName: true
        });

        return result;

    } catch (err) {
        throw err;
    }
};