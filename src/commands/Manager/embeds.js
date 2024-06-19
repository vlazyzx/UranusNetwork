const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embeds')
        .setDescription('Create an embed message and send it to the selected channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption((channel) => channel
            .setName('channel').setDescription('The channel where the message will be sent.').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread))
        .addStringOption((option) => option
            .setName('title').setDescription('Short title of the message being created.').setRequired(true))
        .addStringOption((option) => option
            .setName('description').setDescription('Description of the message being created.').setRequired(true))
        .addStringOption((option) => option
            .setName('color').setDescription('Select a color for the message being created.').setRequired(false)
            .addChoices(
                { name: 'Default', value: 'default' },
                { name: 'Red', value: 'red' },
                { name: 'Blue', value: 'blue' },
                { name: 'White', value: 'white' },
                { name: 'Orange', value: 'orange' },
                { name: 'Cyan', value: 'cyan' },
                { name: 'Green', value: 'green' },
                { name: 'Yellow', value: 'yellow' },
                { name: 'Purple', value: 'purple' },
            ))
        .addStringOption((option) => option
            .setName('content').setDescription('Content in the embed that is being created. ( can be used as role tag )').setRequired(false))
        .addStringOption((option) => option
            .setName('footer').setDescription('Footer for the message being created.').setRequired(false))
        .addStringOption((option) => option
            .setName('image').setDescription('Image link for the message being created.').setRequired(false))
        .addStringOption((option) => option
            .setName('thumbnail').setDescription('Image link for the message being created.').setRequired(false)),

    async execute(interaction, client) {
        const { options } = interaction;
        const channel = options.getChannel('channel');
        const color = options.getString('color');
        const image = options.getString('image');
        const thumbnail = options.getString('thumbnail');
        const footer = options.getString('footer');
        const content = options.getString('content');

        const Embed = new EmbedBuilder()
            .setTitle(`${options.getString('title').replace(/\\n/g, '\n')}`)
            .setDescription(`${options.getString('description').replace(/\\n/g, '\n')}`)

        if (image) {
            Embed.setImage(image)
        }

        if (thumbnail) {
            Embed.setThumbnail(thumbnail)
        }

        if (footer) {
            Embed.setFooter({ text: `${footer.replace(/\\n/g, '\n')}` })
        }

        switch (color) {
            case 'default': { Embed.setColor(config.embed.color) } break;
            case 'red': { Embed.setColor('Red') } break;
            case 'blue': { Embed.setColor('Blue') } break;
            case 'white': { Embed.setColor('White') } break;
            case 'orange': { Embed.setColor('Orange') } break;
            case 'cyan': { Embed.setColor('Aqua') } break;
            case 'green': { Embed.setColor('Green') } break;
            case 'yellow': { Embed.setColor('Yellow') } break;
            case 'purple': { Embed.setColor('Purple') } break;
        }

        if (content) {
            await channel.send({ embeds: [Embed], content: `${content.replace(/\\n/g, '\n')}` })
        } else {
            await channel.send({ embeds: [Embed] })
        }

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`Successfully created and sent message to ${channel}`)
                .setColor(config.embed.color)], ephemeral: true
        })
    }
}