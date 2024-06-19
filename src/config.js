module.exports = {
    client: {
        token: 'MTIzOTQ4MzE2NzYyMzA5MDIzNg.G6cRKS.ANIU-JAgbUg5qfW4_DOKKGq5XKRYLmUW7rIOiM',  // Ambil discord bot token yang bisa diambil di https://discord.com/developers/applications
        id: '1239483167623090236', // Ambil discord bot id yang bisa diambil di https://discord.com/developers/applications
        guild: '1123660043498303578', // Ambil server id sebagai server developer untuk bot ini
        database: 'mongodb://uranus:uranusmengudara@ac-puu2vuo-shard-00-00.olm7ryf.mongodb.net:27017,ac-puu2vuo-shard-00-01.olm7ryf.mongodb.net:27017,ac-puu2vuo-shard-00-02.olm7ryf.mongodb.net:27017/?ssl=true&replicaSet=atlas-li6rgz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=UranusNetworkDatabase' // MongoDB URL, you can get it from https://mongodb.com/ ( tutorial https://www.youtube.com/watch?v=HhHzCfrqsoE&t=192s&pp=ygUZaG93IHRvIGNyZWF0ZSBtb25nb2RiIHVybA%3D%3D )
    },
    embed: {
        color: 0x3498db,  // Dapat diubah dengan color hex lain asalkan formatnya disamakan ( Contoh : 0xff012f, 0x10aa64 )
    }
}