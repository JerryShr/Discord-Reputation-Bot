const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { searchReviews } = require("../utils/database");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("搜尋評論（內容 / 用戶名稱 / 商品名稱）")
        .addStringOption(option => 
            option.setName("關鍵詞")
                .setDescription("要搜尋的關鍵詞")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const query = ensureUTF8(interaction.options.getString("關鍵詞"));
        
        // 搜尋評價
        const results = searchReviews(query);
        
        if (results.length === 0) {
            await interaction.reply({
                content: ensureUTF8(`找不到包含 **${query}** 的評價記錄。`),
                ephemeral: true
            });
            return;
        }
        
        // 限制結果數量，避免超過Discord的嵌入限制
        const maxResults = Math.min(10, results.length);
        const limitedResults = results.slice(0, maxResults);
        
        // 創建嵌入
        const embed = new EmbedBuilder()
            .setTitle(ensureUTF8(`搜尋結果: "${query}"`))
            .setDescription(ensureUTF8(`找到 ${results.length} 條評價記錄${results.length > maxResults ? `（顯示前 ${maxResults} 條）` : ""}:`))
            .setColor("#3498db")
            .setTimestamp();
        
        // 添加每條評價記錄
        limitedResults.forEach((review, index) => {
            const date = new Date(review.timestamp).toLocaleDateString();
            embed.addFields({
                name: ensureUTF8(`${index + 1}. ${review.productName} (${review.rating}/10)`),
                value: ensureUTF8(`**評論:** ${review.comment}\n` +
                       `**用戶:** ${review.username}\n` +
                       `**日期:** ${date}\n` +
                       `**ID:** ${review.id}`)
            });
        });
        
        // 如果結果被截斷，添加提示
        if (results.length > maxResults) {
            embed.setFooter({ 
                text: ensureUTF8(`僅顯示 ${maxResults} 條結果，共找到 ${results.length} 條。請使用更具體的關鍵詞縮小搜尋範圍。`)
            });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};
