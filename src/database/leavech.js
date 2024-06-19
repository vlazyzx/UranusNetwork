const { model, Schema } = require('mongoose')

module.exports = model("LeaveCHSchema", new Schema({
    GuildID: String,
    ChannelID: String
}))