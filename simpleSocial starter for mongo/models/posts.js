// let nextPostID=3

// let postData=[
//     {
//         postid: 0,
//         message:"Hi it's Dave",
//         user:"Dave"
//     },{
//         postid: 1,
//         message:"Glad it's Thursday",
//         user:"Julie"
//     }, {
//         postid: 2,
//         message:"Anyone for tennis this weekend?",
//         user:"Sam"
//     }
// ]

const mongoose = require('mongoose')

const {Schema, model} = mongoose

const postSchema = new Schema({
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
        //postid: nextPostID++,
        message: message,
        user: user,
        likes: 0,
        time: Date.now()
    }
    PostData.create(newPost)
    .catch(err=>console.error('Could not add post to MongoDB...', err))
}

module.exports={
    getPosts,
    addPost,
    getLatestNPosts,

}