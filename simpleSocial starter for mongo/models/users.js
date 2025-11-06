// let userData=[
//     {
//         username: "user1",
//         password: "123"
//     },{
//         username: "user2",
//         password: "456"
//     }
// ]

const mongoose = require('mongoose')

const {Schema, model} = mongoose

const userSchema = new Schema({
    username: String,
    password: String
})

const UserData = model("user", userSchema)

async function addUser(UserFormInput, password){

    let userExists = null;

    userExists = await UserData.findOne({username: UserFormInput}).exec()
    if(userExists){
        return false
    } else {
        let newUser={
            username:UserFormInput,
            password:password
        }
        await UserData.create(newUser)
        .catch(err=>console.error('Could not add user to MongoDB...', err))
        return true
    }

}
async function checkUser(usernameFromForm, password){
    // let found=userData.find(thisUser=>thisUser.username==username)
    // if(found){
    //     return found.password==password
    // } else {
    //     return false
    // }
    // //return boolean true if it matches else false

    let userExists = null;

    userExists = await UserData.findOne({username: usernameFromForm}).exec()
        if(userExists){
        return userExists.password==password
    } else {
        return false
    }
    //return boolean true if it matches else false
}

module.exports={
    addUser,
    checkUser
}