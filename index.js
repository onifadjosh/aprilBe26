const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
dotenv.config()
app.set("view engine", "ejs")
app.use(express.urlencoded({extended:true}))//body parser
const connectDB = require("./database/connectDB")
app.use(express.json({limit:"50mb"}))
app.use(cors())


const UserRouter = require("./routers/user.routes")
app.use("/api/v1", UserRouter)


// app.get(path, callback(param))
const URI = process.env.MONGODB_URI

mongoose.connect(URI)
.then(()=>{
    console.log("database connected successfully");
    
})
.catch((err)=>{
    console.log("cannot connect to database", err);
    
})

let person = {
    firstName:"pam",
    lastName:"Josh",
    email:"pamjosh@gmail.com",
    course:"software"
}
let arrPerson = [person, person, person]
let gender = "male"

app.get("/", (request, response)=>{
    // response.send("application working fine")
    // response.send(2+3)
    // response.send(person)
    // response.send(arrPerson)
    response.sendFile(__dirname+"/index.html")

    console.log(__dirname);
    
})

app.get("/index", (req, res)=>{
    res.redirect("/")
})

app.get("/ejs", (req, res)=>{
    res.render("index", {gender, arrPerson})
})

app.post("/delete/:id", (req, res)=>{
    const {id} = req.params
    console.log(req.params);

    arrPerson.splice(id, 1)
    res.render("index", {gender, arrPerson})
    
})

app.get("/addUser", (req, res)=>{
    res.render("addUser")
})

app.post("/addUser", (req, res)=>{
    console.log(req.body);
    const {firstName, lastName, email, course}= req.body

    arrPerson.push(req.body)

    res.render("index", {gender, arrPerson})
    
})
app.get("/editUser/:id", (req, res)=>{
    const {id}= req.params
    res.render("editUser")
})

app.post("/editUser/:id", (req, res)=>{
    const{id}= req.params
    const {firstName, lastName, email, course}= req.body

    arrPerson.splice(id, 1,req.body )

    res.render("index", {gender, arrPerson})
})




//create server
//app.listen(port, callback)

app.listen(process.env.PORT, (err)=>{
    if(err){
        console.log("error starting server", err);
        
    }else{
        console.log("Server started successfully");
        
    }
})


module.exports=async(req, res)=>{
    await connectDB()
    return app(req, res)
}