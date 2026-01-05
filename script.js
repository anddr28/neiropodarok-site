// script.js — fixes: remove underline/glow behavior and add to-top button + VK/telegram behavior

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // if mobile nav open, close it
        const nav = document.querySelector('.nav');
        if (nav && nav.classList.contains('mobile-open')) nav.classList.remove('mobile-open');
      }
    });
  });

  // Header shadow on scroll
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 18 ? '0 14px 50px rgba(178,122,255,0.06)' : '';
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const nav = document.querySelector('.nav');
  mobileToggle && mobileToggle.addEventListener('click', () => {
    if (!nav) return;
    const open = nav.classList.toggle('mobile-open');
    mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Custom select component (same logic as before)
  document.querySelectorAll('.custom-select').forEach(cs => {
    const trigger = cs.querySelector('.cs-trigger');
    const options = cs.querySelectorAll('.cs-options li');
    const hidden = cs.querySelector('input[type="hidden"]');

    const toggle = (to) => {
      if (to === undefined) cs.classList.toggle('open');
      else if (to) cs.classList.add('open');
      else cs.classList.remove('open');
      cs.setAttribute('aria-expanded', cs.classList.contains('open') ? 'true' : 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    cs.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape') toggle(false);
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const v = opt.dataset.value;
        trigger.textContent = v;
        hidden.value = v;
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        toggle(false);
        trigger.focus();
      });
    });

    document.addEventListener('click', (e) => {
      if (!cs.contains(e.target)) toggle(false);
    });
  });

  // Reveal on scroll (IntersectionObserver)
  const revealTargets = document.querySelectorAll('[data-reveal], .why-card, .neon-step, .example-card, .neon-panel, .order-form, .section-title');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(t => io.observe(t));

  // Modal video
  const modal = document.getElementById('previewModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalCloseArea = document.getElementById('modalClose');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    try {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.querySelector('source').src = '';
      modalVideo.load();
    } catch (e) {}
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.play').forEach(btn => {
    btn.addEventListener('click', () => {
      const videoSrc = btn.dataset.video;
      if (!videoSrc) {
        alert('Видео не найдено. Положите файл в /images и укажите путь в data-video.');
        return;
      }
      const sourceEl = modalVideo.querySelector('source');
      sourceEl.src = videoSrc;
      modalVideo.load();
      modalVideo.play().catch(()=>{});
      openModal();
    });
  });

  modalCloseArea.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Accordion
  document.querySelectorAll('.acc-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const content = parent.querySelector('.acc-a');
      const isOpen = getComputedStyle(content).display === 'block';
      document.querySelectorAll('.acc-a').forEach(a => { a.style.display = 'none'; });
      content.style.display = isOpen ? 'none' : 'block';
    });
  });

  // Counter for textarea
  const textarea = document.querySelector('textarea[name="message"]');
  const charCount = document.getElementById('charCount');
  if (textarea && charCount) {
    const update = () => charCount.textContent = `${textarea.value.length}/300`;
    textarea.addEventListener('input', update);
    update();
  }

  // Form handling + validation
  const form = document.getElementById('orderForm');
  const toast = document.getElementById('toast');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    let ok = true;
    ['recipient','event','message','character','contact'].forEach(name => {
      const v = data.get(name);
      if (!v || v.toString().trim() === '') ok = false;
    });
    if (!form.elements['agree'].checked) ok = false;
    if (!ok) { showToast('Пожалуйста, заполните все поля.', true); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    const prevText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Создаём...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
      form.reset();
      // reset custom select UI
      document.querySelectorAll('.custom-select').forEach(cs => {
        const trigger = cs.querySelector('.cs-trigger');
        const hidden = cs.querySelector('input[type="hidden"]');
        trigger.textContent = 'Выберите событие';
        hidden.value = '';
        cs.querySelectorAll('.cs-options li').forEach(li => li.classList.remove('active'));
      });
      if (textarea) charCount.textContent = '0/300';
      showToast('Заявка принята! Мы уже создаём ваше видео 🚀', false);
    }, 1500);
  });

  function showToast(msg, isError=false) {
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    toast.style.background = isError ? 'linear-gradient(90deg,#ff6b6b,#ff9aa2)' : 'linear-gradient(90deg,var(--neon-cyan),var(--neon-blue))';
    setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=> toast.style.display='none', 350); }, 3000);
  }

  // Demo button scroll
  const demoBtn = document.getElementById('demoBtn');
  demoBtn && demoBtn.addEventListener('click', () => {
    const examples = document.getElementById('examples');
    if (examples) examples.scrollIntoView({ behavior: 'smooth' });
  });

  // TO TOP button
  const toTop = document.getElementById('toTop');
  function checkToTop() {
    if (window.scrollY > 360) {
      toTop.classList.add('show');
      toTop.classList.remove('hide');
    } else {
      toTop.classList.remove('show');
      toTop.classList.add('hide');
    }
  }
  window.addEventListener('scroll', checkToTop);
  checkToTop();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // when clicking nav link on mobile, close menu
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('mobile-open')) nav.classList.remove('mobile-open');
    });
  });

  // set footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
