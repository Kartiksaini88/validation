let express = require("express")

const { body, validationResult } = require("express-validator");

let mongoose = require("mongoose")

let app = express()

app.use(express.json())


let connect = ()=>{

   return mongoose.connect("mongodb://127.0.0.1:27017/Val");
};

let userSchema = new mongoose.Schema(
    {
        firstName:{type:String,required:true},
        lastName : {type:String,required:true},
        email:{type:String,required:true,unique:true},
        pincode:{type:String,required:true},
        age:{type:Number,required:true},
        gender: {
            type: String,
            enum: ["Male", "Female","Others"],
            default: "Male",
           },
    },
    {
        versionKey:false 
    }
)

let User = mongoose.model("user",userSchema)


app.get("/user",async(req,res)=>{
    try{
        let user = await User.find().lean().exec()
        res.status(201).send({user:user})
    }
    catch(err){
        res.status(500).send({err:err.message})
    }
})



app.post("/user",body("firstName").not().isEmpty().withMessage("First name can not be empty"),
body("lastName").not().isEmpty().withMessage("last name can not be empty"),
body("email").not().isEmpty().withMessage("First name can not be empty").isEmail().withMessage("Enter the email only") 

.custom(async (value) => {
  const user = await User.findOne({ email: value });

  if (user) {
    throw new Error("Email is already taken");
  }
  return true;
}).
custom(async(value , {req})=>{
   if(value != req.body.confirmEmail){
    throw new Error("Email and confirm Email should  match");
   }
   return true;
}),


body("pincode").not().isEmpty().withMessage("First name can not be empty").isNumeric().custom((value)=>{
   
    if (value.length==6) {
        
        return true 
      
      }
      throw new Error("Pincode should be exactly 6 numbers");
}),
body("age").not().isEmpty().withMessage("First name can not be empty").isNumeric().custom((value)=>{
  if(value < 1 || value > 100){ 
    throw new Error("Age must be a number between 1 and 100"); 
  } 
  return true
}),
body("gender").not().isEmpty().withMessage("First name can not be empty"),   
 
async(req,res)=>{ 
    try{  
       
        // console.log(body("firstName"));
        const errors = validationResult(req);
        console.log({ errors });
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        let user = await User.create(req.body)
        return res.status(201).send({user:user})
    }
    catch(err){
        return  res.status(500).send({err:err.message})
    }
})



app.listen(2000, async function () {
    try {
      await connect();
      console.log("listening on port 5000");
    } catch (err) {
      console.error(err.message);
    }
  });