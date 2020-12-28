const mongoose = require('mongoose')

const HistorySchema = require('./schemas/history')
const PlaylistSchema = require('./schemas/playlist')
const SongSchema = require('./schemas/song')


module.exports = {
    Song: mongoose.model('Song', SongSchema),
    Playlist: mongoose.model('Playlist', PlaylistSchema),
    History: mongoose.model('History', HistorySchema),
}