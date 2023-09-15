import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

async function fetchArticles() {
    const res = await fetch('/customer-experience/query-index.json')
    const json = await res.json();
    return json.data;
}

function buildArticle(article) {
    const picture = createOptimizedPicture(article.image, article.imageAlt, true, [{ width: '750' }])
    
    const articleEl = document.createElement('li');
    articleEl.innerHTML = `
    <div class="articles-article-image">
        ${picture.outerHTML}
    </div>
    <div class="articles-article-body">
        <h5>Article</h5>
        <h4>${article.title}</h4>
        <p><${article.description}/p>
    </div>
    `;

    return articleEl;
}

export default async function decorate(block) {
    const ARTICLES_PER_PAGE = 1;

    // Create container
    const articlesContainer = document.createElement('ul');
    articlesContainer.className = 'article-cards';

    // Fetch articles
    const articlesData = await fetchArticles();
    const articlesCount = articlesData.length;
    let articlesOffset = 0;
    let pageMax = ARTICLES_PER_PAGE;

    // Create article elements
    for (let article of articlesData) {
        const articleEl = buildArticle(article);
        articlesContainer.appendChild(articleEl);
        
        if (articlesOffset >= ARTICLES_PER_PAGE) {
            articleEl.style.display = 'none';
        } else {
            articlesOffset++;
        }
    }

    // Add button and number of articles
    const articles = articlesContainer.childNodes;
    const loadMoreButton = document.createElement('button');
    loadMoreButton.innerText = 'Load more';
    const paginationText = document.createElement('p');
    paginationText.innerText = `1 - ${pageMax} of ${articlesCount}`;
    loadMoreButton.addEventListener('click', function() {
        // Load more articles
        pageMax = Math.min(articlesOffset + ARTICLES_PER_PAGE, articlesCount);
        while (articlesOffset != pageMax) {
            articles[articlesOffset].style.display = '';
            articlesOffset++;
        }

        paginationText.innerText = `1 - ${pageMax} of ${articlesCount}`;
        if (articlesOffset == articlesCount) this.remove();
    });

    block.appendChild(articlesContainer);
    block.appendChild(paginationText);
    block.appendChild(loadMoreButton);
}
