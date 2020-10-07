const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const ytdl = require('ytdl-core')
const fs = require('fs')
const md5 = require('md5')

const uuid = require('uuid').v4

const SERVER_ID = uuid()
const SERVER_VERSION =  process.env.SERVER_VERSION || "v1.0"
const APP_PORT = process.env.APP_PORT || 3000

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'
const API_KEY = 'AIzaSyBPHm3qB0pN8Mm5oPAnok40K_7LhQ2xkS8'


app.get('/', (req, res) => {
    res.json({
        server_name: "MP3 Server",
        server_version: SERVER_VERSION,
        server_id: SERVER_ID
    })
})


// app.get('/music/langyen', (req, res) => {
//     console.log(__dirname)
//     res.sendFile(path.resolve(__dirname, '..', 'assets', 'langyen.mp3'))
// })

app.get('/search', async (req, res) => {
    let queryString = req.query.q

    let rs = await axios.get(YOUTUBE_API + `/search?part=snippet&maxResults=25&q=${queryString}&key=${API_KEY}`)
    res.send(rs.data)
})


// app.get('/song', (req, res) => {
//     let yt = ytdl('https://www.youtube.com/watch?v=iYBe6fWXVCs', {
//         quality: 'highestaudio',
//         filter: 'audioonly'
//     })

//     yt.pipe(res)
//     // yt.pipe(fs.createWriteStream('hi.mp3'))
// })

function waitForPipe(pipe) {
    return new Promise(res => {
        pipe.on('close', () => res(true))
    })
}

app.get('/stream', async (req, res) => {
    let ytID = req.query.ytid
    let sysID = req.query.sysid
    
    try {
        let fileName = null
        if (ytID) {
            fileName = `./assets/musics/${md5(ytID)}.mp3`
            if (fs.existsSync(fileName)) {
                serve_mp3(req, res, fileName)
                return
            }
            // try to download yt song
            let ytsong = ytdl(`https://www.youtube.com/watch?v=${ytID}`, {
                quality: 'highestaudio',
                filter: 'audioonly'
            })

            // download to file

            let download_proccess = ytsong.pipe(fs.createWriteStream(fileName))
            await waitForPipe(download_proccess)
            serve_mp3(req, res, fileName)

            // save to 
        } else if (sysID) {
            throw new Error("Not supported")
        } else {
            throw new Error("No params (ytid, sysid)")
        }

    } catch (e) {
        res.status(500).json({
            code: 500,
            reason: e.message
        })
    }


    //check if exists
})

function serve_mp3(req, res, fileName) {
    let music = fileName

    let stat = fs.statSync(music)
    range = req.headers.range;
    let readStream;

    if (range !== undefined) {
        let parts = range.replace(/bytes=/, "").split("-");

        let partial_start = parts[0]
        let partial_end = parts[1]

        if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
            return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
        }

        let start = parseInt(partial_start, 10)
        // console.log(stat.size)
        let end = partial_end ? parseInt(partial_end, 10) : stat.size - 1
        let content_length = (end - start) + 1

        res.status(206).header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': content_length,
            'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
        });

        // console.log(end)
        readStream = fs.createReadStream(music, {start: start, end: end})
    } else {
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        readStream = fs.createReadStream(music)
    }
    readStream.pipe(res)
}


ytdl('https://www.youtube.com/watch?v=iYBe6fWXVCs', {
    quality: 'highestaudio',
    filter: 'audioonly'
})
  .pipe(fs.createWriteStream('hi.mp3'))



app.listen(APP_PORT, () => {
    console.log('App listening on port', APP_PORT)
})