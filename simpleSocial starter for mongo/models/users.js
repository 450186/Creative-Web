
const mongoose = require('mongoose')

const {Schema, model} = mongoose

const userSchema = new Schema({
    username: String,
    password: String,
    Firstname: String,
    Lastname: String,
})

const UserData = model("user", userSchema)

async function addUser(UserFormInput, password, firstname, surname){

    let userExists = null;
    let nameExists = null;

    userExists = await UserData.findOne({username: UserFormInput}).exec()
    nameExists = await UserData.findOne({Firstname: firstname, Lastname: surname}).exec()
    if(userExists || nameExists){
        return false
    } else {
        let newUser={
            username:UserFormInput,
            password:password,
            Firstname: firstname,
            Lastname: surname,
        }
        await UserData.create(newUser)
        .catch(err=>console.error('Could not add user to MongoDB...', err))
        return true
    }


}
async function checkUser(usernameFromForm, password){

    let userExists = null;

    userExists = await UserData.findOne({username: usernameFromForm}).exec()
        if(userExists){
        return userExists.password==password
    } else {
        return false
    }
}

module.exports={
    addUser,
    checkUser
}