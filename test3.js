const fs = require('fs')
let arrAllUser = JSON.parse(fs.readFileSync("users.json").toString())

let uid = 5959

let tree = getTree(uid, arrAllUser, 0)

console.log(tree)

function getTree(uid, arrAllUser, treeLevel) {
    // find that user
    let rootUser = arrAllUser[arrAllUser.findIndex((e) => e.code === uid)]

    // find f1
    let f1s = arrAllUser.filter(e => e.sponsorId === uid)
    
    let user = {
        n: rootUser.code,
        i: f1s.length
    }

    if (treeLevel > 15) return user
    
    // continue dive deep
    user.childrens = f1s.map(e => getTree(e.code, arrAllUser, treeLevel + 1))
    
    return user
}