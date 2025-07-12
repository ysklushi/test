const Parser = require('rss-parser');
const parser = new Parser();

// ▼▼▼▼▼ 這裡是修改的部分 ▼▼▼▼▼
// 您指定的法律相關關鍵字 (已為您整理並移除重複)
const LEGAL_KEYWORDS = [
    // 原始關鍵字
    '判決', '起訴', '法院', '地院', '高院', '最高法院', '不起訴', 
    '緩刑', '有期徒刑', '重判', '犯嫌', '法官', '檢察官', '律師', '被告',
    // 新增的關鍵字
    '勞基法', '勞動基準法', '修法', '草案', '三讀通過', '羈押', '交保', 
    '具保', '性騷擾', '霸凌', '職場不法侵害', '求償', '判賠', '無罪', 
    '改判', '電子腳鐐', '追訴', '時效', '繼承', '遺產', '懲戒法院', 
    '司法院', '法務部', '貪污', '賄選', '裁定', '緩起訴'
];
// ▲▲▲▲▲ 這裡是修改的部分 ▲▲▲▲▲

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
            .slice(0, 20); // 最多只回傳 20 則最新聞

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