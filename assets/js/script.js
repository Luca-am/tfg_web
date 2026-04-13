// Script per a visualitzacions de portada de PDF

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el layout se calcule completamente
    requestAnimationFrame(() => {
        renderPdfCovers()
            .then(() => {
                decorateBookCards();
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
            detailButton.textContent = detailLink.dataset.ctaLabel || 'Descobreix el llibre';
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
