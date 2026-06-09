import { db } from "../../../config/db";

//Get the user details from the database
export const getUserDetails = async (userId: string) => {
    const [user_detail]: any = await db.query("SELECT * from users where user_id = ?", [userId]);
    return user_detail.length > 0 ? user_detail[0] : null
}

export const updateUserDetails = async (userId: string,first_name: string,last_name: string,phone: string,dob: any,gender: string,address: string,city: string,state: string,path: any
) => {
    let query = `UPDATE users SET first_name=?,last_name=?,phone=?,dob=?,gender=?,state=?,city=?,address=?`;

    const values = [first_name,last_name,phone,dob,gender,state,city,address];

    if (path) {
        query += `, photo_url=?`;
        values.push(path);
    }

    query += ` WHERE user_id=?`;
    values.push(userId);

    await db.query(query, values);
};