
// ======= partial loader (header/footer) =======
function loadPartial(selector, url){
  fetch(url, {cache: "no-store"})
    .then(r => {
      if(!r.ok) throw new Error('Partial not found');
      return r.text();
    })
    .then(html => {
      document.querySelector(selector).innerHTML = html;
      if(selector === '#header-placeholder') initHeader();
      // set footer year if footer loaded
      if(selector === '#footer-placeholder'){
        const yEl = document.getElementById('year');
        if(yEl) yEl.textContent = new Date().getFullYear();
      }
    })
    .catch(err => {
      console.warn('Partial load failed:', err);
      // fallback: insert minimal header/footer so site doesn't break
      if(selector === '#header-placeholder'){
        document.querySelector(selector).innerHTML = '<header class="site-header"><div class="wrap"><a class="logo" href="index.html">Composer</a></div></header>';
      }
    });
}

loadPartial('#header-placeholder','partials/header.html');
loadPartial('#footer-placeholder','partials/footer.html');


// ======= language =======

const REPO_NAME = window.location.pathname.split('/')[1];
const BASE_PATH = REPO_NAME && document.title !== 'Composer' ? `/${REPO_NAME}` : '';

const defaultLang = localStorage.getItem('lang') || 'ua'; // Використовуємо 'ua' (нижній регістр)


function applyLang(lang){
    
    const safeLang = lang.toLowerCase(); 
    
    // Використовуємо динамічний шлях: BASE_PATH + /lang/ + ua.json
    fetch(`${BASE_PATH}/lang/${safeLang}.json`, {cache: "no-store"}) 
    // ^^^ ВИПРАВЛЕНО: Додано BASE_PATH для коректного шляху на GitHub Pages
    
        .then(r => r.json())
        .then(dict => {
            document.querySelectorAll('[data-i18n]').forEach(el=>{
                const key = el.getAttribute('data-i18n');
                if(dict[key]) el.textContent = dict[key];
            });
            // Додатковий цикл для елементів по ID (залишаємо як було)
            for(const k in dict){
               const el = document.getElementById(k);
             // Уникаємо перезапису rotating-sub, оскільки його обробляє окрема функція
                if(el && k !== 'rotating-sub') el.textContent = dict[k];
            }
      
            // Запускаємо ротацію підзаголовків з новими словами
            startRotatingSubtitles(dict); 
            
            localStorage.setItem('lang', lang);
        })
        .catch((e)=>{ 
            console.error('Lang file not found or failed to parse:', e); 
        });
}

// ======= init header (menu + lang) =======
function initHeader(){
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if(menuToggle && nav){
    menuToggle.addEventListener('click', ()=>{
      nav.classList.toggle('open');
    });
    // close menu on click outside (mobile)
    document.addEventListener('click', (e)=>{
      if(!nav.contains(e.target) && !menuToggle.contains(e.target)){
        nav.classList.remove('open');
      }
    });
  }

  const ls = document.getElementById('lang-switch');
  if(ls){
    ls.value = localStorage.getItem('lang') || defaultLang;
    ls.addEventListener('change', e => applyLang(e.target.value));
  }
  // apply initial lang
  applyLang(localStorage.getItem('lang') || defaultLang);
}


// ======= Media embed loader with fallback =======
// usage: provide container with data attributes for youtube and soundcloud:
// <div id="media-block" data-youtube="VIDEO_OR_PLAYLIST_ID" data-sc="SOUNDCLOUD_URL"></div>

function loadMediaEmbeds() {
  document.querySelectorAll('[data-yt-id], [data-sc-url]').forEach(el=>{
    // YouTube embed
    const yt = el.getAttribute('data-yt-id');
    if(yt){
      // If looks like playlist (starts with PL) use listType=playlist
      let src;
      if(/^PL|^UU|^LL|^FL/.test(yt) || yt.includes('list=')) {
        // if full url passed, leave it
        if(yt.includes('http')) src = yt;
        else src = `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(yt)}`;
      } else {
        src = `https://www.youtube.com/embed/${encodeURIComponent(yt)}`;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'embed';
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.border = '0';
      // try to detect load failure — we use timeout as fallback
      let loaded = false;
      iframe.addEventListener('load', ()=> { loaded = true; });
      // append iframe
      wrapper.appendChild(iframe);

      // after 2s check if loaded; if not — show fallback
      setTimeout(()=>{
        if(!loaded){
          const link = document.createElement('a');
          link.href = `https://youtube.com/watch?v=${yt}`;
          link.target = '_blank';
          link.rel = 'noopener';
          link.className = 'btn';
          link.textContent = 'Відкрити на YouTube';
          // clear and show fallback
          wrapper.innerHTML = '';
          wrapper.appendChild(link);
        }
      }, 1800);

      el.appendChild(wrapper);
    }

    // SoundCloud embed
    const sc = el.getAttribute('data-sc-url');
    if(sc){
      const wrapperSc = document.createElement('div');
      wrapperSc.className = 'embed';
      // SoundCloud embed widget:
      const scIframe = document.createElement('iframe');
      // if user passed raw link or track id, accept link form
      const scUrl = sc.startsWith('http') ? sc : `https://soundcloud.com/${sc}`;
      // build player src
      scIframe.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(scUrl) + '&auto_play=false';
      scIframe.width = '100%';
      scIframe.height = '166';
      scIframe.scrolling = 'no';
      scIframe.frameBorder = 'no';
      scIframe.loading = 'lazy';
      let scLoaded = false;
      scIframe.addEventListener('load', ()=> scLoaded = true);
      wrapperSc.appendChild(scIframe);

      setTimeout(()=>{
        if(!scLoaded){
          const link = document.createElement('a');
          link.href = scUrl;
          link.target = '_blank';
          link.rel = 'noopener';
          link.className = 'btn';
          link.textContent = 'Відкрити на SoundCloud';
          wrapperSc.innerHTML = '';
          wrapperSc.appendChild(link);
        }
      }, 1800);

      el.appendChild(wrapperSc);
    }
  });
}

// Run media loader when DOM ready
document.addEventListener('DOMContentLoaded', loadMediaEmbeds);
// Also re-run after partials loaded (in case media block is inside page partial)
setTimeout(loadMediaEmbeds, 1000);




