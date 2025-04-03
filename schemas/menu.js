let mongoose = require('mongoose');
let menuSchema = mongoose.Schema({
    text:{
        type:String
    },
    URL:{
        type:String,
        default:"",
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    parent:{
        type:mongoose.Types.ObjectId,
        ref:'menu'
    }
},{
    timestamps:true
})
module.exports = mongoose.model('meny',menuSchema)
// products