const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const welcomech = require('../../database/welcomech');
const welcomerole = require('../../database/welcomerole');
const leavech = require('../../database/leavech');
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('greeting')
        .setDescription('Manage system greeting on this server!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((command) => command
            .setName('welcome-channel').setDescription('Added channel data to database!')
            .addChannelOption((channel) => channel
                .setName('channel').setDescription('The channel to be added as data.').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand((command) => command
            .setName('welcome-role').setDescription('Added data roles to the database!')
            .addRoleOption((option) => option
                .setName('role').setDescription('Role to be added as data.').setRequired(true)))
        .addSubcommand((command) => command
            .setName('leave-channel').setDescription('Added channel data to database!')
            .addChannelOption((channel) => channel
                .setName('channel').setDescription('The channel to be added as data.').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand((command) => command
            .setName('remove').setDescription('Deleted the system greeting on this server!')
            .addStringOption((option) => option
                .setName('config').setDescription('Config list that can be deleted on this server.').setRequired(true)
                .addChoices(
                    { name: 'Welcome Channel', value: 'wc-ch' },
                    { name: 'Welcome Role', value: 'wc-role' },
                    { name: 'Leave Channel', value: 'lv-ch' },
                ))),

    async execute(interaction, client) {
        const { guild, options } = interaction;
        const channel = options.getChannel('channel')
        const role = options.getRole('role')

        switch (options.getSubcommand()) {
            case 'welcome-channel': {
                await welcomech.findOne({ GuildID: guild.id }).then(async (data) => {
                    if (!data) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Successfully added data features for this server.`)
                                .setColor(config.embed.color)], ephemeral: true
                        }).then(async() => {
                            await welcomech.create({ GuildID: guild.id, ChannelID: channel.id });
                        });
                    } else {
                        interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Failed to create data because this server has this feature installed.`)
                                .setColor(config.embed.color)], ephemeral: true
                        });
                    }
                });
            }
                break;
            case 'welcome-role': {
                await welcomerole.findOne({ GuildID: guild.id }).then(async (data) => {
                    if (!data) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Successfully added data features for this server.`)
                                .setColor(config.embed.color)], ephemeral: true
                        }).then(async() => {
                            await welcomerole.create({ GuildID: guild.id, RoleID: role.id });
                        });
                    } else {
                        interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Failed to create data because this server has this feature installed.`)
                                .setColor(config.embed.color)], ephemeral: true
                        });
                    }
                });
            }
                break;
            case 'leave-channel': {
                await leavech.findOne({ GuildID: guild.id }).then(async (data) => {
                    if (!data) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Successfully added data features for this server.`)
                                .setColor(config.embed.color)], ephemeral: true
                        }).then(async() => {
                            await leavech.create({ GuildID: guild.id, ChannelID: channel.id });
                        });
                    } else {
                        interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Failed to create data because this server has this feature installed.`)
                                .setColor(config.embed.color)], ephemeral: true
                        });
                    }
                });
            }
                break;
            case 'remove': {
                switch (options.getString('config')) {
                    case 'wc-ch': {
                        await welcomech.findOneAndDelete({ GuildID: guild.id }).then(async (data) => {
                            if (data) {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Successfully deleted feature data from this server.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            } else {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Failed to delete feature data because no data was found.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            }
                        });
                    }
                        break;
                    case 'wc-role': {
                        await welcomerole.findOneAndDelete({ GuildID: guild.id }).then(async (data) => {
                            if (data) {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Successfully deleted feature data from this server.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            } else {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Failed to delete feature data because no data was found.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            }
                        });
                    }
                        break;
                    case 'lv-ch': {
                        await leavech.findOneAndDelete({ GuildID: guild.id }).then(async (data) => {
                            if (data) {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Successfully deleted feature data from this server.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            } else {
                                interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setDescription(`Failed to delete feature data because no data was found.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                });
                            }
                        });
                    }
                        break;
                }
            }
                break;
        }
    }
}