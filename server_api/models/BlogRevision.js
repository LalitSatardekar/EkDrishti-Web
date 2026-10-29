import mongoose from 'mongoose'
const schema=new mongoose.Schema({blog:{type:mongoose.Schema.Types.ObjectId,required:true,index:true},version:{type:Number,required:true},snapshot:{type:mongoose.Schema.Types.Mixed,required:true},editor:String},{timestamps:true})
schema.index({blog:1,version:1},{unique:true})
export default mongoose.models.BlogRevision||mongoose.model('BlogRevision',schema)
