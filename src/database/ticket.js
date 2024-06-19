const { model, Schema } = require("mongoose");

module.exports = model("TicketSchema", new Schema({
    dataId: String,
    panelId: String,
    logId: String,
    transcriptId: String,
    openCategoryId: String,
    closeCategoryId: String,
    supportId: String,
}))