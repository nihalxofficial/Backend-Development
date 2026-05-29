const express = require('express')
const mongoose = require('mongoose');
const dotenv = require("dotenv")
const cors = require("cors");
const { ObjectId } = require('mongodb');

dotenv.config()

const app = express()
const port = process.env.PORT
const uri = process.env.MONGODB_URI
const { Schema } = mongoose;

app.use(cors())
app.use(express.json())


mongoose.connect(uri).then(()=>console.log("Connected Mongoose to Atlas"));

const StudentSchema = new Schema({
  name: {type: String, required: true},
  age: {type: Number, required: true, min:18},
  department: {type:String},
  cgpa: {type:Number}
}, { timestamps: true })

const Student = mongoose.model('Student', StudentSchema);


app.get('/', (req, res) => {
  res.json({message: "Connected to server successfully!"})
})

app.get("/students", async(req, res)=> {
    const result = await Student.find().sort({cgpa:-1})
    res.send(result)
})

app.get("/students/:sId", async(req, res)=>{
    const {sId} = req.params;
    const result = await Student.findById(sId)
    res.send(result);
})

app.post("/students", async(req, res)=>{
    const student = req.body;
    const result = await Student.create(student)
    res.send(result)
})

app.patch("/students/:sId", async(req,res)=>{
    const {sId} = req.params;
    const updateData = req.body;
    const result = await Student.updateOne({_id: sId}, updateData);
    res.send(result);
})

app.delete("/students/:sId", async(req,res)=>{
    const {sId} = req.params;
    const result = await Student.deleteOne({_id: sId})
    res.send(result)
})

app.listen(port, () => {
  console.log(`Server app listening on port ${port}`)
})