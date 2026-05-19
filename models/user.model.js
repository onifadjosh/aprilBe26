const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true, select:false},
    isAdmin:{type:Boolean, default:false},
    profileImage:{
        secure_url:{type:String},
        public_id:{type:String}
    }

}, {timestamps:true, strict:"throw"})

const UserModel = mongoose.model("user", UserSchema)


module.exports = UserModel