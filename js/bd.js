
document.addEventListener('DOMContentLoaded', () => {
  /* Utility helpers */
  const isActivationKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'Space';
  const focusOption = (options, index) => {
    if (!options || !options.length) return;
    index = (index + options.length) % options.length;
    options[index].focus();
    return index;
  };

  /* DROPDOWN: customDropdown */
  (function initDropdown() {
    const dropdown = document.getElementById('customDropdown');
    if (!dropdown) return; // guard: nothing to do

    const btn = dropdown.querySelector('.dropdown-btn');
    const list = dropdown.querySelector('.dropdown-list');

    if (!btn || !list) return;

    // ensure list has an id (for aria-controls)
    if (!list.id) list.id = `dropdown-list-${Math.random().toString(36).slice(2,8)}`;
    btn.setAttribute('aria-controls', list.id);

    // collect option elements
    const options = Array.from(list.querySelectorAll('li'));

    // normalize roles / attributes
    list.setAttribute('role', list.getAttribute('role') || 'listbox');
    list.setAttribute('tabindex', list.getAttribute('tabindex') || '-1');
    options.forEach((opt, i) => {
      if (!opt.hasAttribute('role')) opt.setAttribute('role', 'option');
      // if no aria-selected, derive initial selection from markup or default to first
      if (!opt.hasAttribute('aria-selected')) opt.setAttribute('aria-selected', 'false');
      // make programmatically focusable but not tabbable
      opt.setAttribute('tabindex', '-1');
    });

    // find initial selected index
    let selectedIndex = options.findIndex(o => o.getAttribute('aria-selected') === 'true');
    if (selectedIndex < 0) selectedIndex = 0;

    // set initial label on button
    const labelEl = btn.querySelector('.label');
    if (labelEl && options[selectedIndex]) {
      labelEl.textContent = options[selectedIndex].textContent.trim();
      options[selectedIndex].setAttribute('aria-selected', 'true');
    }

    // state helpers
    function openDropdown() {
      list.classList.add('open');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      // focus selected option programmatically
      options[selectedIndex].focus();
    }

    function closeDropdown() {
      list.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }

    function toggleDropdown() {
      if (list.classList.contains('open')) closeDropdown();
      else openDropdown();
    }

    function updateSelection(index, {updateLabel = true} = {}) {
      index = (index + options.length) % options.length;
      options.forEach((opt, i) => {
        opt.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      selectedIndex = index;
      if (updateLabel && labelEl) labelEl.textContent = options[index].textContent.trim();
    }

    // click on button
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // keyboard on button
    btn.addEventListener('keydown', (e) => {
      // open and focus first option
      if (['ArrowDown', 'Enter'].includes(e.key) || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        openDropdown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // open and focus last option
        updateSelection(options.length - 1, {updateLabel: false});
        openDropdown();
      }
    });

    // add event listeners for options
    options.forEach((option, index) => {
      // mouse click
      option.addEventListener('click', (ev) => {
        ev.stopPropagation();
        updateSelection(index);
        closeDropdown();
        // navigate if data-value set
        const dest = option.dataset.value;
        if (dest) {
          // small timeout to allow the UI to update (optional)
          window.location.href = dest;
        }
      });

      // keyboard interaction on option
      option.addEventListener('keydown', (ev) => {
        const key = ev.key;
        if (key === 'ArrowDown') {
          ev.preventDefault();
          selectedIndex = (index + 1) % options.length;
          focusOption(options, selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'ArrowUp') {
          ev.preventDefault();
          selectedIndex = (index - 1 + options.length) % options.length;
          focusOption(options, selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'Home') {
          ev.preventDefault();
          selectedIndex = 0;
          focusOption(options, selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (key === 'End') {
          ev.preventDefault();
          selectedIndex = options.length - 1;
          focusOption(options, selectedIndex);
          updateSelection(selectedIndex, {updateLabel: false});
        } else if (isActivationKey(ev)) {
          ev.preventDefault();
          option.click(); // trigger click behavior (selection + navigation)
        } else if (key === 'Escape') {
          ev.preventDefault();
          closeDropdown();
          btn.focus();
        }
      });

      // on focus, update aria-activedescendant-like behavior by updating aria-selected (visual)
      option.addEventListener('focus', () => {
        options.forEach((o, i) => o.setAttribute('aria-selected', i === index ? 'true' : 'false'));
        selectedIndex = index;
      });
    });

    // click outside closes dropdown
    document.addEventListener('click', (ev) => {
      if (!dropdown.contains(ev.target)) {
        closeDropdown();
      }
    });

    // close on Escape if open (global)
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && list.classList.contains('open')) {
        closeDropdown();
        btn.focus();
      }
    });

    // Make sure button aria-expanded default is set
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
  })(); // end dropdown init

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

  /* Optional: reduce-motion respect */
  (function respectReducedMotion() {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) {
        // find elements with transitions and remove them gracefully
        // This is minimal — if you want, handle more selectors
        document.querySelectorAll('.dropdown-list, .gallery-item img, .contact-icons').forEach(el => {
          el.style.transition = 'none';
        });
      }
    } catch (e) {
      // ignore if matchMedia not supported
    }
  })();
}); // end DOMContentLoaded
