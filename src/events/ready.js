const { Events } = require("discord.js");

// 確保控制台輸出使用UTF-8編碼
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`準備就緒！已登入為 ${client.user.tag}`);
    }
};
