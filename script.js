// Script per a visualitzacions de portada de PDF

document.addEventListener('DOMContentLoaded', function() {
    renderPdfCovers()
        .then(() => {
            addPdfOpenButtons();
            decorateBookCards();
        })
        .catch((error) => {
            console.error('Error al renderitzar portades PDF:', error);
        });
});

function decorateBookCards() {
    document.querySelectorAll('.book-card').forEach((card) => {
        const wrapper = card.querySelector('.cover-wrapper');
        const title = card.querySelector('h4');
        const author = card.querySelector('p');
        const button = card.querySelector('.open-pdf');

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

        if (button) {
            button.className = 'open-pdf cover-overlay__button';
            content.appendChild(button);
        }

        overlay.appendChild(content);
        wrapper.appendChild(overlay);

        title.style.display = 'none';
        author.style.display = 'none';
    });
}

async function renderPdfCover(canvas) {
    const card = canvas.closest('.book-card');
    const pdfSrc = card?.dataset?.pdfSrc?.trim();
    if (!pdfSrc) {
        return;
    }

    if (typeof pdfjsLib === 'undefined') {
        console.error('pdfjsLib no està definit. Comprova la inclusió de PDF.js.');
        return;
    }

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js';
        const encodedPath = pdfSrc.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const pdfUrl = new URL(encodedPath, window.location.href).href;
        console.log('PDF cover load:', pdfUrl);
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const wrapper = canvas.parentElement;
        const wrapperHeight = wrapper.clientHeight;

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = wrapperHeight / baseViewport.height;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = 'auto';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        const context = canvas.getContext('2d');
        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
    } catch (error) {
        canvas.style.background = '#e2e8f0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        console.error('No es pot renderitzar el PDF:', pdfSrc, error);
    }
}

function renderPdfCovers() {
    const canvases = document.querySelectorAll('.cover-canvas');
    return Promise.allSettled(Array.from(canvases).map(renderPdfCover));
}

function addPdfOpenButtons() {
    document.querySelectorAll('.book-card[data-pdf-src]').forEach((card) => {
        const pdfSrc = card.dataset.pdfSrc;
        if (!pdfSrc) return;
        if (card.querySelector('.open-pdf')) return;

        const link = document.createElement('a');
        link.className = 'open-pdf';
        link.href = encodeURI(pdfSrc);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Obrir PDF';
        card.appendChild(link);
    });
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