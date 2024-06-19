const { model, Schema } = require('mongoose')

module.exports = model("WelcomeCHSchema", new Schema({
    GuildID: String,
    ChannelID: String
}))