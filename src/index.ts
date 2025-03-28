import express from 'express';
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { contentModel, linkModel, userModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { randomHashCreate } from './hashCreate';
import cors from 'cors'
const app = express();
app.use(cors())
app.use(express.json())
app.post('/api/v1/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try{
        await userModel.create({
            username: username,
            password: password
        })

        res.json({
            message: "User signed in.."
        })
    }catch(e){
        res.status(411).json({
            message: "User already exist.."
        })
    }
})
app.post('/api/v1/signin',async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await userModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        },JWT_PASSWORD)
        res.json({
            token
        })
    }else{
        res.status(403).json({
            message: "Inccorect Credential...."
        })
    }
})
app.post('/api/v1/content',userMiddleware, async(req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title

    await contentModel.create({
        link,
        type,
        title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })

    res.json({
        message: "Content added"
    })
})
app.get('/api/v1/content',userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId
    const content = await contentModel.find({
        userId: userId
    }).populate('userId', 'username')

    res.json({
        content
    })
})
app.delete('/api/v1/content',userMiddleware, async(req, res) => {
    const contentId = req.body.contentId;

    await contentModel.deleteMany({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message: "deleted"
    })
})
app.post('/api/v1/brain/share',userMiddleware, async(req, res) => {
    const share = req.body.share;

    if(share){
        const existingLink = await linkModel.findOne({
            //@ts-ignore
            userId: req.userId
        })
        if(existingLink){
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = randomHashCreate(10)
        await linkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash
        })
        res.json({
            hash
        })
    }else{
        await linkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
        res.json({
            message: "removed Shared Link.."
        })
    }
    

})

app.get('/api/v1/brain/:shareLink', async (req,res) => {
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json({
            message: "Hash is wrong"
        })
        return;
    }
        const content = await contentModel.find({
            //@ts-ignore
            userId: link.userId
        })
        const user = await userModel.findOne({
            //@ts-ignore
            _id: link.userId
        })
        if(!user){
            res.status(411).json({
                message: "User not found"
            })
            return;
        }
        res.json({
            username: user.username,
            content: content
        })
    
})
app.listen(3000)