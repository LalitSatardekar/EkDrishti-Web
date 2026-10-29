import mongoose from 'mongoose'
const schema=new mongoose.Schema({_id:{type:String,default:'blog'},config:{type:mongoose.Schema.Types.Mixed,default:{}},version:{type:Number,default:0}},{timestamps:true})
export default mongoose.models.BlogSettings||mongoose.model('BlogSettings',schema)
