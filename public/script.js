document.addEventListener('DOMContentLoaded', () => {
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');

    async function fetchAndDisplayWeather(cityId, cityName) {
        weatherDisplay.innerHTML = `<p class="loading">正在查詢 ${cityName} 的天氣...</p>`;
        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '無法從伺服器獲取資料');
            }

            // data 現在會是一個陣列，例如 [{...}, {...}]
            const forecasts = await response.json(); 

            if (!Array.isArray(forecasts) || forecasts.length === 0) {
                throw new Error('資料格式不正確或無預報資料');
            }

            // 使用 map 和 join 來動態產生多行 HTML
            const forecastHtml = forecasts.map(item => `
                <p class="weather-row">
                    <span>${item.description}</span>
                    <span><strong>溫度:</strong> ${item.temperature}</span>
                    <span><strong>降雨機率:</strong> ${item.pop}</span>
                </p>
            `).join('');

            // 組合最終的 HTML
            const html = `
                <div class="weather-details">
                    <p class="city-title"><strong>${cityName}</strong></p>
                    ${forecastHtml}
                </div>
            `;

            weatherDisplay.innerHTML = html;

        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
            console.error('Fetch error:', error);
        }
    }

    locationSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        fetchAndDisplayWeather(selectedOption.value, selectedOption.text);
    });

    const initialOption = locationSelect.options[locationSelect.selectedIndex];
    fetchAndDisplayWeather(initialOption.value, initialOption.text);
});