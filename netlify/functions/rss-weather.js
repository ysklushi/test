const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function (event, context) {
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
        
        // --- 全新的、更穩定的解析邏輯 ---
        
        // 1. 先精準地抓取溫度和降雨機率
        let temperature = 'N/A';
        let pop = 'N/A';
        const tempMatch = content.match(/溫度: (\d+\s*~\s*\d+)/);
        if (tempMatch) temperature = tempMatch[1] + ' °C';

        const popMatch = content.match(/降雨機率: (\d+%)/);
        if (popMatch) pop = popMatch[1];
        
        // 2. 從原始字串中，移除我們已經處理過的資訊
        let description = content;
        if (tempMatch) description = description.replace(tempMatch[0], '');
        if (popMatch) description = description.replace(popMatch[0], '');
        
        // 3. 移除城市名稱和多餘的空格，剩下的就是乾淨的天氣描述
        const cityName = feed.title.split(' ')[0]; // 從 "臺北市 - 36小時天氣預報" 中取出 "臺北市"
        description = description.replace(cityName, '').trim();

        // 整理最終要回傳的資料
        const weatherData = {
            description: description,
            temperature: temperature,
            pop: pop,
        };
        
        // ------------------------------------

        return {
            statusCode: 200,
            body: JSON.stringify(weatherData),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};