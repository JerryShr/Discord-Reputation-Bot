const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require("discord.js");
const { getReviewStats } = require("../utils/database");
const { generateRatingChart } = require("../utils/chart");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("顯示評價統計（橫向條狀圖 + 平均分）")
        .addStringOption(option => 
            option.setName("商品名稱")
                .setDescription("要查看統計的商品名稱 (不填則顯示所有評價的統計)")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        // 延遲回覆，因為生成圖表可能需要一些時間
        await interaction.deferReply();
        
        const productName = ensureUTF8(interaction.options.getString("商品名稱"));
        
        // 獲取評價統計
        const stats = getReviewStats(productName);
        
        if (stats.totalReviews === 0) {
            await interaction.editReply({
                content: ensureUTF8(productName 
                    ? `找不到商品 **${productName}** 的評價記錄。`
                    : "目前還沒有任何評價記錄。")
            });
            return;
        }
        
        try {
            // 生成評價統計圖表
            const chartBuffer = await generateRatingChart(stats);
            
            // 創建附件
            const attachment = new AttachmentBuilder(chartBuffer, { name: "rating-stats.png" });
            
            // 發送統計信息
            await interaction.editReply({
                content: ensureUTF8(`${productName ? `**${productName}** 的評價統計：` : "所有商品的評價統計："}\n` +
                         `總評價數: **${stats.totalReviews}**\n` +
                         `平均評分: **${stats.averageRating}/10**`),
                files: [attachment]
            });
        } catch (error) {
            console.error("生成評價統計圖表時出錯:", error);
            await interaction.editReply({
                content: ensureUTF8("生成評價統計圖表時出錯，請稍後再試！")
            });
        }
    }
};
