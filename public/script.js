document.addEventListener('DOMContentLoaded', () => {
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');

    async function fetchAndDisplayWeather(cityId, cityName) {
        // 1. 為了更好的使用者體驗，先清空舊內容並顯示載入訊息
        weatherDisplay.innerHTML = `<p class="loading">正在查詢 ${cityName} 的天氣...</p>`;

        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '無法從伺服器獲取資料');
            }

            const forecasts = await response.json();

            if (!Array.isArray(forecasts) || forecasts.length === 0) {
                throw new Error('資料格式不正確或無預報資料');
            }

            // 2. 使用 map 和 join 動態產生多個天氣預報列
            const forecastRowsHtml = forecasts.map(item => `
                <div class="weather-row">
                    <span class="description">${item.description}</span>
                    <span class="temperature">溫度: ${item.temperature}</span>
                    <span class="pop">降雨機率: ${item.pop}</span>
                </div>
            `).join('');

            // 3. 組合最終要放入藍色盒子裡的完整 HTML
            const innerHtml = `
                <div class="weather-content">
                    <div class="city-title">${cityName}</div>
                    <div class="forecast-list">
                        ${forecastRowsHtml}
                    </div>
                </div>
            `;

            // 4. 將產生好的 HTML 放入顯示區
            weatherDisplay.innerHTML = innerHtml;

        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
            console.error('Fetch error:', error);
        }
    }

    // (監聽事件的程式碼不變)
    locationSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        fetchAndDisplayWeather(selectedOption.value, selectedOption.text);
    });

    const initialOption = locationSelect.options[locationSelect.selectedIndex];
    fetchAndDisplayWeather(initialOption.value, initialOption.text);
});