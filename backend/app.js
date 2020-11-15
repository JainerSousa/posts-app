const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

const app = express();

mongoose.connect(`mongodb+srv://Jainer:${process.env.MONGO_ATLAS_PW}@mean-course-eue6e.mongodb.net/node-angular?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to database!');
}).catch((error) => {
  console.log('Connection failed!');
  console.log('Error message: ' + error.message);
  console.log('Error name: '+error.name);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');;
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);


module.exports = app;
