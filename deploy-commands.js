const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('memo')
        .setDescription('メモを残します。')
        .addStringOption(option => option.setName('date').setDescription('日付').setRequired(true))
        .addStringOption(option => option.setName('content').setDescription('内容').setRequired(true)),
    new SlashCommandBuilder()
    .setName('memolist')
    .setDescription('全てのメモを表示します。'),
]

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands("1208417025362362408"),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();