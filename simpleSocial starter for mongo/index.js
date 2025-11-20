const express = require('express')
const app = express()
const path = require('path')

const posts = require('./models/posts.js')
const userModel = require('./models/users.js')

const sessions = require('express-session')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const { userInfo } = require('os')

const threeMinutes = 3 * 60 * 1000
const tenMinutes = 10 * 60 * 1000
const oneHour = 1 * 60 * 60 * 1000

const dotenv = require('dotenv').config()
const mongoDBusername = process.env.mongoDBusername
const mongoDBpassword = process.env.mongoDBpassword
const mongoAppName = process.env.mongoAppName

const connectionString = `mongodb+srv://${mongoDBusername}:${mongoDBpassword}@cluster0.b7jyjnd.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`

const mongoose = require('mongoose')
const { title } = require('process')

mongoose.connect(connectionString)
    .catch(err => console.error('Could not connect to MongoDB...', err))

app.use(cookieParser("my own secret phrase"))

app.use(sessions({
    secret: "my own secret phrase",
    cookie: { maxAge: tenMinutes },
    resave: false,
    saveUninitialized: false,
    rolling: true
}))

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

function checkAdmin(request, response, nextAction) {
    if(request.session.username && request.session.isAdmin) {
        nextAction()
    } else {
        return response.render('/pages/permissiondenied', {
            username: request.session.username || null,
            isloggedin: false,
            title: "Permission Denied",
            isAdmin: null
        })
    }
}

function checkLoggedIn(request, response, nextAction) {
    if(request.session && request.session.username) {
        return nextAction()
    }
    return response.render("pages/notloggedin", {
        username: null,
        isloggedin: false,
        title: "Not Logged In",
        isAdmin: false
    })
}

function getloggedinState(request) {
    return request.session && request.session.username;
}

app.get('/app', checkLoggedIn, async (request, response) => {
    response.render('pages/app', {
        username: request.session.username,
        isloggedin: getloggedinState(request),
        posts: await posts.getLatestNPosts(8),
        title: "App",
        isAdmin: request.session.isAdmin || false
    })
})

app.get('/profile', checkLoggedIn, async (request, response) => {
    const username = request.session.username;

    const user = await userModel.UserData.findOne({username}).exec();

    if(!user) {
        return response.render('pages/notloggedin', {
            username: null,
            isloggedin: false,
            title: "Not Logged In",
            isAdmin: request.session.isAdmin || false
        })
    }
    response.render('pages/profile', {
        username: user.username,
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        profilePic: user.profilePic,
        isloggedin: getloggedinState(request),
        title: "Profile",
        isAdmin: request.session.isAdmin || false
    })
})

app.get('/getposts', async (request, response) => {
    response.json({ posts: await posts.getLatestNPosts(8) })
})

// app.post('/likepost', async (request, response) => {
//     const postId = request.body.postId;
//     try {
//         await posts.addLikeToPost(postId, request.session.username);
//         response.json({ success: true });
//     } catch (err) {
//         response.json({ success: false, error: err.message });
//     }
// })

app.post('/newpost', async (request, response) => {
    const message = request.body.message?.trim()

    if(!message) {
        return response.render('pages/app', {
            username: request.session.username,
            isloggedin: getloggedinState(request),
            title: "App",
            posts: await posts.getLatestNPosts(8),
            errorMessage: "You must say something!",
            isAdmin: request.session.isAdmin || false
        })
    }
    await posts.addPost(message, request.session.username);
    return response.redirect('/app')
})

app.get('/login', (request, response) => {
    response.render('pages/login', {
        isloggedin: getloggedinState(request),
        username: request.session.username || null,
        title: "Login",
        isAdmin: false
    })
})

app.post('/login', async (request, response) => {
    if (await userModel.checkUser(request.body.username, request.body.password)) {
        const user = await userModel.UserData.findOne({username: request.body.username})

        request.session.username = user.username
        request.session.isAdmin = user.isAdmin

        return response.redirect('/app')
    } else {
        response.render('pages/login', {
            username: request.session.username,
            isloggedin: getloggedinState(request),
            title: "Login Failed",
            errorMessage: "Incorrect Credentials Entered! Please Try Again",
            isAdmin: false
        })
    }
})

app.get('/register', (request, response) => {
    response.render('pages/register', {
        isloggedin: getloggedinState(request),
        username: request.session.username || null,
        title: "Register",
        isAdmin: false
    })
})

app.post('/register', async (request, response) => {

    const {username, password, Firstname, Lastname, profilePic} = request.body

    if (await userModel.addUser(username, password, Firstname, Lastname, profilePic)) {
        request.session.username = username;
        response.redirect('/app')
    } else {
        response.render('pages/register', {
                username: request.session.username || null,
                isloggedin: getloggedinState(request),
                title: "Register",
                errorMessage: "Username Aready exists!",
                isAdmin: false
            })
    }
})

app.get('/logout', checkLoggedIn, (request, response) => {
    response.render('pages/logout', {
        isloggedin: getloggedinState(request),
        username: request.session.username || null,
        title: "Logout",
        isAdmin: false
    })
})

app.post('/logout', (request, response) => {
    request.session.destroy()
    response.redirect('/')
})

app.post('/edit-username', checkLoggedIn ,async (request, response) => {
    let oldUsername = request.session.username
    const {newUsername} = request.body

    if(await userModel.checkUsername(newUsername)) {
        return response.json({ success: false, error: "Username already exists" });
    }
    await userModel.UserData.findOneAndUpdate(
        {username: oldUsername},
        {username: newUsername},
        {new: true}
    );

    request.session.username = newUsername;

    return response.json({ success: true });
})

app.post('/edit-firstname', async (request, response) => {
    let CurrentUsername = request.session.username
    const {newFirstname} = request.body

    
    await userModel.UserData.findOneAndUpdate(
        {username: CurrentUsername},
        {Firstname: newFirstname},
        {new: true}
    );

    return response.json({ success: true });

})
app.post('/edit-lastname', async (request, response) => {
    let CurrentUsername = request.session.username
    const {newLastname} = request.body

    
    await userModel.UserData.findOneAndUpdate(
        {username: CurrentUsername},
        {Lastname: newLastname},
        {new: true}
    );

    return response.json({ success: true });

})

app.get('/admin', async (request, response) => {
    let allUsers = await userModel.UserData.find({},{
        _id: 0,
        password: 0,
        __v: 0
    })
    response.render('pages/admin', {
        username: request.session.username,
        isloggedin: true,
        isAdmin: true,
        users: allUsers,
        title: "Admin"
    })

})
app.post('/delete-post', async (request, response) => {
    if(!request.session.username || !request.session.isAdmin) {
        return response.json({success: false, error: "Not Authorised"})
    }

    const postId = request.body.postId

    await posts.deletePost({_id: postId})
    response.redirect('/app')

})

app.post('/delete-user', async (request, response) => {
    if(!request.session.username || !request.session.isAdmin) {
        return response.render('pages/admin', {
            username: request.session.username,
            isloggedin: true,
            users: await userModel.UserData.find({}, {
                _id: 0, 
                password: 0, 
                __v: 0
            }),
            isAdmin: true,
            title: "Admin",
            errorMessage: "Not Authorised"
        })
    }

    const User = request.body.username

    if(request.session.username === User) {
        return response.render('pages/admin', {
            username: request.session.username,
            isloggedin: true,
            users: await userModel.UserData.find({}, {
                //ignore these fields
                _id: 0, 
                password: 0, 
                __v: 0
            }),
            isAdmin: true,
            title: "Admin",
            errorMessage: "You cannot delete your own account!"
        })
    }
    await userModel.deleteUser(User)
    await posts.PostData.deleteMany({user: User})
    response.redirect('/admin')

})
app.post('/change-admin', async (request, response) => {
    if(!request.session.username || !request.session.isAdmin) {
        return response.render('pages/admin', {
            username: request.session.username,
            isloggedin: true,
            users: await userModel.UserData.find({}, {
                _id: 0, 
                password: 0, 
                __v: 0
            }),
            isAdmin: true,
            title: "Admin",
            errorMessage: "Not Authorised"
        })
    }
    const isAdmin = request.body.isAdmin ? true : false
    const userChange = request.body.username

    if(userChange === request.session.username && !isAdmin) {
        return response.render('pages/admin', {
            username: request.session.username,
            isloggedin: true,
            users: await userModel.UserData.find({}, {
                _id: 0, 
                password: 0, 
                __v: 0
            }),
            isAdmin: true,
            title: "Admin",
            errorMessage: "You cannot change your own Privileges!"
        })  
    }

    await userModel.UserData.updateOne(
        {username: request.body.username },
        {$set: {
            isAdmin: isAdmin
        }}
    )
    return response.redirect('/admin')
})

app.listen(3000, () => {
    console.log('listening on port 3000')
})