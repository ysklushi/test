const Parser = require('rss-parser');
const parser = new Parser();

// 這就是 Netlify 認識的後端函式標準格式
exports.handler = async function (event, context) {
    // 從前端請求的網址中，取得 ?cityId=XX 的值
    const { cityId } = event.queryStringParameters;
    if (!cityId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '缺少 cityId 參數' }),
        };
    }

    try {
        const rssUrl = `https://www.cwa.gov.tw/rss/forecast/36_${cityId}.xml`;
        const feed = await parser.parseURL(rssUrl);

        if (!feed.items || feed.items.length === 0) {
            throw new Error('RSS feed 中沒有項目');
        }

        const latestItem = feed.items[0];
        const content = latestItem.content;
        let temperature = 'N/A', pop = 'N/A', description = content.split(' ')[2] || 'N/A';

        const tempMatch = content.match(/溫度: (\d+ ~ \d+)/);
        if (tempMatch) temperature = tempMatch[1] + ' °C';

        const popMatch = content.match(/降雨機率: (\d+%)/);
        if (popMatch) pop = popMatch[1];

        const weatherData = { description, temperature, pop };
        
        // 成功時，回傳 200 和天氣資料
        return {
            statusCode: 200,
            body: JSON.stringify(weatherData),
        };

    } catch (error) {
        // 失敗時，回傳 500 和錯誤訊息
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};