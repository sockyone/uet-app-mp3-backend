const { Mongoose } = require('mongoose')

const Schema = require('mongoose').Schema

const Song = new Schema({
    id: String,
    title: String,
    description: String,
    channelTitle: String,
    publishTime: Date,
    liveBroadcastContent: String,
    thumbnails: Schema.Types.Mixed,
    duration: String
})

module.exports = Song