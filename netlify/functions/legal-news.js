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
    // 更新為您指定的 RSS 來源，已加入「報導者」
    const RSS_FEEDS = [
        'https://feeds.feedburner.com/rsscna/social',      // 中央社
        'https://news.ltn.com.tw/rss/society.xml',          // 自由時報
        'https://newtalk.tw/rss/category/14',              // Newstalk新聞
        'https://cmsapi.businessweekly.com.tw/?CategoryId=efd99109-9e15-422e-97f0-078b21322450&TemplateId=8E19CF43-50E5-4093-B72D-70A912962D55', // 商業週刊
        'https://www.twreporter.org/a/rss2.xml'             // 報導者 (新加入)
    ];
    // ▲▲▲▲▲ 這裡是修改的部分 ▲▲▲▲▲

    try {
        const feeds = await Promise.all(
            RSS_FEEDS.map(url => parser.parseURL(url).catch(e => {
                console.warn(`無法解析 RSS: ${url}`, e.message); // 增加錯誤處理，避免單一來源失敗導致全部中斷
                return null;
            }))
        );

        // ▼▼▼▼▼ 這裡是修改的部分 ▼▼▼▼▼
        // 將所有來源的新聞合併，並為每則新聞加上來源標記
        const allItems = feeds.filter(Boolean).reduce((acc, feed) => {
            if (feed && feed.items) {
                const feedUrl = feed.feedUrl || (feed.link || '');
                let sourceName = feed.title; // 預設使用 RSS 的標題
                
                // 根據 feed 的 URL 判斷來源名稱，已加入「報導者」的判斷邏輯
                if (feedUrl.includes('cna') || feedUrl.includes('feedburner')) sourceName = '中央社';
                else if (feedUrl.includes('ltn.com.tw')) sourceName = '自由時報';
                else if (feedUrl.includes('newtalk.tw')) sourceName = 'Newstalk新聞';
                else if (feedUrl.includes('businessweekly.com.tw')) sourceName = '商業週刊';
                else if (feedUrl.includes('twreporter.org')) sourceName = '報導者';

                const itemsWithSource = feed.items.map(item => ({
                    ...item,
                    source: sourceName // 附加來源屬性
                }));
                return acc.concat(itemsWithSource);
            }
            return acc;
        }, []);

        if (allItems.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }
        
        // 核心篩選邏輯：
        const filteredNews = allItems
            .filter(item => 
                item.title && LEGAL_KEYWORDS.some(keyword => item.title.includes(keyword))
            )
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            .slice(0, 50)
            .map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                source: item.source // 將來源資訊一起回傳
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