const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
//passport-local-mongoose automatically creates & saves username as password fields.

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);