'use client';

import { useState, useEffect } from 'react';
import { Lunar } from 'lunar-javascript';

export default function Home() {
  // --- 状态管理 ---
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [lunarDate, setLunarDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [links, setLinks] = useState([]);
  
  // 搜索引擎状态
  const [engines, setEngines] = useState([]);
  const [currentEngine, setCurrentEngine] = useState({ name: '百度', url: 'https://www.baidu.com/s?wd=' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- 初始化逻辑 ---
  useEffect(() => {
    // 1. 读取导航链接
    const envLinks = process.env.NEXT_PUBLIC_NAV_LINKS;
    if (envLinks) {
      try { setLinks(JSON.parse(envLinks)); } catch (e) { console.error("导航链接解析失败", e); }
    } else {
      setLinks([{ name: '演示-淘宝', url: 'https://www.taobao.com' }]);
    }

    // 2. 读取搜索引擎 (内置默认值)
    const envEngines = process.env.NEXT_PUBLIC_SEARCH_ENGINES;
    let loadedEngines = [
      { name: '百度', url: 'https://www.baidu.com/s?wd=' },
      { name: 'Google', url: 'https://www.google.com/search?q=' },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
      { name: '必应', url: 'https://www.bing.com/search?q=' },
      { name: '360', url: 'https://www.so.com/s?q=' },
      { name: '搜狗', url: 'https://www.sogou.com/web?query=' },
    ];

    if (envEngines) {
      try {
        const parsedEngines = JSON.parse(envEngines);
        if (parsedEngines.length > 0) loadedEngines = parsedEngines;
      } catch (e) {
        console.error("搜索引擎配置解析失败", e);
      }
    }
    setEngines(loadedEngines);
    setCurrentEngine(loadedEngines[0]);

    // 3. 时间更新
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'long' }));
      const lunar = Lunar.fromDate(now);
      setLunarDate(`农历 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 事件处理 ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `${currentEngine.url}${encodeURIComponent(searchQuery)}`;
  };

  return (
    <main className="relative w-full h-screen overflow-hidden text-white font-sans">
      
      {/* 背景视频 */}
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
        <source src="/background/cat.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-10 pointer-events-none" />

      {/* --- 全屏透明遮罩 (仅在菜单打开时显示，用于点击空白处关闭菜单) --- */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsDropdownOpen(false)} 
        />
      )}

      {/* 主体内容 */}
      {/* 修改点：这里使用了 pt-44 (176px)，如果你觉得不够低，可以改用自定义写法 pt-[200px] */}
      <div className="relative z-20 flex flex-col items-center pt-44 h-full w-full px-4">
        
        {/* 时钟 */}
        <div className="flex items-end gap-3 mb-8 drop-shadow-md select-none">
          <h1 className="text-7xl font-light tracking-wide">{time}</h1>
          <div className="flex flex-col text-sm font-medium opacity-90 pb-2 gap-1">
            <span>{date}</span>
            <span className="text-xs opacity-70 tracking-wider">{lunarDate}</span>
          </div>
        </div>

        {/* 搜索框容器 */}
        {/* 注意：z-50 确保它在遮罩层之上 */}
        <form onSubmit={handleSearch} className="w-full max-w-xl relative z-50">
          <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full h-12 px-2 shadow-lg transition-all duration-300 hover:bg-white">
            
            {/* 搜索引擎选择器按钮 */}
            <div 
              className="pl-4 pr-3 flex items-center gap-1 cursor-pointer border-r border-gray-300/50 h-3/5 hover:opacity-70 transition-opacity"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-gray-600 text-sm font-bold select-none whitespace-nowrap min-w-[3em] text-center">
                {currentEngine.name}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* 下拉菜单 */}
            {isDropdownOpen && (
              <div className="absolute top-14 left-0 w-36 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden py-2 z-50">
                {engines.map((engine, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentEngine(engine);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      px-4 py-2.5 text-sm text-gray-700 cursor-pointer transition-colors font-medium
                      hover:bg-blue-500 hover:text-white
                      ${currentEngine.name === engine.name ? 'text-blue-600 bg-blue-50' : ''}
                    `}
                  >
                    {engine.name}
                  </div>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm h-full px-3"
              autoFocus
            />

            {/* 搜索按钮 */}
            <button 
              type="submit" 
              className="h-9 w-9 bg-[#2c2c2c] rounded-full flex items-center justify-center hover:bg-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 底部导航 */}
      <div className="absolute bottom-0 w-full z-30 pb-8 sm:pb-12">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-300/20 to-transparent pointer-events-none" />
        <div className="relative flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-sm sm:text-base font-medium text-white/90 tracking-wider 
                px-4 py-2 rounded-full transition-all duration-200
                hover:bg-white/20 hover:text-white hover:backdrop-blur-sm
              "
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
