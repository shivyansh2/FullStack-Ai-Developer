require("dotenv").config();

const express = require("express")
const mongoose = require("mongoose")
const Student = require("./models/Student")

const app = express();

app.use(express.json());

mongoose
.connect(process.env.MONGO_URI)
.then(() =>console.log("MongoDB connected"))
.catch((err) => console.error("Connection error:", err))

//POST
app.post("/students", async (req,res) =>{
    try{
        const student = await Student.create(req.body);
        res.status(201).json(student);
    }catch(err){
        res.status(400).json({error:err.message})
    }
})

//GET
app.get("/students", async (req,res) =>{
    try{
        const students = await Student.find()
        res.json(students)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

//GET ONE STUDENT
app.get("/students/:id",async (req,res)=>{
    try{
        const student = await Student.findById(req.params.id)

        if(!student){
            return res.status(400).json({message:"Student not found"})
        }
        res.json(student)
    }catch(err){
        res.status(400).json({error:"Invalid student ID"})
    }
})

//UPDATE STUDENT
app.put("/students/:id", async(req,res) =>{
    try{
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators:true}
        )
        if(!student){
            return res.status(404).json({message: "Student not found"})
        }
        res.json(student)
    }catch(err){
        res.status(400).json({error : err.message})
    }
})

//DELETE A STUDENT
app.delete("/students/:id" , async (req,res) =>{
    try{
        const student = await Student.findOneAndDelete(req.params.id)

        if(!student){
            return res.status(404).json({message: "Student not found"})
        }
        res.json({message : "Stduent deleted successfully"})
    }catch(err){
        res.status(400).json({error : "Invalid Student ID"})
    }
})

async function startServer() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB connected")

        app.listen(process.env.PORT || 3000, ()=>{
            console.log("Server running on port 3000")
        })
    }catch(err){
        console.log("Database connection failed",err.message)
        process.exit(1)
    }
}

startServer()