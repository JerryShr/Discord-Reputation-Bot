const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("顯示將機器人添加到伺服器的邀請連結"),
    
    async execute(interaction) {
        const clientId = interaction.client.user.id;
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2147483648&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setTitle(ensureUTF8(" 邀請評價機器人"))
            .setDescription(ensureUTF8(`點擊下方連結將評價機器人添加到您的伺服器：\n\n[點擊這裡邀請機器人](${inviteUrl})`))
            .setColor("#3498db")
            .setFooter({ text: ensureUTF8("評價機器人 v1.0.0") })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
