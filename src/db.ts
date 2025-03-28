import mongoose, { model, Schema } from "mongoose";
mongoose.connect('mongodb+srv://ayushsonawale:1234@cluster0.yjnym.mongodb.net/second_brain')
const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: String, 
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
})

const LinkSchema = new Schema({
    hash : String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true}
})
export const userModel = model ('User', UserSchema)
export const contentModel = model('Content' , ContentSchema)
export const linkModel = model('Links', LinkSchema)