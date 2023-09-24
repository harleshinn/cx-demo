import { getMetadata } from '../../scripts/lib-franklin.js';
import createTag from '../../utils/tag.js';

/** Toggle search button */
export function toggleSearch() {
  const searchWrapper = document.querySelector('.nav-tools .gnav-search');
  const searchContainerHidden = document.querySelector('.search-container');
  const sectionHidden = document.querySelectorAll('.section');

  searchWrapper.classList.toggle('hide');
  if (searchContainerHidden.querySelector('ul').childElementCount) {
    searchContainerHidden.classList.toggle('hide');
    sectionHidden.forEach((element) => {
      element.classList.toggle('hide');
    });
  }
}
class Gnav {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.desktop = window.matchMedia('(min-width: 1200px)');
  }

  init = () => {
    this.state = {};

    const mainnav = document.querySelector('.nav-tools');

    // disabled search as not in desktop design
    const enableSearch = getMetadata('enable-search');
    if (!enableSearch || enableSearch !== 'no') {
      const div = createTag('div', { class: 'search' });
      div.innerHTML = '<p>Search</p>';
      this.body.append(div);

      this.search = this.decorateSearch();
      if (this.search) {
        mainnav.append(this.search);
      }
    }

    window.addEventListener('resize', this.resizeContent);
  };

  // search on mobile menu (Disabled for now)
  decorateSearch = () => {
    const searchBlock = this.body.querySelector('.search');
    if (searchBlock) {
      const label = searchBlock.querySelector('p').textContent;
      const searchEl = createTag('div', { class: 'gnav-search hide' });
      const searchBar = this.decorateSearchBar(label);

      searchEl.append(searchBar);
      return searchEl;
    }
    return null;
  };

  decorateSearchBar = (label) => {
    const searchBar = createTag('aside', { id: 'gnav-search-bar', class: 'gnav-search-bar' });
    const mainContainer = document.querySelector('main');
    const searchField = createTag('div', { class: 'gnav-search-field' });
    const html = `<div class="cards-wrapper">
                      <div class="cards">
                        <ul>
                        </ul>
                      </div>
                    </div>`;
    const containerResults = createTag('div', { class: 'search-container' }, html);
    const searchInput = createTag('input', { class: 'gnav-search-input', placeholder: label });
    const searchResults = createTag('div', { class: 'gnav-search-results' });

    const clearButton = createTag('button', { class: 'clear-results-button' }, '✕');

    mainContainer.prepend(containerResults);

    clearButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.clearSearchInput();
    });

    searchInput.addEventListener('input', (e) => {
      if (!this.onSearchInput) {
        this.loadSearchNav();
      } else {
        this.onSearchInput(e.target.value, containerResults.querySelector('ul'));
      }
    });

    searchField.append(searchInput, clearButton);
    searchBar.append(searchField, searchResults);
    return searchBar;
  };

  loadSearchNav = async () => {
    if (this.onSearchInput) return;
    const gnavSearch = await import('./gnav-search.js');
    this.onSearchInput = gnavSearch.default;
  };

  clearSearchInput = () => {
    toggleSearch.call(this);
  };
}

export default async function init(blockEl) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  const html = await resp.text();

  if (html) {
    try {
      const parser = new DOMParser();
      const gnavDoc = parser.parseFromString(html, 'text/html');
      const gnav = new Gnav(gnavDoc.body, blockEl);
      gnav.init();
    } catch (e) {
      const { debug } = await import('../../utils/console.js');
      if (debug) {
        debug('Could not great global navigation', e);
      }
    }
  }
}
