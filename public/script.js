document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有需要的 DOM 元素
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');
    const dayToggleButton = document.getElementById('day-toggle-btn');

    // 用來儲存從 API 獲取的完整預報資料 (例如 [今日, 明日])
    let allForecasts = [];
    // 用來追蹤當前顯示的是哪一天 (0: 今日, 1: 明日)
    let currentDayIndex = 0;

    // 函式：只渲染指定某一天的天氣
    function renderWeather(dayIndex) {
        // 如果沒有那天的資料，就什麼都不做
        if (!allForecasts[dayIndex]) return;

        const forecast = allForecasts[dayIndex];
        const html = `
            <div class="weather-row">
                <span class="description">${forecast.description}</span>
                <span class="temperature">溫度: ${forecast.temperature}</span>
                <span class="pop">降雨機率: ${forecast.pop}</span>
            </div>
        `;
        weatherDisplay.innerHTML = html;
    }

    // 函式：獲取天氣資料
    async function fetchAndDisplayWeather(cityId, cityName) {
        // 1. 重設狀態
        weatherDisplay.innerHTML = `<p class="loading">正在查詢 ${cityName} 的天氣...</p>`;
        dayToggleButton.disabled = true;
        dayToggleButton.classList.remove('toggled');
        allForecasts = [];
        currentDayIndex = 0;
        
        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '無法從伺服器獲取資料');
            }
            
            // 2. 將獲取的預報陣列存起來
            allForecasts = await response.json();

            if (!Array.isArray(allForecasts) || allForecasts.length === 0) {
                throw new Error('資料格式不正確');
            }

            // 3. 預設渲染第一天 (今日) 的天氣
            renderWeather(0);

            // 4. 如果有超過一天的資料，才啟用切換按鈕
            if (allForecasts.length > 1) {
                dayToggleButton.disabled = false;
            }

        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
        }
    }

    // 按鈕的點擊事件
    dayToggleButton.addEventListener('click', () => {
        // 切換索引 (0 -> 1, 1 -> 0)
        currentDayIndex = 1 - currentDayIndex;
        
        // 重新渲染對應日期的天氣
        renderWeather(currentDayIndex);

        // 更新按鈕的視覺狀態 (箭頭方向)
        dayToggleButton.classList.toggle('toggled');
    });

    // 下拉選單的變動事件
    locationSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        fetchAndDisplayWeather(selectedOption.value, selectedOption.text);
    });

    // 頁面首次載入時，自動查詢預設城市
    const initialOption = locationSelect.options[locationSelect.selectedIndex];
    fetchAndDisplayWeather(initialOption.value, initialOption.text);
});