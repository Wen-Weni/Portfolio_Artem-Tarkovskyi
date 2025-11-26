// Просте завантаження header & footer
function loadPartial(selector, url){
    fetch(url)
      .then(r => r.text())
      .then(html => {
        document.querySelector(selector).innerHTML = html;
        // після вставки ініціалізація локальної логіки, наприклад перемикання мови
        if(selector === '#header-placeholder') initHeader();
      })
      .catch(err => console.warn('Partial load failed:', err));
  }
  
  loadPartial('#header-placeholder','partials/header.html');
  loadPartial('#footer-placeholder','partials/footer.html');
  
  // LANGUAGE
  const defaultLang = localStorage.getItem('lang') || 'ua';
  const langSelect = () => document.getElementById('lang-switch');
  
  function applyLang(lang){
    fetch(`/lang/${lang}.json`)
      .then(r => r.json())
      .then(dict => {
        document.querySelectorAll('[data-i18n]').forEach(el=>{
          const key = el.getAttribute('data-i18n');
          if(dict[key]) el.textContent = dict[key];
        });
        // also set IDs keys
        for(const k in dict){
          const el = document.getElementById(k);
          if(el) el.textContent = dict[k];
        }
        localStorage.setItem('lang', lang);
      });
  }
  
  // init header actions (called after header partial loaded)
  function initHeader(){
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.main-nav');
    if(menuToggle){
      menuToggle.addEventListener('click', ()=> nav.classList.toggle('open'));
    }
  
    const ls = document.getElementById('lang-switch');
    if(ls){
      ls.value = localStorage.getItem('lang') || defaultLang;
      ls.addEventListener('change', e => applyLang(e.target.value));
    }
  
    // set current year in footer if available
    const year = new Date().getFullYear();
    const yEl = document.getElementById('year');
    if(yEl) yEl.textContent = year;
  }
  
  // apply initial language
  applyLang(defaultLang);
  
  // example contact form handler (static site can use Formspree or Netlify forms)
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      alert('Функціонал відправки форми не підключено. Використайте Formspree або Netlify Forms для production.');
    });
  }
  