const Schema = require('mongoose').Schema

const History = new Schema({
    gid: String,
    searchString: String,
})

module.exports = History