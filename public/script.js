document.addEventListener('DOMContentLoaded', () => {
    // 獲取重要的 DOM 元素
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');

    // 異步函式：根據選擇的城市 ID 獲取並顯示天氣
    async function fetchAndDisplayWeather(cityId, cityName) {
        // 1. 顯示載入中訊息
        weatherDisplay.innerHTML = `<p class="loading">正在查詢 ${cityName} 的天氣...</p>`;

        // 2. 定義後端 API 的路徑 (相對路徑，適用於部署)
        // 這個路徑會被 Netlify 導向到 /.netlify/functions/rss-weather
        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            // 3. 發送網路請求
            const response = await fetch(apiEndpoint);

            // 如果請求失敗 (例如 404, 500 錯誤)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '無法從伺服器獲取資料');
            }

            // 4. 解析回傳的 JSON 資料
            const data = await response.json();

            // 5. 建立要顯示的 HTML 內容
            const html = `
                <div class="weather-details">
                    <p><strong>${cityName}</strong></p>
                    <p>${data.description}</p>
                    <p><strong>溫度:</strong> ${data.temperature}</p>
                    <p><strong>降雨機率:</strong> ${data.pop}</p>
                </div>
            `;

            // 6. 將天氣資訊更新到顯示框中
            weatherDisplay.innerHTML = html;

        } catch (error) {
            // 7. 如果過程中發生任何錯誤，顯示錯誤訊息
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
            console.error('Fetch error:', error);
        }
    }

    // 監聽下拉選單的 'change' 事件
    locationSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        const cityId = selectedOption.value;
        const cityName = selectedOption.text;
        fetchAndDisplayWeather(cityId, cityName);
    });

    // 頁面首次載入時，自動查詢預設選擇的城市（臺北市）
    const initialOption = locationSelect.options[locationSelect.selectedIndex];
    fetchAndDisplayWeather(initialOption.value, initialOption.text);
});