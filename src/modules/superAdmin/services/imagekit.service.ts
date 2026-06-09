import imagekit from "../../../config/imageKit";

export const uploadImage = async (
    fileBuffer: Buffer,
    fileName: string,
    folder: string
): Promise<string> => {
    const response = await imagekit.upload({
        file:     fileBuffer.toString("base64"),
        fileName: fileName,
        folder:   folder,
    });
    return response.url;
};
