const { Events, InteractionType } = require("discord.js");
const { addReview } = require("../utils/database");
const config = require("../config");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // 處理按鈕交互
        if (interaction.isButton()) {
            // 評價按鈕
            if (interaction.customId.startsWith("review_")) {
                const productName = interaction.customId.replace("review_", "");
                
                // 創建模態框
                await interaction.showModal({
                    title: ensureUTF8(`評價商品: ${productName}`),
                    customId: `review_modal_${productName}`,
                    components: [
                        // 不再顯示商品名稱輸入框，而是將商品名稱存儲在customId中
                        {
                            type: 1, // ActionRow
                            components: [
                                {
                                    type: 4, // TextInput
                                    customId: "rating",
                                    label: "購買評分 (1-10)",
                                    style: 1, // Short
                                    required: true,
                                    placeholder: "請輸入1-10的數字",
                                    minLength: 1,
                                    maxLength: 2
                                }
                            ]
                        },
                        {
                            type: 1, // ActionRow
                            components: [
                                {
                                    type: 4, // TextInput
                                    customId: "comment",
                                    label: "購買評論 (選填)",
                                    style: 2, // Paragraph
                                    required: false,
                                    placeholder: "請分享您對此商品的評論...",
                                    maxLength: 1000
                                }
                            ]
                        }
                    ]
                });
            }
        }
        
        // 處理模態框提交
        else if (interaction.type === InteractionType.ModalSubmit) {
            if (interaction.customId.startsWith("review_modal_")) {
                // 從customId中提取商品名稱，而不是從輸入框中獲取
                const productName = ensureUTF8(interaction.customId.replace("review_modal_", ""));
                const rating = interaction.fields.getTextInputValue("rating");
                const comment = ensureUTF8(interaction.fields.getTextInputValue("comment"));
                
                // 驗證評分
                const ratingNum = parseInt(rating);
                if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
                    await interaction.reply({ content: "評分必須是1到10之間的數字！", ephemeral: true });
                    return;
                }
                
                // 創建評價對象
                const review = {
                    productName,
                    rating: ratingNum,
                    comment: comment || "無評論",
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    userAvatar: interaction.user.displayAvatarURL({ dynamic: true })
                };
                
                // 添加評價到數據庫
                const savedReview = addReview(review);
                
                if (savedReview) {
                    // 通知用戶評價已提交
                    await interaction.reply({ content: ensureUTF8("感謝您的評價！"), ephemeral: true });
                    
                    // 在指定頻道發送評價訊息
                    const reviewChannel = interaction.client.channels.cache.get(config.reviewChannelId);
                    if (reviewChannel) {
                        await reviewChannel.send({
                            embeds: [{
                                title: ensureUTF8(`商品評價: ${productName}`),
                                description: ensureUTF8(`**評分:** ${ratingNum}/10\n**評論:** ${comment || "無評論"}`),
                                color: ratingNum >= 7 ? 0x4caf50 : (ratingNum >= 4 ? 0xffcc00 : 0xff4d4d),
                                timestamp: new Date(),
                                footer: {
                                    text: `評價ID: ${savedReview.id}`
                                },
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.displayAvatarURL({ dynamic: true })
                                }
                            }]
                        });
                    } else {
                        console.error(`找不到評價顯示頻道 (ID: ${config.reviewChannelId})`);
                    }
                } else {
                    await interaction.reply({ content: ensureUTF8("提交評價時出錯，請稍後再試！"), ephemeral: true });
                }
            }
        }
    }
};
