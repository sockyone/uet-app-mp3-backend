const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const ytdl = require('ytdl-core')
const fs = require('fs')
const md5 = require('md5')
const https = require('https')
const execSync = require('child_process').execSync


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

app.get('/trending', async (req, res) => {
    let rs = await axios.get(YOUTUBE_API + `/videos?part=id&maxResults=30&chart=mostPopular&regionCode=VN&videoCategoryId=10&key=${API_KEY}`)
    let ids = rs.data.items.map(e => e.id)
    rs = await axios.get(YOUTUBE_API + `/videos?part=contentDetails,snippet&id=${ids.join(',')}&key=${API_KEY}`)
    rs = rs.data.items.map((e) => {
        return {
            id: e.id,
            title: e.snippet.title,
            description: e.snippet.description,
            channelTitle: e.snippet.channelTitle,
            publishTime: e.snippet.publishTime || e.snippet.publishedAt,
            liveBroadcastContent: e.snippet.liveBroadcastContent,
            thumbnails: e.snippet.thumbnails,
            duration: e.contentDetails.duration
        }
    })

    res.json(rs)
})

app.get('/search', async (req, res) => {
    let queryString = req.query.q

    let rs = await axios.get(YOUTUBE_API + `/search?part=id&maxResults=30&q=${encodeURIComponent(queryString)}&key=${API_KEY}`)
    // res.send(rs.data)
    //transform the result
    let ids = rs.data.items.map(e => e.id.videoId)
    rs = await axios.get(YOUTUBE_API + `/videos?part=contentDetails,snippet&id=${ids.join(',')}&key=${API_KEY}`)
    

    // console.log(rs.data.items)
    rs = rs.data.items.map((e) => {
        return {
            id: e.id,
            title: e.snippet.title,
            description: e.snippet.description,
            channelTitle: e.snippet.channelTitle,
            publishTime: e.snippet.publishTime || e.snippet.publishedAt,
            liveBroadcastContent: e.snippet.liveBroadcastContent,
            thumbnails: e.snippet.thumbnails,
            duration: e.contentDetails.duration
        }
    })

    res.json(rs)
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
    return new Promise((res, rej) => {
        pipe.on('close', () => res(true))
    })
}

app.get('/stream', async (req, res) => {
    let ytID = req.query.ytid
    let sysID = req.query.sysid
    console.log(ytID);
    try {
        let fileName = null
        if (ytID) {
            fileName = `./assets/musics/${md5(ytID)}`

            try {
                fs.accessSync(fileName)
                // return res.redirect(`/static/musics/${md5(ytID)}.mp3`)

                serve_mp3(req, res, fileName + ".mp3")
                return
            } catch (e) {
                // donothing
            }
            // try to download yt song

            let ytsong = ytdl(`https://www.youtube.com/watch?v=${ytID}`, {
                quality: 'highestaudio',
                filter: 'audioonly'
            })

            // // download to file

            let download_proccess = ytsong.pipe(fs.createWriteStream(fileName))

            // stream.on('error', console.error);
            console.log("Downloading...");
            await waitForPipe(download_proccess)
            // transform
            console.log("Start transform from webm to mp3")
            execSync(`ffmpeg -i ${fileName} -acodec libmp3lame ${fileName}.mp3`)
            // return res.redirect(`/static/musics/${md5(ytID)}.mp3`)
            serve_mp3(req, res, fileName + ".mp3")

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


app.get('/recommend', async (req, res) => {
    let search = req.query.q
    // "anh%20y%C3%AAu%20em"
    let url = `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(search)}`
    let rs = await axios.get(url, {responseType:'arraybuffer'})
    let json = JSON.parse(require('iconv-lite').decode(rs.data, "ISO-8859-1"))
    res.send(json[1])
})

// ytdl('https://www.youtube.com/watch?v=iYBe6fWXVCs', {
//     quality: 'highestaudio',
//     filter: 'audioonly'
// })
//   .pipe(fs.createWriteStream('hi.mp3'))

// app.use("/static", (req, res, next) => {console.log("Received!"); next()}, express.static("assets"))

// https.createServer({
//     key: fs.readFileSync('./server.key'),
//     cert: fs.readFileSync('./server.cert')
//   }, app).listen(APP_PORT, () => {
//     console.log('Listening...')
// })

app.listen(APP_PORT, () => {
    console.log('App listening on port', APP_PORT)
})