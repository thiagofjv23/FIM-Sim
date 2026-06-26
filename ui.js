// CONTROLE DE NAVEGAÇÃO INTERNA (SINGLE PAGE APPLICATION)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(element => {
        element.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`tab-${tabId}`).classList.add('active');
    
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

// COMPONENTES DINÂMICOS DE ALTERNÂNCIA DE CATEGORIA
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
            refreshUI(); // Atualiza a renderização focando na nova categoria selecionada
        };
        container.appendChild(btn);
    }
}

// FLUXO DE RENDERIZAÇÃO COMPLETO
function refreshUI() {
    document.getElementById('yearIndicator').innerText = `Temporada ${currentYear}`;
    
    const btnSim = document.getElementById('btnSim');
    if (currentRound === totalRoundsPerSeason) {
        btnSim.innerText = `Avançar Ano para ${currentYear + 1} 🗓️`;
        btnSim.className = "btn btn-year-end";
    } else {
        btnSim.innerText = `Simular Etapa ${currentRound + 1}/${totalRoundsPerSeason} 🏁`;
        btnSim.className = "btn btn-sim";
    }

    renderRaceResultWidget();
    renderStandingsTab();
    renderGaragesTab();
    renderTransferPanel();
}

// EXIBE OS DETALHES DA ÚLTIMA CORRIDA BASEADO NA ABA ATIVA
function renderRaceResultWidget() {
    const panel = document.getElementById('raceResultPanel');
    
    // Valida se há dados salvos e se a categoria atual possui registros mapeados
    if (!lastRaceData || !lastRaceData[activeCategory]) {
        panel.style.display = 'none';
        return;
    }

    // Isola os dados exclusivos da categoria que o usuário está visualizando
    const activeRaceData = lastRaceData[activeCategory];

    panel.style.display = 'block';
    document.getElementById('txtRaceRound').innerText = `Etapa ${activeRaceData.roundNum} - ${categoriesConfig[activeCategory].name}`;
    
    document.getElementById('podium-p1').innerText = activeRaceData.podium[0]?.display || 'N/A';
    document.getElementById('podium-p2').innerText = activeRaceData.podium[1]?.display || 'N/A';
    document.getElementById('podium-p3').innerText = activeRaceData.podium[2]?.display || 'N/A';

    const dnfList = document.getElementById('dnfList');
    dnfList.innerHTML = '';
    
    if (activeRaceData.dnfs.length === 0) {
        dnfList.innerHTML = '<li>🎉 Nenhum abandono registrado! Grid completo cruzou a linha.</li>';
    } else {
        activeRaceData.dnfs.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.flag} ${item.name}</strong> - Motivo: <span style="color:#ef4444">${item.reason}</span>`;
            dnfList.appendChild(li);
        });
    }
}

// EXPÕE AS TABELAS DE PONTUAÇÃO DE PILOTOS E CONSTRUTORES
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
        const riderIdDisplay = `<span style="font-size: 0.8em; color: #9ca3af;">ID: ${r.riderId}</span>`;
        tr.innerHTML = `
            <td class="text-center font-weight-bold">P${idx+1}</td>
            <td>
                <strong>${r.flag} ${r.name}</strong> ${regenBadge}
                <br><small style="color:#6b7280">${r.team} - Assento ${r.seat}</small>
                <br>${riderIdDisplay}
            </td>
            <td class="text-center font-mono text-accent">${r.points} pts</td>
        `;
        ridersBody.appendChild(tr);
    });

    // 2. Mundial de Equipes
    const teamScores = {};
    // CORREÇÃO: Usar teamObj.name como chave do objeto de pontuação
    categoriesConfig[activeCategory].teams.forEach(teamObj => teamScores[teamObj.name] = 0);
    
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


// MAPEA OS BOXES OFICIAIS ATIVOS
function renderGaragesTab() {
    createCategorySelectors('catTabsGarages');
    const body = document.getElementById('garageTableBody');
    const title = document.getElementById('garageTitle');
    if (!body || !title) return;

    title.innerText = `Alocação de Vagas de Fábrica - ${categoriesConfig[activeCategory].name}`;
    body.innerHTML = '';
    const riders = ecosystem[activeCategory];
    
    // CORREÇÃO: Iterar sobre o teamObj e acessar a propriedade .name
    categoriesConfig[activeCategory].teams.forEach(teamObj => {
        const teamHeader = document.createElement('tr');
        teamHeader.className = 'team-row-head';
        teamHeader.innerHTML = `<td colspan="5">⚡ ${teamObj.name}</td>`;
        body.appendChild(teamHeader);

        // O filtro agora compara r.team com teamObj.name
        const teammates = riders.filter(r => r.team === teamObj.name);
        teammates.forEach(r => {
            const tr = document.createElement('tr');
            const tag = r.isReal ? '' : '<span class="fictional-tag">Regen</span>';
            const transferBtn = `<button class="btn-small" onclick="openTransferModal(${r.riderId})">📋 Transfer</button>`;
            tr.innerHTML = `
                <td class="text-center sub-desc">Assento ${r.seat}</td>
                <td><strong>${r.flag} ${r.name}</strong> ${tag}</td>
                <td class="text-center">${r.age} anos</td>
                <td class="text-center">
                    <span class="stat-badge" style="color:#10b981">${r.speed}</span> / 
                    <span class="stat-badge" style="color:#a78bfa">${r.potential}</span>
                </td>
                <td class="text-center">${transferBtn}</td>
            `;
            body.appendChild(tr);
        });
    });
}



// ==========================================================================
// SISTEMA DE TRANSFERÊNCIA DE PILOTOS (UI)
// ==========================================================================

function openTransferModal(riderId) {
    const transferOptions = getTransferOptions(riderId);
    
    if (!transferOptions) {
        alert("❌ Piloto não encontrado");
        return;
    }

    const modal = document.createElement('div');
    modal.id = `modal-transfer-${riderId}`;
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: #1f2937;
        border: 2px solid #fbbf24;
        border-radius: 8px;
        padding: 24px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        color: white;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    `;

    const rider = transferOptions.rider;
    const currentTeam = transferOptions.currentTeam;
    const currentSeat = transferOptions.currentSeat;
    const availableTransfers = transferOptions.availableTransfers;

    let html = `
        <h2 style="margin-top: 0; color: #fbbf24;">📋 Transferência de Piloto</h2>
        <div style="margin-bottom: 20px; padding: 12px; background: #374151; border-radius: 6px;">
            <p><strong>${rider.flag} ${rider.name}</strong></p>
            <p style="margin: 0; color: #9ca3af;">
                Equipe Atual: <strong>${currentTeam}</strong> - Assento <strong>${currentSeat}</strong>
            </p>
            <p style="margin: 0; color: #9ca3af;">ID do Piloto: <strong>${rider.riderId}</strong></p>
        </div>
    `;

    if (availableTransfers.length === 0) {
        html += `<p style="color: #ef4444;">❌ Nenhuma vaga disponível nesta categoria.</p>`;
    } else {
        html += `<p style="margin-bottom: 12px; color: #d1d5db;">Selecione a nova equipe e assento:</p>`;
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;

        availableTransfers.forEach(teamOption => {
            teamOption.availableSeats.forEach(seat => {
                const btnId = `transfer-btn-${riderId}-${teamOption.teamId}-${seat}`;
                html += `
                    <button 
                        id="${btnId}"
                        class="btn-transfer"
                        onclick="confirmTransfer(${riderId}, ${teamOption.teamId}, ${seat})"
                        style="
                            padding: 12px;
                            background: #10b981;
                            border: none;
                            border-radius: 6px;
                            color: white;
                            cursor: pointer;
                            font-weight: bold;
                            text-align: left;
                            transition: background 0.2s;
                        "
                        onmouseover="this.style.background='#059669'"
                        onmouseout="this.style.background='#10b981'"
                    >
                        ✔ ${teamOption.teamName} - Assento ${seat}
                    </button>
                `;
            });
        });

        html += `</div>`;
    }

    html += `
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button 
                class="btn-cancel"
                onclick="closeTransferModal(${riderId})"
                style="
                    flex: 1;
                    padding: 10px;
                    background: #6b7280;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.2s;
                "
                onmouseover="this.style.background='#4b5563'"
                onmouseout="this.style.background='#6b7280'"
            >
                ✖ Cancelar
            </button>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
        if (e.target === modal) closeTransferModal(riderId);
    };
}

function confirmTransfer(riderId, teamId, seat) {
    const success = executeRiderTransfer(riderId, teamId, seat);
    
    if (success) {
        closeTransferModal(riderId);
        refreshUI();
        logEvent(`✔ Transferência concluída com sucesso!`, "success");
    } else {
        alert("❌ Falha ao executar transferência. Verifique os dados.");
    }
}

function closeTransferModal(riderId) {
    const modal = document.getElementById(`modal-transfer-${riderId}`);
    if (modal) {
        modal.remove();
    }
}

/**
 * Renderizar painel de transferências (resumo e gerenciamento)
 */
function renderTransferPanel() {
    const panel = document.getElementById('transferPanel');
    if (!panel) return;

    const riders = ecosystem[activeCategory];
    
    let html = `
        <h3 style="margin-top: 0; color: #fbbf24;">📋 Gerenciamento de Transferências</h3>
        <p style="color: #9ca3af; font-size: 0.9em;">Clique no botão "Transfer" na aba Garagens para transferir um piloto.</p>
        <div style="background: #374151; border-radius: 6px; padding: 12px; margin-top: 12px;">
            <p style="margin: 0;"><strong>Status do Grid:</strong></p>
            <p style="margin: 8px 0 0 0; color: #d1d5db;">Total de pilotos: <strong>${riders.length}</strong></p>
            <p style="margin: 8px 0 0 0; color: #d1d5db;">Temporada: <strong>${currentYear}</strong></p>
            <p style="margin: 8px 0 0 0; color: #d1d5db;">Categoria: <strong>${categoriesConfig[activeCategory].name}</strong></p>
    `;

    // Listar pilotos por equipe com seus IDs
    const teamGroups = {};
    riders.forEach(r => {
        if (!teamGroups[r.team]) teamGroups[r.team] = [];
        teamGroups[r.team].push(r);
    });

    html += `<div style="margin-top: 16px; border-top: 1px solid #4b5563; padding-top: 12px;">`;
    html += `<p style="margin-top: 0; color: #9ca3af; font-size: 0.85em;">Composição das Equipes:</p>`;
    
    Object.entries(teamGroups).forEach(([teamName, teamRiders]) => {
        html += `<p style="margin: 8px 0; color: #e5e7eb; font-size: 0.9em;">`;
        html += `<strong>${teamName}:</strong> `;
        html += teamRiders.map(r => `${r.flag} ${r.name} (ID: ${r.riderId})`).join(", ");
        html += `</p>`;
    });

    html += `</div></div>`;

    panel.innerHTML = html;
}

// INICIALIZADOR COMPATÍVEL
function initUI() {
    switchTab('inicio');
    if (typeof createCategorySelectors === "function") {
        createCategorySelectors('catTabsCamp');
        createCategorySelectors('catTabsGarages');
    }
}

window.addEventListener('DOMContentLoaded', initUI);
