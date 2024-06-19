const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("./config");
const chalk = require("chalk");
const welcomech = require('./database/welcomech');
const welcomerole = require('./database/welcomerole');
const leavech = require('./database/leavech');

const client = new Client({
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.on('guildMemberAdd', async (member) => {
    const datach = await welcomech.findOne({ GuildID: member.guild.id });
    if (!datach) return;
    if (datach) {
        await client.channels.cache.get(datach.ChannelID).send({
            embeds: [new EmbedBuilder()
                .setTitle(`▬▬▬▬▬▬▬▬  🪐 Welcome 🪐  ▬▬▬▬▬▬▬▬`)
                .setDescription(`✨HI ${member} to UranusNetWork🚀 Community\n\n 🌴 Verification your account on <#1184028307897982987>\n 🌴 Check out server information <#1169165731611553792> `)
                .setImage(`https://cdn.discordapp.com/attachments/1133022390276857987/1240303841166102599/URanus_NET_2.png?ex=66461277&is=6644c0f7&hm=d838717f7b3e75f9bb1cca2ae821d9857a74d78f739ea74477c05b30d1f92537&`)
                .setColor(config.embed.color)
                .setFooter({ text: `${member.guild.name} now has ${member.guild.memberCount} members` })]
        });
    }
});

client.on('guildMemberAdd', async (member) => {
    const datarole = await welcomerole.findOne({ GuildID: member.guild.id });
    if (!datarole) return;
    if (datarole) {
        await member.roles.add(datarole.RoleID);
    }
});

client.on('guildMemberRemove', async (member) => {
    const datach = await leavech.findOne({ GuildID: member.guild.id });
    if (!datach) return;
    if (datach) {
        await client.channels.cache.get(datach.ChannelID).send({
            embeds: [new EmbedBuilder()
                //.setTitle(`${member.guild.name}'s Leave Log`)
                // .setImage(``)
                .setDescription(`**${member.user.tag}** leaves the **${member.guild.name}**`)
                .setColor(config.embed.color)]
        });
    }
});

client.handleEvents();
client.handleCommands();
client.login(config.client.token);


client.on("error", (err) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
})

process.on("unhandledRejection", (reason, promise) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${reason}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${promise}`))
})

process.on("uncaughtException", (err, origin) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${origin}`))
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${origin}`))
})

process.on("warning", (warn) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${warn}`))
})