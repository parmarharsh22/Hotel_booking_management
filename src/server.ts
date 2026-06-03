import express,{Request,Response} from "express";
import dotenv from "dotenv"
import path from "node:path";
const app = express();
dotenv.config();

import authRouter from "./modules/auth/routes/authroute";
const portnu = process.env.PORTNU || 7777


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

//Router Declarations here!
app.use("/",authRouter);

app.listen(portnu,()=>{
    console.log("Server started at ",portnu);
})