let arrAllUser = [
    {
        code: 1022,
        sponsorId: 0,
        id: 'skksksksksk',
        created: 1605949673672
    },
    {
        code: 1027,
        sponsorId: 0,
        id: 'skksksksksk1',
        created: 1605949673673
    },
    {
        code: 1027,
        sponsorId: 1022,
        id: 'skksksksksk2',
        created: 1605949673674
    },
    {
        code: 1200,
        sponsorId: 1022,
        id: 'skksksksksk3',
        created: 1605949673675
    },
    {
        code: 1223,
        sponsorId: 1022,
        id: 'skksksksksk3',
        created: 1605949673676
    },{
        code: 1200,
        sponsorId: 1022,
        id: 'skksksksksk3',
        created: 1605949673679
    }
]

//group user by id
let groupedUserById = {}
for (let user of arrAllUser) {
    let code = user.code
    if (groupedUserById[code]) {
        // do nothing
    } else {
        groupedUserById[code] = []
    }
    groupedUserById[code].push(user)
}

//sort in group
for (let key in groupedUserById) {
    if (groupedUserById[key].length === 0 || groupedUserById[key].length === 1) continue
    groupedUserById[key] = groupedUserById[key].sort((a,b) => a.created - b.created)

    // else main logic
    while (groupedUserById[key].length > 1) {
        let user = groupedUserById[key].pop()
        let userCurrentCode = user.code
        while (groupedUserById[userCurrentCode]) {
            userCurrentCode+=1
        }
        // assign new
        groupedUserById[userCurrentCode] = []
        user.code = userCurrentCode
        groupedUserById[userCurrentCode].push(user)
    }
}

let fixedArrAllUser = []

for (let key in groupedUserById) {
    fixedArrAllUser.push(...groupedUserById[key])
}

console.log(fixedArrAllUser)