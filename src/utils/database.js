const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

// Ū���Ҧ�����
function getAllReviews() {
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        return JSON.parse(data).reviews;
    } catch (error) {
        console.error("Ū�������ƾڮɥX��:", error);
        return [];
    }
}

// �K�[�s����
function addReview(review) {
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        const db = JSON.parse(data);
        
        // �K�[�ߤ@ID�M�ɶ��W
        review.id = Date.now().toString();
        review.timestamp = new Date().toISOString();
        
        db.reviews.push(review);
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
        return review;
    } catch (error) {
        console.error("�K�[�����ɥX��:", error);
        return null;
    }
}

// �j������
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

// ��������έp
function getReviewStats(productName) {
    const reviews = getAllReviews();
    
    // �p�G���w�F�ӫ~�W�١A�u�L�o�Ӱӫ~������
    const filteredReviews = productName 
        ? reviews.filter(r => r.productName === productName)
        : reviews;
    
    // �p��������G
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
    
    // �p�⥭����
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
