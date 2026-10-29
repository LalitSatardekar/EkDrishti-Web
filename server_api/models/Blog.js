import mongoose from 'mongoose'
import { validateBlogDocument } from '../../src/lib/blogContent.js'
const schema = new mongoose.Schema({
  slug:{type:String,required:true,unique:true}, slugs:{type:[String],required:true}, title:{type:String,default:'',maxLength:240}, excerpt:{type:String,maxLength:1000},searchText:{type:String,maxLength:2000000},
  document:{type:mongoose.Schema.Types.Mixed,required:true,validate:{validator(value){try{validateBlogDocument(value);return true}catch{return false}},message:'Invalid structured article document'}}, schemaVersion:{type:Number,default:1},
  categories:[String],tags:[String],author:mongoose.Schema.Types.Mixed,featuredImage:mongoose.Schema.Types.Mixed,faq:mongoose.Schema.Types.Mixed,seo:mongoose.Schema.Types.Mixed,cta:mongoose.Schema.Types.Mixed,typography:mongoose.Schema.Types.Mixed,titleTypography:mongoose.Schema.Types.Mixed,fonts:[mongoose.Schema.Types.Mixed],topicCluster:String,sources:String,experience:String,
  featured:{type:Boolean,default:false},toc:{type:Boolean,default:true},status:{type:String,enum:['draft','scheduled','published','archived'],default:'draft'},scheduledAt:Date,publishedAt:Date,substantiveUpdatedAt:Date,reviewAt:Date,lastEditedBy:String
},{timestamps:true})
schema.index({slugs:1},{unique:true})
schema.index({status:1,scheduledAt:1,publishedAt:-1})
export default mongoose.models.Blog || mongoose.model('Blog',schema)
