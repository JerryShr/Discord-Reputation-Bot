require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    reviewChannelId: process.env.REVIEW_CHANNEL_ID,
    globalCommands: process.env.GLOBAL_COMMANDS === 'true',
    guildId: process.env.GUILD_ID
};
