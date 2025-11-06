const express= require('express')
const app=express()
const path=require('path')

const posts=require('./models/posts.js')
const userModel=require('./models/users.js')

const sessions=require('express-session')
const cookieParser=require('cookie-parser')

const threeMinutes= 3*60*1000
const oneHour = 1*60*60*1000

const dotenv=require('dotenv').config()

app.use(sessions({
    secret:"my own secret phrase",
    cookie: {maxAge: threeMinutes},
    resave: false,
    saveUninitialized: false
}))


app.listen(3000, ()=>{
    console.log('listening on port 3000')
})

app.use(express.static('public'))

app.use(express.urlencoded({extended: false}))


function checkLoggedIn(request, response, nextAction){
    if(request.session){
        if(request.session.username){
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

app.get('/app', checkLoggedIn, (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'app.html'))
})

app.get('/profile', checkLoggedIn, (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'profile.html'))
})

app.get('/getposts', (request, response)=>{
    response.json({posts:posts.getPosts()})
})

app.post('/newpost', (request, response)=>{
    posts.addPost(request.body.message, "userX")
    response.sendFile(path.join(__dirname, '/views', 'app.html'))
})

app.get('/login', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'login.html'))
})

app.post('/login', (request, response)=>{
    if(userModel.checkUser(request.body.username, request.body.password)){
        request.session.username=request.body.username
        response.sendFile(path.join(__dirname, '/views', 'app.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
})

app.get('/register', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'register.html'))
})

app.post('/register', (request, response)=>{
    if(userModel.addUser(request.body.username, request.body.password)){
        response.sendFile(path.join(__dirname, '/views', 'login.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'registration_failed.html'))
    }
})

app.get('/logout', checkLoggedIn, (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'logout.html'))
})

app.post('/logout', (request, response)=>{
    request.session.destroy()
    response.redirect('/')
})

