let projectsData = [];
const grid = document.getElementById('project-grid');

// 1. Carga de Dados e Renderização Inicial
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        if (!response.ok) throw new Error();
        projectsData = await response.json();
        renderCards();
    } catch {
        if (grid) grid.innerHTML = "<p class='error-message'>Erro ao carregar os projetos. Verifique o console.</p>";
    }
}

function getRandomLayoutClass() {
    const random = Math.random();
    if (random < 0.6) return ''; // Aqui pode ser vazio (normal)
    if (random < 0.8) return ''; // Aqui pode ser wide
    return ''; // Aqui pode ser tall
}

// 2. Construção de Interface (Cards)
function renderCards() {
    if (!grid) return;
    grid.innerHTML = projectsData.map(p => {
        const layoutClass = getRandomLayoutClass();
        const tags = p.tags.map(t => `<span class="tag ${t.class}">${t.name}</span>`).join('');
        const links = [
            { url: p.prodUrl, icon: 'external-link', label: 'Produção' },
            { url: p.repoUrl, icon: 'git-branch', label: 'Repositório' }
        ].filter(l => l.url).map(l => `
            <a href="${l.url}" target="_blank" class="card-link-btn" onclick="event.stopPropagation()">
                <i data-lucide="${l.icon}" class="lucide-icon"></i> ${l.label}
            </a>`).join('');

        // Constrói os detalhes dinamicamente baseando-se em challenge e solution
        let detailsHTML = '';
        if (p.challenge) {
            detailsHTML += `<h2>O Desafio</h2><p>${p.challenge}</p>`;
        }
        if (p.solution) {
            detailsHTML += `<h2>A Solução</h2><p>${p.solution}</p>`;
        }
        if (!detailsHTML) {
            detailsHTML = '<p>Detalhes adicionais em breve...</p>';
        }

        return `
            <div class="card ${layoutClass}" data-category="${p.category}" onclick="expandCard(this)">
                <button class="minimize-btn" onclick="minimizeCard(event, this)"><i data-lucide="minus"></i></button>
                <div class="tags-wrapper">${tags}</div>
                <div class="card-header"><h3>${p.title}</h3><p>${p.description}</p></div>
                <div class="card-details">${detailsHTML}</div>
                ${links ? `<div class="card-links">${links}</div>` : ''}
            </div>`;
    }).join('');
    lucide.createIcons();
}

// 3. Sistema de Filtros
function filterProjects(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));

    document.querySelectorAll('.card').forEach(card => {
        if (card.classList.contains('expanded')) minimizeCard({ stopPropagation: () => { } }, card.querySelector('.minimize-btn'));

        const isVisible = category === 'all' || card.getAttribute('data-category') === category;
        card.classList.toggle('hidden', !isVisible);
        if (isVisible) {
            card.classList.remove('animate-fade-in');
            card.offsetHeight; // Trigger reflow
            card.classList.add('animate-fade-in');
        }
    });
}

// 4. Mecânica de Expansão e Minimização
function expandCard(card) {
    if (card.classList.contains('expanded')) return;

    const rect = card.getBoundingClientRect();
    const placeholder = card.cloneNode(false);
    placeholder.className += ' placeholder';
    placeholder.style.visibility = 'hidden';

    card._placeholder = placeholder;
    card.parentNode.insertBefore(placeholder, card);

    Object.assign(card.style, {
        position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', zIndex: '9999'
    });

    card.offsetHeight; // Flush styles
    card.classList.add('expanded');
    Object.assign(card.style, { top: '0', left: '0', width: '100vw', height: '100vh' });
    document.body.style.overflow = 'hidden';
}

function minimizeCard(event, btn) {
    event.stopPropagation();
    const card = btn.closest('.card');
    const p = card._placeholder;

    if (!p) return;
    card.classList.remove('expanded');
    const rect = p.getBoundingClientRect();
    Object.assign(card.style, { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px` });

    setTimeout(() => {
        if (card.classList.contains('expanded')) return;
        Object.assign(card.style, { position: '', top: '', left: '', width: '', height: '', margin: '', zIndex: '' });
        p.remove();
        card._placeholder = null;
        document.body.style.overflow = '';
    }, 400);
}

loadProjects();