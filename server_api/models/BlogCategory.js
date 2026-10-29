import mongoose from 'mongoose'
const schema=new mongoose.Schema({name:{type:String,required:true,maxLength:100},slug:{type:String,required:true,unique:true},description:{type:String,maxLength:2000},image:String,seoTitle:String,metaDescription:String,order:{type:Number,default:0},visible:{type:Boolean,default:true}},{timestamps:true})
export default mongoose.models.BlogCategory||mongoose.model('BlogCategory',schema)
