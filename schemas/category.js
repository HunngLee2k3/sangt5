let mongoose = require('mongoose');
let categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        default:"",
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    slug:String
},{
    timestamps:true
})
module.exports = mongoose.model('category',categorySchema)
// products