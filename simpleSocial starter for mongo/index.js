const express = require('express')
const app = express()
const path = require('path')

const posts = require('./models/posts.js')
const userModel = require('./models/users.js')

const sessions = require('express-session')
const cookieParser = require('cookie-parser')
const { userInfo } = require('os')

const threeMinutes = 3 * 60 * 1000
const oneHour = 1 * 60 * 60 * 1000

const dotenv = require('dotenv').config()
const mongoDBusername = process.env.mongoDBusername
const mongoDBpassword = process.env.mongoDBpassword
const mongoAppName = process.env.mongoAppName

const connectionString = `mongodb+srv://${mongoDBusername}:${mongoDBpassword}@cluster0.b7jyjnd.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`
// const connectionString = `mongodb+srv://${mongoDBusername}:${mongoDBpassword}@cluster0.lpfnqqx.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`
const mongoose = require('mongoose')
mongoose.connect(connectionString)
    .catch(err => console.error('Could not connect to MongoDB...', err))

app.use(sessions({
    secret: "my own secret phrase",
    cookie: { maxAge: threeMinutes },
    resave: false,
    saveUninitialized: false
}))


app.listen(3000, () => {
    console.log('listening on port 3000')
})

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

function checkLoggedIn(request, response, nextAction) {
    if (request.session) {
        if (request.session.username) {
            nextAction()
        } else {
            request.session.destroy()
            response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
        }
    } else {
        request.session.destroy()
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
}

app.get('/app', checkLoggedIn, (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'app.html'))
})

app.get('/profile', checkLoggedIn, (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'profile.html'))
})

app.get('/getposts', async (request, response) => {
    response.json({ posts: await posts.getLatestNPosts(3) })
})

app.post('/likepost', async (request, response) => {
    const postId = request.body.postId;
    try {
        await posts.addLikeToPost(postId, request.session.username);
        response.json({ success: true });
    } catch (err) {
        response.json({ success: false, error: err.message });
    }
})

app.post('/newpost', (request, response) => {
    posts.addPost(request.body.message, request.session.username)
    response.redirect('/app')
})

app.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'login.html'))
})

app.post('/login', async (request, response) => {
    if (await userModel.checkUser(request.body.username, request.body.password)) {
        request.session.username = request.body.username
        response.sendFile(path.join(__dirname, '/views', 'app.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
})

app.get('/register', (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'register.html'))
})

app.post('/register', async (request, response) => {
    if (await userModel.addUser(request.body.username, request.body.password, request.body.Firstname, request.body.Lastname)) {
        response.sendFile(path.join(__dirname, '/views', 'app.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'registration_failed.html'))
    }
})

app.get('/account', checkLoggedIn, (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'accountpage.html'))
})

app.get('/logout', checkLoggedIn, (request, response) => {
    response.sendFile(path.join(__dirname, '/views', 'logout.html'))
})

app.post('/logout', (request, response) => {
    request.session.destroy()
    response.redirect('/')
})

