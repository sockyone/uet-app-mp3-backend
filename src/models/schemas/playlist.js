const Schema = require('mongoose').Schema
const Song = require('./song')

const Playlist = new Schema({
    gid: String,
    name: String,
    songs: [Song]
})

module.exports = Playlist