const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

// 讀取所有評價
function getAllReviews() {
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        return JSON.parse(data).reviews;
    } catch (error) {
        console.error("讀取評價數據時出錯:", error);
        return [];
    }
}

// 添加新評價
function addReview(review) {
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        const db = JSON.parse(data);
        
        // 添加唯一ID和時間戳
        review.id = Date.now().toString();
        review.timestamp = new Date().toISOString();
        
        db.reviews.push(review);
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
        return review;
    } catch (error) {
        console.error("添加評價時出錯:", error);
        return null;
    }
}

// 搜索評價
function searchReviews(query) {
    const reviews = getAllReviews();
    if (!query) return reviews;
    
    const lowerQuery = query.toLowerCase();
    return reviews.filter(review => 
        (review.productName && review.productName.toLowerCase().includes(lowerQuery)) ||
        (review.comment && review.comment.toLowerCase().includes(lowerQuery)) ||
        (review.username && review.username.toLowerCase().includes(lowerQuery))
    );
}

// 獲取評價統計
function getReviewStats(productName) {
    const reviews = getAllReviews();
    
    // 如果指定了商品名稱，只過濾該商品的評價
    const filteredReviews = productName 
        ? reviews.filter(r => r.productName === productName)
        : reviews;
    
    // 計算評分分佈
    const ratingDistribution = {};
    for (let i = 1; i <= 10; i++) {
        ratingDistribution[i] = 0;
    }
    
    filteredReviews.forEach(review => {
        const rating = parseInt(review.rating);
        if (rating >= 1 && rating <= 10) {
            ratingDistribution[rating]++;
        }
    });
    
    // 計算平均分
    const totalRating = filteredReviews.reduce((sum, review) => sum + parseInt(review.rating || 0), 0);
    const averageRating = filteredReviews.length > 0 ? (totalRating / filteredReviews.length).toFixed(1) : 0;
    
    return {
        totalReviews: filteredReviews.length,
        averageRating,
        ratingDistribution
    };
}

module.exports = {
    getAllReviews,
    addReview,
    searchReviews,
    getReviewStats
};
