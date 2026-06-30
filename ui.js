let selectedHistoryRound = null;
let selectedHistoryYear = null;

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
    item.innerHTML = `[${currentYear}] ${text}`;
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
            selectedHistoryRound = null;
            selectedHistoryYear = null;
            refreshUI();
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
    if (typeof renderFinancesTab === 'function') renderFinancesTab();
    renderTransfersTab();
    renderHistoricoTab();
}

// EXIBE OS DETALHES DA ÚLTIMA CORRIDA BASEADO NA ABA ATIVA
function renderRaceResultWidget() {
    const panel = document.getElementById('raceResultPanel');
    if (!panel) return;

    if (!lastRaceData || lastRaceData.catKey !== activeCategory) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    document.getElementById('txtRaceRound').innerText = `Etapa ${lastRaceData.round}/${totalRoundsPerSeason} - ${categoriesConfig[activeCategory].name}`;

    const p1 = lastRaceData.finishers[0];
    const p2 = lastRaceData.finishers[1];
    const p3 = lastRaceData.finishers[2];
    document.getElementById('podium-p1').innerText = p1 ? `${p1.flag} ${p1.name}` : 'N/A';
    document.getElementById('podium-p2').innerText = p2 ? `${p2.flag} ${p2.name}` : 'N/A';
    document.getElementById('podium-p3').innerText = p3 ? `${p3.flag} ${p3.name}` : 'N/A';

    const dnfList = document.getElementById('dnfList');
    dnfList.innerHTML = '';
    if (!lastRaceData.dnfs || lastRaceData.dnfs.length === 0) {
        dnfList.innerHTML = '<li>Nenhum abandono registrado. Grid completo cruzou a linha.</li>';
    } else {
        lastRaceData.dnfs.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.flag} ${item.name}</strong> - <span style="color:#9ca3af">${item.team}</span>`;
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
                <a href="#" onclick="openRiderProfile(${r.riderId}); return false;" style="color: white; text-decoration: none; border-bottom: 1px dashed var(--text-secondary);">
                    <strong>${r.flag} ${r.name}</strong>
                </a> ${regenBadge}
                <br><small style="color:#6b7280">${r.team} - Assento ${r.seat}</small>
                <br>${riderIdDisplay}
            </td>
            <td class="text-center font-mono text-accent">${r.points} pts</td>
        `;
        ridersBody.appendChild(tr);
    });

    // 2. Mundial de Equipes (CORRIGIDO)
    const teamScores = {};
    
    // Agora extraímos corretamente a propriedade .name do objeto da equipe
    categoriesConfig[activeCategory].teams.forEach(t => {
        const teamName = t.name || t; // Failsafe para suportar objetos ou strings
        teamScores[teamName] = 0;
    });
    
    currentRiders.forEach(r => { 
        if(teamScores[r.team] !== undefined) {
            teamScores[r.team] += r.points; 
        }
    });
    
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

    renderRaceHistoryPanel();
}

function renderRaceHistoryPanel() {
    const section = document.getElementById('raceHistorySection');
    if (!section) return;

    const rounds = (raceHistory || [])
        .filter(r => r.cat === activeCategory && r.year === currentYear)
        .sort((a, b) => a.round - b.round);

    if (rounds.length === 0) {
        section.innerHTML = '';
        return;
    }

    if (selectedHistoryRound === null || !rounds.find(r => r.round === selectedHistoryRound)) {
        selectedHistoryRound = rounds[rounds.length - 1].round;
    }

    const entry = rounds.find(r => r.round === selectedHistoryRound);

    const btns = rounds.map(r => `
        <button class="tab-btn ${r.round === selectedHistoryRound ? 'active' : ''}"
            onclick="selectedHistoryRound = ${r.round}; renderRaceHistoryPanel();">
            Etapa ${r.round}
        </button>
    `).join('');

    const rows = entry ? entry.results.map(r => `
        <tr>
            <td class="text-center font-weight-bold">${r.pos}º</td>
            <td>${r.flag} <strong>${r.name}</strong><br><small style="color:#6b7280">${r.team}</small></td>
            <td class="text-center font-mono" style="color:#94a3b8">0:00.000</td>
            <td class="text-center font-mono text-accent">${r.pts} pts</td>
        </tr>
    `).join('') : '';

    const dnfRows = entry && entry.dnfs.length > 0
        ? entry.dnfs.map(d => `<li>${d.flag} ${d.name} <small style="color:#6b7280">(${d.team})</small></li>`).join('')
        : '';

    section.innerHTML = `
        <div class="panel-box" style="margin-top:1.5rem">
            <div class="panel-header">📋 Resultados por Etapa — Temporada ${currentYear}</div>
            <div class="category-tabs" style="margin-bottom:1rem">${btns}</div>
            <div class="table-res">
                <table>
                    <thead><tr>
                        <th style="width:10%" class="text-center">Pos</th>
                        <th style="width:55%">Piloto</th>
                        <th style="width:20%" class="text-center">Tempo</th>
                        <th style="width:15%" class="text-center">Pts</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            ${dnfRows ? `<div class="dnf-box"><h4>⚠️ DNF</h4><ul>${dnfRows}</ul></div>` : ''}
        </div>
    `;
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

        const teammates = riders.filter(r => r.teamId === teamObj.id);
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

    const salaryVal = rider.salary || 0;
    const isPayDriver = salaryVal < 0;
    const salaryLabel = isPayDriver
        ? `<span style="color:#34d399;">💰 Pay Driver: +${Math.abs(salaryVal).toFixed(3)}M€/ano (equipe recebe)</span>`
        : `<span style="color:#fbbf24;">Salário: ${salaryVal.toFixed(3)}M€/ano</span>`;
    const contractLabel = rider.contractEndYear ? `Contrato até ${rider.contractEndYear}` : '';

    let html = `
        <h2 style="margin-top: 0; color: #fbbf24;">📋 Transferência de Piloto</h2>
        <div style="margin-bottom: 20px; padding: 12px; background: #374151; border-radius: 6px;">
            <p style="margin:0 0 4px 0;"><strong>${rider.flag} ${rider.name}</strong>${isPayDriver ? ' <span style="background:#065f46;color:#6ee7b7;padding:2px 6px;border-radius:4px;font-size:0.8em;">PAY DRIVER</span>' : ''}</p>
            <p style="margin: 0; color: #9ca3af;">
                Equipe Atual: <strong>${currentTeam}</strong> - Assento <strong>${currentSeat}</strong>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 0.9em;">${salaryLabel}${contractLabel ? ` &nbsp;·&nbsp; <span style="color:#9ca3af;">${contractLabel}</span>` : ''}</p>
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
                const tfState = teamFinancesState[teamOption.teamId];
                const balanceInfo = tfState
                    ? `<span style="font-size:0.8em;font-weight:normal;opacity:0.85;"> · Saldo: ${tfState.balance >= 0 ? '<span style="color:#6ee7b7;">' : '<span style="color:#f87171;">'}${tfState.balance.toFixed(2)}M€</span></span>`
                    : '';
                html += `
                    <button
                        id="${btnId}"
                        class="btn-transfer"
                        onclick="confirmTransfer(${riderId}, '${teamOption.teamId}', ${seat})"
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
                        ✔ ${teamOption.teamName} - Assento ${seat}${balanceInfo}
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
        </div>
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

    html += `</div>`;

    panel.innerHTML = html;
}

// INICIALIZADOR COMPATÍVEL
function initUI() {
    // Ensure financial state is initialized if not already done
    if (typeof initTeamFinances === 'function' && typeof teamFinancesState !== 'undefined' && Object.keys(teamFinancesState).length === 0) {
        initTeamFinances();
    }
    switchTab('inicio');
    if (typeof createCategorySelectors === "function") {
        createCategorySelectors('catTabsCamp');
        createCategorySelectors('catTabsGarages');
        createCategorySelectors('catTabsFinancas');
    }
}

window.addEventListener('DOMContentLoaded', initUI);

/**
 * Abre o perfil detalhado do piloto (estilo MotoGP Oficial)
 * @param {number} riderId - O ID do piloto a ser inspecionado
 * @param {string} categoryKey - A categoria em que ele corre (ex: 'motogp')
 */
function openRiderProfile(riderId, categoryKey = activeCategory) {
    try {
        const grid = ecosystem[categoryKey];
        const rider = grid.find(r => r.riderId === riderId);
        
        if (!rider) throw new Error("Piloto não encontrado no grid ativo.");

        // 1. Programação Defensiva: Garante que os stats existam
        rider.stats = rider.stats || { wins: 0, podiums: 0, poles: 0, races: 0, dnfs: 0 };

        // 2. Cálculo em Tempo Real da Posição
        const sortedGrid = [...grid].sort((a, b) => b.points - a.points);
        const championshipPos = sortedGrid.findIndex(r => r.riderId === riderId) + 1;

        // 3. Busca Relacional do Companheiro de Equipe
        const teammate = grid.find(r => r.teamId === rider.teamId && r.riderId !== riderId);
        const teammateName = teammate ? teammate.name : "N/A";

        // Criação do Elemento Modal
        const modal = document.createElement('div');
        modal.id = `modal-profile-${riderId}`;
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); display: flex;
            justify-content: center; align-items: center; z-index: 2000; padding: 1rem;
        `;

        // Split do nome para o efeito visual (Nome menor em cima, Sobrenome maior)
        const nameParts = rider.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Utilizar o assento ou o ID de forma estilizada caso não tenhamos números oficiais de corrida ainda
        const displayNum = rider.isReal ? (rider.riderId.toString().slice(-2)) : rider.seat;

        const html = `
            <div class="profile-modal-content">
                <div style="text-align: right; padding: 10px;">
                    <button onclick="document.getElementById('modal-profile-${riderId}').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                
                <div class="profile-header">
                    <div class="profile-number">${displayNum}</div>
                    <div class="profile-name">
                        <span style="font-size: 0.6em; display: block; color: var(--text-secondary);">${rider.flag} ${firstName}</span>
                        ${lastName || firstName}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--accent); font-weight: bold; text-transform: uppercase;">
                        ${rider.team}
                    </div>
                </div>

                <div style="padding: 1rem 0 0;">
                    <div class="profile-tabs">
                        <button class="profile-tab active">${currentYear} Season</button>
                        <button class="profile-tab">Attributes</button>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Position</div>
                        <div class="stat-value">${championshipPos}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Points</div>
                        <div class="stat-value">${rider.points}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Victories</div>
                        <div class="stat-value">${rider.stats.wins}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Podiums</div>
                        <div class="stat-value">${rider.stats.podiums}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Poles</div>
                        <div class="stat-value">${rider.stats.poles}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Races</div>
                        <div class="stat-value">${rider.stats.races}</div>
                    </div>
                </div>

                ${teammate ? `
                <div class="teammate-card" onclick="document.getElementById('modal-profile-${riderId}').remove(); openRiderProfile(${teammate.riderId}, '${categoryKey}')">
                    <div>
                        <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 2px;">Teammate</div>
                        <div style="font-weight: bold; font-size: 0.95rem;">${teammate.flag} ${teammateName}</div>
                    </div>
                    <div style="color: var(--text-secondary);">›</div>
                </div>` : ''}
            </div>
        `;

        modal.innerHTML = html;
        document.body.appendChild(modal);

        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

    } catch (error) {
        console.warn(`[UI] Falha ao renderizar perfil do piloto: ${error.message}`);
    }
}

function renderTransfersTab() {
    createCategorySelectors('catTabsTransfers');

    const header = document.getElementById('transfersHeader');
    const content = document.getElementById('transfersContent');
    if (!header || !content) return;

    const transfers = (typeof lastYearTransfers !== 'undefined') ? lastYearTransfers : [];
    const fas = (typeof freeAgents !== 'undefined') ? freeAgents : [];

    if (!transfers || transfers.length === 0) {
        header.textContent = 'Mercado de Transferências';
        const faRows = fas.length
            ? fas.map(r => `<tr>
                <td>${r.flag} ${r.name}${r.isReal ? ' <span style="font-size:0.65rem;background:var(--accent);color:#000;border-radius:3px;padding:1px 4px;">REAL</span>' : ''}</td>
                <td class="text-center">${r.age}</td>
                <td class="text-center">${r.speed}</td>
                <td class="text-center">${r.potential}</td>
                <td>${r.previousTeam || '—'}</td>
            </tr>`).join('')
            : `<tr><td colspan="5" style="color:var(--text-secondary);text-align:center;">Pool vazio</td></tr>`;
        content.innerHTML = `
            <p style="color:var(--text-secondary);padding:0.5rem 0 1rem;">Nenhuma transferência registrada nesta temporada.</p>
            <div class="panel-header" style="font-size:0.9rem;">⚡ Free Agents Disponíveis (${fas.length})</div>
            <div class="table-res"><table>
                <thead><tr>
                    <th style="width:35%">Piloto</th>
                    <th style="width:8%" class="text-center">Idade</th>
                    <th style="width:8%" class="text-center">Vel</th>
                    <th style="width:8%" class="text-center">Pot</th>
                    <th style="width:41%">Equipe Anterior</th>
                </tr></thead>
                <tbody>${faRows}</tbody>
            </table></div>`;
        return;
    }

    const filtered  = transfers.filter(t => t.cat === activeCategory);
    const saidas    = filtered.filter(t => t.type === 'saida');
    const entradas  = filtered.filter(t => t.type === 'entrada');
    const renovacoes = filtered.filter(t => t.type === 'renovacao');

    header.textContent = `Mercado — Temporada ${currentYear - 1} → ${currentYear}  |  📤 ${saidas.length}  |  📥 ${entradas.length}  |  🔄 ${renovacoes.length}  |  ⚡ ${fas.length} FA`;

    const realBadge = (r) => r.isReal
        ? `<span style="font-size:0.65rem;background:var(--accent);color:#000;border-radius:3px;padding:1px 4px;margin-left:4px;">REAL</span>`
        : '';

    const rowsSaidas = saidas.length
        ? saidas.map(t => `<tr>
                <td>${t.rider.flag} ${t.rider.name}${realBadge(t.rider)}</td>
                <td class="text-center">${t.rider.age}</td>
                <td>${t.motivo}</td>
            </tr>`).join('')
        : `<tr><td colspan="3" style="color:var(--text-secondary);text-align:center;">Sem saídas nesta categoria</td></tr>`;

    const rowsEntradas = entradas.length
        ? entradas.map(t => {
            const novoBadge = !t.rider.isReal
                ? `<span style="font-size:0.65rem;background:#2a6e2a;color:#aaffaa;border-radius:3px;padding:1px 4px;margin-left:4px;">NOVO</span>`
                : '';
            const origem = t.previousTeam ? `${t.previousTeam} → ${t.team}` : `Novato → ${t.team}`;
            return `<tr>
                <td>${t.rider.flag} ${t.rider.name}${novoBadge}${realBadge(t.rider)}</td>
                <td class="text-center">${t.rider.age}</td>
                <td style="font-size:0.8rem;">${origem}</td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="3" style="color:var(--text-secondary);text-align:center;">Sem contratações nesta categoria</td></tr>`;

    const rowsRenovacoes = renovacoes.length
        ? renovacoes.map(t => `<tr>
                <td>${t.rider.flag} ${t.rider.name}${realBadge(t.rider)}</td>
                <td class="text-center">${t.rider.age}</td>
                <td>${t.team}</td>
                <td class="text-center">+${t.years} ano${t.years > 1 ? 's' : ''}</td>
            </tr>`).join('')
        : `<tr><td colspan="4" style="color:var(--text-secondary);text-align:center;">Sem renovações nesta categoria</td></tr>`;

    const rowsFA = fas.length
        ? fas.map(r => `<tr>
                <td>${r.flag} ${r.name}${realBadge(r)}</td>
                <td class="text-center">${r.age}</td>
                <td class="text-center">${r.speed}</td>
                <td class="text-center">${r.potential}</td>
                <td style="font-size:0.8rem;">${r.previousTeam || '—'}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="color:var(--text-secondary);text-align:center;">Pool vazio</td></tr>`;

    content.innerHTML = `
        <div class="grid-layout">
            <div>
                <div class="panel-header" style="font-size:0.9rem;">📤 Saídas / Liberados</div>
                <div class="table-res"><table>
                    <thead><tr>
                        <th style="width:45%">Piloto</th>
                        <th style="width:10%" class="text-center">Idade</th>
                        <th style="width:45%">Motivo</th>
                    </tr></thead>
                    <tbody>${rowsSaidas}</tbody>
                </table></div>
            </div>
            <div>
                <div class="panel-header" style="font-size:0.9rem;">📥 Contratações</div>
                <div class="table-res"><table>
                    <thead><tr>
                        <th style="width:30%">Piloto</th>
                        <th style="width:8%" class="text-center">Idade</th>
                        <th style="width:62%">Origem → Destino</th>
                    </tr></thead>
                    <tbody>${rowsEntradas}</tbody>
                </table></div>
            </div>
        </div>
        <div class="grid-layout" style="margin-top:1rem;">
            <div>
                <div class="panel-header" style="font-size:0.9rem;">🔄 Contratos Renovados</div>
                <div class="table-res"><table>
                    <thead><tr>
                        <th style="width:35%">Piloto</th>
                        <th style="width:10%" class="text-center">Idade</th>
                        <th style="width:45%">Equipe</th>
                        <th style="width:10%" class="text-center">Duração</th>
                    </tr></thead>
                    <tbody>${rowsRenovacoes}</tbody>
                </table></div>
            </div>
            <div>
                <div class="panel-header" style="font-size:0.9rem;">⚡ Free Agents Disponíveis (${fas.length})</div>
                <div class="table-res"><table>
                    <thead><tr>
                        <th style="width:30%">Piloto</th>
                        <th style="width:8%" class="text-center">Idade</th>
                        <th style="width:8%" class="text-center">Vel</th>
                        <th style="width:8%" class="text-center">Pot</th>
                        <th style="width:46%">Equipe Anterior</th>
                    </tr></thead>
                    <tbody>${rowsFA}</tbody>
                </table></div>
            </div>
        </div>`;
}

function renderHistoricoTab() {
    const container = document.getElementById('historicoContent');
    if (!container) return;

    createCategorySelectors('catTabsHistorico');

    const arc = (typeof seasonArchive !== 'undefined') ? seasonArchive : [];
    const catArchive = arc.filter(s => s.standings && s.standings[activeCategory]);

    if (selectedHistoryYear === null && catArchive.length > 0) {
        selectedHistoryYear = catArchive[catArchive.length - 1].year;
    }

    // Palmarès
    const palmares = catArchive.length === 0
        ? `<p style="color:var(--text-secondary);text-align:center;padding:2rem">Nenhuma temporada encerrada ainda.</p>`
        : `<div class="table-res"><table>
               <thead><tr>
                   <th class="text-center" style="width:15%">Ano</th>
                   <th style="width:50%">Campeão</th>
                   <th style="width:20%">Equipe</th>
                   <th class="text-center" style="width:15%">Pts</th>
               </tr></thead>
               <tbody>
               ${catArchive.slice().reverse().map(s => {
                   const champ = s.standings[activeCategory][0];
                   const active = s.year === selectedHistoryYear;
                   return `<tr style="cursor:pointer;${active ? 'background:rgba(229,0,20,0.08)' : ''}"
                               onclick="selectedHistoryYear=${s.year};renderHistoricoTab()">
                       <td class="text-center" style="color:var(--text-secondary)">${s.year}</td>
                       <td>${champ.flag} <strong>${champ.name}</strong></td>
                       <td style="color:var(--text-secondary);font-size:0.8em">${champ.team}</td>
                       <td class="text-center" style="color:var(--accent);font-weight:700">${champ.points}</td>
                   </tr>`;
               }).join('')}
               </tbody>
           </table></div>`;

    // Classificação final do ano selecionado
    const yearData = catArchive.find(s => s.year === selectedHistoryYear);
    const detail = !yearData
        ? `<p style="color:var(--text-secondary);text-align:center;padding:2rem">Selecione um ano.</p>`
        : `<div class="table-res"><table>
               <thead><tr>
                   <th class="text-center" style="width:8%">Pos</th>
                   <th style="width:42%">Piloto</th>
                   <th style="width:22%">Equipe</th>
                   <th class="text-center" style="width:10%">Pts</th>
                   <th class="text-center" style="width:9%">V</th>
                   <th class="text-center" style="width:9%">P</th>
               </tr></thead>
               <tbody>
               ${yearData.standings[activeCategory].map(r => `
                   <tr>
                       <td class="text-center" style="color:var(--text-secondary)">${r.pos}º</td>
                       <td>${r.flag} <strong>${r.name}</strong></td>
                       <td style="color:var(--text-secondary);font-size:0.8em">${r.team}</td>
                       <td class="text-center" style="color:var(--accent);font-weight:700">${r.points}</td>
                       <td class="text-center">${r.wins}</td>
                       <td class="text-center">${r.podiums}</td>
                   </tr>`).join('')}
               </tbody>
           </table></div>`;

    // Estatísticas de carreira — apenas pilotos que competiram na categoria ativa
    const fa = (typeof freeAgents !== 'undefined') ? freeAgents : [];
    const allRiders = [
        ...(ecosystem[activeCategory] || []),
        ...fa.filter(r => r.stats && r.stats.categories && r.stats.categories.includes(activeCategory))
    ];
    const seen = new Set();
    const uniqueRiders = allRiders.filter(r => {
        if (seen.has(r.riderId)) return false;
        seen.add(r.riderId);
        return r.stats && r.stats.races > 0;
    });
    uniqueRiders.sort((a, b) => {
        const ta = (a.stats.titlesByCategory && a.stats.titlesByCategory[activeCategory]) || 0;
        const tb = (b.stats.titlesByCategory && b.stats.titlesByCategory[activeCategory]) || 0;
        if (tb !== ta) return tb - ta;
        if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
        return b.stats.podiums - a.stats.podiums;
    });

    const careerRows = uniqueRiders.map(r => {
        const catTitles = (r.stats.titlesByCategory && r.stats.titlesByCategory[activeCategory]) || 0;
        const bc = (r.stats.byCat && r.stats.byCat[activeCategory]) || { wins: 0, podiums: 0, races: 0, dnfs: 0 };
        return `
        <tr>
            <td>${r.flag} <strong>${r.name}</strong>${!r.isReal ? ' <span style="font-size:0.65rem;background:#1a3a1a;color:#4caf50;border-radius:3px;padding:1px 4px;">Regen</span>' : ''}</td>
            <td class="text-center" style="color:var(--accent);font-weight:700">${catTitles}</td>
            <td class="text-center">${bc.wins}</td>
            <td class="text-center">${bc.podiums}</td>
            <td class="text-center" style="color:var(--text-secondary)">${bc.races}</td>
            <td class="text-center" style="color:var(--text-secondary)">${bc.dnfs}</td>
        </tr>`;
    }).join('');

    const career = uniqueRiders.length === 0
        ? `<p style="color:var(--text-secondary);text-align:center;padding:2rem">Sem dados de carreira ainda.</p>`
        : `<div class="table-res"><table>
               <thead><tr>
                   <th style="width:35%">Piloto</th>
                   <th class="text-center" style="width:13%">🏆 Títulos</th>
                   <th class="text-center" style="width:13%">Vitórias</th>
                   <th class="text-center" style="width:13%">Pódios</th>
                   <th class="text-center" style="width:13%">Corridas</th>
                   <th class="text-center" style="width:13%">DNFs</th>
               </tr></thead>
               <tbody>${careerRows}</tbody>
           </table></div>`;

    container.innerHTML = `
        <div class="grid-layout" style="margin-bottom:1.5rem">
            <div class="panel-box">
                <div class="panel-header">🏆 Palmarès — ${categoriesConfig[activeCategory].name}</div>
                ${palmares}
            </div>
            <div class="panel-box">
                <div class="panel-header">📊 Classificação Final ${selectedHistoryYear || ''}</div>
                ${detail}
            </div>
        </div>
        <div class="panel-box">
            <div class="panel-header">👤 Estatísticas de Carreira — ${categoriesConfig[activeCategory].name}</div>
            ${career}
        </div>
    `;
}
