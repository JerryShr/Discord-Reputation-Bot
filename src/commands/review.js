const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("review")
        .setDescription("創建一個評價按鈕，讓用戶可以給予商品評價")
        .addStringOption(option => 
            option.setName("商品名稱")
                .setDescription("要評價的商品名稱")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const productName = ensureUTF8(interaction.options.getString("商品名稱"));
        
        // 創建評價按鈕
        const reviewButton = new ButtonBuilder()
            .setCustomId(`review_${productName}`)
            .setLabel(ensureUTF8(`評價商品: ${productName}`))
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⭐");
        
        const row = new ActionRowBuilder().addComponents(reviewButton);
        
        await interaction.reply({
            content: ensureUTF8(`**${productName}** 的評價按鈕已創建！用戶可以點擊下方按鈕進行評價。`),
            components: [row]
        });
    }
};
