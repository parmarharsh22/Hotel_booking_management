import fs from "fs";
import path from "path";

export async function deleteOldPhoto(filename: string){
    try{
        if(!filename) return;

        const filePath = path.join(process.cwd(),"src","public","uploads","profile-photos",filename);
        await fs.promises.unlink(filePath);

    }catch(err:any){
        if(err.code !== "ENOTENT"){
            console.log("Image deletion failed :",err);
        }
    }
}