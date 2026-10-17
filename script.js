/* ── Hamburger Menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const overlay = document.getElementById('overlay');

function openMenu() {
  hamburger.classList.add('open');
  navLinks.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  if (navLinks.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});



overlay.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ── Contact Modal ── */
const modalOverlay = document.getElementById('contact-modal');
const heroContactBtn = document.getElementById('hero-contact-btn');
const modalClose = document.getElementById('modal-close');
const ctaContactBtn = document.getElementById('cta-contact-btn');

function openModal(e) {
  e.preventDefault();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

heroContactBtn.addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('cta').scrollIntoView({ behavior: 'smooth' });
});
ctaContactBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Scroll indicators (float and step through the sections) ── */
const scrollDownBtn = document.getElementById('scroll-down');
const scrollUpBtn = document.getElementById('scroll-up');
const scrollOrder = ['hero-section', 'about', 'projects', 'cta'];

function scrollSections() {
  return scrollOrder.map(id => document.getElementById(id)).filter(Boolean);
}

function currentSectionIndex() {
  const y = window.scrollY + window.innerHeight * 0.35;
  const els = scrollSections();
  let index = 0;
  els.forEach((el, i) => {
    if (el.offsetTop <= y) index = i;
  });
  return index;
}

function atPageBottom() {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
}

if (scrollDownBtn) {
  scrollDownBtn.addEventListener('click', () => {
    const els = scrollSections();
    const next = els[currentSectionIndex() + 1];
    if (next && !atPageBottom()) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (scrollUpBtn) {
  scrollUpBtn.addEventListener('click', () => {
    const els = scrollSections();
    const index = currentSectionIndex();
    if (index > 0 && window.scrollY > 2) els[index - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
}

/* ── Nav scrollspy (highlight the section in view) ── */
const navSections = [
  { id: 'hero-section', link: 'home-link' },
  { id: 'about', link: 'about-link' },
  { id: 'projects', link: 'projects-link' },
  { id: 'cta', link: 'contact-link' }
];

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navSections.forEach(item => {
        const link = document.getElementById(item.link);
        if (link) link.classList.toggle('active', item.id === entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  navSections.forEach(item => {
    const section = document.getElementById(item.id);
    if (section) navObserver.observe(section);
  });
}

/* ── Contact Form (client-side validation + SweetAlert) ── */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, key) {
  const errorEl = document.getElementById(input.id + '-error');
  if (errorEl) errorEl.textContent = translations[currentLang][key] || '';
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
}

function clearFieldError(input) {
  const errorEl = document.getElementById(input.id + '-error');
  if (errorEl) errorEl.textContent = '';
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
}

function validateForm() {
  let firstInvalid = null;

  if (!nameInput.value.trim()) {
    setFieldError(nameInput, 'form.errName');
    firstInvalid = firstInvalid || nameInput;
  } else {
    clearFieldError(nameInput);
  }

  if (!emailInput.value.trim()) {
    setFieldError(emailInput, 'form.errEmail');
    firstInvalid = firstInvalid || emailInput;
  } else if (!EMAIL_RE.test(emailInput.value.trim())) {
    setFieldError(emailInput, 'form.errInvalidEmail');
    firstInvalid = firstInvalid || emailInput;
  } else {
    clearFieldError(emailInput);
  }

  if (!messageInput.value.trim()) {
    setFieldError(messageInput, 'form.errMessage');
    firstInvalid = firstInvalid || messageInput;
  } else {
    clearFieldError(messageInput);
  }

  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

[nameInput, emailInput, messageInput].forEach(input => {
  input.addEventListener('input', () => {
    if (input.classList.contains('input-error')) clearFieldError(input);
  });
});

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/markus.sl@hotmail.com';

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  formStatus.textContent = '';

  if (!validateForm()) return;

  const honeypot = document.getElementById('company');
  if (honeypot && honeypot.value) return;

  const submitBtn = contactForm.querySelector('.submit-btn');
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = translations[currentLang]['modal.sending'];

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        _subject: 'New message from your portfolio',
        _template: 'table',
        _captcha: 'false'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== 'true') {
      throw new Error(data.message || 'Send failed');
    }

    contactForm.reset();
    closeModal();

    Swal.fire({
      icon: 'success',
      title: translations[currentLang]['form.successTitle'],
      text: translations[currentLang]['form.successText'],
      confirmButtonText: translations[currentLang]['form.successBtn'],
      buttonsStyling: false,
      customClass: {
        popup: 'swal-palette',
        confirmButton: 'swal-palette-btn',
        icon: 'swal-palette-icon'
      }
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: translations[currentLang]['form.errorTitle'],
      text: translations[currentLang]['form.errorText'],
      confirmButtonText: translations[currentLang]['form.errorBtn'],
      buttonsStyling: false,
      customClass: {
        popup: 'swal-palette',
        confirmButton: 'swal-palette-btn'
      }
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

/* ── 3D Carousel (Infinite Wrap, Equal Spacing) ── */
const stage = document.getElementById('carousel-stage');
const cards = stage.querySelectorAll('.carousel-card');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsContainer = document.getElementById('carousel-dots');
const numCards = cards.length;
const theta = 360 / numCards;

let cumulativeAngle = 0;
let currentIndex = 0;

let isDragging = false;
let startX = 0;
let startCumulative = 0;
let dragMoved = false;

function getRadius() {
  const w = cards[0].offsetWidth;
  // Phones use a tighter spacing so the neighbouring cards peek in more.
  const spread = window.matchMedia('(max-width: 768px)').matches ? 1.15 : 1.3; //change the multiplier for less or more space between cards
  return Math.round(((w / 2) / Math.tan(Math.PI / numCards)) * spread);
}

function initCarousel() {
  const radius = getRadius();
  cards.forEach((card, i) => {
    card.style.transform = `translate(-50%, -50%) rotateY(${i * theta}deg) translateZ(${radius}px)`;
  });
  goTo(0);
  sizeStage();
}

// Size the stage so the front card (scaled by perspective) is never clipped
function sizeStage() {
  const radius = getRadius();
  const perspective = 1200;
  const scale = perspective / (perspective - radius);
  let maxOff = 0;
  cards.forEach(card => { maxOff = Math.max(maxOff, card.offsetHeight); });
  stage.style.height = Math.ceil(maxOff * scale) + 'px';
}

function updateCards(index) {
  cards.forEach((card, i) => {
    let offset = (i - index + numCards) % numCards;
    if (offset > numCards / 2) offset -= numCards;
    const abs = Math.abs(offset);
    card.style.opacity = Math.max(0.05, 1 - abs * 0.22);
    card.style.zIndex = numCards * 10 - abs;
    card.style.pointerEvents = offset === 0 ? 'auto' : 'none';
  });
}

function goTo(index) {
  const targetAngle = -(index * theta);
  let delta = targetAngle - cumulativeAngle;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  cumulativeAngle += delta;
  currentIndex = ((index % numCards) + numCards) % numCards;
  stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
  updateCards(currentIndex);
  updateDots();
}

function updateDots() {
  const dots = dotsContainer.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

// ── Buttons (same direction always) ──
prevBtn.addEventListener('click', () => {
  cumulativeAngle += theta;
  currentIndex = ((currentIndex - 1) % numCards + numCards) % numCards;
  stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
  updateCards(currentIndex);
  updateDots();
});

nextBtn.addEventListener('click', () => {
  cumulativeAngle -= theta;
  currentIndex = (currentIndex + 1) % numCards;
  stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
  updateCards(currentIndex);
  updateDots();
});

// ── Dots ──
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.type = 'button';
  dot.setAttribute('aria-label', `Go to project ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

// ── Drag ──
function startDrag(e) {
  isDragging = true;
  startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  dragMoved = false;
  startCumulative = cumulativeAngle;
  stage.style.transition = 'none';
  cards.forEach(c => c.style.transition = 'none');
  if (e.type.includes('mouse')) e.preventDefault();
}

function onDrag(e) {
  if (!isDragging) return;
  const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  if (Math.abs(x - startX) > 5) dragMoved = true;
  const angle = startCumulative + (x - startX) * 0.18;
  stage.style.transform = `rotateY(${angle}deg)`;
  updateCards(Math.round(-angle / theta));
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  const m = stage.style.transform.match(/rotateY\(([-\d.]+)deg\)/);
  const current = m ? parseFloat(m[1]) : cumulativeAngle;
  const nearest = Math.round(-current / theta);
  const target = -(nearest * theta);
  cumulativeAngle = current + (target - current);
  currentIndex = ((nearest % numCards) + numCards) % numCards;
  cards.forEach(c => c.style.transition = '');
  stage.style.transition = '';
  stage.offsetHeight;
  stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
  updateCards(currentIndex);
  updateDots();
  dragJustEnded = dragMoved;
  setTimeout(() => { dragJustEnded = false; }, 350);
}

stage.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', onDrag);
document.addEventListener('mouseup', endDrag);

stage.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('touchmove', onDrag, { passive: false });
document.addEventListener('touchend', endDrag);

// ── Resize ──
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const radius = getRadius();
    cards.forEach((card, i) => {
      card.style.transform = `translate(-50%, -50%) rotateY(${i * theta}deg) translateZ(${radius}px)`;
    });
    sizeStage();
  }, 200);
});

initCarousel();

// Re-measure once fonts/images settle so the stage fits exactly
window.addEventListener('load', sizeStage);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(sizeStage);
}

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Card Audio Player (<audio> with volume control) ── */
const cardAudio = document.getElementById('card-audio');
cardAudio.volume = 0.3;

let dragJustEnded = false;
let activeCard = null;

cards.forEach(card => {
  const btn = card.querySelector('.card-player-btn');
  const bar = card.querySelector('.card-player-bar');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (dragJustEnded) return;
    const url = card.dataset.previewUrl;
    if (!url) return;

    if (activeCard === card && !cardAudio.paused) {
      cardAudio.pause();
      card.classList.remove('playing');
      btn.textContent = '\u25B6';
      activeCard = null;
      return;
    }

    if (activeCard) {
      activeCard.classList.remove('playing');
      const prevBtn = activeCard.querySelector('.card-player-btn');
      if (prevBtn) prevBtn.textContent = '\u25B6';
    }

    if (cardAudio.src !== url) {
      cardAudio.src = url;
    }
    cardAudio.currentTime = 0;
    cardAudio.play();
    card.classList.add('playing');
    btn.textContent = '\u23F8';
    activeCard = card;
  });

  cardAudio.addEventListener('timeupdate', function () {
    if (activeCard === card && cardAudio.duration) {
      const pct = (cardAudio.currentTime / cardAudio.duration) * 100;
      bar.style.width = pct + '%';
    }
  });

  cardAudio.addEventListener('ended', function () {
    if (activeCard === card) {
      card.classList.remove('playing');
      btn.textContent = '\u25B6';
      bar.style.width = '0';
      activeCard = null;
    }
  });
});

/* ── Typewriter (types hero description once) ── */
const typedText = document.getElementById('typed-text');
let currentLang = localStorage.getItem('lang') || 'sv';
let charIndex = 0;
let typeTimer = null;

const typedCursor = document.querySelector('.typed-cursor');

function typeOnce() {
  const text = translations[currentLang]['hero.desc'];
  if (charIndex < text.length) {
    typedText.textContent += text[charIndex];
    charIndex++;
    typeTimer = setTimeout(typeOnce, 10 + Math.random() * 10);
  } else {
    typedCursor.style.display = 'none';
  }
}

function resetTypewriter() {
  clearTimeout(typeTimer);
  typedText.textContent = '';
  charIndex = 0;
  typedCursor.style.display = '';
  typeOnce();
}

/* ── Language Translator EN/SV ── */
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.theme': 'Theme',
    'hero.name': 'Markus Sundvall',
    'hero.desc': 'My name is Markus and I believe that music making should be inspiring, rewarding and fun. If you agree and are looking for a creative partner, then you have come to the right place!',
    'hero.btn': 'Get in touch',
    'hero.tagline': 'Music Producer',
    'hero.scroll': 'Scroll down',
    'hero.scrollUp': 'Scroll up',
    'about.title': 'About Me',
    'about.p1': 'My name is Markus Sundvall and im a music producer based in Stockholm. \nI found my passion for music production in my teens, where Avicii and Martin Garrix became my biggest role models. Since then, I have spent many hours in various studios, completed a Bachelor of Arts degree in music production, and traveled to London and Barcelona to work with artists and songwriters.',
    'about.p2': 'When it comes to recording instruments, I am independent, playing saxophone, guitar, and piano. Therefore, I have a great opportunity to help you achieve your vision, from the first demo to a finished song ready for release. I look forward to hearing more about your project!',
    'studio.title': 'The Studio',
    'studio.p1': 'My studio is located in the Östermalm district of Stockholm. It is part of the studio collective Tropikal Studios on Skeppargatan.',
    'studio.p2': 'The space is fully equipped for professional music production and includes a sofa—perfect for long, relaxed sessions in the studio.',
    'studio.p3': 'You are more than welcome to drop by!',
    'tag-production': 'Production',
    'tag-mixing': 'Mixing',
    'tag-mastering': 'Mastering',
    'tag-songwriting': 'Songwriting',
    'tag-co-production': 'Co-production',
    'tag-saxophone': 'Saxophone',
    'tag-recording': 'Recording',
    'tag-live': 'Live',
    'card.desc': 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    'card.desc0': 'An Avicii-inspired pop song I wrote together with the artist Thornberg in a session.',
    'card.desc1': 'I was honored by the sibling duo Anna and Marcus Claesson to produce this beautiful and well-written song for their artist project.',
    'card.desc2': 'A Robyn-inspired song I produced in London together with the artist Josefine and another producer.',
    'card.desc3': 'With this song, I and the artist Måns won P4 Nästa Stjärna Göteborg 2025.',
    'card.desc4': 'An 80s-inspired song in the Synthwave genre, from my own artist project Sidelake 85.',
    'card.desc5': 'A Scandipop song I produced in London together with the artist Josefine and another producer.',
    'projects.title': 'Previous work',
    'projects.sub': 'Spin through some of my selected songs',
    'cta.title': "Let's Create Something Together",
    'cta.desc': "Got a track, an idea, or a vision? I'd love to hear about it.",
    'cta.btn': 'Contact me',
    'footer.copy': '© 2026 Markus Sundvall. All rights reserved.',
    'projects.moreText': 'Wanna hear more? Check out the rest of my projects.',
    'projects.moreBtn': 'Explore more',
    'pl.title': 'All projects',
    'pl.sub': 'Produced & mixed by Markus Sundvall',
    'pl.song': 'Song',
    'pl.artist': 'Artist',
    'pl.album': 'Album',
    'pl.length': 'Length',
    'pl.preview': 'Preview',
    'pl.play': 'Play preview',
    'pl.openSpotify': 'Open the full playlist on Spotify',
    'modal.title': 'Get in Touch',
    'modal.sub': "Have a project in mind? Let's talk.",
    'modal.name': 'Your Name',
    'modal.email': 'Your Email',
    'modal.msg': 'Your Message',
    'modal.send': 'Send Message',
    'modal.privacy': 'Your name, email and message are only used to reply to your enquiry.',
    'modal.sending': 'Sending...',
    'form.errName': 'Please enter your name.',
    'form.errEmail': 'Please enter your email address.',
    'form.errInvalidEmail': 'Please enter a valid email address.',
    'form.errMessage': 'Please write a message.',
    'form.successTitle': 'Message sent!',
    'form.successText': "Thanks for reaching out. I'll get back to you soon.",
    'form.successBtn': 'Great, thanks!',
    'form.errorTitle': 'Oops...',
    'form.errorText': "Something went wrong and your message couldn't be sent. Please try again, or email me directly at markus.sl@hotmail.com.",
    'form.errorBtn': 'Close',
  },
  sv: {
    'nav.home': 'Hem',
    'nav.about': 'Om mig',
    'nav.projects': 'Projekt',
    'nav.contact': 'Kontakt',
    'nav.theme': 'Tema',
    'hero.name': 'Markus Sundvall',
    'hero.desc': 'Jag heter Markus och tycker att musikskapande ska vara inspirerande, givande och roligt. Om du håller med och letar efter en kreativ partner, då har du kommit rätt!',
    'hero.btn': 'Hör av dig',
    'hero.tagline': 'Musikproducent',
    'hero.scroll': 'Scrolla ner',
    'hero.scrollUp': 'Scrolla upp',
    'about.title': 'Om mig',
    'about.p1': 'Jag heter Markus Sundvall och är en musikproducent baserad i Stockholm. \nJag fann mitt passion för musikproduktion i tonåren, där Avicii och Martin Garrix blev mina största förebilder. Sedan dess har jag tillbringat många timmar i olika studior, slutfört en kandidatexamen i musikproduktion och rest till London och Barcelona för att arbeta med artister och låtskrivare.',
    'about.p2': 'När det gäller inspelning av instrument är jag självständig och spelar saxofon, gitarr och piano. Därför har jag en utmärkt möjlighet att hjälpa dig förverkliga din vision, från första demon till en färdig låt redo för release. Jag ser fram emot att höra mer om ditt projekt!',
    'studio.title': 'Studion',
    'studio.p1': ' På Östermalm i Stockholm har jag min studio. Lokalen är en del av studiokollektivet Tropikal Studios på Skeppargatan.',
    'studio.p2': 'Studion är redo för professionell musikproduktion och i rummet finns även en soffa som bjuder in till härliga och långa studiohäng.',
    'studio.p3': 'Du är varmt välkommen att svänga förbi!',
    'tag-production': 'Produktion',
    'tag-mixing': 'Mixning',
    'tag-mastering': 'Mastring',
    'tag-songwriting': 'Låtskrivning',
    'tag-co-production': 'Co-produktion',
    'tag-saxophone': 'Saxofon',
    'tag-recording': 'Inspelning',
    'tag-live': 'Live',
    'card.desc': 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    'card.desc0': 'En Avicii-inspirerad poplåt jag skrev tillsammans med artisten Thornberg under en session.',
    'card.desc1': 'Jag fick äran av syskonparet Anna och Marcus Claesson att producera den här fina och välskrivna låten till deras artistprojekt.',
    'card.desc2': 'En Robyn-inspirerad låt jag producerade i London tillsammans med artisten Josefine och en annan producent.',
    'card.desc3': 'Med den här låten vann jag och artisten Måns P4 Nästa Stjärna Göteborg 2025.',
    'card.desc4': 'En 80-talsinspirerad låt i genren Synthwave i det egna artistprojekt Sidelake 85.',
    'card.desc5': 'En Scandipoplåt jag producerade i London tillsammans med artisten Josefine och en annan producent.',
    'projects.title': 'Mina utvalda låtar',
    'projects.sub': 'Snurra dig genom min karriär hittils',
    'cta.title': 'Låt oss skapa något tillsammans',
    'cta.desc': 'Har du en låt, en idé eller en vision? Jag vill gärna höra om den.',
    'cta.btn': 'Kontakta mig',
    'footer.copy': '© 2026 Markus Sundvall. Alla rättigheter förbehållna.',
    'projects.moreText': 'Vill du höra mer? Kolla in resten av mina projekt.',
    'projects.moreBtn': 'Utforska mer',
    'pl.title': 'Alla projekt',
    'pl.sub': 'Producerat & mixat av Markus Sundvall',
    'pl.song': 'Låt',
    'pl.artist': 'Artist',
    'pl.album': 'Album',
    'pl.length': 'Längd',
    'pl.preview': 'Förhandslyssna',
    'pl.play': 'Spela förhandslyssning',
    'pl.openSpotify': 'Öppna hela spellistan på Spotify',
    'modal.title': 'Kontakta mig',
    'modal.sub': 'Har du ett projekt i åtanke? Låt oss prata.',
    'modal.name': 'Ditt namn',
    'modal.email': 'Din e-post',
    'modal.msg': 'Ditt meddelande',
    'modal.send': 'Skicka meddelande',
    'modal.privacy': 'Ditt namn, e-post och meddelande används endast för att svara på din förfrågan.',
    'modal.sending': 'Skickar...',
    'form.errName': 'Vänligen ange ditt namn.',
    'form.errEmail': 'Vänligen ange din e-postadress.',
    'form.errInvalidEmail': 'Vänligen ange en giltig e-postadress.',
    'form.errMessage': 'Vänligen skriv ett meddelande.',
    'form.successTitle': 'Meddelande skickat!',
    'form.successText': 'Tack för att du hör av dig. Jag återkommer till dig snart.',
    'form.successBtn': 'Toppen, tack!',
    'form.errorTitle': 'Hoppsan...',
    'form.errorText': 'Något gick fel och ditt meddelande kunde inte skickas. Försök igen, eller mejla mig direkt på markus.sl@hotmail.com.',
    'form.errorBtn': 'Stäng',
  }
};

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  document.querySelectorAll('.lang-flag').forEach(flag => {
    flag.classList.toggle('active', flag.dataset.lang === lang);
  });

  resetTypewriter();
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  setLanguage(currentLang === 'en' ? 'sv' : 'en');
});

setLanguage(currentLang);

/* ── Theme toggle (light / dark) ── */
const themeToggle = document.getElementById('theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const logoImage= document.querySelector(".logo");
let currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

function applyTheme(theme, persist) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) {
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#071622' : '#184e77');
  if(theme==='light') {

    logoImage.src="/logos/Logo-3.png";
    
  }
  else {
    logoImage.src="/logos/Logo-3-Darkmode.png";
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
  });
}

applyTheme(currentTheme, false);

/* ── Navbar shadow once the page is scrolled ── */
const navEl = document.querySelector('nav');
if (navEl) {
  const onNavScroll = () => navEl.classList.toggle('nav-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

/* ── Card covers (lazy: only fetch when the projects section scrolls into view) ── */
const projectCards = document.querySelectorAll('.carousel-card');

function loadCardCover(card) {
  const spotifyUrl = card.dataset.spotifyUrl;
  const coverFallback = card.dataset.coverUrl;
  const playerBg = card.querySelector('.card-player-bg');
  if (!playerBg) return;

  function setCover(url) {
    playerBg.style.backgroundImage = `
      linear-gradient(135deg, rgba(24,78,119,0.85), rgba(26,117,159,0.65)),
      url(${url})
    `;
  }

  if (spotifyUrl) {
    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`)
      .then(res => {
        if (!res.ok) throw new Error('OEmbed failed');
        return res.json();
      })
      .then(data => {
        if (data.thumbnail_url) setCover(data.thumbnail_url);
        else if (coverFallback) setCover(coverFallback);
      })
      .catch(() => {
        if (coverFallback) setCover(coverFallback);
      });
  } else if (coverFallback) {
    setCover(coverFallback);
  }
}

const projectsSection = document.getElementById('projects');
if (projectsSection && 'IntersectionObserver' in window) {
  const coverObserver = new IntersectionObserver((entries, obs) => {
    if (entries.some(entry => entry.isIntersecting)) {
      projectCards.forEach(loadCardCover);
      obs.disconnect();
    }
  }, { rootMargin: '200px' });
  coverObserver.observe(projectsSection);
} else {
  projectCards.forEach(loadCardCover);
}

/* ── Playlist modal ("See all songs" table) ── */
const playlistTracks = [
  { title: 'Out of Control', artist: 'Thornberg', album: 'Cycles', length: '2:28', preview: 'https://p.scdn.co/mp3-preview/3519b2d5bb64ee3b92a871618de6c4109f89944b' },
  { title: 'Första åren av mitt liv', artist: 'Mackan n Matthew', album: 'Första åren av mitt liv', length: '3:03', preview: 'https://p.scdn.co/mp3-preview/b6547cc9f3737121e45eb136159eec610307a05c' },
  { title: 'Romantic Comedies', artist: 'Josefine Ridell', album: 'Romantic Comedies', length: '2:48', preview: 'https://p.scdn.co/mp3-preview/0a84d1affa36da35caeec515c9e4081905175bb1' },
  { title: 'Nobody But You', artist: 'Josefine Ridell', album: 'Nobody But You', length: '2:57', preview: 'https://p.scdn.co/mp3-preview/29a127c31d24a9ea143453a65283e0cceb9e5d6a' },
  { title: 'Signaler och Substanser', artist: 'Mackan n Matthew', album: 'Signaler och Substanser', length: '3:18', preview: 'https://p.scdn.co/mp3-preview/1824eadf1b767d8edfa1fc9870a6ff4134a3b3a6' },
  { title: 'Slow', artist: 'Josefine Ridell', album: 'Slow', length: '3:03', preview: 'https://p.scdn.co/mp3-preview/b30e1f0123c24cc21b59f6c4c1242434a0398a9e' },
  { title: 'Kvällarna vi minns', artist: 'Måns Holmgren', album: 'Kvällarna vi minns', length: '3:44', preview: 'https://p.scdn.co/mp3-preview/9b384f021881b02175b4bb7e400b6ba99aa40d71' },
  { title: 'Moving On', artist: 'Josefine Ridell', album: 'Moving On', length: '3:00', preview: 'https://p.scdn.co/mp3-preview/1a504d22adf5324bace9bf89a5854d473ae78184' },
  { title: 'Keep My Head Up High', artist: 'Thornberg', album: 'Cycles', length: '3:45', preview: 'https://p.scdn.co/mp3-preview/9d44f8be2ef299302dd3185dcd3b3c32899acce6' },
  { title: 'Belong', artist: 'Thornberg', album: 'Cycles', length: '3:00', preview: 'https://p.scdn.co/mp3-preview/c58b8ef7a9f43e3d43f1e41f7fba666478e59248' },
  { title: 'Light in the Distance', artist: 'Thornberg', album: 'Light in the Distance', length: '3:16', preview: 'https://p.scdn.co/mp3-preview/2ffbbce5688a003170abb472dd065f5f73b9e58e' },
  { title: 'Autumn Drive', artist: 'Sidelake 85', album: 'Autumn Drive', length: '4:56', preview: 'https://p.scdn.co/mp3-preview/b2c47f5fdffdf224909bf9cb7f8409df705c73c2' },
  { title: 'Lost in Magenta', artist: 'Sidelake 85', album: 'Lost in Magenta', length: '4:29', preview: 'https://p.scdn.co/mp3-preview/8cf7d2867ea73e10c0203019c36f9d345bccaeed' }
];

const playlistModal = document.getElementById('playlist-modal');
const playlistBtn = document.getElementById('playlist-btn');
const playlistClose = document.getElementById('playlist-close');
const playlistBody = document.getElementById('pl-tbody');

const previewAudio = new Audio();
previewAudio.volume = 0.6;
let previewBtn = null;

function stopPreview() {
  previewAudio.pause();
  if (previewBtn) {
    previewBtn.textContent = '\u25B6';
    previewBtn.classList.remove('playing');
  }
  previewBtn = null;
}

function openPlaylistModal(e) {
  if (e) e.preventDefault();
  playlistModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlaylistModal() {
  playlistModal.classList.remove('open');
  document.body.style.overflow = '';
  stopPreview();
}

function togglePreview(btn) {
  const url = btn.dataset.preview;
  if (!url) return;

  if (btn === previewBtn && !previewAudio.paused) {
    stopPreview();
    return;
  }
  if (previewBtn) {
    previewBtn.textContent = '\u25B6';
    previewBtn.classList.remove('playing');
  }
  previewAudio.src = url;
  previewAudio.currentTime = 0;
  previewAudio.play();
  btn.textContent = '\u23F8';
  btn.classList.add('playing');
  previewBtn = btn;
}

if (playlistModal && playlistBtn && playlistBody) {
  const playLabel = translations[currentLang]['pl.play'];

  playlistBody.innerHTML = playlistTracks.map(track => `
    <tr data-preview="${track.preview}">
      <td>
        <button class="pl-play" type="button" data-preview="${track.preview}" aria-label="${playLabel}: ${track.title}">&#9654;</button>
      </td>
      <td class="pl-song">${track.title}</td>
      <td class="pl-artist">${track.artist}</td>
      <td class="pl-album">${track.album}</td>
      <td class="pl-length">${track.length}</td>
    </tr>
  `).join('');

  playlistBody.addEventListener('click', e => {
    const btn = e.target.closest('.pl-play');
    if (btn) togglePreview(btn);
  });

  playlistBody.addEventListener('dblclick', e => {
    if (e.target.closest('.pl-play')) return;
    const row = e.target.closest('tr[data-preview]');
    if (!row) return;
    const btn = row.querySelector('.pl-play');
    if (btn) togglePreview(btn);
  });

  previewAudio.addEventListener('ended', stopPreview);

  playlistBtn.addEventListener('click', openPlaylistModal);
  playlistClose.addEventListener('click', closePlaylistModal);
  playlistModal.addEventListener('click', e => {
    if (e.target === playlistModal) closePlaylistModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlaylistModal();
  });
}
