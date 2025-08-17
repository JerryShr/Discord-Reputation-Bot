/**
 * 確保文本使用UTF-8編碼，解決中文顯示亂碼問題
 * @param {string} text 要處理的文本
 * @returns {string} 處理後的文本
 */
function ensureUTF8(text) {
    if (!text) return text;
    return Buffer.from(text, 'utf8').toString('utf8');
}

module.exports = {
    ensureUTF8
};
