import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import createTag from '../../utils/tag.js';

async function fetchBlogArticleIndex() {
  const index = '/query-index.json';
  const resp = await fetch(index);
  const json = await resp.json();
  const lookup = {};
  json.data.forEach((row) => {
    lookup[row.path] = row;
  });
  return { data: json.data, lookup };
}

function decorateCard(hit) {
  const {
    title, description, image, imageAlt,
  } = hit;
  const path = hit.path.split('.')[0];
  const picture = createOptimizedPicture(image, imageAlt || title, false, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const html = `<div class="cards-card-image">${pictureTag}</div>
      <div class="cards-card-body">
        <h4><a href="${path}">${title}</a></h4>
        <p>${description}</p>
      </div>`;
  return createTag('li', { class: 'cards' }, html);
}

function highlightTextElements(terms, elements) {
  elements.forEach((e) => {
    const matches = [];
    const txt = e.textContent;
    terms.forEach((term) => {
      const offset = txt.toLowerCase().indexOf(term);
      if (offset >= 0) {
        matches.push({ offset, term });
      }
    });
    matches.sort((a, b) => a.offset - b.offset);
    let markedUp = '';
    if (!matches.length) markedUp = txt;
    else {
      markedUp = txt.substr(0, matches[0].offset);
      matches.forEach((hit, i) => {
        markedUp += `<mark class="gnav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</mark>`;
        if (matches.length - 1 === i) {
          markedUp += txt.substr(hit.offset + hit.term.length);
        } else {
          markedUp += txt.substring(hit.offset + hit.term.length, matches[i + 1].offset);
        }
      });
      e.innerHTML = markedUp;
    }
  });
}

async function populateSearchResults(searchTerms, resultsContainer) {
  const limit = 12;
  const terms = searchTerms.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => !!e);
  const sectionHidden = document.querySelectorAll('.section');
  const resultsWrapper = document.querySelector('.search-container');
  resultsContainer.innerHTML = '';

  if (terms.length) {
    if (!window.blogIndex) {
      window.blogIndex = await fetchBlogArticleIndex();
    }

    const articles = window.blogIndex.data;

    const hits = [];
    let i = 0;
    for (; i < articles.length; i += 1) {
      const e = articles[i];
      const text = [e.title, e.content].join(' ').toLowerCase();

      if (terms.every((term) => text.includes(term))) {
        if (hits.length === limit) {
          break;
        }
        hits.push(e);
      }
    }

    hits.forEach((hit) => {
      const card = decorateCard(hit);
      resultsContainer.appendChild(card);
    });

    if (!hits.length) {
      sectionHidden.forEach((element) => {
        if (element.classList.contains('hide')) {
          element.classList.toggle('hide');
        }
      });
    } else {
      if (resultsWrapper.classList.contains('hide')) {
        resultsWrapper.classList.toggle('hide');
      }
      sectionHidden.forEach((element) => {
        if (!element.classList.contains('hide')) {
          element.classList.toggle('hide');
        }
      });
    }
    highlightTextElements(terms, resultsContainer.querySelectorAll('h3, .article-card-category, .article-card-body > p'));
  } else {
    sectionHidden.forEach((element) => {
      element.classList.toggle('hide');
    });
    resultsWrapper.classList.toggle('hide');
  }
}

export default function onSearchInput(value, resultsContainer, advancedLink) {
  populateSearchResults(value, resultsContainer);
  if (advancedLink) {
    const href = new URL(advancedLink.href);
    href.searchParams.set('q', value);
    advancedLink.href = href.toString();
  }
}
