import { Request } from "express";

export const getJwtTokenValue = (variable: any , req: Request) => {
    const temp = ((req as any).user);
    const value = temp[variable];
    if(!value){
        return console.log("No such value in token");
    } 
    return value;
}