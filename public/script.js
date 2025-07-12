document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有需要的 DOM 元素
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');
    const dayToggleButton = document.getElementById('day-toggle-btn');
    const todayLabel = dayToggleButton.querySelector('.toggle-label.today');
    const tomorrowLabel = dayToggleButton.querySelector('.toggle-label.tomorrow');

    let allForecasts = [];
    let currentDayIndex = 0;

    // 渲染指定某一天的天氣
    function renderWeather(dayIndex) {
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

    // 更新切換按鈕的視覺狀態
    function updateToggleVisuals() {
        dayToggleButton.classList.toggle('toggled', currentDayIndex === 1);
        todayLabel.classList.toggle('active', currentDayIndex === 0);
        tomorrowLabel.classList.toggle('active', currentDayIndex === 1);
    }
    
    // 獲取天氣資料的主函式
    async function fetchAndDisplayWeather(cityId) {
        // 1. 重設狀態
        weatherDisplay.innerHTML = `<p class="loading">查詢中...</p>`;
        dayToggleButton.classList.add('disabled'); // 禁用按鈕
        allForecasts = [];
        currentDayIndex = 0;
        updateToggleVisuals(); // 更新視覺為預設狀態
        
        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error('伺服器回應錯誤');
            
            allForecasts = await response.json();
            if (!Array.isArray(allForecasts) || allForecasts.length === 0) {
                throw new Error('資料格式不正確');
            }

            renderWeather(0); // 預設渲染第一天

            if (allForecasts.length > 1) {
                dayToggleButton.classList.remove('disabled'); // 啟用按鈕
            }
        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
        }
    }

    // 按鈕的點擊事件
    dayToggleButton.addEventListener('click', () => {
        // 如果按鈕是禁用狀態，則不執行任何操作
        if (dayToggleButton.classList.contains('disabled')) return;

        currentDayIndex = 1 - currentDayIndex; // 切換索引
        renderWeather(currentDayIndex);
        updateToggleVisuals(); // 更新視覺
    });

    // 下拉選單的變動事件
    locationSelect.addEventListener('change', (event) => {
        fetchAndDisplayWeather(event.target.value);
    });

    // 頁面首次載入時，自動查詢預設城市
    fetchAndDisplayWeather(locationSelect.value);
});