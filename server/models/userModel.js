import mongoose from "mongoose";
//The data base schema




//collection of data 
const employees = mongoose.Schema(
    {
   name:{
    type:String,
    required:true,
   },
   email:{
    type:String,
    required:true,
   }, 
   mobilnum:{
    type:String,
    required:true,
   },
    designation:{
    type:String,
    required:true,
   },
   gender:{
    type:String,
    required:true,
   },
   course:{
    type:String,
    required:true,
   },
   imagePath: {  // Corrected field name
    type: String, // imagePath to store the image file path
    required: false, // This field is optional for now
  },
  imageUrl: {  // Corrected field name
    type: String, // imagePath to store the image file path
    required: false, // This field is optional for now
  }
    }
);



//user that will veiw edit delete the data 
const manager = mongoose.Schema(
  {
    name:{
      type:String,
      required:true,
    },
    pass:{
      type:String,
      required:false,
    },
    mobilnum:{
      type:String,
      required:true,
    },
    imagePath:{
      type:String,
      required:false,
    }
  }
)
export const Managers = mongoose.model('Boss',manager);
export const Employee = mongoose.model('Workers', employees);
//eH5r11githp8UP2L