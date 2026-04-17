// Script per a visualitzacions de portada de PDF

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el layout se calcule completamente
    requestAnimationFrame(() => {
        renderPdfCovers()
            .then(() => {
                decorateBookCards();
                initBibliographyFilters();
                initDetailCitations();
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

function initDetailCitations() {
    const bibliographyCard = document.querySelector('.ficha-card.ficha-bib');

    if (!bibliographyCard || bibliographyCard.querySelector('.citation-actions')) {
        return;
    }

    hydrateDetailCitationDataset(bibliographyCard, document);

    const metaList = bibliographyCard.querySelector('.meta-list');
    const heroActions = document.querySelector('.book-hero__actions');
    const actions = document.createElement('div');
    actions.className = 'citation-actions citation-actions--detail';

    if (heroActions) {
        actions.classList.add('citation-actions--hero');

        const downloadButton = heroActions.querySelector('a[download]');
        const backButton = heroActions.querySelector('a.secondary');
        const backTarget = document.querySelector('.personal-secondary');

        if (downloadButton) {
            downloadButton.classList.add('hero-action-download');
        }

        if (backButton) {
            backButton.classList.add('detail-back-link');

            if (backTarget) {
                backTarget.appendChild(backButton);
            }
        }
    }

    const menu = document.createElement('div');
    menu.className = 'citation-menu citation-menu--detail';

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
    preview.hidden = true;

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
    actions.appendChild(menu);
    actions.appendChild(preview);
    actions.appendChild(feedback);

    if (heroActions) {
        const downloadButton = heroActions.querySelector('.hero-action-download');

        if (downloadButton) {
            heroActions.insertBefore(actions, downloadButton);
        } else {
            heroActions.prepend(actions);
        }
    } else if (metaList) {
        metaList.insertAdjacentElement('afterend', actions);
    } else {
        bibliographyCard.appendChild(actions);
    }

    actions.addEventListener('click', async (event) => {
        const option = event.target.closest('.citation-menu__option');

        if (!option) {
            return;
        }

        const citationKind = option.dataset.citationKind;
        const citationText = buildApaCitation(bibliographyCard, citationKind);

        if (!citationText) {
            showCitationFeedback(feedback, 'No s\'ha pogut generar la cita.', true);
            hideCitationPreview(actions);
            return;
        }

        try {
            await copyTextToClipboard(citationText);
            showCitationFeedback(feedback, 'Copiat al porta-retalls.');
        } catch (error) {
            showCitationFeedback(feedback, 'No s\'ha pogut copiar.');
        }
    });

    actions.addEventListener('mouseover', handleCitationPreviewUpdate);
    actions.addEventListener('focusin', handleCitationPreviewUpdate);
    actions.addEventListener('mouseleave', () => {
        clearCitationOptionState(actions);
        hideCitationPreview(actions);
    });

    function handleCitationPreviewUpdate(event) {
        const option = event.target.closest('.citation-menu__option');

        if (!option) {
            return;
        }

        const citationKind = option.dataset.citationKind;
        setCitationPreview(bibliographyCard, citationKindToSource(citationKind), actions);
        setCitationOptionState(actions, citationKind);
    }

    actions.addEventListener('focusout', () => {
        window.requestAnimationFrame(() => {
            if (!actions.contains(document.activeElement)) {
                clearCitationOptionState(actions);
                hideCitationPreview(actions);
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!actions.contains(event.target)) {
            clearCitationOptionState(actions);
            hideCitationPreview(actions);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            clearCitationOptionState(actions);
            hideCitationPreview(actions);
        }
    });
}

function citationKindToSource(citationKind) {
    return citationKind || 'intertextual';
}

function setCitationPreview(source, citationKind, actionsNode) {
    if (!source) return;

    const actions = actionsNode || source.querySelector('.citation-actions');
    const preview = actions?.querySelector('.citation-preview');
    const previewText = actions?.querySelector('.citation-preview__text');

    if (!preview || !previewText) return;

    const previewValue = buildApaCitation(source, citationKind);
    previewText.textContent = previewValue || 'No s\'ha pogut generar la cita.';
    preview.hidden = false;
}

function hideCitationPreview(actions) {
    if (!actions) return;

    const preview = actions.querySelector('.citation-preview');

    if (!preview) return;

    preview.hidden = true;
}

function setCitationOptionState(actions, citationKind) {
    if (!actions) return;

    actions.querySelectorAll('.citation-menu__option').forEach((option) => {
        const isActive = option.dataset.citationKind === citationKind;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function clearCitationOptionState(actions) {
    if (!actions) return;

    actions.querySelectorAll('.citation-menu__option').forEach((option) => {
        option.classList.remove('is-active');
        option.setAttribute('aria-pressed', 'false');
    });
}

function hydrateDetailCitationDataset(target, doc) {
    const metadata = extractCitationMetadataFromDocument(doc);
    const title = doc.querySelector('h1')?.textContent?.trim() || '';
    const subtitle = doc.querySelector('.hero-subtitle')?.textContent?.trim() || '';
    const pathname = window.location.pathname.replace(/\\/g, '/');
    const inferredType = /\/articles\//.test(pathname) || /article/i.test(subtitle) ? 'article' : 'book';

    if (title && !target.dataset.citationTitle) {
        target.dataset.citationTitle = title;
    }

    if (metadata.author && !target.dataset.citationAuthor) {
        target.dataset.citationAuthor = metadata.author;
    }

    if (metadata.year && !target.dataset.citationYear) {
        target.dataset.citationYear = metadata.year;
    }

    target.dataset.type = target.dataset.type || inferredType;

    if (metadata.journal) {
        target.dataset.citationJournal = metadata.journal;
    }

    if (metadata.publisher) {
        target.dataset.citationPublisher = metadata.publisher;
    }

    if (metadata.volume) {
        target.dataset.citationVolume = metadata.volume;
    }

    if (metadata.issue) {
        target.dataset.citationIssue = metadata.issue;
    }

    if (metadata.pages) {
        target.dataset.citationPages = metadata.pages;
    }

    if (metadata.doi) {
        target.dataset.citationDoi = metadata.doi;
    }

    if (metadata.url) {
        target.dataset.citationUrl = metadata.url;
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

    // Apply filters from URL params, e.g. bibliography.html?theme=reality
    const urlParams = new URLSearchParams(window.location.search);
    ['type', 'theme'].forEach((group) => {
        const val = urlParams.get(group);
        if (val) {
            const target = bibliography.querySelector(
                `.bibliography-filter__button[data-filter-group="${group}"][data-filter-value="${val}"]`
            );
            if (target) target.click();
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

    const pdfLink = doc.querySelector('.book-hero__actions a[download]')?.href || '';
    const canonicalUrl = window.location.href;

    if (!metadata.url) {
        metadata.url = pdfLink || canonicalUrl;
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
