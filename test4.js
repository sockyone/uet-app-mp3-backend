const fs = require('fs')
let arrAllUser = JSON.parse(fs.readFileSync("users.json").toString())
let arrAllOrder = JSON.parse(fs.readFileSync("orders.json").toString())

let arrAllOrderConfirmed = arrAllOrder.filter(e => e.status === 1)
function getF1WithAboveZero(user, arrAllOrderConfirmed) {
    let rs = 0
    let unders = arrAllUser.filter(e => e.sponsorId === user.code)
    for (let under of unders) {
        if (under.value > 0) rs++
    }

    return rs
}

for (let i = 0; i < arrAllUser.length; i++) {
    arrAllUser[i].f1AboveZero = getF1WithAboveZero(arrAllUser[i], arrAllOrderConfirmed)
    arrAllUser[i].bonusPaid = 0
}

console.log(arrAllUser)