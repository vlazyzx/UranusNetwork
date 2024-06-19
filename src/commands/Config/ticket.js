const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config");
const ticket = require("../../database/ticket");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage the ticket system on this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((command) => command
            .setName('enable').setDescription('Activate the ticket system on this server.')
            .addChannelOption((channel) => channel
                .setName('panel').setDescription('The channel used as the ticket interface panel.').setRequired(true).addChannelTypes(ChannelType.GuildText))
            .addChannelOption((channel) => channel
                .setName('log').setDescription('The channel used as a log when a ticket is created.').setRequired(true).addChannelTypes(ChannelType.GuildText))
            .addChannelOption((channel) => channel
                .setName('transcript').setDescription('The channel used as a ticket transcript when the ticket is deleted.').setRequired(true).addChannelTypes(ChannelType.GuildText))
            .addChannelOption((channel) => channel
                .setName('open-category').setDescription('Category used as a place for ticket channels to be created.').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
            .addChannelOption((channel) => channel
                .setName('close-category').setDescription('Category used as a closed ticket channel.').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
            .addRoleOption((option) => option
                .setName('support').setDescription('Role used as support in channel tickets.').setRequired(true)))
        .addSubcommand((command) => command
            .setName('delete').setDescription('Deactivate the ticket system on this server.')),

    async execute(interaction, client) {
        switch (interaction.options.getSubcommand()) {
            case 'enable': {
                await ticket.findOne({ dataId: 'created' }).then(async (ticketData) => {
                    if (!ticketData) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`Successfully added ticket data on this server.`)
                                .setColor(config.embed.color)
                            ], ephemeral: true
                        }).then(async () => {
                            await ticket.create({
                                dataId: 'created',
                                panelId: interaction.options.getChannel('panel').id,
                                logId: interaction.options.getChannel('log').id,
                                transcriptId: interaction.options.getChannel('transcript').id,
                                openCategoryId: interaction.options.getChannel('open-category').id,
                                closeCategoryId: interaction.options.getChannel('close-category').id,
                                supportId: interaction.options.getRole('support').id,
                            }).then(async () => {
                                const channel = interaction.options.getChannel('panel');
                                const Embed = new EmbedBuilder()
                                    .setTitle(`UranusNetwork Ticket 🎟️`)
                                    .setDescription(`Selamat datang di Channel Bantuan UranusNetwork🚀!\n Tim kami akan dengan senang hati membantu Anda dengan masalah apa pun yang sedang dialami, kami bekerja secepat yang kami bisa untuk menyelesaikannya.\n Silakan buka tiket\n\nKamu hanya bisa membuka ticket sekali saja!.`)
                                    .setThumbnail(`https://cdn.discordapp.com/attachments/1133022390276857987/1242206441998389318/uranus-removebg-preview.png?ex=664cfe66&is=664bace6&hm=c12ee0a178166ea8ca41cb3d1992132e82e51f8597ab1a1072725afda1c10ae5&`)
                                    .setColor(config.embed.color)
                                    // .setImage ('')
                                    .setFooter({ text: `©᲼•᲼uranusnetwork 🚀🚀` })
                                const Button = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel('Create Ticket')
                                            .setCustomId('create-ticket')
                                            .setEmoji('1130326072060293221')
                                            .setStyle(ButtonStyle.Secondary)
                                    )

                                await channel.messages.fetch().then(async (messages) => {
                                    if (messages.size > 0) {
                                        await channel.bulkDelete(1).then(async () => {
                                            return channel.send({ embeds: [Embed], components: [Button] });
                                        })
                                    } else {
                                        return channel.send({ embeds: [Embed], components: [Button] });
                                    }
                                });
                            });
                        });
                    } else {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`Failed to add ticket data on this server because there is already data installed.`)
                                .setColor(config.embed.color)
                                .setFooter({ text: `To delete this feature use /ticket delete` })
                            ], ephemeral: true
                        });
                    }
                });
            }
                break;
            case 'delete': {
                await ticket.findOneAndDelete({ dataId: 'created' }).then(async (ticketData) => {
                    if (ticketData) {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`Successfully deleted ticket data from this server.`)
                                .setColor(config.embed.color)
                                .setFooter({ text: `To add data for this feature, use /ticket enable` })
                            ], ephemeral: true
                        });
                    } else {
                        return interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setTitle(`System Alert`)
                                .setDescription(`Failed to delete ticket data on this server because no data is available.`)
                                .setColor(config.embed.color)
                                .setFooter({ text: `To add data for this feature, use /ticket enable` })
                            ], ephemeral: true
                        });
                    }
                });
            }
                break;
        }
    }
}