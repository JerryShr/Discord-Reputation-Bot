const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// 確保正確處理UTF-8編碼
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

// 嘗試註冊字體，如果失敗則使用系統默認字體
try {
    // 嘗試註冊微軟正黑體（Windows系統常見中文字體）
    registerFont(path.join("C:", "Windows", "Fonts", "msjh.ttc"), { family: "Microsoft JhengHei" });
    console.log("成功註冊微軟正黑體字體");
} catch (error) {
    console.log("無法註冊自定義字體，將使用系統默認字體");
}

// 生成評價統計圖表
async function generateRatingChart(stats) {
    const { ratingDistribution, averageRating } = stats;
    
    // 設置畫布
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    
    // 填充背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    
    // 設置標題
    ctx.fillStyle = "#333333";
    ctx.font = "bold 24px 'Microsoft JhengHei', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ensureUTF8(`評價統計 (平均: ${averageRating}/10)`), width / 2, 40);
    
    // 計算最大值以確定比例
    const maxCount = Math.max(...Object.values(ratingDistribution), 1);
    
    // 設置條形圖參數
    const barWidth = 50;
    const barSpacing = 20;
    const startX = 80;
    const startY = height - 60;
    const maxBarHeight = height - 120;
    
    // 繪製每個評分的條形
    Object.entries(ratingDistribution).forEach(([rating, count], index) => {
        const x = startX + index * (barWidth + barSpacing);
        const barHeight = (count / maxCount) * maxBarHeight;
        const y = startY - barHeight;
        
        // 根據評分設置顏色
        const ratingNum = parseInt(rating);
        let color;
        if (ratingNum <= 3) {
            color = "#ff4d4d"; // 紅色 (低評分)
        } else if (ratingNum <= 7) {
            color = "#ffcc00"; // 黃色 (中評分)
        } else {
            color = "#4caf50"; // 綠色 (高評分)
        }
        
        // 繪製條形
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 繪製評分數字
        ctx.fillStyle = "#333333";
        ctx.font = "16px 'Microsoft JhengHei', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(rating, x + barWidth / 2, startY + 25);
        
        // 繪製計數
        ctx.fillText(count, x + barWidth / 2, y - 10);
    });
    
    // 繪製軸標籤
    ctx.fillStyle = "#333333";
    ctx.font = "18px 'Microsoft JhengHei', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ensureUTF8("評分"), width / 2, height - 15);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(ensureUTF8("數量"), 0, 0);
    ctx.restore();
    
    // 返回畫布的 Buffer
    return canvas.toBuffer("image/png");
}

module.exports = {
    generateRatingChart
};
