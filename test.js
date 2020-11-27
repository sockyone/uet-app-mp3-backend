let arrAllUser = [
    {
        code: 1022,
        sponsorId: 0,
        id: '1',
        created: 1605949673672
    },
    {
        code: 1023,
        sponsorId: 1022,
        id: '2',
        created: 1605949673673
    },
    {
        code: 1024,
        sponsorId: 1022,
        id: '3',
        created: 1605949673674
    },
    {
        code: 1025,
        sponsorId: 1023,
        id: '4',
        created: 1605949673675
    },
    {
        code: 1026,
        sponsorId: 1023,
        id: '5',
        created: 1605949673675
    },
    {
        code: 1027,
        sponsorId: 1024,
        id: '6',
        created: 1605949673675
    },
    {
        code: 1028,
        sponsorId: 1024,
        id: '7',
        created: 1605949673675
    },
    {
        code: 1029,
        sponsorId: 1027,
        id: '8',
        created: 1605949673675
    },
    {
        code: 1030,
        sponsorId: 1025,
        id: '9',
        created: 1605949673675
    },
    {
        code: 1031,
        sponsorId: 1025,
        id: '10',
        created: 1605949673675
    },
    {
        code: 1032,
        sponsorId: 1027,
        id: '11',
        created: 1605949673675
    },
]

let arrAllOrder = [
    {
        amount: 200000,
        created: 1605655788432,
        id: 'mamammamamama2',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '11',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: 'mamammamamama1',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '10',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '9',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '9',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '9',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '8',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '7',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '7',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '7',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '6',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '7',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '5',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '7',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '4',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '3',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '3',
        paid: false
    },
    {
        amount: 200000,
        created: 1605655788432,
        id: '2',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '2',
        paid: false
    },{
        amount: 200000,
        created: 1605655788432,
        id: '1',
        status: 1, //0: đang chờ xác nhận; 1: đã xác nhận,
        uid: '1',
        paid: false
    }
]

// lấy những order đã được xác nhận
arrAllOrder = arrAllOrder.filter(e => e.status === 1)


// tính doanh số của nhánh dưới nó, số lượng người bên dưới, và doanh số chính bản thân
// doanh số chính bản thân: value
// doanh số nhánh dưới: valueOfUnder
// số người ở nhánh dưới: unders

function getValueOfUser(user) {
    // tinh tong doanh so
    let v = 0
    let iSale = arrAllOrder.filter(e => e.uid === user.id).reduce((a,c) => a + c.amount, 0)
    let underUsers = 0
    let unders = arrAllUser.filter(e => e.sponsorId === user.code)
    // underUsers += unders.length
    for (let under of unders) {
        let detail = getValueOfUser(under)
        underUsers += (detail.unders + 1)
        v += (detail.value + detail.valueOfUnder)
    }

    // count level
    // let level = getLevel(v)

    return {
        value: iSale,
        // level: level,
        unders: underUsers,
        valueOfUnder: v
    }
}

function getLevel(v) {
    if (v > 200000) return 4
    if (v > 50000) return 3
    if (v > 30000) return 2
    if (v > 10000) return 1
    return 0
}

function calBonusFromOrder(order) {
    let maxBonus = 4
    // find the seller of it
    let sellerIdx = arrAllUser.findIndex(e => e.id === order.uid)
    let orderAmount = order.amount
    if (sellerIdx < 0) return
    
    let seller = arrAllUser[sellerIdx]
    let currentCode = seller.sponsorId
    while (currentCode > 0) {
        let userOfCurrentCodeIdx =  arrAllUser.findIndex(e => e.code === currentCode)
        let level = arrAllUser[userOfCurrentCodeIdx].level
        if (level > maxBonus) {
            arrAllUser[userOfCurrentCodeIdx].bonus += maxBonus * orderAmount / 100
            maxBonus = 0
        } else {
            arrAllUser[userOfCurrentCodeIdx].bonus += (level - (4 - maxBonus)) * orderAmount / 100
            maxBonus = maxBonus - level
        }
        if (maxBonus === 0) break
        currentCode = arrAllUser[userOfCurrentCodeIdx].sponsorId
    }
}
async function payUsers() {
    for (let user of arrAllUser) {
        if (user.bonus > 0) await payUser(user)
    }
}

for (let i = 0; i < arrAllUser.length; i++) {
    let detail = getValueOfUser(arrAllUser[i])
    arrAllUser[i].value = detail.value
    arrAllUser[i].unders = detail.unders
    arrAllUser[i].valueOfUnder = detail.valueOfUnder
}

// console.log(arrAllUser)


for (let i = 0; i < arrAllUser.length; i++) {
    arrAllUser[i].level = getLevel(arrAllUser[i].valueOfUnder)

}
console.log(arrAllUser)


// for (let i = 0; i < arrAllUser.length; i++) {
//     arrAllUser[i].bonus = 0
// }

// // duyệt các order chưa đc trả thưởng

// // count bonus for every user
// for (let i = 0; i < arrAllOrder.length; i++) {
//     if (arrAllOrder[i].paid) continue
//     calBonusFromOrder(arrAllOrder[i])
//     arrAllOrder[i].paid = true
// }


// payUsers()

// async function payUser(user) {
//     let bonus = user.bonus
//     // trả thưởng
//     console.log(`Paid ${bonus} for user id ${user.id}`)
// }

// // sau đó nhớ duyệt user và chỉnh bonuss về 0
// for (let i = 0; i < arrAllUser.length; i++) {
//     arrAllUser[i].bonus = 0
// }