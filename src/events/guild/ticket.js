const { EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ticket = require("../../database/ticket");
const config = require("../../config");
const moment = require("moment-timezone");
const ticketCh = require("../../database/ticketCh");
const sourcebin_js = require("sourcebin_js");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.isButton()) {
            const { customId } = interaction;
            const ticketData = await ticket.findOne({ dataId: 'created' });
            const ticketChannel = await ticketCh.findOne({ ticketId: interaction.channel.id });

            if (customId === 'create-ticket') {
                if (!ticketData) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`It seems that the ticket system is not installed on this server. Please contact the staff on duty for further consideration regarding this issue.`)
                            .setColor(config.embed.color)], ephemeral: true
                    });
                } else {
                    if (interaction.guild.channels.cache.find(c => c.topic === `${interaction.user.id}`)) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`It looks like you still have unclosed ticket channels. Close it first to create a new ticket.`)
                                .setColor(config.embed.color)], ephemeral: true
                        });
                    } else {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`Wait a moment, the system is creating a ticket channel for you.`)
                                .setColor(config.embed.color)], ephemeral: true
                        }).then(async (replyCreate) => {
                            await interaction.guild.channels.create({
                                name: `ticket-${interaction.user.username}`,
                                topic: `${interaction.user.id}`,
                                parent: ticketData.openCategoryId,
                                type: ChannelType.GuildText,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.id,
                                        deny: [
                                            PermissionFlagsBits.ViewChannel
                                        ],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [
                                            PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel,
                                            PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions,
                                            PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.UseApplicationCommands
                                        ]
                                    },
                                    {
                                        id: ticketData.supportId,
                                        allow: [
                                            PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels,
                                            PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel,
                                            PermissionFlagsBits.UseApplicationCommands, PermissionFlagsBits.AttachFiles,
                                            PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageRoles
                                        ]
                                    }
                                ]
                            }).then(async (channelTicket) => {
                                await channelTicket.send({
                                    content: `<@!${interaction.user.id}>, <@&${ticketData.supportId}>`,
                                    embeds: [new EmbedBuilder()
                                        .setTitle(`System Alert`)
                                        .setDescription(`Welcome to our ticketing system!\nState your need to open this ticket, our staff on duty will immediately answer it and will handle it professionally. Mention support if you haven't received a reply within 1 day.`)
                                        .setColor(config.embed.color)],
                                    components: [new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setLabel('Close')
                                                .setCustomId('close-ticket')
                                                .setStyle(ButtonStyle.Danger),
                                            new ButtonBuilder()
                                                .setLabel('Transcript')
                                                .setCustomId('transcript-ticket')
                                                .setStyle(ButtonStyle.Secondary)
                                        )]
                                }).then(async (msgTicket) => {
                                    msgTicket.pin().then(async () => {
                                        channelTicket.bulkDelete(1);
                                    }).then(async () => {
                                        await client.channels.cache.get(ticketData.logId).send({
                                            embeds: [new EmbedBuilder()
                                                .setTitle(`System Alert`)
                                                .setDescription(`There are tickets that have just been made.`)
                                                .addFields([
                                                    { name: 'TICKET NAME', value: `\`\`\`${channelTicket.name}\`\`\``, inline: false },
                                                    { name: 'TICKET ID', value: `\`\`\`${channelTicket.id}\`\`\``, inline: false },
                                                    { name: 'OWNER NAME', value: `\`\`\`${interaction.user.displayName}\`\`\``, inline: false },
                                                    { name: 'OWNER ID', value: `\`\`\`${interaction.user.id}\`\`\``, inline: false },
                                                    { name: 'TICKET CREATED', value: `\`\`\`${moment(Date.now()).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                                ])
                                                .setColor(config.embed.color)]
                                        }).then(async () => {
                                            await ticketCh.create({ ticketId: channelTicket.id, messageId: msgTicket.id, ownerId: interaction.user.id });
                                            if (replyCreate) return replyCreate.edit({
                                                embeds: [new EmbedBuilder()
                                                    .setTitle(`System Alert`)
                                                    .setDescription(`The system has successfully created a ticket channel ( <#${channelTicket.id}> ) for you.`)
                                                    .setColor(config.embed.color)], ephemeral: true
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                }
            }

            if (customId === 'close-ticket') {
                if (interaction.member.roles.cache.has(ticketData.supportId)) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`Successfully closed the channel ticket and closed the ticket owner's chat access.`)
                            .setColor(config.embed.color)], ephemeral: true
                    }).then(async () => {
                        const owner = await client.users.fetch(ticketChannel.ownerId);
                        const channel = await client.channels.fetch(ticketChannel.ticketId);
                        const message = await channel.messages.fetch(ticketChannel.messageId);
                        await channel.edit({
                            name: `close-${owner.username}`,
                            topic: `${owner.id}`,
                            parent: ticketData.closeCategoryId,
                            type: ChannelType.GuildText,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [
                                        PermissionFlagsBits.ViewChannel
                                    ],
                                },
                                {
                                    id: owner.id,
                                    deny: [
                                        PermissionFlagsBits.SendMessages
                                    ],
                                    allow: [
                                        PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AttachFiles,
                                        PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory,
                                        PermissionFlagsBits.UseApplicationCommands
                                    ]
                                },
                                {
                                    id: ticketData.supportId,
                                    allow: [
                                        PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels,
                                        PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel,
                                        PermissionFlagsBits.UseApplicationCommands, PermissionFlagsBits.AttachFiles,
                                        PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageRoles
                                    ]
                                }
                            ]
                        }).then(async () => {
                            await message.edit({
                                content: `<@!${owner.id}>, <@&${ticketData.supportId}>`,
                                embeds: [new EmbedBuilder()
                                    .setTitle(`System Alert`)
                                    .setDescription(`Welcome to our ticketing system!\nState your need to open this ticket, our staff on duty will immediately answer it and will handle it professionally. Mention support if you haven't received a reply within 1 day.`)
                                    .setColor(config.embed.color)],
                                components: [new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel('Open')
                                            .setCustomId('open-ticket')
                                            .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                            .setLabel('Delete')
                                            .setCustomId('delete-ticket')
                                            .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                            .setLabel('Transcript')
                                            .setCustomId('transcript-ticket')
                                            .setStyle(ButtonStyle.Secondary)
                                    )]
                            });
                        });
                    });
                } else {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`It looks like you can't use this button. Only support tickets can use this button.`)
                            .setColor(config.embed.color)], ephemeral: true
                    }).then(async () => {
                        return interaction.channel.send({
                            content: `<@&${ticketData.supportId}>`,
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`The ticket owner asked to close the channel ticket. Only support tickets can close this channel ticket.`)
                                .setColor(config.embed.color)]
                        });
                    });
                }
            }

            if (customId === 'open-ticket') {
                if (interaction.member.roles.cache.has(ticketData.supportId)) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`Successfully opened the ticket channel and provided chat access to the ticket owner.`)
                            .setColor(config.embed.color)], ephemeral: true
                    }).then(async () => {
                        const owner = await client.users.fetch(ticketChannel.ownerId);
                        const channel = await client.channels.fetch(ticketChannel.ticketId);
                        const message = await channel.messages.fetch(ticketChannel.messageId);
                        await channel.edit({
                            name: `ticket-${owner.username}`,
                            topic: `${owner.id}`,
                            parent: ticketData.openCategoryId,
                            type: ChannelType.GuildText,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [
                                        PermissionFlagsBits.ViewChannel
                                    ],
                                },
                                {
                                    id: owner.id,
                                    allow: [
                                        PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel,
                                        PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions,
                                        PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.UseApplicationCommands
                                    ]
                                },
                                {
                                    id: ticketData.supportId,
                                    allow: [
                                        PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels,
                                        PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel,
                                        PermissionFlagsBits.UseApplicationCommands, PermissionFlagsBits.AttachFiles,
                                        PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageRoles
                                    ]
                                }
                            ]
                        }).then(async () => {
                            await message.edit({
                                content: `<@!${owner.id}>, <@&${ticketData.supportId}>`,
                                embeds: [new EmbedBuilder()
                                    .setTitle(`System Alert`)
                                    .setDescription(`Welcome to our ticketing system!\nState your need to open this ticket, our staff on duty will immediately answer it and will handle it professionally. Mention support if you haven't received a reply within 1 day.`)
                                    .setColor(config.embed.color)],
                                components: [new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel('Close')
                                            .setCustomId('close-ticket')
                                            .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                            .setLabel('Transcript')
                                            .setCustomId('transcript-ticket')
                                            .setStyle(ButtonStyle.Secondary)
                                    )]
                            });
                        });
                    });
                } else {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`It looks like you can't use this button. Only support tickets can use this button.`)
                            .setColor(config.embed.color)], ephemeral: true
                    }).then(async () => {
                        return interaction.channel.send({
                            content: `<@&${ticketData.supportId}>`,
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`The ticket owner asks to open the ticket channel. Only support tickets can open this channel ticket.`)
                                .setColor(config.embed.color)]
                        });
                    });
                }
            }

            if (customId === 'delete-ticket') {
                if (interaction.member.roles.cache.has(ticketData.supportId)) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`Are you sure you want to delete this ticket channel? All content cannot be restored to its original state after being deleted.`)
                            .setColor(config.embed.color)],
                        components: [new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel('Continue')
                                    .setCustomId('accept-delete-ticket')
                                    .setStyle(ButtonStyle.Success)
                            )], ephemeral: true
                    });
                } else {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle(`System Alert`)
                            .setDescription(`It looks like you can't use this button. Only support tickets can use this button.`)
                            .setColor(config.embed.color)], ephemeral: true
                    });
                }
            }

            if (customId === 'accept-delete-ticket') {
                await interaction.channel.messages.fetch().then(async (messages) => {
                    const content = await messages.reverse().map(m => `${moment(new Date(m.createdAt)).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm A')} - ${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');
                    const transcript = await sourcebin_js.create([{ name: `${interaction.channel.name}`, content: content, languageId: 'text' }], { title: `TICKET TRANSCRIPT : ${interaction.channel.name}` })
                    await interaction.channel.messages.fetchPinned().then(async (pinnedMessages) => {
                        const pinnedMessageArray = Array.from(pinnedMessages.values());
                        await pinnedMessageArray.forEach(async (msg) => {
                            await interaction.channel.messages.fetch(msg.id).then(async (created) => {
                                const datecreate = `${created.createdAt.toUTCString()}`;
                                const owner = await client.users.fetch(`${ticketChannel.ownerId}`);
                                return interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setTitle(`System Alert`)
                                        .setDescription(`Successfully implemented the ticket delete system on this channel.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                }).then(async () => {
                                    return owner.send({
                                        embeds: [new EmbedBuilder()
                                            .setTitle(`System Alert`)
                                            .setDescription(`The following is a recording of all chats on the ticket.`)
                                            .addFields([
                                                { name: 'TICKET NAME', value: `\`\`\`${interaction.channel.name}\`\`\``, inline: false },
                                                { name: 'TICKET ID', value: `\`\`\`${interaction.channel.id}\`\`\``, inline: false },
                                                { name: 'OWNER NAME', value: `\`\`\`${owner.displayName}\`\`\``, inline: false },
                                                { name: 'OWNER ID', value: `\`\`\`${owner.id}\`\`\``, inline: false },
                                                { name: 'TICKET CREATED', value: `\`\`\`${moment(datecreate).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                                { name: 'TICKET CLOSED', value: `\`\`\`${moment(Date.now()).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                            ])
                                            .setColor(config.embed.color)],
                                        components: [new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setLabel('Transcript')
                                                    .setURL(`${transcript.url}`)
                                                    .setStyle(ButtonStyle.Link)
                                            )]
                                    }).then(async () => {
                                        await client.channels.cache.get(ticketData.transcriptId).send({
                                            embeds: [new EmbedBuilder()
                                                .setTitle(`System Alert`)
                                                .setDescription(`The following is a recording of all chats on the ticket.`)
                                                .addFields([
                                                    { name: 'TICKET NAME', value: `\`\`\`${interaction.channel.name}\`\`\``, inline: false },
                                                    { name: 'TICKET ID', value: `\`\`\`${interaction.channel.id}\`\`\``, inline: false },
                                                    { name: 'OWNER NAME', value: `\`\`\`${owner.displayName}\`\`\``, inline: false },
                                                    { name: 'OWNER ID', value: `\`\`\`${owner.id}\`\`\``, inline: false },
                                                    { name: 'TICKET CREATED', value: `\`\`\`${moment(datecreate).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                                    { name: 'TICKET CLOSED', value: `\`\`\`${moment(Date.now()).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                                ])
                                                .setColor(config.embed.color)],
                                            components: [new ActionRowBuilder()
                                                .addComponents(
                                                    new ButtonBuilder()
                                                        .setLabel('Transcript')
                                                        .setURL(`${transcript.url}`)
                                                        .setStyle(ButtonStyle.Link)
                                                )]
                                        }).then(async () => {
                                            return interaction.channel.send({
                                                embeds: [new EmbedBuilder()
                                                    .setDescription(`Channel tickets will be deleted by the system in less than 5 seconds.`)
                                                    .setColor(config.embed.color)]
                                            }).then(async () => {
                                                setTimeout(async function () {
                                                    interaction.channel.delete();
                                                    await ticketCh.findOneAndDelete({ ownerId: owner.id });
                                                }, 6000);
                                            });
                                        });
                                    });
                                })
                            });
                        });
                    });
                });
            }

            if (customId === 'transcript-ticket') {
                await interaction.channel.messages.fetch().then(async (messages) => {
                    const content = await messages.reverse().map(m => `${moment(new Date(m.createdAt)).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm A')} - ${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');
                    const transcript = await sourcebin_js.create([{ name: `${interaction.channel.name}`, content: content, languageId: 'text' }], { title: `TICKET TRANSCRIPT : ${interaction.channel.name}` })
                    await interaction.channel.messages.fetchPinned().then(async (pinnedMessages) => {
                        const pinnedMessageArray = Array.from(pinnedMessages.values());
                        await pinnedMessageArray.forEach(async (msg) => {
                            await interaction.channel.messages.fetch(msg.id).then(async (created) => {
                                const datecreate = `${created.createdAt.toUTCString()}`;
                                const owner = await client.users.fetch(`${ticketChannel.ownerId}`);
                                return interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setTitle(`System Alert`)
                                        .setDescription(`Successfully created a chat copy of this ticket and sent it to your DM.`)
                                        .setColor(config.embed.color)], ephemeral: true
                                }).then(async () => {
                                    return interaction.member.send({
                                        embeds: [new EmbedBuilder()
                                            .setTitle(`System Alert`)
                                            .setDescription(`The following is a recording of all chats on the ticket.`)
                                            .addFields([
                                                { name: 'TICKET NAME', value: `\`\`\`${interaction.channel.name}\`\`\``, inline: false },
                                                { name: 'TICKET ID', value: `\`\`\`${interaction.channel.id}\`\`\``, inline: false },
                                                { name: 'OWNER NAME', value: `\`\`\`${owner.displayName}\`\`\``, inline: false },
                                                { name: 'OWNER ID', value: `\`\`\`${owner.id}\`\`\``, inline: false },
                                                { name: 'TICKET CREATED', value: `\`\`\`${moment(datecreate).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss')}\`\`\``, inline: false },
                                            ])
                                            .setColor(config.embed.color)],
                                        components: [new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setLabel('Transcript')
                                                    .setURL(`${transcript.url}`)
                                                    .setStyle(ButtonStyle.Link)
                                            )]
                                    });
                                })
                            });
                        });
                    });
                });
            }
        }
    }
}