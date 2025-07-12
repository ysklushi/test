const Parser = require('rss-parser');
const parser = new Parser();

// 您指定的法律相關關鍵字 (已為您整理並移除重複)
const LEGAL_KEYWORDS = [
    '判決', '起訴', '法院', '地院', '高院', '最高法院', '不起訴', 
    '緩刑', '有期徒刑', '重判', '犯嫌', '法官', '檢察官', '律師', '被告'
];

exports.handler = async function (event, context) {
    const CNA_SOCIAL_RSS_URL = 'https://feeds.feedburner.com/rsscna/social';

    try {
        const feed = await parser.parseURL(CNA_SOCIAL_RSS_URL);

        if (!feed.items || feed.items.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }

        // 核心篩選邏輯：檢查標題是否包含任何一個關鍵字
        const filteredNews = feed.items
            .filter(item => 
                item.title && LEGAL_KEYWORDS.some(keyword => item.title.includes(keyword))
            )
            .map(item => ({
                title: item.title,
                link: item.link,
            }))
            .slice(0, 15); // 最多只回傳 15 則最新聞

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