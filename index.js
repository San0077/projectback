import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb';
const app = express()
app.use(express.json());
dotenv.config()
app.use(cors())

var mongoUrl = process.env.mongoUrl;
async function createConnection(){
    var client = new MongoClient(mongoUrl);
    await client.connect()
    console.log("connection is ready ")
 return client
}
export var client = await createConnection()

async function passwordMatch(pass){
    var salt = await bcrypt.genSalt(4);
    var hash = await bcrypt.hash(pass,salt);
    return hash;
}


app.post("/signin", async function(req,res){
    let {email,password,role} = req.body
    let hash = await passwordMatch(password)
    let result = await client.db("dashboard").collection("images").insertOne({email,"password":hash,"role":role})
    res.send(result)
    console.log(result)
    
})
const jobs =[{
    title:" board for graphic",
    discrp:"Dribbble is the heart of the design community and the best resource to discover and connect with designers and jobs worldwide.",
    link:""
  },{
    
title:"free lancing ",
discrp:"Dribbble is the heart of the design community and the best resource to…",
link:""

},
{
    
title:"design Jobs",
discrp:"Dribbble is the heart of the design community and the best resource to…",
link:""
}]
app.post("/jobs",async function(req,res){
    let {company,special,location}=req.body
    let result =await client.db("jobs").collection("jobsData")
    .find({"company":{$regex:company},"special":{$regex:special},"location":{$regex:location},
   
})
    .toArray()
 res.send(result)
})

app.post("/jobs_post",async function(req,res){
    let {img,company,special,location,mode}=req.body
    let result =await client.db("jobs").collection("jobsData").insertOne({img,company,special,location,mode})
    res.send(result);
})
app.get("/jobs_post",async function(req,res){
    let result =await client.db("chart").collection("data").find({}).toArray();
    res.send(result)
 })
app.get("/jobs", async function(req,res){
    let {q} =req.query;
    console.log(q)
       function search (s){
        return jobs.filter( data=>{
            if(data.title.toString().toLowerCase()
        .includes(s)) 
        {
            return data
        }
    })
    }
      res.send(search(q))
   
})
app.get("/",async function(req,res){
    let result =await client.db("dashboard").collection("data").find({}).toArray()
    res.send(result)
})
app.post("/jobs",async function(req,res){
    let {img,title,type}=req.body;
    console.log(img)
    let result =await client.db("dashboard").collection("data").insertOne({img,title,type})
    res.send(result)
    console.log(result)
    
})

  app.post("/Login",async function(req,res){
    let {email,password}=req.body;
    console.log(email)
    let result =await client.db("dashboard").collection("images")
    .findOne({email});
    if(!result){
        res.status(401).send({msg:"invalid"})
    }else{
        var storedPassword = result.password
        var compare = await bcrypt.compare(password,storedPassword)
        if(!compare){
            res.status(401).send({msg:"invalid"})
        }else{
            const token = await jwt.sign({id:"result._id"},"santhosh");
            res.send({msg:"login sucessfully",token:token})
              console.log(result)
        }
    }
  })


app.listen(process.env.PORT,()=>{
    console.log("server is ready")
});
