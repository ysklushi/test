document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有需要的 DOM 元素
    const locationSelect = document.getElementById('location-select');
    const weatherDisplay = document.getElementById('weather-display');
    const dayToggleButton = document.getElementById('day-toggle-btn');
    const todayLabel = dayToggleButton.querySelector('.toggle-label.today');
    const tomorrowLabel = dayToggleButton.querySelector('.toggle-label.tomorrow');

    // --- 1. 定義我們的天氣圖示庫 (SVG 程式碼) ---
    const ICONS = {
        sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
        cloudy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
        'cloud-sun': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16.5V22"></path><path d="M12 2v2.5"></path><path d="M20 12h2.5"></path><path d="M1.5 12H4"></path><path d="M18.36 5.64l1.77-1.77"></path><path d="M3.87 20.13l1.77-1.77"></path><path d="M18.36 18.36l1.77 1.77"></path><path d="M3.87 3.87l1.77 1.77"></path><path d="M16 20a4 4 0 0 0-8 0"></path><path d="M12 12a8 8 0 0 0-8 8"></path></svg>`,
        'cloud-rain': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="M8 19v1"></path><path d="M8 14v1"></path><path d="M16 19v1"></path><path d="M16 14v1"></path><path d="M12 21v1"></path><path d="M12 16v1"></path></svg>`,
        'cloud-lightning': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="m13 12-3 5h4l-3 5"></path></svg>`,
        snowflake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
    };

    // --- 2. 根據文字描述，回傳對應的圖示 SVG ---
    function getWeatherIcon(description) {
        if (description.includes('雷')) return ICONS['cloud-lightning'];
        if (description.includes('雨')) return ICONS['cloud-rain'];
        if (description.includes('雪')) return ICONS.snowflake;
        if (description.includes('晴') && description.includes('雲')) return ICONS['cloud-sun'];
        if (description.includes('晴')) return ICONS.sun;
        if (description.includes('多雲')) return ICONS.cloudy;
        if (description.includes('陰') || description.includes('雲')) return ICONS.cloud;
        return ICONS.cloud; // 預設圖示
    }

    let allForecasts = [];
    let currentDayIndex = 0;

    // 渲染指定某一天的天氣
    function renderWeather(dayIndex) {
        if (!allForecasts[dayIndex]) return;
        
        const forecast = allForecasts[dayIndex];
        const iconSvg = getWeatherIcon(forecast.description); // 獲取圖示

        const html = `
            <div class="weather-row">
                <span class="weather-icon">${iconSvg}</span>
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
        weatherDisplay.innerHTML = `<p class="loading">查詢中...</p>`;
        dayToggleButton.classList.add('disabled');
        allForecasts = [];
        currentDayIndex = 0;
        updateToggleVisuals();
        
        const apiEndpoint = `/api/rss-weather?cityId=${cityId}`;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error('伺服器回應錯誤');
            
            allForecasts = await response.json();
            if (!Array.isArray(allForecasts) || allForecasts.length === 0) {
                throw new Error('資料格式不正確');
            }

            renderWeather(0);

            if (allForecasts.length > 1) {
                dayToggleButton.classList.remove('disabled');
            }
        } catch (error) {
            weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
        }
    }

    // 按鈕的點擊事件 (不變)
    dayToggleButton.addEventListener('click', () => {
        if (dayToggleButton.classList.contains('disabled')) return;
        currentDayIndex = 1 - currentDayIndex;
        renderWeather(currentDayIndex);
        updateToggleVisuals();
    });

    // 下拉選單的變動事件 (不變)
    locationSelect.addEventListener('change', (event) => {
        fetchAndDisplayWeather(event.target.value);
    });

    // 頁面首次載入時，自動查詢預設城市 (不變)
    fetchAndDisplayWeather(locationSelect.value);
});