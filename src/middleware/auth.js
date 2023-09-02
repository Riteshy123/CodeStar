const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req,res,next) => {
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.decode(token,process.env.SECRET_KEY);
       console.log(verifyUser);

        // token ki id se comple data reading
        const user = await Register.findOne({_id:verifyUser._id});
        console.log(user.firstname);
        
        req.token = token;
        req.user = user;


         next();
    } catch (error) {
        res.status(401).send(`error ${"please login !"}`);
        // res.render("Please login !");
    }
}

module.exports = auth;