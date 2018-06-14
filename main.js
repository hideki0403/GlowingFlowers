////////////////////////////////////////////////////////////////////////////////
//     ________                                                               //
//    /             \                               []                        //
//   |               |                                                        //
//   |   ____        |    _____     \          /     |    ___      _____      //
//   |  /    \       |   /     \     \        /      |  |/   \    /     \     //
//   |        |      |  |       |     \  /\  /       |  |     |   |     |     //
//   \_______/       |   \_____/       \/  \/        |  |     |   \_____|     //
//                                                                      |     //
//                                                                \_____/     //
//   ________                                                                 //
//  |           \                                                             //
//  |            |                                                 _____      //
//  |________    |     _____    \          /   _____    | ____    /           //
//  |            |    /     \    \        /   /     \   |/    \   \____       //
//  |            |   |       |    \  /\  /    |_____/   |              \      //
//  |            |    \_____/      \/  \/     \______/  |         _____/      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

//================================================================//
// Copyright © 2018 hideki_0403(hideki0403) All Rights Reserved.  //
// このソースコードの無断利用、二次配布、改変配布を行うことを禁じます。 //
// お問い合わせは Twitter @hideki_0403 まで。                       //
//                                                                //
// 使用ライブラリ: eris(DiscordAPI), fs(FileSystem)                //
//================================================================//

const eris = require('eris')
const token = require('./config.conf')['token']
const bot = new eris(token)
const fs = require('fs')
//const dir = './'
const dir = '/home/pi/デスクトップ/DiscordBots/kusa/'

buySeed = 'off'
plantSeed = 'off'
delSaveData = 'off'
safeSetting = null


/* 
===============メモ===============
・花は7種類の種の中からランダムで咲く。→結局三種類になった
・種はその花の科目を指す→その仕様なくなった
・花が咲いたときに新規花か判定、すでにデータベースに登録されていれば登録済みの花として処理される。→実装済み

=================================

==========Embedデザイン定義============
[Success]

bot.createMessage(msg.channel.id, {
    embed: {
        color: 0x44fc53,
        author: {
            name: 'Success!',
            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
        },
        description: '',
        footer: {
            text: msg.author.username,
            icon_url: msg.author.avatarURL
        }
    }
})


[Error]

bot.createMessage(msg.channel.id, {
    embed: {
        color: 0xff1919,
        author: {
            name: 'Error',
            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
        },
        description: 'ErrorCode:' + error,
        footer: {
            text: msg.author.username,
            icon_url: msg.author.avatarURL
        }
    }
})


======================================
*/

bot.on('ready', (msg) => {
    console.log('Ready...')
    bot.editStatus('online', {name: '.kusa help | ' + Object.keys(bot.guildShardMap).length + ' servers & ' + bot.users.size + ' users'})
})

// 3分おきにステータス更新
setInterval (function () {
    bot.editStatus('online', {name: '.kusa help | ' + Object.keys(bot.guildShardMap).length + ' servers & ' + bot.users.size + ' users'})
//    fs.writeFileSync(dir + 'cnf.dat', hatsugen)
}, 180000)



// 新規ユーザーデータ定義
var newUserData = {
    "data": {
        "name": "none",
        "coin": 100,
        "level": 1,
        "exp": 0,
        "flowers": 0,
        "kusa": 0
    },
    "login": {
        "lastLogin": 'none',
        "loginStreak": 0,
        "cumulativeLogin": 0,
    },
    "nowGlowingFlowerData": {
        "flowerDir": "none",
        "nowTall": "none",
        "endTall": "none"
    },
    "storage": {
        "ふつうのタネ": 0,
        "すこし高級なタネ": 0,
        "最高級のタネ": 0
    },
    "complete": []
}

// expテーブル

// lv5毎に必要経験値数増加
// 基本的に
// 基礎レベルx10+前レベルアップに必要だった経験値数
// の簡単な計算式から成り立っている（らしい）

const expTable = [
    50,150,300,500,750, //5
    1100,1550,2100,2750,3500, //10
    4400,5450,6650,8000,9500, //15
    11200,13100,15200,17500,20000, //20
    22750,25750,29000,32500,36250, //25
    40300,44650,49300,54250,59500, //30
    65100,71050,77350,84000,91000, //35
    98400,106200,114400,123000,132000, //40
    141450,151350,161700,172500,183750, //45
    195500,207750,220500,233750,247500, //50
    261800,276650,292050,308000,324500, //55
    341600,359300,377600,396500,416000, //60
    436150,456950,478400,500500,523250, //65
    546700,570850,595700,621250,647500, //70
    674500,702250,730750,760000,790000, //75
    820800,852400,884800,918000,952000, //80
    986850,1022550,1059100,1096500,1134750, //85
    1173900,1213950,1254900,1296750,1339500, //90
    1383200,1427850,1473450,1520000,1567500, //95
    1616000,1665500,1716000,1767500,1820000, //100
    1873550,1928150,1983800,2040500,2098250, //105
    2157100,2217050,2278100,2340250,2403500, //110
    2467900,2533450,2600150,2668000,2737000, //115
    2807200,2878600,2951200,3025000,3100000 //120 <--- Lv120になるまでに必要な経験値数は310万。一体このクソゲーに時間を費やしてLv120になる猛者は居るのだろうか...
]

/*
[EXPTable]

[5]   50 100 150 200 250 
[10]  350 450 550 650 750
[15]  900 1050 1200 1350 1500
[20]  1700 1900 2100 2300 2500
[25]  2750 3000 3250 3500 3750
[30]  4050 4350 4650 4950 5250
[35]  5600 5950 6300 6650 7000
[40]  7400 7800 8200 8600 9000
[45]  9450 9900 10350 10800 11250
[50]  11750 12250 12750 13250 13750
[55]  14300 14850 15400 15950 16500
[60]  17100 17700 18300 18900 19500
[65]  20150 20800 21450 22100 22750
[70]  23450 24150 24850 25550 26250
[75]  27000 27750 28500 29250 30000
[80]  30800 31600 32400 33200 34000
[85]  34850 35700 36550 37400 38250
[90]  39150 40050 40950 41850 42750
[95]  43700 44650 45600 46550 47500
[100] 48500 49500 50500 51500 52500
[105] 53550 54600 55650 56700 57750 
[110] 58850 59950 61050 62150 63250
[115] 64400 65550 66700 67850 69000
[120] 70200 71400 72600 73800 75000

*/


// isExistFile
function isExistFile(name) {
    try {
        fs.statSync(dir + 'lib/userdata/' + name + '.dat')
        return true
    } catch(err) {
        if(err.conde === 'ENOENT') return false
    }
}

function isExistFlowerFile(name) {
    try {
        fs.statSync(dir + 'lib/data/flower/' + name)
        return true
    } catch(err) {
        if(err.conde === 'ENOENT') {
            return false
            errcode = err.conde
        }
    }
}
function isExistSettingsFile(name) {
    try {
        fs.statSync(dir + 'lib/userdata/settings/' + name + '.conf')
        return true
    } catch(err) {
        if(err.conde === 'ENOENT') return false
    }
}

// function autobuy
function autobuy(num) {

}

//notice 
var notice = [
    '[Notice] .kusa loginでログインボーナスがもらえます！',
    '[Notice] 花によってレア度が違います！',
    '[Notice] バグがあれば、Twitter @hideki_0403 まで報告をお願いします。'
]

// 登録
bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa register') {
        if(isExistFile(msg.author.id) === true) {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: '既に登録しています',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        } else {
            fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newUserData, null))
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0x44fc53,
                    author: {
                        name: 'Success!',
                        icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                    },
                    description: '登録が完了しました！まずは花を育てるために「.kusa buy seed」で種を買ってみよう！',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        }
    }
})
// 種購入
bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa buy seed') {
        if(true !== isExistFile(msg.author.id)) {
            //未登録時処理
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたはまだ登録をしていません！\n.kusa register を実行して登録をしてください。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        } else {
            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                buySeed = 'on'
                safeSetting = msg.author.id
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0x44fc53,
                        author: {
                            name: 'お店 - タネ売り場',
                        },
                        description: 'どのタネを買うか、番号で指定してください。\n**タネのまとめ買い機能**が実装されました。買いたいタネの番号の後に半角スペース、その後ろに買いたい個数を入力してください。\nなお単品で買いたい場合はこれまで通り、買いたいタネの番号のみで入力しても購入できます。\nex.) 1 100 (ふつうのタネを100個)\n\n**あなたの現在の所持金:' + data.data.coin + 'コイン**',
                        fields: [
                            {
                                name: '1',
                                value: 'ふつうのタネ（100コイン）\n[通常のレア度の花が咲きます]'
                            } , {
                                name: '2',
                                value: 'すこし高級なタネ（500コイン）\n[少しレアな花が咲きます]'
                            } , {
                                name: '3',
                                value: '最高級のタネ（3000コイン）\n[滅多に咲かないレア度の高い花が咲きます]'
                            }
                        ],
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })

        }
    }
})

// buy
bot.on('messageCreate', (msg) => {
    if(buySeed === 'on') {
        if(safeSetting === msg.author.id) {
            if(msg.content.match(/1|2|3/)) {
                if(msg.content.match(/1.*?/)) {
                    var replace = msg.content.replace('1 ', '')
                    if(replace === '') {
                        var replace = 1
                    }
                    var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                    if(data.data.coin >= 100 * replace) {
                        var zankin = data.data.coin - 100 * replace
                        var newData = {
                            "data": {
                                "name": msg.author.username,
                                "coin": zankin,
                                "level": data.data.level,
                                "exp": data.data.exp,
                                "flowers": data.data.flowers,
                                "kusa": data.data.kusa
                            },
                            "login": {
                                "lastLogin": data.login.lastLogin,
                                "loginStreak": data.login.loginStreak,
                                "cumulativeLogin": data.login.cumulativeLogin,
                            },
                            "nowGlowingFlowerData": {
                                "flowerDir": data.nowGlowingFlowerData.flowerDir,
                                "nowTall": data.nowGlowingFlowerData.nowTall,
                                "endTall": data.nowGlowingFlowerData.endTall
                            },
                            "storage": {
                                "ふつうのタネ": parseInt(data.storage.ふつうのタネ) + parseInt(replace),
                                "すこし高級なタネ": data.storage.すこし高級なタネ,
                                "最高級のタネ": data.storage.最高級のタネ
                            },
                            "complete": data.complete
                        }
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0x44fc53,
                                author: {
                                    name: 'Success!',
                                    icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                },
                                description: 'ふつうのタネの購入（' + replace + '個）が完了しました。\n次に「.kusa plant」でタネを植えてみよう！\n\n残金:' + zankin + 'コイン',
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
                        buySeed = 'off'
                        safeSetting = null
                        fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                    } else {
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0xff1919,
                                author: {
                                    name: 'Error',
                                    icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                },
                                description: '所持金が足りないため買えませんでした',
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
                        buySeed = 'off'
                        safeSetting = null
                    }
                } else {
                    if(msg.content.match(/2.*?/)) {
                        var replace = msg.content.replace('2 ', '')
                        if(replace === '') {
                            var replace = 1
                        }
                        var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                        if(data.data.coin >= 500 * replace) {
                            var zankin = data.data.coin - 500 * replace
                            var newData = {
                                "data": {
                                    "name": msg.author.username,
                                    "coin": zankin,
                                    "level": data.data.level,
                                    "exp": data.data.exp,
                                    "flowers": data.data.flowers,
                                    "kusa": data.data.kusa
                                },
                                "login": {
                                    "lastLogin": data.login.lastLogin,
                                    "loginStreak": data.login.loginStreak,
                                    "cumulativeLogin": data.login.cumulativeLogin,
                                },
                                "nowGlowingFlowerData": {
                                    "flowerDir": data.nowGlowingFlowerData.flowerDir,
                                    "nowTall": data.nowGlowingFlowerData.nowTall,
                                    "endTall": data.nowGlowingFlowerData.endTall
                                },
                                "storage": {
                                    "ふつうのタネ": data.storage.ふつうのタネ,
                                    "すこし高級なタネ": parseInt(data.storage.すこし高級なタネ) + parseInt(replace),
                                    "最高級のタネ": data.storage.最高級のタネ
                                },
                                "complete": data.complete
                            }
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0x44fc53,
                                    author: {
                                        name: 'Success!',
                                        icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                    },
                                    description: 'すこし高級なタネの購入（' + replace + '個）が完了しました。\n次に「.kusa plant」でタネを植えてみよう！\n\n残金:' + zankin + 'コイン',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            buySeed = 'off'
                            safeSetting = null
                            fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                        } else {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0xff1919,
                                    author: {
                                        name: 'Error',
                                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                    },
                                    description: '所持金が足りないため買えませんでした',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            buySeed = 'off'
                            safeSetting = null
                        }
                    } else {
                        if(msg.content.match(/3.*?/)) {
                            var replace = msg.content.replace('3 ', '')
                            if(replace === '') {
                                var replace = 1
                            }
                            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                            if(data.data.coin >= 3000 * replace) {
                                var zankin = data.data.coin - 3000 * replace
                                var newData = {
                                    "data": {
                                        "name": msg.author.username,
                                        "coin": zankin,
                                        "level": data.data.level,
                                        "exp": data.data.exp,
                                        "flowers": data.data.flowers,
                                        "kusa": data.data.kusa
                                    },
                                    "login": {
                                        "lastLogin": data.login.lastLogin,
                                        "loginStreak": data.login.loginStreak,
                                        "cumulativeLogin": data.login.cumulativeLogin,
                                    },
                                    "nowGlowingFlowerData": {
                                        "flowerDir": data.nowGlowingFlowerData.flowerDir,
                                        "nowTall": data.nowGlowingFlowerData.nowTall,
                                        "endTall": data.nowGlowingFlowerData.endTall
                                    },
                                    "storage": {
                                        "ふつうのタネ": data.storage.ふつうのタネ,
                                        "すこし高級なタネ": data.storage.すこし高級なタネ,
                                        "最高級のタネ": parseInt(data.storage.最高級のタネ) + parseInt(replace)
                                    },
                                    "complete": data.complete
                                }
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0x44fc53,
                                        author: {
                                            name: 'Success!',
                                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                        },
                                        description: '最高級のタネの購入（' + replace + '個）が完了しました。\n次に「.kusa plant」でタネを植えてみよう！\n\n残金:' + zankin + 'コイン',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                buySeed = 'off'
                                safeSetting = null
                                fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                            } else {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0xff1919,
                                        author: {
                                            name: 'Error',
                                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                        },
                                        description: '所持金が足りないため買えませんでした',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                buySeed = 'off'
                                safeSetting = null
                            }
                        }
                    }
                }
            }
        }
    }
})

// Login
bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa login') {
        if(true !== isExistFile(msg.author.id)) {
            //未登録時処理
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたはまだ登録をしていません！\n.kusa register を実行して登録をしてください。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        } else {
            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
            var objDate = new Date()
            var year = objDate.getFullYear()
            var month = objDate.getMonth() + 1
            var day = objDate.getDate()
            var today = year + '/' + month + '/' + day

            var objDate = new Date()

            objDate.setDate(objDate.getDate() - 1)

            var lsyear = objDate.getFullYear()
            var lsmonth = objDate.getMonth()+ 1
            var lsday = objDate.getDate()
            var yesterday = lsyear + '/' + lsmonth + '/' + lsday
            // 既に今日ログインしてあるか判定
            if(today === data.login.lastLogin) {
                // 今日すでにログインしてあった場合
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0xff1919,
                        author: {
                            name: 'Error',
                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                        },
                        description: 'あなたは既にログインしています。また明日、再度お試しください。',
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            } else {
                // 今日まだログインしていなかった場合
                if(data.login.lastLogin = yesterday) {
                    var renzokuLogin = data.login.loginStreak + 1
                } else {
                    var renzokuLogin = 1
                }

                var goukeiLogin = data.login.cumulativeLogin + 1

                if(renzokuLogin > 1) {
                    if(renzokuLogin > 30) {
                        var min = renzokuLogin 
                        var max = renzokuLogin + 100

                        var a = Math.floor( Math.random() * (max + 1 - min) ) + min
                        var bounusCoin = 300 + a
                    } else {
                        var bounusCoin = renzokuLogin * 10
                    }
                    var stickEggplant = '\n連続ログイン' + renzokuLogin + '日目の報酬で追加で' + bounusCoin + 'コインを獲得！'
                } else {
                    var stickEggplant = ''
                    var bounusCoin = 0
                }

                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0x44fc53,
                        author: {
                            name: 'Success!',
                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                        },
                        description: 'ログインしました。ログインで200コインを獲得！' + stickEggplant,
                        fields: [
                            {
                                name: '連続ログイン日数',
                                value: renzokuLogin + '日'
                            } , {
                                name: '累計ログイン日数',
                                value: goukeiLogin + '日'
                            }
                        ],
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
                var newData = {
                    "data": {
                        "name": msg.author.username,
                        "coin": data.data.coin + 200 + bounusCoin,
                        "level": data.data.level,
                        "exp": data.data.exp,
                        "flowers": data.data.flowers,
                        "kusa": data.data.kusa
                    },
                    "login": {
                        "lastLogin": today,
                        "loginStreak": renzokuLogin,
                        "cumulativeLogin": goukeiLogin,
                    },
                    "nowGlowingFlowerData": {
                        "flowerDir": data.nowGlowingFlowerData.flowerDir,
                        "nowTall": data.nowGlowingFlowerData.nowTall,
                        "endTall": data.nowGlowingFlowerData.endTall
                    },
                    "storage": {
                        "ふつうのタネ": data.storage.ふつうのタネ + 1,
                        "すこし高級なタネ": data.storage.すこし高級なタネ,
                        "最高級のタネ": data.storage.最高級のタネ
                    },
                    "complete": data.complete
                }
                fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
            }
        }
    }
})

// タネを植える
bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa plant') {
        if(isExistFile(msg.author.id) === true) {
            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
            if(data.nowGlowingFlowerData.flowerDir === 'none') {
            plantSeed = 'on'
            safeSetting = msg.author.id
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0x44fc53,
                    author: {
                        name: 'タネを植える'
                    },
                    description: 'どのタネを植えるか選択してください！',
                    fields: [
                        {
                            name: '1',
                            value: 'ふつうのタネ（' + data.storage.ふつうのタネ + '個所持）\n[通常のレア度の花が咲きます]'
                        } , {
                            name: '2',
                            value: 'すこし高級なタネ（' + data.storage.すこし高級なタネ + '個所持）\n[少しレアな花が咲きます]'
                        } , {
                            name: '3',
                            value: '最高級のタネ（' + data.storage.最高級のタネ + '個所持）\n[滅多に咲かないレア度の高い花が咲きます]'
                        }
                    ],
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        } else {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたは現在花を育てている最中です。\n花を育てている間は新しいタネを植えることができません。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        }
        } else {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたはまだ登録をしていません！\n.kusa register を実行して登録をしてください。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        }
    } else {
        if(msg.content.match(/\.kusa plant .*?/)) {
            if(isExistFile(msg.author.id) === true) {
                var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                if(data.nowGlowingFlowerData.flowerDir === 'none') {
                    var repl = msg.content.replace('.kusa plant ', '')
                    if(repl === '1') {
                        var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                        if(data.storage.ふつうのタネ >= 1) {
                            var rand = Math.floor( Math.random() * 100)
                            if(rand < 40) {
                                var flowerFolder = 'ア行'
                            } else {
                                if(rand < 30) {
                                    var flowerFolder = 'カ行'
                                } else {
                                    if(rand < 20) {
                                        var flowerFolder = 'サ行'
                                    } else {
                                        if(rand > 0) {
                                            var flowerFolder = 'タ行'
                                        }
                                    }
                                }
                            }
        
                            var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
                                                
                            var min = 0
                            var max = randomFlower.length
        
                            var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                            var flw = randomFlower[flowerResult]
                            console.log(flw)
                            while(flw === 'undefined') {
                                var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                var flw = randomFlower[flowerResult]
                                console.log('再生成')
                                console.log(flw)
                            }
        
                            var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
        
                            var tane = data.storage.ふつうのタネ - 1
                            var newData = {
                                "data": {
                                    "name": msg.author.username,
                                    "coin": data.data.coin,
                                    "level": data.data.level,
                                    "exp": data.data.exp,
                                    "flowers": data.data.flowers,
                                    "kusa": data.data.kusa
                                },
                                "login": {
                                    "lastLogin": data.login.lastLogin,
                                    "loginStreak": data.login.loginStreak,
                                    "cumulativeLogin": data.login.cumulativeLogin,
                                },
                                "nowGlowingFlowerData": {
                                    "flowerDir": flowerFolder + '/' + flw,
                                    "nowTall": 0,
                                    "endTall": flowerTall
                                },
                                "storage": {
                                    "ふつうのタネ": tane,
                                    "すこし高級なタネ": data.storage.すこし高級なタネ,
                                    "最高級のタネ": data.storage.最高級のタネ
                                },
                                "complete": data.complete
                            }
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0x44fc53,
                                    author: {
                                        name: 'Success!',
                                        icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                    },
                                    description: 'ふつうのタネを植えました！',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            plantSeed = 'off'
                            safeSetting = null
                            fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                        } else {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0xff1919,
                                    author: {
                                        name: 'Error',
                                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                    },
                                    description: 'タネが無いため植えられませんでした。',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            plantSeed = 'off'
                            safeSetting = null
                        }
                    } else {
                        if(repl === '2') {
                            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                            if(data.storage.すこし高級なタネ >= 1) {
                                var tane = data.storage.すこし高級なタネ - 1
                                var rand = Math.floor( Math.random() * 100)
                                if(rand < 40) {
                                    var flowerFolder = 'タ行'
                                } else {
                                    if(rand < 30) {
                                        var flowerFolder = 'ナ行'
                                    } else {
                                        if(rand < 20) {
                                            var flowerFolder = 'ハ行'
                                        } else {
                                            if(rand > 0) {
                                                var flowerFolder = 'マ行'
                                            }
                                        }
                                    }
                                }
        
                                    var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
                                                    
                                    var min = 0
                                    var max = randomFlower.length
                
                                    var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                    var flw = randomFlower[flowerResult]
                                    console.log(flw)
                                    while(flw === 'undefined') {
                                        var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                        var flw = randomFlower[flowerResult]
                                        console.log('再生成')
                                        console.log(flw)
                                    }
                
                                    var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
                                    var newData = {
                                        "data": {
                                            "name": msg.author.username,
                                            "coin": data.data.coin,
                                            "level": data.data.level,
                                            "exp": data.data.exp,
                                            "flowers": data.data.flowers,
                                            "kusa": data.data.kusa
                                        },
                                        "login": {
                                            "lastLogin": data.login.lastLogin,
                                            "loginStreak": data.login.loginStreak,
                                            "cumulativeLogin": data.login.cumulativeLogin,
                                        },
                                        "nowGlowingFlowerData": {
                                            "flowerDir": flowerFolder + '/' + flw,
                                            "nowTall": 0,
                                            "endTall": flowerTall
                                        },
                                        "storage": {
                                            "ふつうのタネ": data.storage.ふつうのタネ,
                                            "すこし高級なタネ": tane,
                                            "最高級のタネ": data.storage.最高級のタネ
                                        },
                                        "complete": data.complete
                                    }
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            color: 0x44fc53,
                                            author: {
                                                name: 'Success!',
                                                icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                            },
                                            description: 'すこし高級なタネを植えました！',
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            }
                                        }
                                    })
                                    plantSeed = 'off'
                                    safeSetting = null
                                    fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                                
                            } else {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0xff1919,
                                        author: {
                                            name: 'Error',
                                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                        },
                                        description: 'タネが無いため植えられませんでした。',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                plantSeed = 'off'
                                safeSetting = null
                            }
                        } else {
                            if(repl === '3') {
                                var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                                if(data.storage.最高級のタネ >= 1) {
                                    var tane = data.storage.最高級のタネ - 1
                                    var rand = Math.floor( Math.random() * 100)
                                    if(rand < 50) {
                                        var flowerFolder = 'マ行'
                                    } else {
                                        if(rand < 40) {
                                            var flowerFolder = 'ヤ行'
                                        } else {
                                            if(rand > 0) {
                                                var flowerFolder = 'ラ行'
                                            }
                                        }
                                    }
                                  
                                    var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
        
                                    var min = 0
                                    var max = randomFlower.length
                
                                    var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                    var flw = randomFlower[flowerResult]
                                    console.log(flw)
                                    while(flw === 'undefined') {
                                        var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                        var flw = randomFlower[flowerResult]
                                        console.log('再生成')
                                        console.log(flw)
                                    }
                
                                    var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
                                    var newData = {
                                        "data": {
                                            "name": msg.author.username,
                                            "coin": data.data.coin,
                                            "level": data.data.level,
                                            "exp": data.data.exp,
                                            "flowers": data.data.flowers,
                                            "kusa": data.data.kusa
                                        },
                                        "login": {
                                            "lastLogin": data.login.lastLogin,
                                            "loginStreak": data.login.loginStreak,
                                            "cumulativeLogin": data.login.cumulativeLogin,
                                        },
                                        "nowGlowingFlowerData": {
                                            "flowerDir": flowerFolder + '/' + flw,
                                            "nowTall": 0,
                                            "endTall": flowerTall
                                        },
                                        "storage": {
                                            "ふつうのタネ": data.storage.ふつうのタネ,
                                            "すこし高級なタネ": data.storage.すこし高級なタネ,
                                            "最高級のタネ": tane
                                        },
                                        "complete": data.complete
                                    }
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            color: 0x44fc53,
                                            author: {
                                                name: 'Success!',
                                                icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                            },
                                            description: '最高級のタネを植えました！',
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            }
                                        }
                                    })
                                    plantSeed = 'off'
                                    safeSetting = null
                                    fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                               
                                } else {
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            color: 0xff1919,
                                            author: {
                                                name: 'Error',
                                                icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                            },
                                            description: 'タネが無いため植えられませんでした。',
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            }
                                        }
                                    })
                                    plantSeed = 'off'
                                    safeSetting = null
                                }
                            } else {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0xff1919,
                                        author: {
                                            name: 'Error',
                                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                        },
                                        description: repl + 'は有効なインプットではありません。',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                            }
                        }
                    }
                } else {
                    bot.createMessage(msg.channel.id, {
                        embed: {
                            color: 0xff1919,
                            author: {
                                name: 'Error',
                                icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                            },
                            description: 'あなたは現在花を育てている最中です。\n花を育てている間は新しいタネを植えることができません。',
                            footer: {
                                text: msg.author.username,
                                icon_url: msg.author.avatarURL
                            }
                        }
                    })
                }
            } else {
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0xff1919,
                        author: {
                            name: 'Error',
                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                        },
                        description: 'あなたはまだ登録をしていません！\n.kusa register を実行して登録をしてください。',
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            }
        }
    }
})

bot.on('messageCreate', (msg) => {
    if(plantSeed === 'on') {
        if(safeSetting === msg.author.id) {
            if(msg.content.match(/1|2|3/)) {
                if(msg.content === '1') {
                    var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                    if(data.storage.ふつうのタネ >= 1) {
                        var rand = Math.floor( Math.random() * 100)
                        if(rand < 40) {
                            var flowerFolder = 'ア行'
                        } else {
                            if(rand < 30) {
                                var flowerFolder = 'カ行'
                            } else {
                                if(rand < 20) {
                                    var flowerFolder = 'サ行'
                                } else {
                                    if(rand > 0) {
                                        var flowerFolder = 'タ行'
                                    }
                                }
                            }
                        }
    
                        var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
                                            
                        var min = 0
                        var max = randomFlower.length
    
                        var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                        var flw = randomFlower[flowerResult]
                        console.log(flw)
                        while(flw === 'undefined') {
                            var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                            var flw = randomFlower[flowerResult]
                            console.log('再生成')
                            console.log(flw)
                        }
    
                        var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
    
                        var tane = data.storage.ふつうのタネ - 1
                        var newData = {
                            "data": {
                                "name": msg.author.username,
                                "coin": data.data.coin,
                                "level": data.data.level,
                                "exp": data.data.exp,
                                "flowers": data.data.flowers,
                                "kusa": data.data.kusa
                            },
                            "login": {
                                "lastLogin": data.login.lastLogin,
                                "loginStreak": data.login.loginStreak,
                                "cumulativeLogin": data.login.cumulativeLogin,
                            },
                            "nowGlowingFlowerData": {
                                "flowerDir": flowerFolder + '/' + flw,
                                "nowTall": 0,
                                "endTall": flowerTall
                            },
                            "storage": {
                                "ふつうのタネ": tane,
                                "すこし高級なタネ": data.storage.すこし高級なタネ,
                                "最高級のタネ": data.storage.最高級のタネ
                            },
                            "complete": data.complete
                        }
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0x44fc53,
                                author: {
                                    name: 'Success!',
                                    icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                },
                                description: 'ふつうのタネを植えました！',
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
                        plantSeed = 'off'
                        safeSetting = null
                        fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                    } else {
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0xff1919,
                                author: {
                                    name: 'Error',
                                    icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                },
                                description: 'タネが無いため植えられませんでした。',
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
                        plantSeed = 'off'
                        safeSetting = null
                    }
                } else {
                    if(msg.content === '2') {
                        var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                        if(data.storage.すこし高級なタネ >= 1) {
                            var tane = data.storage.すこし高級なタネ - 1
                            var rand = Math.floor( Math.random() * 100)
                            if(rand < 40) {
                                var flowerFolder = 'タ行'
                            } else {
                                if(rand < 30) {
                                    var flowerFolder = 'ナ行'
                                } else {
                                    if(rand < 20) {
                                        var flowerFolder = 'ハ行'
                                    } else {
                                        if(rand > 0) {
                                            var flowerFolder = 'マ行'
                                        }
                                    }
                                }
                            }
    
                                var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
                                                
                                var min = 0
                                var max = randomFlower.length
            
                                var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                var flw = randomFlower[flowerResult]
                                console.log(flw)
                                while(flw === 'undefined') {
                                    var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                    var flw = randomFlower[flowerResult]
                                    console.log('再生成')
                                    console.log(flw)
                                }
            
                                var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
                                var newData = {
                                    "data": {
                                        "name": msg.author.username,
                                        "coin": data.data.coin,
                                        "level": data.data.level,
                                        "exp": data.data.exp,
                                        "flowers": data.data.flowers,
                                        "kusa": data.data.kusa
                                    },
                                    "login": {
                                        "lastLogin": data.login.lastLogin,
                                        "loginStreak": data.login.loginStreak,
                                        "cumulativeLogin": data.login.cumulativeLogin,
                                    },
                                    "nowGlowingFlowerData": {
                                        "flowerDir": flowerFolder + '/' + flw,
                                        "nowTall": 0,
                                        "endTall": flowerTall
                                    },
                                    "storage": {
                                        "ふつうのタネ": data.storage.ふつうのタネ,
                                        "すこし高級なタネ": tane,
                                        "最高級のタネ": data.storage.最高級のタネ
                                    },
                                    "complete": data.complete
                                }
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0x44fc53,
                                        author: {
                                            name: 'Success!',
                                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                        },
                                        description: 'すこし高級なタネを植えました！',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                plantSeed = 'off'
                                safeSetting = null
                                fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                            
                        } else {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0xff1919,
                                    author: {
                                        name: 'Error',
                                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                    },
                                    description: 'タネが無いため植えられませんでした。',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            plantSeed = 'off'
                            safeSetting = null
                        }
                    } else {
                        if(msg.content === '3') {
                            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                            if(data.storage.最高級のタネ >= 1) {
                                var tane = data.storage.最高級のタネ - 1
                                var rand = Math.floor( Math.random() * 100)
                                if(rand < 50) {
                                    var flowerFolder = 'マ行'
                                } else {
                                    if(rand < 40) {
                                        var flowerFolder = 'ヤ行'
                                    } else {
                                        if(rand > 0) {
                                            var flowerFolder = 'ラ行'
                                        }
                                    }
                                }
                              
                                var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + flowerFolder)
    
                                var min = 0
                                var max = randomFlower.length
            
                                var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                var flw = randomFlower[flowerResult]
                                console.log(flw)
                                while(flw === 'undefined') {
                                    var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                                    var flw = randomFlower[flowerResult]
                                    console.log('再生成')
                                    console.log(flw)
                                }
            
                                var flowerTall = (Math.round((Math.random() * (30 - 5) + 5) * 100)) / 100 //5cm以上30cm未満で小数点第2位までを算出する
                                var newData = {
                                    "data": {
                                        "name": msg.author.username,
                                        "coin": data.data.coin,
                                        "level": data.data.level,
                                        "exp": data.data.exp,
                                        "flowers": data.data.flowers,
                                        "kusa": data.data.kusa
                                    },
                                    "login": {
                                        "lastLogin": data.login.lastLogin,
                                        "loginStreak": data.login.loginStreak,
                                        "cumulativeLogin": data.login.cumulativeLogin,
                                    },
                                    "nowGlowingFlowerData": {
                                        "flowerDir": flowerFolder + '/' + flw,
                                        "nowTall": 0,
                                        "endTall": flowerTall
                                    },
                                    "storage": {
                                        "ふつうのタネ": data.storage.ふつうのタネ,
                                        "すこし高級なタネ": data.storage.すこし高級なタネ,
                                        "最高級のタネ": tane
                                    },
                                    "complete": data.complete
                                }
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0x44fc53,
                                        author: {
                                            name: 'Success!',
                                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                        },
                                        description: '最高級のタネを植えました！',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                plantSeed = 'off'
                                safeSetting = null
                                fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                           
                            } else {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0xff1919,
                                        author: {
                                            name: 'Error',
                                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                                        },
                                        description: 'タネが無いため植えられませんでした。',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                plantSeed = 'off'
                                safeSetting = null
                            }
                        }
                    }
                }
            }
        }
    }
})


// 草 or w で成長するやつ

bot.on('messageCreate', (msg) => {
    if(isExistFile(msg.author.id) === true) {
        if(msg.content.match(/草|w|ｗ/)) {
            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
            if(data.nowGlowingFlowerData.flowerDir !== 'none') {
                if(data.nowGlowingFlowerData.flowerDir.match(/undefined/)) {
                    var recovary = data.nowGlowingFlowerData.flowerDir.replace('/undefined', '')
                    var randomFlower = fs.readdirSync(dir + 'lib/data/flower/' + recovary)
                                            
                    var min = 0
                    var max = randomFlower.length

                    var flowerResult = Math.floor( Math.random() * (max + 1 - min) ) + min
                    var flw = randomFlower[flowerResult]
                    console.log(flw)
                    var ReflwData = recovary + '/' + flw
                    var newData = {
                        "data": {
                            "name": msg.author.username,
                            "coin": data.data.coin,
                            "level": data.data.level,
                            "exp": data.data.exp,
                            "flowers": data.data.flowers,
                            "kusa": data.data.kusa
                        },
                        "login": {
                            "lastLogin": data.login.lastLogin,
                            "loginStreak": data.login.loginStreak,
                            "cumulativeLogin": data.login.cumulativeLogin,
                        },
                        "nowGlowingFlowerData": {
                            "flowerDir": ReflwData,
                            "nowTall": data.nowGlowingFlowerData.nowTall,
                            "endTall": data.nowGlowingFlowerData.endTall
                        },
                        "storage": {
                            "ふつうのタネ": data.storage.ふつうのタネ,
                            "すこし高級なタネ": data.storage.すこし高級なタネ,
                            "最高級のタネ": data.storage.最高級のタネ
                        },
                        "complete": data.complete
                    }
                    fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                }
                    var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
                    var flwData = JSON.parse(fs.readFileSync(dir + 'lib/data/flower/' + data.nowGlowingFlowerData.flowerDir))
                    
                    var plusTall = (Math.round((Math.random() * (1.5 - 0.01) + 0.01) * 100)) / 100
                    var newTall = data.nowGlowingFlowerData.nowTall + plusTall
    
                    // マイスターポイント付与
                    var min1 = 1
                    var max1 = 4
                    var exp = Math.floor( Math.random() * (max1 + 1 - min1) ) + min1
                    // コイン付与
                    var gold = Math.floor( Math.random() * (5 + 1 - 1) ) + 1
    
                    if(data.nowGlowingFlowerData.endTall < newTall) {

                        var complistcache = data.complete
                        console.log(complistcache.length)
                        if(complistcache.length > 0) {
                            var complist = complistcache
                            if(complist.indexOf(flwData.name) === -1) {
                                var newFlowerBounus = '新花ボーナス！: 200コイン\n\n**図鑑に登録されました！**\n\n新花マイスターポイントボーナス: +350'
                                var nfbc = 200
                                var nfbe = 350
                                complist.push(flwData.name)
                            } else {
                                var newFlowerBounus = '（既に咲いたことのある花でした...）'
                                var nfbc = 0
                                var nfbe = 0
                            }
                        } else {
                            var complist = []
                            var newFlowerBounus = '新花ボーナス！: 200コイン\n\n**図鑑に登録されました！**\n\n新花マイスターポイントボーナス: +350'
                            var nfbc = 200
                            var nfbe = 350
                            complist.push(flwData.name) 
                        }
    
                        
    
                        // 正規のURLか判別
                        if(flwData.image.match(/.*?.jpg|.*?.png/)) {
                            var flowerImage = flwData.image
                        } else {
                            var flowerImage = ''
                        }
    
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0x44fc53,
                                author: {
                                    name: '花が咲きました！'
                                },
                                description: '=====Result=====\n開花ボーナス: 300コイン\n' + newFlowerBounus + '\nマイスターポイント: +200\n================',
                                image: {
                                    url: flwData.image
                                },
                                fields: [
                                    {
                                        name: '花の名前',
                                        value: flwData.name
                                    } ,{
                                        name: 'この花って何？',
                                        value: flwData.description + '\n([Wikipedia](https://ja.wikipedia.org/wiki/' + flwData.name + ')より)'
                                    }
                                ],
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
    
                        var newExp = data.data.exp + nfbe + 200 + exp
                        var nowLevel = data.data.level
                        var lvupbounus = 0
                        for(i = 0; expTable.length > i; i++) {
                            if(newExp > expTable[i]) {
                                if(nowLevel < i + 1) {
                                    var newLevel = nowLevel + 1
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            author: {
                                                name: msg.author.username + ' LevelUP！',
                                                icon_url: msg.author.avatarURL
                                            },
                                            description: 'フラワーマイスターレベルが ' + nowLevel + ' から ' + newLevel + ' にアップしました！\n**レベルアップボーナス！** --> 最高級のタネ3個が付与されました',
                                            color: 0xffdf2d,
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            },
                                            timestamp: new Date()
                                        }
                                    })
                                    var lvupbounus = 3
                                    break
                                }
                            } else {
                                var newLevel = nowLevel
                                break
                            }
                        }
    
                        var newData = {
                            "data": {
                                "name": msg.author.username,
                                "coin": data.data.coin + nfbc + 300 + gold,
                                "level": newLevel,
                                "exp": data.data.exp,
                                "flowers": data.data.flowers + 1,
                                "kusa": data.data.kusa + 1
                            },
                            "login": {
                                "lastLogin": data.login.lastLogin,
                                "loginStreak": data.login.loginStreak,
                                "cumulativeLogin": data.login.cumulativeLogin,
                            },
                            "nowGlowingFlowerData": {
                                "flowerDir": "none",
                                "nowTall": "none",
                                "endTall": "none"
                            },
                            "storage": {
                                "ふつうのタネ": data.storage.ふつうのタネ,
                                "すこし高級なタネ": data.storage.すこし高級なタネ,
                                "最高級のタネ": data.storage.最高級のタネ + lvupbounus
                            },
                            "complete": complist
                        }
    
                        fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                } else {

                    var nowLevel = data.data.level
                    var newExp = data.data.exp + exp
                    var lvupbounus = 0
                    for(i = 0; expTable.length > i; i++) {
                        if(newExp > expTable[i]) {
                            if(nowLevel < i + 1) {
                                var newLevel = nowLevel + 1
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        author: {
                                            name: msg.author.username + ' LevelUP！',
                                            icon_url: msg.author.avatarURL
                                        },
                                        description: 'フラワーマイスターレベルが ' + nowLevel + ' から ' + newLevel + ' にアップしました！\n**レベルアップボーナス！** --> 最高級のタネ3個が付与されました',
                                        color: 0xffdf2d,
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        },
                                        timestamp: new Date()
                                    }
                                })
                                var lvupbounus = 3
                                break
                            }
                        } else {
                            var newLevel = nowLevel
                            break
                        }
                    }

                    var newData = {
                        "data": {
                            "name": msg.author.username,
                            "coin": data.data.coin + gold,
                            "level": newLevel,
                            "exp": newExp,
                            "flowers": data.data.flowers,
                            "kusa": data.data.kusa + 1
                        },
                        "login": {
                            "lastLogin": data.login.lastLogin,
                            "loginStreak": data.login.loginStreak,
                            "cumulativeLogin": data.login.cumulativeLogin,
                        },
                        "nowGlowingFlowerData": {
                            "flowerDir": data.nowGlowingFlowerData.flowerDir,
                            "nowTall": newTall,
                            "endTall": data.nowGlowingFlowerData.endTall
                        },
                        "storage": {
                            "ふつうのタネ": data.storage.ふつうのタネ,
                            "すこし高級なタネ": data.storage.すこし高級なタネ,
                            "最高級のタネ": data.storage.最高級のタネ + lvupbounus
                        },
                        "complete": data.complete
                    }
                }

                fs.writeFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat', JSON.stringify(newData, null))
                }
            }
        }
})

bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa help') {
        bot.createMessage(msg.channel.id, {
            embed: {
                author: {
                    name: 'GlowingFlowers help menu',
                    icon_url: msg.author.avatarURL
                },
                description: 'GlowingFlowersのヘルプです。',
                color: 0x429bf4,
                footer: {
                    text: 'Created by hideki0403#7963'
                },
                fields: [
                    {
                        name: '.kusa help',
                        value: 'このヘルプメニューです。'
                    } , {
                        name: '.kusa register',
                        value: 'GlowingFlowersに登録（ユーザーデータ作成）します。'
                    } , {
                        name: '.kusa buy seed',
                        value: 'タネを買うことができます。'
                    } , {
                        name: '.kusa plant',
                        value: '買ったタネを植えることができます。'
                    } , {
                        name: '.kusa status',
                        value: 'あなたのステータスを表示します。'
                    } , {
                        name: '.kusa DeleteGameData',
                        value: 'あなたの登録情報を全削除します。\n**!!注意!! このコマンドを実行するとあなたの全てのユーザーデータが削除されます。復旧等は出来ませんので、ご使用に関しては自己責任でお願いします。**'
                    } , {
                        name: '.kusa login',
                        value: 'その日のログインボーナスを貰うことができます。また、連続ログインによってボーナスが貰えるため、毎日ログインしていれば沢山のボーナスが貰えるかも....？'
                    } , {
                        name: '.kusa ranking',
                        value: 'GlowingFlowersのグローバルランキングを表示します。'
                    }
                ]
            }
        })
    } else {
        // ranking
        if(msg.content === '.kusa ranking') {
            var rankingTable = []
            var files = fs.readdirSync(dir + 'lib/userdata')
            for(i = 0; files.length > i; i++) {
                var userData = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + files[i]))
                var pushData = [userData.data.exp, userData.data.name]
                rankingTable.push(pushData)
            }
            rankingTable.sort(function(a, b) {
                var aa = a[0]
                var bb = b[0]
                if(aa < bb) {
                    return 1
                }
                if(aa > bb) {
                    return -1
                }
                return 0
            })
            if(isExistFile(msg.author.id) === true) {
                var rankMes = 'あなたは **' + (rankingTable.findIndex(o => o[1] === msg.author.username) + 1 )+ '位** です。'
            } else {
                var rankMes = 'あなたはGlowingFlowersに登録していないため、あなたの順位を表示することができません。'
            }
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0x56b6ff,
                    author: {
                        name: 'GlowingFlowers グローバルランキング',
                        icon_url: msg.author.avatarURL
                    },
                    description: rankMes,
                    fields: [
                        {
                            name: '1位 - ' + rankingTable[0][0] + 'pt.',
                            value: rankingTable[0][1] + 'さん'
                        } , {
                            name: '2位 - ' + rankingTable[1][0] + 'pt.',
                            value: rankingTable[1][1] + 'さん'
                        } , {
                            name: '3位 - ' + rankingTable[2][0] + 'pt.',
                            value: rankingTable[2][1] + 'さん'
                        } , {
                            name: '4位 - ' + rankingTable[3][0] + 'pt.',
                            value: rankingTable[3][1] + 'さん'
                        } , {
                            name: '5位 - ' + rankingTable[4][0] + 'pt.',
                            value: rankingTable[4][1] + 'さん'
                        } , {
                            name: '6位 - ' + rankingTable[5][0] + 'pt.',
                            value: rankingTable[5][1] + 'さん'
                        } , {
                            name: '7位 - ' + rankingTable[6][0] + 'pt.',
                            value: rankingTable[6][1] + 'さん'
                        } , {
                            name: '8位 - ' + rankingTable[7][0] + 'pt.',
                            value: rankingTable[7][1] + 'さん'
                        } , {
                            name: '9位 - ' + rankingTable[8][0] + 'pt.',
                            value: rankingTable[8][1] + 'さん'
                        } , {
                            name: '10位 - ' + rankingTable[9][0] + 'pt.',
                            value: rankingTable[9][1] + 'さん'
                        }
                    ], 
                    footer: {
                        text: 'GlowingFlowers'
                    }
                }
            })
        }
    }
})

bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa DeleteGameData') {
        if(isExistFile(msg.author.id) === true) {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: '!!!Warning!!!',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'このコマンドを実行するとあなたのセーブデータが**全削除**されます！！！\n運営による復旧も不可能です。\nもし自己責任で、それでもセーブデータを削除したい場合は「deleteSaveData」と入力してください。それ以外の単語が入力された場合はセーブデータが削除されません。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
            delSaveData = 'on'
        } else {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたのゲームデータファイルが見つかりませんでした。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        }
    } else {
        if(delSaveData === 'on') {
            if(msg.content === 'delSaveData') {
                delSaveData = 'off'
                fs.unlinkSync(dir + 'lib/userdata/' + msg.author.id + '.dat')
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0xff1919,
                        author: {
                            name: 'Success',
                            icon_url: ''
                        },
                        description: 'セーブデータの削除に成功しました。',
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            } else {
                delSaveData = 'off'
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0x44fc53,
                        author: {
                            name: '',
                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                        },
                        description: 'セーブデータは削除されませんでした。',
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            }
        }
    }
})

bot.on('messageCreate', (msg) => {
    if(msg.content === '.kusa status') {
        if(isExistFile(msg.author.id) === true) {
            var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/' + msg.author.id + '.dat'))
            if(data.nowGlowingFlowerData.flowerDir === 'none') {
                var hanaNow = '**現在、花を育てていません**'
            } else {
                var hanaNow = '花の名前:**???**\n現在の高さ:**' + data.nowGlowingFlowerData.nowTall + 'cm**'
            }
            var flwLists1 = data.complete
            var flwList = flwLists1.join(' / ')
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0x56b6ff,
                    author: {
                        name: msg.author.username + 'のステータス',
                        icon_url: msg.author.avatarURL
                    },
                    fields: [
                        {
                            name: '基本情報',
                            value:'\nフラワーマイスターレベル:**' + data.data.level + '**\nフラワーマイスターポイント:**' + data.data.exp + '**\nコイン数:**' + data.data.coin + '**\n今まで咲かせてきた花の数:**' + data.data.flowers + '**\n今まで草を生やしてきた回数:**' + data.data.kusa + '回**\n'
                        } , {
                            name: 'ログイン情報',
                            value: '\n最終ログイン日時:**' + data.login.lastLogin + '**\n累計ログイン日数:**' + data.login.cumulativeLogin + '日**\n連続ログイン日数:**' + data.login.loginStreak + '日**\n'
                        } , {
                            name: '所持しているもの',
                            value: '\nふつうのタネ:**' + data.storage.ふつうのタネ + '個**\nすこし高級なタネ:**' + data.storage.すこし高級なタネ + '個**\n最高級のタネ:**' + data.storage.最高級のタネ + '個**\n'
                        } , {
                            name: '現在育てている花の情報',
                            value: '\n' + hanaNow + '\n'
                        } , {
                            name: '花手帳',
                            value: '\nコンプ率:**' + flwLists1.length + '/184**\n記録してきた花一覧（重複なし）:**' + flwList + '**\n'
                        }
                    ], 
                    footer: {
                        text: 'GlowingFlowers'
                    }
                }
            })
        } else {
            bot.createMessage(msg.channel.id, {
                embed: {
                    color: 0xff1919,
                    author: {
                        name: 'Error',
                        icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                    },
                    description: 'あなたはまだ登録をしていません！\n.kusa register を実行して登録をしてください。',
                    footer: {
                        text: msg.author.username,
                        icon_url: msg.author.avatarURL
                    }
                }
            })
        }
    }
})

/*
// settings
bot.on('messageCreate', (msg) => {
    if(msg.content.match(/\.kusa settings.*?/)) {
        if(msg.content === '.kusa settings') {
            if(isExistSettingsFile(msg.author.id) === true) {
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0x56b6ff,
                        author: {
                            name: '設定変更',
                            icon_url: msg.author.avatarURL
                        },
                        fields: [
                            {
                                name: '.kusa settings autoplant <タネ番号/false>',
                                value: '花が咲いたときに自動でタネを植える設定を有効化（無効化）します。タネ番号を入力することで、そのタネが自動的に植えられます。また、falseと入力することで無効化することができます。'
                            } , {
                                name: '.kusa settings autobuy <タネ番号/false>',
                                value: '花が咲いたときに自動でタネを買う機能を有効化（無効化）します。タネ番号を入力することで、そのタネが自動的に購入されます。また、falseと入力することで無効化することができます。'
                            }
                        ], 
                        footer: {
                            text: 'GlowingFlowers'
                        }
                    }
                })
            } else {
                var data = {
                    "autobuy": false,
                    "autoplant": false,
                }
                fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0x44fc53,
                        author: {
                            name: 'Settingsファイルを生成しました。',
                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                        },
                        description: 'あなたのSettingsファイルが存在しなかったため自動生成されました。\nもう一度 .kusa settings と入力することで変更できる設定一覧を見ることができます。',
    
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            }
        } else {
            if(isExistSettingsFile(msg.author.id) === true) {
                if(msg.content.match(/\.kusa settings autobuy .*?/)) {
                    var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf'))
                    var num = msg.content.replace('.kusa settings autobuy ', '')
                    if(num === '1') {
                        bot.createMessage(msg.channel.id, {
                            embed: {
                                color: 0x44fc53,
                                author: {
                                    name: '',
                                    icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                },
                                description: '花が咲いたときに、「ふつうのタネ」を自動購入するようにしました。',
                                footer: {
                                    text: msg.author.username,
                                    icon_url: msg.author.avatarURL
                                }
                            }
                        })
                        var data = {
                            "autobuy": 1,
                            "autoplant": data.autoplant,
                        }
                        fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                    } else {
                        if(num === '2') {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0x44fc53,
                                    author: {
                                        name: '',
                                        icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                    },
                                    description: '花が咲いたときに、「少し高級なタネ」を自動購入するようにしました。',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            var data = {
                                "autobuy": 2,
                                "autoplant": data.autoplant,
                            }
                            fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                        } else {
                            if(num === '3') {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0x44fc53,
                                        author: {
                                            name: '',
                                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                        },
                                        description: '花が咲いたときに、「最高級のタネ」を自動購入するようにしました。',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                var data = {
                                    "autobuy": 3,
                                    "autoplant": data.autoplant,
                                }
                                fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                            } else {
                                if(num === 'false') {
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            color: 0x44fc53,
                                            author: {
                                                name: '',
                                                icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                            },
                                            description: '花が咲いたときに、タネを自動購入しないようにしました。',
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            }
                                        }
                                    })
                                    var data = {
                                        "autobuy": false,
                                        "autoplant": data.autoplant,
                                    }
                                    fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                                }
                            }
                        }
                    }
                } else {
                    if(msg.content.match(/\.kusa settings autoplant .*?/)) {
                        var data = JSON.parse(fs.readFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf'))
                        var num = msg.content.replace('.kusa settings autoplant ', '')
                        if(num === '1') {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    color: 0x44fc53,
                                    author: {
                                        name: '',
                                        icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                    },
                                    description: '花が咲いたときに、「ふつうのタネ」を自動で植えるようにしました。',
                                    footer: {
                                        text: msg.author.username,
                                        icon_url: msg.author.avatarURL
                                    }
                                }
                            })
                            var data = {
                                "autobuy": data.autobuy,
                                "autoplant": 1,
                            }
                            fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                        } else {
                            if(num === '2') {
                                bot.createMessage(msg.channel.id, {
                                    embed: {
                                        color: 0x44fc53,
                                        author: {
                                            name: '',
                                            icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                        },
                                        description: '花が咲いたときに、「少し高級なタネ」を自動で植えるようにしました。',
                                        footer: {
                                            text: msg.author.username,
                                            icon_url: msg.author.avatarURL
                                        }
                                    }
                                })
                                var data = {
                                    "autobuy": data.autobuy,
                                    "autoplant": 2,
                                }
                                fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                            } else {
                                if(num === '3') {
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            color: 0x44fc53,
                                            author: {
                                                name: '',
                                                icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                            },
                                            description: '花が咲いたときに、「最高級のタネ」を自動で植えるようにしました。',
                                            footer: {
                                                text: msg.author.username,
                                                icon_url: msg.author.avatarURL
                                            }
                                        }
                                    })
                                    var data = {
                                        "autobuy": data.autobuy,
                                        "autoplant": 3,
                                    }
                                    fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                                } else {
                                    if(num === 'false') {
                                        bot.createMessage(msg.channel.id, {
                                            embed: {
                                                color: 0x44fc53,
                                                author: {
                                                    name: '',
                                                    icon_url: 'https://png.icons8.com/color/50/000000/ok.png'
                                                },
                                                description: '花が咲いたときに、タネを自動で植えないようにしました。',
                                                footer: {
                                                    text: msg.author.username,
                                                    icon_url: msg.author.avatarURL
                                                }
                                            }
                                        })
                                        var data = {
                                            "autobuy": data.autobuy,
                                            "autoplant": false,
                                        }
                                        fs.writeFileSync(dir + 'lib/userdata/settings/' + msg.author.id + '.conf', JSON.stringify(data, null))
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                bot.createMessage(msg.channel.id, {
                    embed: {
                        color: 0xff1919,
                        author: {
                            name: 'Error',
                            icon_url: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/72/sign-error-icon.png'
                        },
                        description: './lib/userdata/settings/' + msg.author.id + '.conf   が見つかりません。\n\n.kusa settingsを実行してください。',
                        footer: {
                            text: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    }
                })
            }
        }
    }
})
*/

bot.connect()
