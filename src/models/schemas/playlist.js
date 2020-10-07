const Schema = require('mongoose').Schema

const Playlist = new Schema({
    idUser: String,
    name: String,
    songs: [Schema.Types.ObjectId]
})

module.exports = Playlist