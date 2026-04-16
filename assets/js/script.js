// Script per a visualitzacions de portada de PDF

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el layout se calcule completamente
    requestAnimationFrame(() => {
        renderPdfCovers()
            .then(() => {
                decorateBookCards();
                initBibliographyCitations();
                initBibliographyFilters();
            })
            .catch((error) => {
                console.error('Error al renderitzar portades PDF:', error);
            });
    });
});

function decorateBookCards() {
    document.querySelectorAll('.book-card').forEach((card) => {
        const wrapper = card.querySelector('.cover-wrapper');
        const title = card.querySelector('h4');
        const author = card.querySelector('p');
        const detailLink = card.querySelector('p a');
        const titleText = title?.textContent ? title.textContent.trim() : '';

        if (!wrapper || !title || !author) return;
        if (wrapper.querySelector('.cover-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'cover-overlay';

        const content = document.createElement('div');
        content.className = 'cover-overlay__content';

        const titleClone = title.cloneNode(true);
        titleClone.className = 'cover-overlay__title';

        const authorClone = author.cloneNode(true);
        authorClone.className = 'cover-overlay__author';

        content.appendChild(titleClone);
        content.appendChild(authorClone);

        if (detailLink) {
            const detailButton = detailLink.cloneNode(true);
            detailButton.className = 'open-detail cover-overlay__button';
            detailButton.textContent = detailLink.dataset.ctaLabel
                || (card.dataset.type === 'article' ? 'Descobreix l\'article' : 'Descobreix el llibre');
            detailButton.setAttribute(
                'aria-label',
                `Descobreix més sobre ${titleText || 'aquest llibre'}`
            );
            content.appendChild(detailButton);
        }

        overlay.appendChild(content);
        wrapper.appendChild(overlay);

        title.style.display = 'none';
        author.style.display = 'none';

        if (detailLink && detailLink.closest('p')) {
            detailLink.closest('p').style.display = 'none';
        }
    });
}

function initBibliographyCitations() {
    const bibliography = document.querySelector('#bibliography');

    if (!bibliography) return;

    const cards = bibliography.querySelectorAll('.book-card');

    if (!cards.length) return;

    cards.forEach((card) => {
        hydrateCitationDataset(card);

        const overlayContent = card.querySelector('.cover-overlay__content');

        if (!overlayContent || overlayContent.querySelector('.citation-actions')) {
            return;
        }

        const actions = document.createElement('div');
        actions.className = 'citation-actions';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'citation-toggle';
        toggle.textContent = 'Cita APA';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-haspopup', 'true');

        const menu = document.createElement('div');
        menu.className = 'citation-menu';
        menu.hidden = true;

        const intertextButton = document.createElement('button');
        intertextButton.type = 'button';
        intertextButton.className = 'citation-menu__option';
        intertextButton.dataset.citationKind = 'intertextual';
        intertextButton.textContent = 'Cita intertextual';

        const referenceButton = document.createElement('button');
        referenceButton.type = 'button';
        referenceButton.className = 'citation-menu__option';
        referenceButton.dataset.citationKind = 'reference';
        referenceButton.textContent = 'Referència bibliogràfica';

        const preview = document.createElement('div');
        preview.className = 'citation-preview';

        const previewLabel = document.createElement('p');
        previewLabel.className = 'citation-preview__label';
        previewLabel.textContent = 'Previsualització';

        const previewText = document.createElement('p');
        previewText.className = 'citation-preview__text';

        const feedback = document.createElement('p');
        feedback.className = 'citation-feedback';
        feedback.setAttribute('aria-live', 'polite');

        preview.appendChild(previewLabel);
        preview.appendChild(previewText);
        menu.appendChild(intertextButton);
        menu.appendChild(referenceButton);
        menu.appendChild(preview);
        actions.appendChild(toggle);
        actions.appendChild(menu);
        actions.appendChild(feedback);
        overlayContent.appendChild(actions);
    });

    let openMenu = null;

    function closeOpenMenu() {
        if (!openMenu) return;

        const toggle = openMenu.parentElement?.querySelector('.citation-toggle');
        openMenu.hidden = true;
        openMenu.parentElement?.classList.remove('is-open');

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }

        openMenu = null;
    }

    bibliography.addEventListener('click', async (event) => {
        const toggle = event.target.closest('.citation-toggle');

        if (toggle) {
            const actions = toggle.closest('.citation-actions');
            const menu = actions?.querySelector('.citation-menu');
            const defaultOption = actions?.querySelector('.citation-menu__option[data-citation-kind="intertextual"]');

            if (!menu) return;

            const shouldOpen = menu.hidden;
            closeOpenMenu();

            if (shouldOpen) {
                menu.hidden = false;
                actions.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                setCitationPreview(cardFromActions(actions), defaultOption?.dataset.citationKind || 'intertextual');
                setCitationOptionState(actions, defaultOption?.dataset.citationKind || 'intertextual');
                openMenu = menu;
            }

            return;
        }

        const option = event.target.closest('.citation-menu__option');

        if (!option) {
            return;
        }

        const card = option.closest('.book-card');
        const actions = option.closest('.citation-actions');
        const feedback = actions?.querySelector('.citation-feedback');
        const citationKind = option.dataset.citationKind;
        const citationText = buildApaCitation(card, citationKind);

        if (!citationText) {
            showCitationFeedback(feedback, 'No s\'ha pogut generar la cita.', true);
            closeOpenMenu();
            return;
        }

        try {
            await copyTextToClipboard(citationText);
            showCitationFeedback(feedback, 'Copiat al porta-retalls.');
        } catch (error) {
            showCitationFeedback(feedback, 'No s\'ha pogut copiar.');
        }

        closeOpenMenu();
    });

    document.addEventListener('click', (event) => {
        if (!bibliography.contains(event.target)) {
            closeOpenMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeOpenMenu();
        }
    });

    bibliography.addEventListener('mouseover', handleCitationPreviewUpdate);
    bibliography.addEventListener('focusin', handleCitationPreviewUpdate);

    function handleCitationPreviewUpdate(event) {
        const option = event.target.closest('.citation-menu__option');

        if (!option) {
            return;
        }

        const actions = option.closest('.citation-actions');
        const card = cardFromActions(actions);
        const citationKind = option.dataset.citationKind;

        setCitationPreview(card, citationKind);
        setCitationOptionState(actions, citationKind);
    }
}

function cardFromActions(actions) {
    return actions?.closest('.book-card') || null;
}

function setCitationPreview(card, citationKind) {
    if (!card) return;

    const actions = card.querySelector('.citation-actions');
    const previewText = actions?.querySelector('.citation-preview__text');

    if (!previewText) return;

    const preview = buildApaCitation(card, citationKind);
    previewText.textContent = preview || 'No s\'ha pogut generar la cita.';
}

function setCitationOptionState(actions, citationKind) {
    if (!actions) return;

    actions.querySelectorAll('.citation-menu__option').forEach((option) => {
        const isActive = option.dataset.citationKind === citationKind;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function hydrateCitationDataset(card) {
    const rawTitle = card.querySelector('h4')?.textContent?.trim() || '';
    const rawMeta = card.querySelector('p')?.textContent?.trim() || '';
    const detailPath = card.querySelector('a[href]')?.getAttribute('href') || '';
    const { author, year } = splitAuthorAndYear(rawMeta);

    if (rawTitle && !card.dataset.citationTitle) {
        card.dataset.citationTitle = rawTitle;
    }

    if (author && !card.dataset.citationAuthor) {
        card.dataset.citationAuthor = author;
    }

    if (year && !card.dataset.citationYear) {
        card.dataset.citationYear = year;
    }

    if (detailPath && !card.dataset.citationDetailUrl) {
        card.dataset.citationDetailUrl = detailPath;
    }
}

function splitAuthorAndYear(rawMeta) {
    const meta = (rawMeta || '').trim();
    const match = meta.match(/^(.*),\s*(\d{4}|s\.d\.)$/i);

    if (!match) {
        return {
            author: meta,
            year: 's.d.'
        };
    }

    return {
        author: match[1].trim(),
        year: match[2].trim()
    };
}

function buildApaCitation(card, kind) {
    if (!card) return '';

    hydrateCitationDataset(card);

    const author = (card.dataset.citationAuthor || '').trim();
    const year = normalizeCitationYear(card.dataset.citationYear || 's.d.');
    const title = (card.dataset.citationTitle || '').trim();
    const type = (card.dataset.type || '').trim();
    const metadata = readCitationMetadata(card);

    if (!author || !title) {
        return '';
    }

    if (kind === 'intertextual') {
        return `(${formatInTextAuthors(author)}, ${year})`;
    }

    return buildApaReference({
        author,
        year,
        title,
        type,
        metadata
    });
}

function readCitationMetadata(card) {
    return {
        journal: (card.dataset.citationJournal || '').trim(),
        publisher: (card.dataset.citationPublisher || '').trim(),
        volume: (card.dataset.citationVolume || '').trim(),
        issue: (card.dataset.citationIssue || '').trim(),
        pages: (card.dataset.citationPages || '').trim(),
        doi: (card.dataset.citationDoi || '').trim(),
        url: (card.dataset.citationUrl || card.dataset.citationDetailUrl || '').trim()
    };
}

function buildApaReference({ author, year, title, type, metadata }) {
    const authorPart = formatReferenceAuthors(author);
    const titlePart = ensureTrailingPeriod(title);
    const sourcePart = type === 'article'
        ? formatArticleSource(metadata)
        : formatBookSource(metadata);

    return [
        `${authorPart} (${year}).`,
        titlePart,
        sourcePart
    ]
        .filter(Boolean)
        .join(' ')
        .trim();
}

function formatArticleSource(metadata) {
    const segments = [];

    if (metadata.journal) {
        let journalSegment = metadata.journal;

        if (metadata.volume) {
            journalSegment += `, ${metadata.volume}`;
        }

        if (metadata.issue) {
            journalSegment += `(${metadata.issue})`;
        }

        if (metadata.pages) {
            journalSegment += `, ${metadata.pages}`;
        }

        segments.push(ensureTrailingPeriod(journalSegment));
    }

    if (metadata.doi) {
        segments.push(normalizeDoi(metadata.doi));
    } else if (metadata.url) {
        segments.push(metadata.url);
    }

    return segments.join(' ');
}

function formatBookSource(metadata) {
    if (metadata.publisher) {
        return ensureTrailingPeriod(metadata.publisher);
    }

    if (metadata.url) {
        return metadata.url;
    }

    return '';
}

function normalizeDoi(doiText) {
    const doi = (doiText || '').trim();

    if (!doi) return '';
    if (/^https?:\/\//i.test(doi)) return doi;

    return `https://doi.org/${doi.replace(/^doi:\s*/i, '')}`;
}

function parseAuthorEntries(authorText) {
    const normalized = (authorText || '').replace(/\s+/g, ' ').trim();

    if (!normalized) {
        return {
            type: 'single',
            authors: []
        };
    }

    if (/et al\.?$/i.test(normalized)) {
        const firstAuthor = normalized.replace(/\s+et al\.?$/i, '').trim();

        return {
            type: 'etal',
            authors: firstAuthor ? [firstAuthor] : []
        };
    }

    const authors = normalized
        .split(/\s+i\s+/i)
        .map((entry) => entry.trim())
        .filter(Boolean);

    return {
        type: authors.length > 1 ? 'multiple' : 'single',
        authors
    };
}

function extractSurname(authorEntry) {
    const entry = (authorEntry || '').trim();

    if (!entry) return '';

    if (entry.includes(',')) {
        return entry.split(',')[0].trim();
    }

    const parts = entry.split(/\s+/).filter(Boolean);
    return parts[parts.length - 1] || '';
}

function toReferenceName(authorEntry) {
    const entry = (authorEntry || '').trim();

    if (!entry) return '';

    if (!entry.includes(',')) {
        return entry;
    }

    const [surnamePart, ...givenParts] = entry.split(',');
    const surname = surnamePart.trim();
    const givenNames = givenParts.join(',').trim();

    if (!givenNames) {
        return surname;
    }

    const initials = givenNames
        .split(/\s+/)
        .map((token) => token.replace(/[^A-Za-zÀ-ÿ]/g, ''))
        .filter(Boolean)
        .map((token) => `${token.charAt(0).toUpperCase()}.`)
        .join(' ');

    return initials ? `${surname}, ${initials}` : surname;
}

function formatInTextAuthors(authorText) {
    const parsed = parseAuthorEntries(authorText);

    if (parsed.type === 'etal') {
        return `${extractSurname(parsed.authors[0])} et al.`;
    }

    if (parsed.authors.length === 2) {
        return `${extractSurname(parsed.authors[0])} & ${extractSurname(parsed.authors[1])}`;
    }

    if (parsed.authors.length > 2) {
        return `${extractSurname(parsed.authors[0])} et al.`;
    }

    return extractSurname(parsed.authors[0]);
}

function formatReferenceAuthors(authorText) {
    const parsed = parseAuthorEntries(authorText);

    if (parsed.type === 'etal') {
        const firstAuthor = toReferenceName(parsed.authors[0]);
        return firstAuthor ? `${firstAuthor}, et al.` : 'Autor desconegut';
    }

    if (parsed.authors.length === 2) {
        return `${toReferenceName(parsed.authors[0])}, & ${toReferenceName(parsed.authors[1])}`;
    }

    if (parsed.authors.length > 2) {
        return `${toReferenceName(parsed.authors[0])}, et al.`;
    }

    return toReferenceName(parsed.authors[0]) || 'Autor desconegut';
}

function normalizeCitationYear(yearText) {
    const year = (yearText || '').trim();

    if (!year || /^desconeguda$/i.test(year)) {
        return 's.d.';
    }

    return year;
}

function ensureTrailingPeriod(text) {
    const value = (text || '').trim();

    if (!value) return '';
    if (/[.!?]$/.test(value)) return value;

    return `${value}.`;
}

function showCitationFeedback(node, message, isError) {
    if (!node) return;

    node.textContent = message;
    node.classList.toggle('is-error', Boolean(isError));

    window.clearTimeout(node._feedbackTimeout);
    node._feedbackTimeout = window.setTimeout(() => {
        node.textContent = '';
        node.classList.remove('is-error');
    }, 2400);
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    fallback.style.pointerEvents = 'none';

    document.body.appendChild(fallback);
    fallback.select();
    fallback.setSelectionRange(0, fallback.value.length);

    const copied = document.execCommand('copy');

    document.body.removeChild(fallback);

    if (!copied) {
        throw new Error('Clipboard copy failed');
    }
}

async function renderPdfCover(canvas) {
    const card = canvas.closest('.book-card');
    const title = card?.querySelector('h4')?.textContent?.trim();
    const wrapper = canvas.parentElement;
    
    if (!title) {
        console.warn('No título disponible para la portada');
        return;
    }

    let wrapperHeight = wrapper.clientHeight;
    let wrapperWidth = wrapper.clientWidth;
    
    // Valores por defecto si el wrapper no tiene dimensiones calculadas
    if (wrapperHeight === 0) wrapperHeight = 340;
    if (wrapperWidth === 0) wrapperWidth = 250;
    
    // Establecer dimensiones del canvas
    canvas.width = wrapperWidth * 2; // Usar resolución más alta para mejor text rendering
    canvas.height = wrapperHeight * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    const context = canvas.getContext('2d');
    
    // Fondo blanco
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar borde sutil
    context.strokeStyle = '#d1d5db';
    context.lineWidth = 2;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Configurar texto
    context.fillStyle = '#1f2937';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajustar tamaño de fuente dinámicamente
    let fontSize = 64;
    let lines = [];
    let maxWidth = canvas.width - 60; // Margen
    
    // Dividir el título en líneas si es muy largo
    do {
        context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        lines = wrapText(context, title, maxWidth);
        if (lines.length > 5 || fontSize < 24) break;
        fontSize -= 4;
    } while (lines.length > 4);
    
    // Dibujar líneas de texto centradas verticalmente
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2;
    
    lines.forEach((line, i) => {
        context.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });
}

function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function renderPdfCovers() {
    const canvases = document.querySelectorAll('.cover-canvas');
    return Promise.allSettled(Array.from(canvases).map(renderPdfCover));
}

function initBibliographyFilters() {
    const bibliography = document.querySelector('#bibliography');

    if (!bibliography) return;

    const buttons = bibliography.querySelectorAll('.bibliography-filter__button');
    const cards = bibliography.querySelectorAll('.book-card');
    const sections = bibliography.querySelectorAll('.bibliography__section');
    const emptyState = bibliography.querySelector('.bibliography-empty');
    const searchInput = bibliography.querySelector('.bibliography-search__input');
    const searchStatus = bibliography.querySelector('.bibliography-search__status');
    const searchCount = bibliography.querySelector('.bibliography-search__count');
    const state = {
        type: 'all',
        theme: 'all',
        query: ''
    };

    cards.forEach((card) => {
        card.dataset.searchBase = buildCardSearchBase(card);
        card.dataset.searchIndex = normalizeForSearch(card.dataset.searchBase);
    });

    function applyFilters() {
        let visibleCards = 0;

        cards.forEach((card) => {
            const matchesType = state.type === 'all' || card.dataset.type === state.type;
            const matchesTheme = state.theme === 'all' || card.dataset.theme === state.theme;
            const matchesQuery = !state.query || (card.dataset.searchIndex || '').includes(state.query);
            const isVisible = matchesType && matchesTheme && matchesQuery;

            card.classList.toggle('is-hidden-by-filter', !isVisible);

            if (isVisible) {
                visibleCards += 1;
            }
        });

        sections.forEach((section) => {
            const hasVisibleCards = section.querySelector('.book-card:not(.is-hidden-by-filter)');
            section.classList.toggle('is-hidden-by-filter', !hasVisibleCards);
        });

        if (searchCount) {
            searchCount.textContent = `${visibleCards} resultat${visibleCards === 1 ? '' : 's'}`;
        }

        if (emptyState) {
            emptyState.hidden = visibleCards !== 0;
        }
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const { filterGroup, filterValue } = button.dataset;

            if (!filterGroup || !filterValue) return;

            state[filterGroup] = filterValue;

            buttons.forEach((candidate) => {
                if (candidate.dataset.filterGroup === filterGroup) {
                    candidate.classList.toggle('is-active', candidate === button);
                }
            });

            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            state.query = normalizeForSearch(searchInput.value);
            applyFilters();
        });
    }

    hydrateDetailSearchIndex(cards, searchStatus, () => {
        if (state.query) {
            applyFilters();
        }
    });

    applyFilters();
}

function normalizeForSearch(text) {
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function buildCardSearchBase(card) {
    const title = card.querySelector('h4')?.textContent?.trim() || '';
    const author = card.querySelector('p')?.textContent?.trim() || '';
    const type = card.dataset.type || '';
    const theme = card.dataset.theme || '';
    const link = card.querySelector('a[href]')?.getAttribute('href') || '';

    return [title, author, type, theme, link].join(' ');
}

async function hydrateDetailSearchIndex(cards, statusNode, onCardIndexed) {
    const linkCards = Array.from(cards).filter((card) => card.querySelector('a[href]'));

    if (!linkCards.length) return;

    let indexed = 0;
    let failed = 0;

    if (statusNode) {
        statusNode.textContent = 'Indexant contingut de fitxes per ampliar la cerca...';
    }

    await Promise.allSettled(linkCards.map(async (card) => {
        const link = card.querySelector('a[href]')?.getAttribute('href');

        if (!link) {
            return;
        }

        try {
            const response = await fetch(link, { cache: 'force-cache' });

            if (!response.ok) {
                throw new Error(`No s\'ha pogut carregar ${link}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const detailBits = [];
            const detailTitle = doc.querySelector('h1')?.textContent?.trim();
            const detailMeta = extractCitationMetadataFromDocument(doc);

            doc.querySelectorAll('h1, .book-hero__meta span, .meta-list strong, .meta-list span, .ficha-note').forEach((node) => {
                detailBits.push(node.textContent || '');
            });

            if (detailTitle) {
                card.dataset.citationTitle = detailTitle;
            }

            if (detailMeta.author) {
                card.dataset.citationAuthor = detailMeta.author;
            }

            if (detailMeta.year) {
                card.dataset.citationYear = detailMeta.year;
            }

            if (detailMeta.journal) {
                card.dataset.citationJournal = detailMeta.journal;
            }

            if (detailMeta.publisher) {
                card.dataset.citationPublisher = detailMeta.publisher;
            }

            if (detailMeta.volume) {
                card.dataset.citationVolume = detailMeta.volume;
            }

            if (detailMeta.issue) {
                card.dataset.citationIssue = detailMeta.issue;
            }

            if (detailMeta.pages) {
                card.dataset.citationPages = detailMeta.pages;
            }

            if (detailMeta.doi) {
                card.dataset.citationDoi = detailMeta.doi;
            }

            if (detailMeta.url) {
                card.dataset.citationUrl = detailMeta.url;
            }

            const enrichedText = `${card.dataset.searchBase || ''} ${detailBits.join(' ')}`;
            card.dataset.searchIndex = normalizeForSearch(enrichedText);
            indexed += 1;

            if (typeof onCardIndexed === 'function') {
                onCardIndexed();
            }
        } catch (error) {
            failed += 1;
        }
    }));

    if (statusNode) {
        if (failed === 0) {
            statusNode.textContent = `Cerca ampliada amb contingut intern de ${indexed} fitxes.`;
        } else {
            statusNode.textContent = `Cerca parcial: ${indexed} fitxes indexades, ${failed} no disponibles.`;
        }
    }
}

function extractCitationMetadataFromDocument(doc) {
    const metadata = {};

    doc.querySelectorAll('.meta-list li').forEach((item) => {
        const label = item.querySelector('strong')?.textContent?.trim();
        const value = item.querySelector('span')?.textContent?.trim();

        if (!label || !value) return;

        const normalizedLabel = normalizeForSearch(label);

        if (normalizedLabel === 'autor') {
            metadata.author = value;
        } else if (normalizedLabel === 'data') {
            metadata.year = value;
        } else if (normalizedLabel === 'revista' || normalizedLabel === 'publicacio' || normalizedLabel === 'publicacion') {
            metadata.journal = value;
        } else if (normalizedLabel === 'editorial') {
            metadata.publisher = value;
        } else if (normalizedLabel === 'volum' || normalizedLabel === 'volumen') {
            metadata.volume = value;
        } else if (normalizedLabel === 'numero' || normalizedLabel === 'numero de revista') {
            metadata.issue = value;
        } else if (normalizedLabel === 'pagines' || normalizedLabel === 'pages') {
            metadata.pages = value;
        } else if (normalizedLabel === 'doi') {
            metadata.doi = value;
        } else if (normalizedLabel === 'url' || normalizedLabel === 'enllac' || normalizedLabel === 'enlace') {
            metadata.url = value;
        }
    });

    const pdfLink = doc.querySelector('.book-hero__actions a[download]')?.getAttribute('href') || '';
    const backLink = doc.querySelector('.book-hero__actions a.secondary')?.getAttribute('href') || '';

    if (!metadata.url) {
        metadata.url = pdfLink || backLink;
    }

    return metadata;
}


// If you want to keep chart helpers available, you can leave them defined below.
// They are not used by the current bibliography page and do not require D3 imports unless activated.
function createBarChart(selector, data, title) {
    const svg = d3.select(selector).append('svg')
        .attr('width', 400)
        .attr('height', 300);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.map(d => d.label));

    const y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.value)]);

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', '#007acc');

    svg.append('text')
        .attr('x', 200)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(title);
}

// Funció per crear gràfic de línia
function createLineChart(selector, data, title) {
    const svg = d3.select(selector).append('svg')
        .attr('width', 400)
        .attr('height', 300);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .rangeRound([0, width])
        .domain(d3.extent(data, d => d.x));

    const y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.y)]);

    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#007acc')
        .attr('stroke-width', 2)
        .attr('d', line);

    svg.append('text')
        .attr('x', 200)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(title);
}

// Funció per crear gràfic de pastís
function createPieChart(selector, data, title) {
    const svg = d3.select(selector).append('svg')
        .attr('width', 400)
        .attr('height', 300);

    const radius = Math.min(400, 300) / 2 - 40;
    const g = svg.append('g')
        .attr('transform', `translate(${200},${150})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = g.selectAll('arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.label));

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => d.data.label);

    svg.append('text')
        .attr('x', 200)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(title);
}
