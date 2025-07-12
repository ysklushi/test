const Parser = require('rss-parser');
const parser = new Parser();

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

exports.handler = async function (event, context) {
    // ▼▼▼▼▼ 這裡是修改的部分 ▼▼▼▼▼
    const RSS_FEEDS = [
        'https://feeds.feedburner.com/rsscna/social',      // 中央社
        'https://news.pts.org.tw/xml/newsfeed.xml'          // 公視新聞
    ];
    // ▲▲▲▲▲ 這裡是修改的部分 ▲▲▲▲▲

    try {
        // ▼▼▼▼▼ 這裡是修改的部分 ▼▼▼▼▼
        // 使用 Promise.all 同時請求多個 RSS 來源
        const feeds = await Promise.all(
            RSS_FEEDS.map(url => parser.parseURL(url))
        );

        // 將所有來源的新聞項目合併成一個陣列
        const allItems = feeds.reduce((acc, feed) => {
            if (feed && feed.items) {
                return acc.concat(feed.items);
            }
            return acc;
        }, []);

        if (allItems.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }

        // 核心篩選邏輯：
        // 1. 篩選標題包含關鍵字的新聞
        // 2. 依照發布日期排序 (最新的在前面)
        // 3. 擷取前 20 則
        // 4. 整理成需要的格式
        const filteredNews = allItems
            .filter(item => 
                item.title && LEGAL_KEYWORDS.some(keyword => item.title.includes(keyword))
            )
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)) // 確保按時間倒序排列
            .slice(0, 20) // 最多只回傳 20 則最新聞
            .map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate // 取得新聞的發布日期
            }));
        // ▲▲▲▲▲ 這裡是修改的部分 ▲▲▲▲▲

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