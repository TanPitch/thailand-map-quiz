export class dropdown {
  static styles = `
    .ss-container {
      position: relative;
      width: 250px; /* Default width, can be overridden via options */
      font-family: sans-serif;
      user-select: none;
      box-sizing: border-box;
      font-size: 14px;
    }
    .ss-trigger {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 15px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ss-trigger:hover { border-color: #888; }
    .ss-trigger::after {
      content: '';
      width: 0; height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #555;
      pointer-events: none;
    }
    .ss-options {
      position: absolute;
      display: block;
      top: 100%;
      left: 0; right: 0;
      border: 1px solid #ccc;
      border-top: 0;
      background: #fff;
      transition: all 0.2s;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: 999;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-height: 250px;
      overflow-y: auto;
      border-radius: 0 0 4px 4px;
      margin-top: 5px;
    }
    .ss-container.open .ss-options {
      opacity: 1; visibility: visible; pointer-events: all;
    }
    .ss-search-wrapper {
      padding: 8px;
      border-bottom: 1px solid #eee;
      background: #f9f9f9;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .ss-search-wrapper input {
      width: 100%;
      padding: 6px 25px 6px 10px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 3px;
      outline: none;
      font-family: inherit; font-size: inherit;
    }
    .ss-clear {
      position: absolute;
      right: 15px;
      top: 50%; transform: translateY(-50%);
      cursor: pointer;
      color: #999; font-weight: bold;
      font-size: 18px; line-height: 1;
      display: none;
    }
    .ss-clear:hover { color: #555; }
    .ss-option {
      display: block; padding: 10px 15px;
      cursor: pointer; transition: background 0.1s;
      color: #333;
    }
    .ss-option:hover { background-color: #f0f0f0; color: #000; }
    .ss-option.selected { background-color: #eef; color: #444; font-weight: 500; }
    .ss-option.hidden { display: none; }
    .ss-highlight { font-weight: bold; color: #000; }
  `;

  constructor(selector, options = {}) {
    this.options = options;

    // Allow string selectors or DOM elements
    if (typeof selector === 'string') {
      this.originalSelect = document.querySelector(selector);
    } else {
      this.originalSelect = selector;
    }

    if (!this.originalSelect) {
      console.error('SearchableSelect: Element not found.');
      return;
    }

    this.injectStyles();
    this.buildUI();
    this.addEventListeners();
  }

  injectStyles() {
    // 1. Inject Default Styles
    if (!document.getElementById('searchable-select-styles')) {
      const style = document.createElement('style');
      style.id = 'searchable-select-styles';
      style.textContent = dropdown.styles;
      document.head.appendChild(style);
    }

    // 2. Inject Custom CSS (if provided)
    if (this.options.customCss) {
      // Remove existing custom style to prevent duplicates if re-initializing
      const existingCustom = document.getElementById('ss-custom-styles');
      if (existingCustom) existingCustom.remove();

      const customStyle = document.createElement('style');
      customStyle.id = 'ss-custom-styles';
      customStyle.textContent = this.options.customCss;
      document.head.appendChild(customStyle);
    }
  }

  buildUI() {
    this.container = document.createElement('div');
    this.container.className = 'ss-container';

    // Apply custom width if provided
    if (this.options.width) {
      this.container.style.width = this.options.width;
    }

    // Apply custom class if provided (useful for scoping custom CSS)
    if (this.options.customClass) {
      this.container.classList.add(this.options.customClass);
    }

    this.originalSelect.parentNode.insertBefore(this.container, this.originalSelect.nextSibling);
    this.originalSelect.style.display = 'none';

    // Trigger
    this.trigger = document.createElement('div');
    this.trigger.className = 'ss-trigger';
    const initialOption = this.originalSelect.options[this.originalSelect.selectedIndex];
    this.triggerSpan = document.createElement('span');
    this.triggerSpan.textContent = initialOption.text;
    this.trigger.appendChild(this.triggerSpan);
    this.container.appendChild(this.trigger);

    // Options
    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = 'ss-options';

    // Search
    this.searchWrapper = document.createElement('div');
    this.searchWrapper.className = 'ss-search-wrapper';
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search...';
    this.clearBtn = document.createElement('span');
    this.clearBtn.className = 'ss-clear';
    this.clearBtn.innerHTML = '&times;';
    
    this.searchWrapper.appendChild(this.searchInput);
    this.searchWrapper.appendChild(this.clearBtn);
    this.optionsContainer.appendChild(this.searchWrapper);

    this.renderOptions();
    this.container.appendChild(this.optionsContainer);
  }

  renderOptions() {
    const existingOptions = this.optionsContainer.querySelectorAll('.ss-option');
    existingOptions.forEach(opt => opt.remove());

    Array.from(this.originalSelect.options).forEach((option) => {
      const customOption = document.createElement('div');
      customOption.className = 'ss-option';
      customOption.dataset.originalText = option.text; 
      customOption.textContent = option.text;
      customOption.dataset.value = option.value;
      if (option.selected) customOption.classList.add('selected');

      customOption.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(option.value, option.text);
      });

      this.optionsContainer.appendChild(customOption);
    });
  }

  selectItem(value, text) {
    this.originalSelect.value = value;
    this.triggerSpan.textContent = text;
    const options = this.optionsContainer.querySelectorAll('.ss-option');
    options.forEach(opt => {
      if (opt.dataset.value === value) opt.classList.add('selected');
      else opt.classList.remove('selected');
    });
    this.dispatchEvent('dropdown.change', { value, text });
    this.close();
  }

  open() {
    if (this.container.classList.contains('open')) return;
    this.container.classList.add('open');
    setTimeout(() => this.searchInput.focus(), 50);
    this.dispatchEvent('dropdown.open');
  }

  close() {
    this.container.classList.remove('open');
    this.searchInput.value = '';
    this.clearBtn.style.display = 'none';
    this.filterOptions('');
  }

  toggle() {
    if (this.container.classList.contains('open')) this.close();
    else this.open();
  }

  filterOptions(query) {
    const lowerQuery = query.toLowerCase();
    const options = this.optionsContainer.querySelectorAll('.ss-option');
    options.forEach(option => {
      const originalText = option.dataset.originalText;
      const lowerText = originalText.toLowerCase();
      if (lowerText.includes(lowerQuery)) option.classList.remove('hidden');
      else option.classList.add('hidden');

      if (query.length > 0) {
        const regex = new RegExp(`(${query})`, 'gi');
        option.innerHTML = originalText.replace(regex, '<span class="ss-highlight">$1</span>');
      } else {
        option.textContent = originalText;
      }
    });
    this.clearBtn.style.display = query.length > 0 ? 'block' : 'none';
  }
  
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { bubbles: true, detail });
    this.container.dispatchEvent(event);
  }

  addEventListeners() {
    this.trigger.addEventListener('click', () => this.toggle());
    this.optionsContainer.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) this.close();
    });
    this.searchInput.addEventListener('input', (e) => {
      this.filterOptions(e.target.value);
      this.dispatchEvent('dropdown.search', { query: e.target.value });
    });
    this.searchInput.addEventListener('click', (e) => e.stopPropagation());
    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.searchInput.value = '';
      this.filterOptions('');
      this.searchInput.focus();
      this.dispatchEvent('dropdown.search', { query: '' });
    });
  }
}