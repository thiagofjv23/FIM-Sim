// CONTROLE DE NAVEGAÇÃO INTERNA (SINGLE PAGE APPLICATION)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(element => {
        element.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`tab-${tabId}`).classList.add('active');
    // Mapeia qual botão de aba disparou o evento para adicionar classe ativa
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.innerText.toLowerCase().includes(tabId.substring(0,3)));
    if (activeBtn) activeBtn.classList.add('active');
    
    refreshUI();
}

function logEvent(text, type) {
    const consoleEl = document.getElementById('logConsole');
    if(!consoleEl) return;
    const item = document.createElement('div');
    item.className = `log-line ${type || ''}`;
    item.innerText = `[${currentYear}] ${text}`;
    consoleEl.appendChild(item);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// COMPONENTES DINÂMICOS DE ALTERNÂNCIA DE CATEGORIA (BOTÕES DE FILTRO)
function createCategorySelectors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    for (const key in categoriesConfig) {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${activeCategory === key ? 'active' : ''}`;
        btn.innerText = categoriesConfig[key].name;
        btn.onclick = () => {
            activeCategory = key;
            refreshUI();
        };
        container.appendChild(btn);
    }
}

// FLUXO DE RENDERIZAÇÃO COMPLETO E SEGURO
function refreshUI() {
    // Atualizadores Globais estáticos
    document.getElementById('yearIndicator').innerText = `Temporada ${currentYear}`;
    
    const btnSim = document.getElementById('btnSim');
    if (currentRound === totalRoundsPerSeason) {
        btnSim.innerText = `Avançar Ano para ${currentYear + 1} 🗓️`;
        btnSim.className = "btn btn-year-end";
    } else {
        btnSim.innerText = `Simular Etapa ${currentRound + 1}/${totalRoundsPerSeason} 🏁`;
        btnSim.className = "btn btn-sim";
    }

    // Renderiza a aba ativa em plano de fundo
    renderRaceResultWidget();
    renderStandingsTab();
    renderGaragesTab();
}

// CORREÇÃO: EXIBE OS DETALHES COMPLETOS DA ÚLTIMA CORRIDA SIMULADA COM DNFS
function renderRaceResultWidget() {
    const panel = document.getElementById('raceResultPanel');
    if (!lastRaceData || lastRaceData.category !== activeCategory) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    document.getElementById('txtRaceRound').innerText = `Etapa ${lastRaceData.roundNum} - ${categoriesConfig[activeCategory].name}`;
    
    document.getElementById('podium-p1').innerText = lastRaceData.podium[0] || 'N/A';
    document.getElementById('podium-p2').innerText = lastRaceData.podium[1] || 'N/A';
    document.getElementById('podium-p3').innerText = lastRaceData.podium[2] || 'N/A';

    const dnfList = document.getElementById('dnfList');
    dnfList.innerHTML = '';
    
    if (lastRaceData.dnfs.length === 0) {
        dnfList.innerHTML = '<li>🎉 Nenhum abandono registrado! Grid completo cruzou a linha.</li>';
    } else {
        lastRaceData.dnfs.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.flag} ${item.name}</strong> - Motivo: <span style="color:#ef4444">${item.reason}</span>`;
            dnfList.appendChild(li);
        });
    }
}

// EXPÕE AS TABELAS DE PONTUAÇÃO DE PILOTOS E CONSTRUTORES (ABA 2)
function renderStandingsTab() {
    createCategorySelectors('catTabsCamp');
    
    const ridersBody = document.getElementById('standingsRidersBody');
    const teamsBody = document.getElementById('standingsTeamsBody');
    if (!ridersBody || !teamsBody) return;

    const currentRiders = [...ecosystem[activeCategory]];
    
    // 1. Mundial de Pilotos
    currentRiders.sort((a,b) => b.points - a.points);
    ridersBody.innerHTML = '';
    currentRiders.forEach((r, idx) => {
        const tr = document.createElement('tr');
        const regenBadge = r.isReal ? '' : '<span class="fictional-tag">Regen</span>';
        tr.innerHTML = `
            <td class="text-center font-weight-bold">P${idx+1}</td>
            <td><strong>${r.flag} ${r.name}</strong> ${regenBadge}<br><small style="color:#6b7280">${r.team}</small></td>
            <td class="text-center font-mono text-accent">${r.points} pts</td>
        `;
        ridersBody.appendChild(tr);
    });

    // 2. Mundial de Equipes (Soma agregada de ambos os pilotos dos boxes)
    const teamScores = {};
    categoriesConfig[activeCategory].teams.forEach(t => teamScores[t] = 0);
    currentRiders.forEach(r => { if(teamScores[r.team] !== undefined) teamScores[r.team] += r.points; });

    const sortedTeams = Object.keys(teamScores).map(key => ({ name: key, points: teamScores[key] }))
                                               .sort((a,b) => b.points - a.points);

    teamsBody.innerHTML = '';
    sortedTeams.forEach((t, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center font-weight-bold">M${idx+1}</td>
            <td><strong>🛡️ ${t.name}</strong></td>
            <td class="text-center font-mono text-accent">${t.points} pts</td>
        `;
        teamsBody.appendChild(tr);
    });
}

// MAPEA OS BOXES OFICIAIS ATIVOS (ABA 3)
function renderGaragesTab() {
    createCategorySelectors('catTabsGarages');
    const body = document.getElementById('garageTableBody');
    const title = document.getElementById('garageTitle');
    if (!body || !title) return;

    title.innerText = `Alocação de Vagas de Fábrica - ${categoriesConfig[activeCategory].name}`;
    body.innerHTML = '';

    const riders = ecosystem[activeCategory];
    
    categoriesConfig[activeCategory].teams.forEach(teamName => {
        const teamHeader = document.createElement('tr');
        teamHeader.className = 'team-row-head';
        teamHeader.innerHTML = `<td colspan="4">⚡ ${teamName}</td>`;
        body.appendChild(teamHeader);

        const teammates = riders.filter(r => r.team === teamName);
        teammates.forEach(r => {
            const tr = document.createElement('tr');
            const tag = r.isReal ? '' : '<span class="fictional-tag">Regen</span>';
            tr.innerHTML = `
                <td class="text-center sub-desc">${r.seat}</td>
                <td><strong>${r.flag} ${r.name}</strong> ${tag}</td>
                <td class="text-center">${r.age} anos</td>
                <td class="text-center">
                    <span class="stat-badge" style="color:#10b981">${r.speed}</span> / 
                    <span class="stat-badge" style="color:#a78bfa">${r.potential}</span>
                </td>
            `;
            body.appendChild(tr);
        });
    });
}

// INICIALIZADOR COMPATÍVEL COM O SISTEMA WINDOW LOAD
function initUI() {
    switchTab('inicio');
}

window.addEventListener('DOMContentLoaded', initUI);
