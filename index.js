const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
    console.log('Bot is ready');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.includes('https://x.com/')) {
        const Webhooks = await message.channel.fetchWebhooks()
        const WebhookNames = Webhooks.map(webhook => webhook.name);
        if (WebhookNames.includes("XTwitterWebhook")) {
            const Webhook = Webhooks.find(webhook => webhook.name === "XTwitterWebhook");
            Webhook.send({
                content: message.content.replace(/https:\/\/x\.com\//g, 'https://twitter.com/'),
                username: message.author.displayName,
                avatarURL: message.author.avatarURL()
            });
            message.delete();
        } else {
            message.channel.createWebhook({ name: "XTwitterWebhook", avatar: client.user.avatarURL(), reason: "Webhook for X Twitter" }).then(async webhook => {
                await webhook.send({
                    content: message.content.replace(/https:\/\/x\.com\//g, 'https://twitter.com/'),
                    username: message.author.displayName,
                    avatarURL: message.author.avatarURL()
                })
                message.delete();
            });
        }
    }
    if (message.content.startsWith('nn!timer')) {
        const time = message.content.split(' ')[1];
        if (!time) return message.reply('時間が指定されていません。');
        if (isNaN(time)) return message.reply('数字で指定してください。');
        const msg = await message.reply({ embeds: [new EmbedBuilder().setTitle('Done!').setDescription(`${time}分のタイマーを設定しました！`).setColor('#0099ff')] });
        setTimeout(() => {
            message.reply({ embeds: [new EmbedBuilder().setTitle('Info').setDescription(`[こちら](${msg.url})で設定した${time}分のタイマーが終了しました！`).setColor('Yellow')] });
        }, time * 60000);

    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'memo') {
        const date = interaction.options.getString('date');
        const content = interaction.options.getString('content');
        const memo = JSON.parse(fs.readFileSync('memo.json', 'utf-8'));
        if (!memo[interaction.user.id]) {
            memo[interaction.user.id] = [];
        }
        memo[interaction.user.id].push({ date, content });
        fs.writeFileSync('memo.json', JSON.stringify(memo, null, 4));
        interaction.reply({ content: 'メモを保存しました。', ephemeral: true });
    }
    if (interaction.commandName === 'memolist') {
        const memo = JSON.parse(fs.readFileSync('memo.json', 'utf-8'));
        const userMemo = memo[interaction.user.id];
        if (!userMemo) {
            interaction.reply({ content: 'メモがありません。', ephemeral: true });
        } else {
            interaction.reply({ content: userMemo.map(memo => `日付: ${memo.date}, 内容: ${memo.content}`).join('\n'), ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN)