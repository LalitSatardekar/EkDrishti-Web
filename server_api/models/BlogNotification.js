import mongoose from 'mongoose'
const schema=new mongoose.Schema({key:{type:String,unique:true,required:true},blog:mongoose.Schema.Types.ObjectId,urls:[String],intent:{type:String,enum:['refresh','schedule','remove']},dueAt:{type:Date,required:true},state:{type:String,enum:['pending','sent','cancelled'],default:'pending'},attempts:{type:Number,default:0},lastStatus:Number},{timestamps:true})
schema.index({state:1,dueAt:1})
export default mongoose.models.BlogNotification||mongoose.model('BlogNotification',schema)
