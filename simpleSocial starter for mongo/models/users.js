
const mongoose = require('mongoose')

const {Schema, model} = mongoose

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    Firstname: {type: String, required: true},
    Lastname: {type: String, required: true},
    profilePic: {type: String, default: "../public/account.jpg"},
    isAdmin: {type: Boolean, default: false}
})

const UserData = model("user", userSchema)

async function addUser(username, password, Firstname, Lastname, profilePic, isAdmin){

    const userExists = await UserData.findOne({username}).exec()

    if(userExists){
        console.log('User already exists')
        return false
    } else {
        let newUser={
            username: username,
            password: password,
            Firstname: Firstname,
            Lastname: Lastname,
            profilePic: profilePic,
            isAdmin: isAdmin
        }
        await UserData.create(newUser)
        .catch(err=>console.error('Could not add user to MongoDB...', err))
        return true
    }
}

async function deleteUser(username) {
    return await UserData.deleteOne({username: username}).exec();
}

async function checkUser(username, password){

    let userExists = null;

    userExists = await UserData.findOne({username: username}).exec()
        if(userExists){
        return userExists.password==password
    } else {
        return false
    }
}
async function checkUsername(username) {
    const user = await UserData.findOne({username}).exec()

    return !!user
}


module.exports={
    addUser,
    checkUser,
    UserData,
    checkUsername,
    deleteUser
}