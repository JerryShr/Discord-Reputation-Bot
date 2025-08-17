const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { addReview } = require("../utils/database");
const config = require("../config");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quickreview")
        .setDescription("快速給予商品評價，無需使用交互式介面")
        .addStringOption(option => 
            option.setName("商品名稱")
                .setDescription("要評價的商品名稱")
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName("評分")
                .setDescription("購買評分 (1-10)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10))
        .addStringOption(option => 
            option.setName("評論")
                .setDescription("購買評論 (選填)")
                .setRequired(false)),
    
    async execute(interaction) {
        const productName = ensureUTF8(interaction.options.getString("商品名稱"));
        const rating = interaction.options.getInteger("評分");
        const comment = ensureUTF8(interaction.options.getString("評論") || "無評論");
        
        // 創建評價對象
        const review = {
            productName,
            rating,
            comment,
            userId: interaction.user.id,
            username: interaction.user.username,
            userAvatar: interaction.user.displayAvatarURL({ dynamic: true })
        };
        
        // 添加評價到數據庫
        const savedReview = addReview(review);
        
        if (savedReview) {
            // 通知用戶評價已提交
            await interaction.reply({ 
                content: ensureUTF8("感謝您的評價！"), 
                ephemeral: true 
            });
            
            // 在指定頻道發送評價訊息
            const reviewChannel = interaction.client.channels.cache.get(config.reviewChannelId);
            if (reviewChannel) {
                const embed = new EmbedBuilder()
                    .setTitle(ensureUTF8(`商品評價: ${productName}`))
                    .setDescription(ensureUTF8(`**評分:** ${rating}/10\n**評論:** ${comment}`))
                    .setColor(rating >= 7 ? 0x4caf50 : (rating >= 4 ? 0xffcc00 : 0xff4d4d))
                    .setTimestamp()
                    .setFooter({ text: `評價ID: ${savedReview.id}` })
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    });
                
                await reviewChannel.send({ embeds: [embed] });
            } else {
                console.error(`找不到評價顯示頻道 (ID: ${config.reviewChannelId})`);
                await interaction.followUp({ 
                    content: ensureUTF8("評價已保存，但無法在顯示頻道中發布。請聯繫管理員檢查配置。"), 
                    ephemeral: true 
                });
            }
        } else {
            await interaction.reply({ 
                content: ensureUTF8("提交評價時出錯，請稍後再試！"), 
                ephemeral: true 
            });
        }
    }
};
