const { model, Schema } = require('mongoose')

module.exports = model("WelcomeRoleSchema", new Schema({
    GuildID: String,
    RoleID: String
}))