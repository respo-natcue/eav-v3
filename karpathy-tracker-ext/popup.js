document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Fetch data
  fetchBlogs();
  fetchTweets();
});

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

async function fetchBlogs() {
  const container = document.getElementById('blog-list');
  const loading = document.querySelector('#blogs .loading-state');
  
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  if (!isExtension) {
      loading.style.display = 'none';
      const mockDate = new Date();
      container.innerHTML = `
        <a class="item-card" href="#" target="_blank">
          <h3 class="item-title">[Local Dev] The state of AI in 2026</h3>
          <p class="item-desc">A deep dive into the recent advancements in Large Language Models and their applications...</p>
          <div class="item-meta">
            <span class="item-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${timeAgo(mockDate)}
            </span>
          </div>
        </a>
      `;
      return;
  }

  try {
    const response = await fetch('https://karpathy.github.io/feed.xml');
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = xml.querySelectorAll('entry'); // atom feed uses <entry>
    
    loading.style.display = 'none';
    
    if (items.length === 0) {
        container.innerHTML = '<div class="error-message">No blog posts found.</div>';
        return;
    }

    // Process top 10 posts
    Array.from(items).slice(0, 10).forEach(item => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').getAttribute('href');
      const updated = new Date(item.querySelector('updated').textContent);
      const summaryNode = item.querySelector('summary') || item.querySelector('content');
      let summary = summaryNode ? summaryNode.textContent.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : 'No description available.';
      
      const card = document.createElement('a');
      card.className = 'item-card';
      card.href = link;
      card.target = '_blank';
      card.innerHTML = `
        <h3 class="item-title">${title}</h3>
        <p class="item-desc">${summary}</p>
        <div class="item-meta">
          <span class="item-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${timeAgo(updated)}
          </span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    loading.style.display = 'none';
    container.innerHTML = `<div class="error-message">Failed to load blogs.<br><small>${err.message}</small></div>`;
  }
}

async function fetchTweets() {
  const container = document.getElementById('tweet-list');
  const loading = document.querySelector('#x-posts .loading-state');
  
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  if (!isExtension) {
      loading.style.display = 'none';
      const mockDate = new Date();
      container.innerHTML = `
        <a class="item-card" href="#" target="_blank">
          <p class="tweet-text">[Local Dev] Just vibe coded a new project in 10 minutes using the latest tools. The future of software is incredible.</p>
          <div class="item-meta">
            <span class="item-date">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              ${timeAgo(mockDate)}
            </span>
            <span>❤️ 15.2K</span>
          </div>
        </a>
      `;
      return;
  }

  try {
    // using Twitter Syndication endpoint to bypass API requirements
    const response = await fetch('https://syndication.twitter.com/srv/timeline-profile/screen-name/karpathy');
    if (!response.ok) throw new Error('Syndication endpoint failed');
    const text = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const nextDataScript = doc.getElementById('__NEXT_DATA__');
    if (!nextDataScript) {
        throw new Error('Twitter data structure changed');
    }

    const jsonData = JSON.parse(nextDataScript.textContent);
    const entries = jsonData?.props?.pageProps?.timeline?.entries || [];
    
    loading.style.display = 'none';

    // filter only tweets, exclude cursors
    const tweets = entries.filter(e => e.type === 'tweet');

    if (tweets.length === 0) {
        container.innerHTML = '<div class="error-message">No recent X posts found.</div>';
        return;
    }

    tweets.forEach(entry => {
      const tweet = entry.content.tweet;
      const textContent = tweet.full_text;
      const date = new Date(tweet.created_at);
      const url = `https://x.com/karpathy/status/${tweet.id_str}`;
      
      // Handle media if present
      let mediaHtml = '';
      if (tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length > 0) {
        const media = tweet.extended_entities.media[0];
        if (media.type === 'photo') {
            mediaHtml = `<img class="tweet-media" src="${media.media_url_https}" alt="Tweet Image">`;
        }
      }

      const card = document.createElement('a');
      card.className = 'item-card';
      card.href = url;
      card.target = '_blank';
      card.innerHTML = `
        <p class="tweet-text">${formatTweetText(textContent)}</p>
        ${mediaHtml}
        <div class="item-meta">
          <span class="item-date">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
            ${timeAgo(date)}
          </span>
          <span>❤️ ${formatNumber(tweet.favorite_count)}</span>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    loading.style.display = 'none';
    container.innerHTML = `<div class="error-message">Failed to load X posts. This often happens if the alternative API is blocked.<br><small>${err.message}</small></div>`;
  }
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

function formatTweetText(text) {
  // basic parsing to remove some trailing pic.twitter links
  return text.replace(/https:\/\/t\.co\/[a-zA-Z0-9]+$/, '').trim();
}
