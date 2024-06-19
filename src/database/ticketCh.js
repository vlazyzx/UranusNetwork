const { model, Schema } = require("mongoose");

module.exports = model("TicketChSchema", new Schema({
    ticketId: String,
    messageId: String,
    ownerId: String,
}))