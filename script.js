// Script per a visualitzacions amb D3.js, inspirat en The Pudding

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js";

document.addEventListener('DOMContentLoaded', function() {
    // Visualització per al resum: un gràfic simple de barres
    const abstractData = [
        { label: 'Objectiu', value: 80 },
        { label: 'Resultats', value: 60 },
        { label: 'Impacte', value: 40 }
    ];

    createBarChart('#abstract-viz', abstractData, 'Aspectes Clau de la Tesi');

    // Gràfic d'introducció: línia per mostrar tendències
    const introData = [
        { x: 0, y: 10 },
        { x: 1, y: 20 },
        { x: 2, y: 35 },
        { x: 3, y: 50 },
        { x: 4, y: 70 }
    ];

    createLineChart('#intro-chart', introData, 'Evolució del Tema');

    // Diagrama de metodologia: cercle amb passos
    const methodData = [
        { label: 'Recerca', value: 30 },
        { label: 'Anàlisi', value: 40 },
        { label: 'Validació', value: 30 }
    ];

    createPieChart('#method-diagram', methodData, 'Passos de la Metodologia');

    // Resultats: gràfic de barres amb dades de mostra
    const resultsData = [
        { label: 'Grup A', value: 45 },
        { label: 'Grup B', value: 65 },
        { label: 'Grup C', value: 30 },
        { label: 'Grup D', value: 80 }
    ];

    createBarChart('#results-viz', resultsData, 'Resultats Principals');

    // Conclusió: resum visual
    const conclusionData = [
        { label: 'Èxit', value: 75 },
        { label: 'Limitacions', value: 25 }
    ];

    createPieChart('#conclusion-summary', conclusionData, 'Resum de la Conclusió');
    renderPdfCovers().then(addPdfOpenButtons);
});

// Scroll animations with Motion
inView("header", () => {
    animate("header h1", { opacity: 1, y: 0 }, { duration: 0.8 });
    animate("header p", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.2 });
});

inView("#abstract", () => {
    animate("#abstract h2", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#abstract p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    animate("#abstract-viz", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.4 });
});

inView("#intro", () => {
    animate("#intro h2", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#intro p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    animate("#intro-chart", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.4 });
});

inView("#method", () => {
    animate("#method h2", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#method p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    animate("#method-diagram", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.4 });
});

inView("#results", () => {
    animate("#results h2", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#results p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    animate("#results-viz", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.4 });
});

inView("#conclusion", () => {
    animate("#conclusion h2", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#conclusion p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    animate("#conclusion-summary", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.4 });
});

inView("#bibliography", () => {
    animate("#bibliography h1", { opacity: 1, y: 0 }, { duration: 0.6 });
    animate("#bibliography p", { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.2 });
    document.querySelectorAll('#bibliography .section-header h2').forEach((title, index) => {
        animate(title, { opacity: 1, y: 0 }, { duration: 0.6, delay: 0.4 + index * 0.15 });
    });
});

async function renderPdfCover(canvas) {
    const card = canvas.closest('.book-card');
    const pdfSrc = card?.dataset?.pdfSrc?.trim();
    if (!pdfSrc) {
        return;
    }

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.392/pdf.worker.min.js';
        const pdfUrl = new URL(pdfSrc, window.location.href).href;
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
    } catch (error) {
        canvas.style.background = '#e2e8f0';
        console.error('No es pot renderitzar el PDF:', pdfSrc, error);
    }
}

function renderPdfCovers() {
    const canvases = document.querySelectorAll('.cover-canvas');
    return Promise.all(Array.from(canvases).map(renderPdfCover));
}

function addPdfOpenButtons() {
    document.querySelectorAll('.book-card[data-pdf-src]').forEach((card) => {
        const pdfSrc = card.dataset.pdfSrc;
        if (!pdfSrc) return;
        if (card.querySelector('.open-pdf')) return;

        const link = document.createElement('a');
        link.className = 'open-pdf';
        link.href = pdfSrc;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Obrir PDF';
        card.appendChild(link);
    });
}


// Funció per crear gràfic de barres
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
}</content>
<parameter name="filePath">c:\Users\Luca\OneDrive\Documents\GitHub\tfg_web\script.js