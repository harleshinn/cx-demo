// eslint-disable-next-line object-curly-newline
import { getMetadata, decorateIcons, buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';
import { toggleSearch } from '../gnav/gnav.js';
import createTag from '../../utils/tag.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

async function buildSeachNav() {
  const searchNav = createTag('div', { class: 'search-nav' });
  // auto block in search form
  const searchForm = buildBlock('gnav', '');
  searchNav.append(searchForm);
  decorateBlock(searchForm);
  loadBlock(searchForm);
}
/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // @toDo:
    // each time an item in the nav is clicked should show
    // first child item and sub-item visible as well (all the first items of that branch)

    const showActiveSection = (e) => {
      const sibling = e.target.nextElementSibling;
      const highlightedChild = sibling.querySelectorAll('.highlight');
      const firstChild = sibling.querySelector('li');
      const activeFirstCol = sibling.querySelector('.nav--third-level');

      highlightedChild.forEach((el) => {
        el.classList.remove('highlight');
      });

      firstChild.className = 'highlight';
      activeFirstCol.classList.add('active');
    };

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', (e) => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            showActiveSection(e);
          }
        });
      });
    }
    /* EventListener for seach button */
    const navTools = nav.querySelector('.nav-tools .icon-search');
    await buildSeachNav();

    navTools.addEventListener('click', () => {
      toggleSearch();
    });

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);

    // Custom code: adding classes to nav and hiding/showing nav on hover
    navSections.querySelectorAll('.nav-drop > ul > li').forEach((drop) => {
      drop.querySelector('ul').classList.add('nav--third-level');
      drop.querySelector('.nav--third-level > li > ul').classList.add('active');

      drop.addEventListener('mouseenter', () => {
        drop.querySelector('ul').classList.add('active');
      });

      drop.addEventListener('mouseleave', () => {
        drop.querySelector('ul').classList.remove('active');
      });

      drop.querySelectorAll('.nav--third-level > li').forEach((thirdLevel) => {
        if (thirdLevel.querySelector('ul') !== null) {
          thirdLevel.addEventListener('mouseenter', () => {
            thirdLevel.querySelector('ul').classList.add('active');
          });

          thirdLevel.addEventListener('mouseleave', () => {
            thirdLevel.querySelector('ul').classList.remove('active');
          });
        }
      });
    });

    // Custom code:
    // transform strong title into h2
    const titles = document.querySelectorAll('.nav-drop strong');
    titles.forEach((title) => {
      const navTitle = document.createElement('h2');
      navTitle.classList.add('nav-drop__title');
      navTitle.textContent = title.textContent;
      title.replaceWith(navTitle);
    });
  }
}
