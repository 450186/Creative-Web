
const mongoose = require('mongoose')

const {Schema, model} = mongoose

const postSchema = new Schema({
    id: Number,
    message: String,
    user: String,
    likes: Number,
    time: Date
})

const PostData = model("posts", postSchema)

function getPosts(){
    let foundData=[]
    return foundData
}

async function getLatestNPosts(n=8) {
    // return PostData.slice(-n).reverse()
    let foundData=[]
    foundData= await PostData.find({}).sort({'time':-1}).limit(n).exec()
    
    return foundData
}

function addPost(message, user){
    
    let newPost={
        message: message,
        user: user,
        likes: 0,
        time: Date.now()
    }
    PostData.create(newPost)
    .catch(err=>console.error('Could not add post to MongoDB...', err))
}

async function addLikeToPost(postId){
    let post= await PostData.findOne({_id: postId}).exec()
    if(post){
        post.likes+=1
        await post.save()
    }
}
module.exports={
    getPosts,
    addPost,
    getLatestNPosts,
    addLikeToPost
}