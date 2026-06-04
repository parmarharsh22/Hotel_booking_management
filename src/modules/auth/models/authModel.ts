import { db } from "../../../config/db";

export const findByEmail = async (email: string) => {
    const [rows]: any = await db.query(
        `SELECT user_id
        FROM users
        WHERE email = ?
        LIMIT 1`,
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
};

export const insertUser = async (firstName:string, lastName:string, email:string, phone:string, state:string, city:any, hashedPass:any,filename:any) =>{
    await db.query("INSERT INTO users(hotel_id,user_role_id,first_name,last_name,email,phone,password_hash,state,city,photo_url) values(?,?,?,?,?,?,?,?,?,?)",[
        null,4,firstName,lastName,email,phone,hashedPass,state,city,filename]);
}