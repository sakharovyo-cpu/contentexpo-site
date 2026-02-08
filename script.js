// Minimal JS: sticky topbar state, mobile menu, reveal animations, language switch, helper copy-to-clipboard.
(() => {
  const topbar = document.querySelector('.topbar');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const year = document.getElementById('year');
  const copyBtn = document.getElementById('copyBtn');
  const langSelect = document.getElementById('langSelect');

  const pageLang = (document.documentElement.lang || 'ru').toLowerCase();

  if (year) year.textContent = new Date().getFullYear();

  // Topbar scrolled state
  const onScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (burger && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };

    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  const supportedLangs = ['ru','en','zh','ar','tr','ko'];
  const langToFile = (val) => (val === 'ru') ? 'index.html' : ('index-' + val + '.html');

  // Default language is Russian. We also remember the user's last choice.
  const getSavedLang = () => {
    try {
      const v = (localStorage.getItem('lang') || '').toLowerCase();
      return supportedLangs.includes(v) ? v : null;
    } catch {
      return null;
    }
  };

  const setSavedLang = (val) => {
    try { localStorage.setItem('lang', val); } catch {}
  };

  const navigateToLang = (val) => {
    const hash = window.location.hash || '';
    const file = langToFile(val);

    // Keep the same folder (works for both http(s):// and file://)
    const parts = window.location.pathname.split('/');
    if (parts[parts.length - 1] === '') {
      parts[parts.length - 1] = file;
    } else {
      parts[parts.length - 1] = file;
    }
    const newPath = parts.join('/');

    window.location.href = newPath + hash;
  };

  const savedLang = getSavedLang();
  const defaultLang = 'ru';
  const targetLang = savedLang || defaultLang;

  // If the user has chosen a language before, open that language.
  // Otherwise, stay on Russian by default.
  // Force Russian on first visit (until the user explicitly switches).
  if (!savedLang && pageLang !== defaultLang) {
    navigateToLang(defaultLang);
    return;
  }

  if (savedLang && savedLang !== pageLang) {
    navigateToLang(savedLang);
    return;
  }

  // Language switch (separate HTML files)
  if (langSelect) {
    langSelect.value = pageLang || targetLang;

    langSelect.addEventListener('change', () => {
      const val = (langSelect.value || defaultLang).toLowerCase();
      setSavedLang(val);
      if (val !== pageLang) navigateToLang(val);
    });
  }

  // Reveal animations
  const els = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-visible'));
  }

  // Copy message helper (localized)
  const copyUi = {
    ru: { copied: 'Скопировано ✅', idle: 'Скопировать текст для сообщения' },
    en: { copied: 'Copied ✅', idle: 'Copy message template' },
    zh: { copied: '已复制 ✅', idle: '复制消息模板' },
    ar: { copied: 'تم النسخ ✅', idle: 'انسخ قالب الرسالة' },
    tr: { copied: 'Kopyalandı ✅', idle: 'Mesaj şablonunu kopyala' },
    ko: { copied: '복사됨 ✅', idle: '메시지 템플릿 복사' }
  };

  const templates = {
    ru: ({ name, contact, brief }) => `Привет! Меня зовут ${name || '…'}.\nКонтакт: ${contact || '…'}.\n\nЗадача:\n${brief || '…'}\n\nПлощадки/формат: …\nСроки: …\nБюджет/ориентир: …`,
    en: ({ name, contact, brief }) => `Hi! My name is ${name || '…'}.\nContact: ${contact || '…'}.\n\nBrief:\n${brief || '…'}\n\nPlatforms/format: …\nDeadline: …\nBudget: …`,
    zh: ({ name, contact, brief }) => `你好！我叫 ${name || '…'}。\n联系方式：${contact || '…'}。\n\n需求：\n${brief || '…'}\n\n发布平台/形式：…\n截止时间：…\n预算：…`,
    ar: ({ name, contact, brief }) => `مرحباً! اسمي ${name || '…'}.\nالتواصل: ${contact || '…'}.\n\nالملخص:\n${brief || '…'}\n\nالمنصات/الصيغة: …\nالموعد النهائي: …\nالميزانية: …`,
    tr: ({ name, contact, brief }) => `Merhaba! Ben ${name || '…'}.\nİletişim: ${contact || '…'}.\n\nBrief:\n${brief || '…'}\n\nPlatform/format: …\nTeslim tarihi: …\nBütçe: …`,
    ko: ({ name, contact, brief }) => `안녕하세요! ${name || '…'} 입니다.\n연락처: ${contact || '…'}.\n\n브리프:\n${brief || '…'}\n\n채널/포맷: …\n마감: …\n예산: …`
  };

  const ui = copyUi[pageLang] || copyUi.ru;
  const tpl = templates[pageLang] || templates.ru;

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const name = document.querySelector('input[name=\"name\"]')?.value?.trim() || '';
      const contact = document.querySelector('input[name=\"contact\"]')?.value?.trim() || '';
      const brief = document.querySelector('textarea[name=\"brief\"]')?.value?.trim() || '';

      const text = tpl({ name, contact, brief });

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      copyBtn.textContent = ui.copied;
      setTimeout(() => (copyBtn.textContent = ui.idle), 1800);
    });
  }

  // Portfolio: show first frame as preview + open video in fullscreen overlay on click.
  // If a video doesn't "подхватывается", common causes are:
  // - filename mismatch (must be assets/1.mp4, assets/2.mp4, assets/3.mp4)
  // - browser cache (hard refresh)
  // - unsupported codec (use H.264/AAC mp4)

  const workCards = Array.from(document.querySelectorAll('.work'));
  const workVideos = Array.from(document.querySelectorAll('.work__video'));

  const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const startPreview = async (v) => {
    if (!v) return;
    try { v.muted = true; } catch {}
    try { v.playsInline = true; } catch {}
    try { v.loop = true; } catch {}
    try { v.preload = 'auto'; } catch {}
    try { v.load(); } catch {}
    v.classList.add('is-previewing');
    await safePlay(v);
  };

  const stopPreview = (v, reset = true) => {
    if (!v) return;
    v.classList.remove('is-previewing');
    try { v.pause(); } catch {}
    try { v.loop = false; } catch {}
    if (reset) {
      try { v.currentTime = 0; } catch {}
    }
  };

  const stopAllPreviews = () => {
    workCards.forEach((c) => {
      const v = c.querySelector('.work__video');
      stopPreview(v);
      c.dataset.previewing = '0';
    });
  };


  // Create a single lightbox overlay (injected once)
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="Video">
      <button class="lightbox__close" type="button" aria-label="Close">×</button>
      <video class="lightbox__video" controls playsinline preload="auto"></video>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lbCloseBtn = lightbox.querySelector('.lightbox__close');
  const lbVideo = lightbox.querySelector('.lightbox__video');

  const safePlay = async (v) => {
    try {
      const p = v.play();
      if (p && typeof p.then === 'function') await p;
    } catch {
      // ignore autoplay/gesture/codec errors
    }
  };

  const openLightbox = async (src) => {
    if (!src) return;
    try { lbVideo.pause(); } catch {}
    lbVideo.removeAttribute('src');
    lbVideo.src = src;
    try { lbVideo.currentTime = 0; } catch {}
    try { lbVideo.load(); } catch {}

    lightbox.classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    // Try to enter fullscreen (best effort, varies by browser)
    try {
      if (lightbox.requestFullscreen) await lightbox.requestFullscreen();
      else if (lbVideo.requestFullscreen) await lbVideo.requestFullscreen();
      else if (lbVideo.webkitEnterFullscreen) lbVideo.webkitEnterFullscreen();
    } catch {
      // ignore fullscreen errors
    }

    // Start playback (user gesture: click)
    await safePlay(lbVideo);
    lbCloseBtn?.focus?.();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    try { lbVideo.pause(); } catch {}
    lbVideo.removeAttribute('src');
    try { lbVideo.load(); } catch {}

    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    } catch {}
  };

  lbCloseBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  // Make thumbnail show the first frame (lazy: only when near viewport)
  const primeFirstFrame = (v) => {
    if (!v || v.dataset.primed === '1') return;
    v.dataset.primed = '1';

    try { v.muted = true; } catch {}
    try { v.playsInline = true; } catch {}
    try { v.loop = false; } catch {}

    // Load enough data to render first frame
    try { v.preload = 'auto'; } catch {}
    try { v.load(); } catch {}

    // Some browsers won't paint the first frame unless play() is called (muted autoplay is allowed)
    const paint = async () => {
      try { v.currentTime = 0; } catch {}
      await safePlay(v);
      try { v.pause(); } catch {}
      try { v.currentTime = 0; } catch {}
    };

    // Wait a moment for data to be available
    setTimeout(paint, 80);
  };

  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          primeFirstFrame(entry.target);
          vio.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });

    workVideos.forEach(v => vio.observe(v));
  } else {
    workVideos.forEach(primeFirstFrame);
  }

  // Portfolio interactions
  // Desktop: hover plays muted loop preview; click opens fullscreen.
  // Mobile: first tap plays preview; second tap opens fullscreen.

  // Hover preview (desktop)
  if (canHover) {
    workCards.forEach((card) => {
      const video = card.querySelector('.work__video');
      card.addEventListener('mouseenter', () => startPreview(video));
      card.addEventListener('mouseleave', () => stopPreview(video));
      card.addEventListener('focusin', () => startPreview(video));
      card.addEventListener('focusout', () => stopPreview(video));
    });
  } else {
    // Stop previews when tapping outside portfolio
    document.addEventListener('pointerdown', (e) => {
      const inside = e.target && (e.target.closest && e.target.closest('.work'));
      const inLightbox = e.target && (e.target.closest && e.target.closest('.lightbox'));
      if (!inside && !inLightbox) stopAllPreviews();
    }, { passive: true });

    // Stop preview when card leaves viewport (mobile)
    if ('IntersectionObserver' in window) {
      const stopIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            const card = entry.target;
            const v = card.querySelector('.work__video');
            stopPreview(v);
            card.dataset.previewing = '0';
          }
        });
      }, { threshold: 0.0 });

      workCards.forEach((c) => stopIo.observe(c));
    }
  }

  // Click/tap behavior
  workCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const video = card.querySelector('.work__video');
      const src = video?.querySelector('source')?.getAttribute('src') || video?.currentSrc || '';
      if (!src) return;

      if (!canHover) {
        // On touch devices: first tap previews, second tap opens
        if (card.dataset.previewing !== '1') {
          e.preventDefault();
          stopAllPreviews();
          startPreview(video);
          card.dataset.previewing = '1';
          return;
        }
        // second tap
        card.dataset.previewing = '0';
        stopPreview(video, false);
      }

      e.preventDefault();
      openLightbox(src);
    });
  });
})();
