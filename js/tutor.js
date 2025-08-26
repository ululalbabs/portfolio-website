document.addEventListener('DOMContentLoaded', () => {
  /* DROPDOWN: #customDropdown */
  (function initDropdown() {
    const dropdown = document.getElementById('customDropdown');
    if (!dropdown) return;

    const btn = dropdown.querySelector('.dropdown-btn');
    const list = dropdown.querySelector('.dropdown-list');
    if (!btn || !list) return;

    // ensure an id for aria-controls
    if (!list.id) list.id = `dropdown-list-${Math.random().toString(36).slice(2,8)}`;
    btn.setAttribute('aria-controls', list.id);
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');

    const options = Array.from(list.querySelectorAll('li'));
    if (!options.length) return;

    // normalize options
    options.forEach((opt) => {
      if (!opt.hasAttribute('role')) opt.setAttribute('role', 'option');
      if (!opt.hasAttribute('tabindex')) opt.setAttribute('tabindex', '-1');
      if (!opt.hasAttribute('aria-selected')) opt.setAttribute('aria-selected', 'false');
    });

    // initial selected
    let selectedIndex = options.findIndex(o => o.getAttribute('aria-selected') === 'true');
    if (selectedIndex < 0) selectedIndex = 0;

    const labelEl = btn.querySelector('.label');
    if (labelEl && options[selectedIndex]) {
      labelEl.textContent = options[selectedIndex].textContent.trim();
      options[selectedIndex].setAttribute('aria-selected', 'true');
    }

    // helpers
    const focusOption = (index) => {
      index = (index + options.length) % options.length;
      options[index].focus();
      return index;
    };
    const updateSelection = (index, {updateLabel = true} = {}) => {
      index = (index + options.length) % options.length;
      options.forEach((opt, i) => opt.setAttribute('aria-selected', i === index ? 'true' : 'false'));
      selectedIndex = index;
      if (updateLabel && labelEl) labelEl.textContent = options[index].textContent.trim();
    };

    function openDropdown() {
      list.classList.add('open');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      // focus selected
      focusOption(selectedIndex);
    }
    function closeDropdown() {
      list.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }

    // toggles
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      list.classList.contains('open') ? closeDropdown() : openDropdown();
    });

    btn.addEventListener('keydown', (e) => {
      // open with Enter / Space / ArrowDown, open last with ArrowUp
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        openDropdown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelection(options.length - 1, {updateLabel: false});
        openDropdown();
      }
    });

    // option interactions
    options.forEach((option, index) => {
      // click
      option.addEventListener('click', (ev) => {
        ev.stopPropagation();
        updateSelection(index);
        closeDropdown();
        const dest = option.dataset.value;
        if (dest) window.location.href = dest;
      });

      // keyboard on option
      option.addEventListener('keydown', (ev) => {
        const key = ev.key;
        if (key === 'ArrowDown') {
          ev.preventDefault();
          selectedIndex = (index + 1) % options.length;
          focusOption(selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'ArrowUp') {
          ev.preventDefault();
          selectedIndex = (index - 1 + options.length) % options.length;
          focusOption(selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'Home') {
          ev.preventDefault();
          selectedIndex = 0;
          focusOption(selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'End') {
          ev.preventDefault();
          selectedIndex = options.length - 1;
          focusOption(selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'Enter' || key === ' ' || ev.code === 'Space') {
          ev.preventDefault();
          option.click();
        } else if (key === 'Escape') {
          ev.preventDefault();
          closeDropdown();
          btn.focus();
        }
      });

      // focus updates aria-selected for screenreaders
      option.addEventListener('focus', () => {
        options.forEach((o, i) => o.setAttribute('aria-selected', i === index ? 'true' : 'false'));
        selectedIndex = index;
      });
    });

    // close on outside click
    document.addEventListener('click', (ev) => {
      if (!dropdown.contains(ev.target)) closeDropdown();
    });

    // global escape
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && list.classList.contains('open')) {
        closeDropdown();
        btn.focus();
      }
    });
  })();

  /* CONTACT BUBBLE */
  (function initContactBubble() {
    const contactWrapper = document.getElementById('contactWrapper');
    const contactBtn = document.getElementById('contactBtn');
    if (!contactWrapper || !contactBtn) return;

    // ensure aria
    contactBtn.setAttribute('aria-expanded', contactWrapper.classList.contains('active') ? 'true' : 'false');

    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = contactWrapper.classList.toggle('active');
      contactBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
    });

    // click outside closes
    document.addEventListener('click', (e) => {
      if (!contactWrapper.contains(e.target) && contactWrapper.classList.contains('active')) {
        contactWrapper.classList.remove('active');
        contactBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactWrapper.classList.contains('active')) {
        contactWrapper.classList.remove('active');
        contactBtn.setAttribute('aria-expanded', 'false');
        contactBtn.focus();
      }
    });

    // prevent clicks inside icons from bubbling out
    const contactIcons = document.getElementById('contactIcons');
    if (contactIcons) contactIcons.addEventListener('click', (ev) => ev.stopPropagation());
  })();

  /* Respect prefers-reduced-motion */
  (function respectReducedMotion() {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) {
        document.querySelectorAll('.dropdown-list, .gallery-item img, .contact-icons').forEach(el => {
          el.style.transition = 'none';
        });
      }
    } catch (e) { /* ignore */ }
  })();
}); // end DOMContentLoaded

/* === Review Karya === */
function openLightbox(el) {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");

  // reset isi
  content.innerHTML = "";

  // cek apakah ada data-video
  const videoSrc = el.getAttribute("data-video");
  if (videoSrc) {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    content.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = el.src;
    content.appendChild(img);
  }

  lightbox.style.display = "flex";
}

// close lightbox
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");

  // stop video saat ditutup
  content.innerHTML = "";
  lightbox.style.display = "none";
}

// close kalau klik background
document.getElementById("lightbox").addEventListener("click", closeLightbox);