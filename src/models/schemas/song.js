const Schema = require('mongoose').Schema

const Song = new Schema({
    info: Schema.Types.Mixed,
    fileName: String,
    ytid: String
})

module.exports = Song