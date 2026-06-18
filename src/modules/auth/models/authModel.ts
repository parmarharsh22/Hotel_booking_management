import { RowDataPacket } from "mysql2";
import { db } from "../../../config/db";

//check for dup. emails
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

//register a new user
export const insertUser = async (firstName: string, lastName: string, email: string, phone: string, state: string, city: any, hashedPass: any, filename: any,gender: any,address: any,dob:any ) => {
    await db.query("INSERT INTO users(hotel_id,user_role_id,first_name,last_name,email,phone,dob,gender,password_hash,state,city,address,photo_url) values(?,?,?,?,?,?,?,?,?,?,?,?,?)", [
        null, 4, firstName, lastName, email, phone,dob,gender,hashedPass, state, city,address, filename]);
}

//login a user
export const logon = async (email: string) => {
    const [rows]: any = await db.query(`SELECT u.user_id,u.hotel_id,r.role_name,u.email,u.password_hash from users as u JOIN user_roles as r ON r.user_role_id = u.user_role_id where 
        u.email = ?  `, [email]);
    return rows.length > 0 ? rows[0] : null
}


//get locations
export const getAllLocations = async()=>{
    const [rows]= await db.query<RowDataPacket[]>("SELECT DISTINCT city from hotels WHERE tenant_status_id=?",[1]);

    if(rows.length==0) return null;

    return rows.map(row=>row.city);
}


export const updatePass = async(email:string,password:string)=>{
    const [rows]:any = await db.query("UPDATE users set password_hash = ? where email = ?",[password,email]);
    return rows.changedRows > 0 ? 1 : null
}