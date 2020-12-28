const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/mp3_app', {useNewUrlParser: true, useUnifiedTopology: true})
require('./src/app')