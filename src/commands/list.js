const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { getAllReviews } = require("../utils/database");
const { ensureUTF8 } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("顯示所有評價列表")
        .addStringOption(option => 
            option.setName("商品名稱")
                .setDescription("要顯示評價的商品名稱 (不填則顯示所有評價)")
                .setRequired(false))
        .addIntegerOption(option => 
            option.setName("頁數")
                .setDescription("要顯示的頁數 (默認為第1頁)")
                .setRequired(false)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const productName = interaction.options.getString("商品名稱");
        const page = interaction.options.getInteger("頁數") || 1;
        const pageSize = 5; // 每頁顯示5條評價
        
        // 獲取所有評價
        let reviews = getAllReviews();
        
        // 如果指定了商品名稱，只過濾該商品的評價
        if (productName) {
            reviews = reviews.filter(r => r.productName === productName);
        }
        
        // 按時間倒序排序（最新的評價在前面）
        reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (reviews.length === 0) {
            await interaction.reply({
                content: ensureUTF8(productName 
                    ? `找不到商品 **${productName}** 的評價記錄。`
                    : "目前還沒有任何評價記錄。"),
                ephemeral: true
            });
            return;
        }
        
        // 計算總頁數
        const totalPages = Math.ceil(reviews.length / pageSize);
        
        // 檢查頁數是否有效
        if (page > totalPages) {
            await interaction.reply({
                content: ensureUTF8(`無效的頁數。總共只有 ${totalPages} 頁評價記錄。`),
                ephemeral: true
            });
            return;
        }
        
        // 獲取當前頁的評價
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, reviews.length);
        const currentPageReviews = reviews.slice(startIndex, endIndex);
        
        // 創建嵌入
        const embed = new EmbedBuilder()
            .setTitle(ensureUTF8(productName 
                ? `${productName} 的評價列表`
                : "所有評價列表"))
            .setDescription(ensureUTF8(`顯示第 ${page}/${totalPages} 頁，共 ${reviews.length} 條評價記錄`))
            .setColor("#3498db")
            .setTimestamp();
        
        // 添加每條評價記錄
        currentPageReviews.forEach((review, index) => {
            const date = new Date(review.timestamp).toLocaleDateString();
            embed.addFields({
                name: ensureUTF8(`${startIndex + index + 1}. ${review.productName} (${review.rating}/10)`),
                value: ensureUTF8(`**評論:** ${review.comment}\n` +
                       `**用戶:** ${review.username}\n` +
                       `**日期:** ${date}\n` +
                       `**ID:** ${review.id}`)
            });
        });
        
        // 添加頁碼信息
        embed.setFooter({ 
            text: ensureUTF8(`第 ${page}/${totalPages} 頁 • 使用 /list 頁數:[頁數] 查看其他頁`)
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};
