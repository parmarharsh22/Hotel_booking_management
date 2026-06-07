import * as bcrypt from "bcrypt"; 

export async function hashedPassword(plainPasswsord: string){
    const hashedPassword = await bcrypt.hash(plainPasswsord,10);
    return hashedPassword;
}

export async function comparePassword(hashedPassowrd: string,plainPassword: string){
    const compare = await bcrypt.compare(plainPassword,hashedPassowrd);
    console.log(compare);
    return compare;
}