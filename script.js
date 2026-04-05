// Script per a visualitzacions amb D3.js, inspirat en The Pudding

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
});

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