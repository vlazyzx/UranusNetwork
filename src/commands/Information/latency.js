const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the latest latency from the bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction, client) {

        const pingSeconds = ((Math.floor(Date.now() - interaction.createdAt) % 60000) / 1000);
        const apiSeconds = ((client.ws.ping % 60000) / 1000);

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`${client.user.username}'s Latency`)
                .setColor(config.embed.color)
                .addFields([
                    { name: 'MSG LATENCY', value: `\`\`\`${Math.floor(Date.now() - interaction.createdAt)}ms (${pingSeconds}s)\`\`\``, inline: true },
                    { name: 'API LATENCY', value: `\`\`\`${client.ws.ping}ms (${apiSeconds}s)\`\`\``, inline: true },
                ])], ephemeral: true
        })
    }
}