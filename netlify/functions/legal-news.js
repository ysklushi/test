const Parser = require('rss-parser');
const parser = new Parser();

// 定義我們要篩選的法律相關關鍵字
// (已為您移除重複的詞彙)
const LEGAL_KEYWORDS = [
    '判決', '起訴', '法院', '地院', '高院', '最高法院', '不起訴', 
    '緩刑', '有期徒刑', '重判', '犯嫌', '法官', '檢察官', '律師', '被告'
];

exports.handler = async function (event, context) {
    const CNA_SOCIAL_RSS_URL = 'https://feeds.feedburner.com/rsscna/social';

    try {
        const feed = await parser.parseURL(CNA_SOCIAL_RSS_URL);

        if (!feed.items || feed.items.length === 0) {
            // 如果 RSS feed 為空，直接回傳空陣列
            return {
                statusCode: 200,
                body: JSON.stringify([]),
            };
        }

        // 核心篩選邏輯
        const filteredNews = feed.items
            .filter(item => {
                // 確保新聞有標題
                if (!item.title) return false;
                // 檢查標題是否包含任何一個關鍵字
                return LEGAL_KEYWORDS.some(keyword => item.title.includes(keyword));
            })
            .map(item => {
                // 只回傳前端需要的資訊：標題和連結
                return {
                    title: item.title,
                    link: item.link,
                };
            })
            // 最多只取回 15 則最新聞，避免版面過長
            .slice(0, 15);

        return {
            statusCode: 200,
            body: JSON.stringify(filteredNews),
        };

    } catch (error) {
        console.error('RSS 解析失敗:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: '無法獲取法律新聞' }),
        };
    }
};