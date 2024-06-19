const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('See all the commands the bot has.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction, client) {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`${client.user.username}'s Help Menu`)
                .setDescription(`${client.user} is a simple bot that is easy to use.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 4096, format: "png" }))
                .setColor(config.embed.color)
                .addFields([
                    { name: 'EMBED BUILDER', value: '```embeds```', inline: false }
                ])], ephemeral: true
        })
    }
}