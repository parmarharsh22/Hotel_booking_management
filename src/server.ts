import express,{Request,Response} from "express";
import dotenv from "dotenv"
const app = express();
dotenv.config();

const portnu = process.env.PORTNU || 7777

app.get("/",(req:Request,res:Response)=>{
    res.send("Started server");
})

app.listen(portnu,()=>{
    console.log("Server started at ",portnu);
})