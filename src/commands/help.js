const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("顯示所有可用的指令"),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(ensureUTF8(" 評價機器人指令列表"))
            .setDescription(ensureUTF8("以下是所有可用的指令："))
            .setColor("#3498db")
            .addFields(
                { name: "/help", value: ensureUTF8("顯示所有可用的指令 (所有人可用)") },
                { name: "/invite", value: ensureUTF8("顯示將機器人添加到伺服器的邀請連結 (所有人可用)") },
                { name: "/review [商品名稱]", value: ensureUTF8("創建一個評價按鈕，讓用戶可以給予商品評價 (僅限管理員)") },
                { name: "/quickreview [商品名稱] [評分] [評論]", value: ensureUTF8("快速給予商品評價，無需使用交互式介面 (所有人可用)") },
                { name: "/stats [商品名稱]", value: ensureUTF8("顯示評價統計（橫向條狀圖 + 平均分） (僅限管理員)") },
                { name: "/search [關鍵詞]", value: ensureUTF8("搜尋評論（內容 / 用戶名稱 / 商品名稱） (僅限管理員)") },
                { name: "/list [商品名稱] [頁數]", value: ensureUTF8("顯示所有評價列表，支持分頁 (僅限管理員)") }
            )
            .setFooter({ text: ensureUTF8("評價機器人 v1.0.0") })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
