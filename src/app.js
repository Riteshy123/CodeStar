require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");


require("./db/conn");
const Register = require("./models/registers");
const { log } = require('console');
const port = 8000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// kisi form ke data ko get krne ke liye
app.use(express.json());
app.use(cookieParser());  // middleware for cookie
app.use(express.urlencoded({extended:false})); 

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);

app.get("/", (req,res) => {
    res.render("index");
});

app.get("/secret", auth, (req,res) => {
    res.render("secret");
})

app.get("/logout", auth, async(req,res) => {

    try{
         console.log(req.user);

        //  req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token

        // })

        // logout from all device
          req.user.tokens = [];

         res.clearCookie("jwt");

         console.log("logout successfully");
         await req.user.save();
         res.render("login");

    }catch(error) {
        res.status(500).send(error);
    }
})

app.get("/register", (req,res) => {
    res.render("register");
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.get("/login", (req, res) =>{
    res.render("login");
})

app.get("/registration", (req,res) => {
    res.render("register");
})

// create a new user in our database

app.post("/register", async (req,res) => {
    try{
          const password = req.body.password;
          const cpassword = req.body.confirmpassword;
        
          if(password === cpassword) {
                
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword    
        })
         
        console.log("the success part is" + registerEmployee);

        const token =  await registerEmployee.generateAuthToken();

        console.log("the token part" + token);
        
        // the res.cookie() function is used to set the cookie name to value.
        // the value parameter may be string or object converted to json

        res.cookie("jwt",token, {
            expires:new Date(Date.now()+ 600000),
            httpOnly:true
        })
        
        console.log(cookie);
        const registered = await registerEmployee.save();

        res.status(201).render("index");
          }else {
            res.send("password are not matching");
          }

        }catch(error) {
           res.status(400).send(error);
           console.log("the error part page");
    }
})
//  login check
app.post("/login", async (req,res) => {
    try{
         const email = req.body.email;
         const password = req.body.password;

         const useremail = await Register.findOne({email:email});
        
         const isMatch =await bcrypt.compare(password,useremail.password);

         const token =  await useremail.generateAuthToken();

         console.log("the token part" + token);

         res.cookie("jwt",token, {
            expires:new Date(Date.now()+ 60000000),
            httpOnly:true
        });
        
        // console.log(`this is cookie awesome ${req.cookies.jwt}`);

         if(isMatch) {
            res.status(201).render("index");
         }
        //  if(useremail.password === password) {
        //     res.status(201).render("index");
        //  }
        else {
            res.send("invalid login details");
         }
        //  res.status(201).render("index");
     
    } catch(error) {
        res.status(400).send("Invalid login details");
    }
})



// const bcrypt = require("bcryptjs");

// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash );

//     const passwordmatch = await bcrypt.compare("vinayraj123@gmail.com",passwordHash);
//     console.log(passwordmatch);
// }

// securePassword("vinayraj123@gmail.com");

// const jwt = require("jsonwebtoken");

// const createToken = async() => {
//       const token = await jwt.sign({_id:"64edbc37185eac11248f4a95"},"mynameisriteshkumarayadsvhfhsghdhghfdgh");
//       console.log(token);

//       const userVer = await jwt.verify(token, "mynameisriteshkumarayadsvhfhsghdhghfdgh");
//    console.log(userVer);

// }

// createToken();



app.listen(port, () =>{
    console.log(`server is running on port no ${port}`);
});