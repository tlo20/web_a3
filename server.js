/*********************************************************************************
* BTI325 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: LO TSZ KIT Student ID: 160067211 Date: 2022/10/14
*
* 
* _______________________________________________________
*
********************************************************************************/
const express = require("express")
const fs = require("fs")
let app = express()
const path = require("path")
const port = process.env.PORT || 8080
let data = require("./data-service")
const multer = require("multer")

const storage = multer.diskStorage({
    destination: "./images/uploaded",
    filename: function(req, file, cb){
       cb(null, Date.now()+ path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use( express.static('public') )
app.use('/images', express.static('images'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/home.html"))
})

app.get("/about",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"))
})

app.get("/employees",(req,res)=>{
    res.type('json')
    const filter = Object.keys(req.query); 
    if(filter.length==1){//check if query exists
        switch(filter[0]){
            case "status": 
                data.getEmployeesByStatus(req.query.status)
                .then(result=>res.send(result),err=> res.send({message:err}));
                break;
            case "department" : 
                data.getEmployeesByDepartment(req.query.department)
                .then(result=>res.send(result),err=> res.send({message:err}));
                break;
            case "manager" : 
                data.getEmployeesByManager(req.query.manager)
                .then(result=>res.send(result),err=> res.send({message:err}));
                break;
            default:
                data.getAllEmployees().then(result=>res.send(result),err=> res.send({message:err}))
        }
    }else{
        data.getAllEmployees().then(result=>res.send(result),err=> res.send({message:err}))
    }
    
    
})


app.get("/managers",(req,res)=>{
    res.type('json')
    data.getManagers().then(result=>{res.send(result)},err=> res.send({message:err}))
})

app.get("/departments",(req,res)=>{
    res.type('application/json')
    data.getDepartments().then(result=>{res.send(result)},err=> res.send({message:err}))
})

app.get("/employees/add",(req,res)=>{
    res.sendFile( path.join(__dirname,"views/addEmployee.html") )
})

app.get("/images/add",(req,res)=>{
    res.sendFile( path.join(__dirname,"views/addImage.html") )
})

app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    res.redirect('/images');
})

app.get("/images",(req,res)=>{
    fs.readdir("./images/uploaded", function(err, files){
     
        res.json({"images":files})
    })
})

app.post("/employees/add",(req,res)=>{
    data.addEmployee(req.body).then(result=>{
        res.redirect('/employees')
    },err=>{
        res.send({message:err})
    })
})

app.get("/employee/:employeeID",(req,res)=>{
    data.getEmployeeByNum(req.params.employeeID)
    .then(result=>res.send(result),err=> res.send({message:err}))
})

/*
app.get("*",(req,res)=>{
    res.status(404).send("Page Not Found")
})
*/


data.initialize().then(result=>{

    app.listen(port,()=>{
        console.log(`Express http server listening on ${port}`)
    })
},err=>{
    console.log("Unable to start up server", err)
})