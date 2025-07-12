// =================================================================
// ==                                                             ==
// ==      你的連結資料庫！未來所有修改都在這個檔案完成。           ==
// ==                                                             ==
// =================================================================
const linkData = [
    // ... (您原有的 linkData 內容，此處省略以保持簡潔) ...
    {
        groupName: "第一群組：律師常用",
        links: [
            { name: "司法院裁判書查詢", url: "https://judgment.judicial.gov.tw/FJUD/default.aspx", icon: "fa-solid fa-scale-balanced" },
            { name: "法源六法", url: "https://six.lawbank.com.tw/", icon: "fa-solid fa-book-atlas" },
            // ... 其他連結 ...
        ]
    },
    // ... 其他群組 ...
];

document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // ==== 天氣查詢與法律新聞功能 ====
    // =================================================================

    // ▼▼▼ 這是關鍵的「安全檢查」 ▼▼▼
    // 先檢查頁面上是否存在天氣工具的主要元素
    const locationSelect = document.getElementById('location-select');
    if (locationSelect) { 
        // 如果存在，才執行所有天氣和新聞相關的程式碼
        
        const weatherDisplay = document.getElementById('weather-display');
        const dayToggleButton = document.getElementById('day-toggle-btn');
        const todayLabel = dayToggleButton.querySelector('.toggle-label.today');
        const tomorrowLabel = dayToggleButton.querySelector('.toggle-label.tomorrow');
        const newsListContainer = document.getElementById('news-list');

        const ICONS = {
            sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
            cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
            cloudy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
            'cloud-rain': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="M8 19v1"></path><path d="M8 14v1"></path><path d="M16 19v1"></path><path d="M16 14v1"></path><path d="M12 21v1"></path><path d="M12 16v1"></path></svg>`,
            'cloud-lightning': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="m13 12-3 5h4l-3 5"></path></svg>`,
            snowflake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
        };

        function getWeatherIcon(description) {
            if (description.includes('雷')) return ICONS['cloud-lightning'];
            if (description.includes('雨')) return ICONS['cloud-rain'];
            if (description.includes('雪')) return ICONS.snowflake;
            if (description.includes('多雲')) return ICONS.cloudy;
            if (description.includes('晴')) return ICONS.sun;
            if (description.includes('陰') || description.includes('雲')) return ICONS.cloud;
            return ICONS.cloud;
        }

        let allForecasts = [];
        let currentDayIndex = 0;

        function renderWeather(dayIndex) {
            if (!allForecasts[dayIndex]) return;
            const forecast = allForecasts[dayIndex];
            const iconSvg = getWeatherIcon(forecast.description);
            weatherDisplay.innerHTML = `<div class="weather-row"><span class="weather-icon">${iconSvg}</span><span class="description">${forecast.description}</span><span class="temperature">溫度: ${forecast.temperature}</span><span class="pop">降雨機率: ${forecast.pop}</span></div>`;
        }

        function updateToggleVisuals() {
            dayToggleButton.classList.toggle('toggled', currentDayIndex === 1);
            todayLabel.classList.toggle('active', currentDayIndex === 0);
            tomorrowLabel.classList.toggle('active', currentDayIndex === 1);
        }
        
        async function fetchAndDisplayWeather(cityId) {
            weatherDisplay.innerHTML = `<p class="loading">查詢中...</p>`;
            dayToggleButton.classList.add('disabled');
            allForecasts = [];
            currentDayIndex = 0;
            updateToggleVisuals();
            
            try {
                const response = await fetch(`/api/rss-weather?cityId=${cityId}`);
                if (!response.ok) throw new Error('伺服器回應錯誤');
                allForecasts = await response.json();
                if (!Array.isArray(allForecasts) || allForecasts.length === 0) throw new Error('資料格式不正確');
                renderWeather(0);
                if (allForecasts.length > 1) dayToggleButton.classList.remove('disabled');
            } catch (error) {
                weatherDisplay.innerHTML = `<p class="error">查詢失敗：${error.message}</p>`;
            }
        }

        async function fetchAndDisplayLegalNews() {
            try {
                const response = await fetch('/api/legal-news');
                if (!response.ok) throw new Error('無法載入新聞資料');
                const newsItems = await response.json();
                if (newsItems.length === 0) {
                    newsListContainer.innerHTML = '目前沒有相關的法律新聞。';
                    newsListContainer.classList.add('news-list-placeholder');
                    return;
                }
                const newsHtml = newsItems.map(item => `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-item">${item.title}</a>`).join('');
                newsListContainer.innerHTML = newsHtml;
                newsListContainer.classList.remove('news-list-placeholder');
            } catch (error) {
                console.error('獲取法律新聞失敗:', error);
                newsListContainer.innerHTML = '載入新聞時發生錯誤，請稍後再試。';
                newsListContainer.classList.add('news-list-placeholder');
                newsListContainer.style.color = 'red';
            }
        }

        dayToggleButton.addEventListener('click', () => {
            if (dayToggleButton.classList.contains('disabled')) return;
            currentDayIndex = 1 - currentDayIndex;
            renderWeather(currentDayIndex);
            updateToggleVisuals();
        });

        locationSelect.addEventListener('change', (event) => {
            fetchAndDisplayWeather(event.target.value);
        });

        // 頁面載入時，執行天氣和新聞的查詢
        fetchAndDisplayWeather(locationSelect.value);
        fetchAndDisplayLegalNews();
    }
    // ▲▲▲ 安全檢查結束 ▲▲▲


    // =================================================================
    // ==== 原有儀表板功能 (現在可以安全地執行，不受天氣功能影響) ====
    // =================================================================
    const searchForm = document.getElementById('google-search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const query = searchInput.value.trim();
            if (query === '') return;
            const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchURL, '_blank');
        });
    }

    const lawbankSearchForm = document.getElementById('lawbank-search-form');
    const lawbankSearchInput = document.getElementById('lawbank-search-input');
    if (lawbankSearchForm) {
        lawbankSearchForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const query = lawbankSearchInput.value.trim();
            if (query === '') return;
            const lawbankSearchURL = `https://six.lawbank.com.tw/Search/Result?keywords=${encodeURIComponent(query)}`;
            window.open(lawbankSearchURL, '_blank');
        });
    }

    const quickNavContainer = document.getElementById('quick-nav');
    const linkContainer = document.getElementById('link-container');
    if (quickNavContainer && linkContainer) {
        let quickNavHTML = '';
        let linksHTML = '';
        linkData.forEach((group, index) => {
            const groupId = `group-${index}`;
            quickNavHTML += `<a href="#${groupId}" class="quick-nav-tag">${group.groupName}</a>`;
            linksHTML += `<section id="${groupId}" class="link-group"><h2>${group.groupName}</h2><div class="grid-container">`;
            group.links.forEach(link => {
                const placeholderClass = link.status === 'placeholder' ? ' is-placeholder' : '';
                const formattedName = link.name.replace('(', '<br>(');
                linksHTML += `<a href="${link.url}" target="_blank" class="link-card${placeholderClass}" title="${link.name}"><div class="icon-container"><i class="${link.icon}"></i></div><p class="title">${formattedName}</p></a>`;
            });
            linksHTML += `</div></section>`;
        });
        quickNavContainer.innerHTML = quickNavHTML;
        linkContainer.innerHTML = linksHTML;
    }

    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('show', window.scrollY > 300);
        });
        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const floatingPanel = document.querySelector('.floating-panel');
    if (floatingPanel) {
        document.addEventListener('click', function(event) {
            if (window.innerWidth > 767) return;
            const isClickInsidePanel = floatingPanel.contains(event.target);
            const isPanelExpanded = floatingPanel.classList.contains('is-expanded');
            if (!isPanelExpanded && isClickInsidePanel) {
                event.preventDefault();
                floatingPanel.classList.add('is-expanded');
            } else if (isPanelExpanded && !isClickInsidePanel) {
                floatingPanel.classList.remove('is-expanded');
            }
        });
    }
});