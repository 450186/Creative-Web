
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

async function addPost(message, user){

    let newPost={
        message: message,
        user: user,
        likes: 0,
        time: new Date(),
    }
    return await PostData.create(newPost)
    .catch(err=>console.error('Could not add post to MongoDB...', err))
}

async function deletePost(postId) {
    return await PostData.deleteOne({_id: postId}).exec()
}

// async function addLikeToPost(postId, username){
//     const Liked = false
//     if(username === post.user){
//         throw new Error("Users cannot like their own posts.");
//     } else {
//         await PostData.updateOne(
//         {_id: postId},
//         {$inc: {likes: 1}}
//         ).exec() 
//         Liked = true;
//     }
//     if(Liked === true){
//         await PostData.updateOne(
//             {_id: postId},
//             {$inc: {likes: - 1}}
//         ).exec()
//         Liked = false;
//     }
// }

module.exports={
    getPosts,
    addPost,
    getLatestNPosts,
    deletePost,
    PostData
    //addLikeToPost
}