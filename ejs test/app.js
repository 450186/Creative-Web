const { name } = require('ejs');
const express = require('express');
const app = express();
const port = 3002;

app.set('view engine', 'ejs');

const user = {
    firstname: 'John',
    lastname: 'Doe',
    isAdmin: true,
};

const articles = [
    {id: 1, title: 'Lorem ipsum dolor sit amet', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
    {id: 2, title: 'Nam blandit pretium neque', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
    {id: 3, title: 'Phasellus auctor convallis purus', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
];

app.get('/', (req, res) => {
    res.render('pages/index', {
        user,
        title: 'Home'
    });
});

app.get('/articles', (req, res) => {
    res.render('pages/articles', {
        articles,
        title: 'Articles'
    });
});

app.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About'
    });
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});


