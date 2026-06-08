import { db } from "../../../config/db";

export const getUserDetails = async(userId: string)=>{
    const [user_detail]: any = await db.query("SELECT * from users where user_id = ?",[userId]);
    return user_detail.length > 0 ? user_detail[0] : null
}