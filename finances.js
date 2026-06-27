// ==========================================================================
// ROAD TO MOTOGP™ - SISTEMA FINANCEIRO V1.0
// Salários, Prize Money, Patrocínios, Pay Drivers, Transferências
// ==========================================================================

// Garante que teamFinancesState existe mesmo se engine.js não carregou
if (typeof teamFinancesState === 'undefined') { var teamFinancesState = {}; }

// ── FATORES DE SALÁRIO POR CATEGORIA (M€/ano) ─────────────────────────────
const SALARY_FACTORS = {
    motogp:         { base: 0.30, scale: 0.30, allowPayDriver: false },
    moto2:          { base: 0.05, scale: 0.025, allowPayDriver: false },
    moto3:          { base: 0.02, scale: 0.006, allowPayDriver: true  },
    moto3_junior:   { base: 0.01, scale: 0.002, allowPayDriver: true  },
    rookies_cup:    { base: 0.005, scale: 0.001, allowPayDriver: true  },
    moto4_latin:    { base: 0.005, scale: 0.001, allowPayDriver: true  },
    moto4_asia:     { base: 0.005, scale: 0.001, allowPayDriver: true  },
    moto4_british:  { base: 0.003, scale: 0.001, allowPayDriver: true  },
    moto4_northern: { base: 0.003, scale: 0.001, allowPayDriver: true  },
    moto4_european: { base: 0.003, scale: 0.001, allowPayDriver: true  },
};

// ── PRIZE MONEY POR POSIÇÃO — BASE MotoGP (M€) ────────────────────────────
const MOTOGP_PRIZES = [1.50, 0.90, 0.60, 0.40, 0.28, 0.22, 0.18, 0.15, 0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.03];
const PRIZE_MULTIPLIERS = {
    motogp: 1.00, moto2: 0.12, moto3: 0.06, moto3_junior: 0.025,
    rookies_cup: 0.01, moto4_latin: 0.01, moto4_asia: 0.01,
    moto4_british: 0.008, moto4_northern: 0.008, moto4_european: 0.008
};

// ── PONTOS POR POSIÇÃO (sistema MotoGP padrão) ────────────────────────────
const POINTS_TABLE = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

// Fallback local para totalRoundsPerSeason (evita dependência de escopo entre scripts)
function _getRounds() {
    return (typeof totalRoundsPerSeason !== 'undefined') ? totalRoundsPerSeason : 10;
}

// ── POOL DE NOMES DE PATROCINADORES ───────────────────────────────────────
const SPONSOR_POOL_TITLE = [
    'Petronas', 'Monster Energy', 'Red Bull', 'Repsol', 'Shell', 'Motul',
    'Castrol', 'Pertamina', 'Total Energies', 'Gulf Oil', 'Prima', 'Lenovo',
    'Liqui Moly', 'Nastro Azzurro', 'Aruba.it', 'GoPro', 'Pata', 'Estrella Galicia'
];
const SPONSOR_POOL_SECONDARY = [
    'Akrapovic', 'Brembo', 'NGK', 'Öhlins', 'Shoei', 'Arai', 'Rizoma',
    'Twin Air', 'Acerbis', 'Termignoni', 'Arrow Exhaust', 'Givi', 'Dainese',
    'Alpinestars', 'OMP', 'Spidi', 'Hel Brakes', 'Leatt', 'Ixon', 'RC Racer'
];

// ==========================================================================
// CÁLCULO DE SALÁRIO E VALOR DE MERCADO
// ==========================================================================

function calculateRiderSalary(rider, catKey) {
    const factor = SALARY_FACTORS[catKey] || SALARY_FACTORS['moto4_european'];

    // Pay driver: regen com lineage alto mas velocidade baixa em categorias menores
    if (factor.allowPayDriver && !rider.isReal && rider.lineage > 55 && rider.speed < 76) {
        return parseFloat((-(rider.lineage * 0.003)).toFixed(3));
    }

    const speedAboveBase = Math.max(0, rider.speed - 70);
    const salary = factor.base + speedAboveBase * factor.scale;
    return parseFloat(salary.toFixed(3));
}

function calculateMarketValue(rider, catKey) {
    const factor = SALARY_FACTORS[catKey] || SALARY_FACTORS['moto4_european'];
    const composite = rider.speed * 0.55 + rider.potential * 0.45;
    const value = Math.max(0.01, (composite - 60) * factor.scale * 15);
    return parseFloat(value.toFixed(2));
}

// ==========================================================================
// PRIZE MONEY
// ==========================================================================

function getPrizeMoney(position, catKey) {
    const multiplier = PRIZE_MULTIPLIERS[catKey] || 0.008;
    const idx = position - 1;
    const base = idx < MOTOGP_PRIZES.length ? MOTOGP_PRIZES[idx] : 0.005;
    return parseFloat((base * multiplier).toFixed(4));
}

// ==========================================================================
// GERAÇÃO DE PATROCINADORES
// ==========================================================================

function generateSponsorsForTeam(team, usedSponsorNames) {
    const sponsors = [];

    function pickUnique(pool) {
        let attempts = 0;
        while (attempts < 40) {
            const name = pool[Math.floor(Math.random() * pool.length)];
            if (!usedSponsorNames.has(name)) {
                usedSponsorNames.add(name);
                return name;
            }
            attempts++;
        }
        return null;
    }

    const budget = team.budget;

    // Title sponsor para equipes com orçamento > 2
    if (budget >= 2) {
        const name = pickUnique(SPONSOR_POOL_TITLE);
        if (name) {
            const annual = parseFloat((budget * 0.35 + Math.random() * budget * 0.15).toFixed(2));
            sponsors.push({ name, type: 'title', annualValue: annual, perRace: parseFloat((annual / _getRounds()).toFixed(4)) });
        }
    }

    // Sponsor secundário para orçamento > 0.5
    if (budget >= 0.5) {
        const name = pickUnique(SPONSOR_POOL_SECONDARY);
        if (name) {
            const annual = parseFloat((budget * 0.12 + Math.random() * budget * 0.06).toFixed(2));
            sponsors.push({ name, type: 'secondary', annualValue: annual, perRace: parseFloat((annual / _getRounds()).toFixed(4)) });
        }
    }

    // Terceiro sponsor para equipes grandes (budget > 8)
    if (budget >= 8) {
        const name = pickUnique(SPONSOR_POOL_SECONDARY);
        if (name) {
            const annual = parseFloat((budget * 0.06 + Math.random() * budget * 0.04).toFixed(2));
            sponsors.push({ name, type: 'secondary', annualValue: annual, perRace: parseFloat((annual / _getRounds()).toFixed(4)) });
        }
    }

    return sponsors;
}

// ==========================================================================
// INICIALIZAÇÃO DO ESTADO FINANCEIRO
// ==========================================================================

function initTeamFinances() {
    teamFinancesState = {};
    const usedSponsorNames = new Set();

    for (const catKey in categoriesConfig) {
        for (const team of categoriesConfig[catKey].teams) {
            teamFinancesState[team.id] = {
                teamId:       team.id,
                catKey:       catKey,
                balance:      team.budget,
                baseIncome:   team.budget,
                sponsors:     generateSponsorsForTeam(team, usedSponsorNames),
                prizeMoney:   0,
                riderCosts:   0,
                sponsorIncome: 0,
                transactions: []
            };
        }
    }
}

// ==========================================================================
// REGISTRO DE TRANSAÇÃO
// ==========================================================================

function recordTransaction(teamId, type, amount, description) {
    const fs = teamFinancesState[teamId];
    if (!fs) return;
    fs.balance = parseFloat((fs.balance + amount).toFixed(4));
    fs.transactions.unshift({ round: currentRound, type, amount: parseFloat(amount.toFixed(4)), description });
    if (fs.transactions.length > 60) fs.transactions.pop();
}

// ==========================================================================
// PROCESSAMENTO FINANCEIRO PÓS-CORRIDA
// ==========================================================================

function processRaceFinances(finisherIds, catKey) {
    const grid = ecosystem[catKey];
    if (!grid) return;

    const teamsInCategory = new Set(grid.map(r => r.teamId).filter(Boolean));

    // 1. Renda de sponsors por corrida para cada equipe da categoria
    for (const teamId of teamsInCategory) {
        const fs = teamFinancesState[teamId];
        if (!fs || !fs.sponsors.length) continue;

        const sponsorTotal = fs.sponsors.reduce((sum, sp) => sum + sp.perRace, 0);
        if (sponsorTotal > 0) {
            recordTransaction(teamId, 'sponsor', sponsorTotal, `Patrocínio — Etapa ${currentRound}`);
            fs.sponsorIncome = parseFloat((fs.sponsorIncome + sponsorTotal).toFixed(4));
        }
    }

    // 2. Salário / pay driver por corrida
    for (const rider of grid) {
        if (!rider.teamId || rider.salary == null) continue;
        const salaryPerRound = parseFloat((rider.salary / _getRounds()).toFixed(5));
        if (salaryPerRound === 0) continue;

        const amount = -salaryPerRound;
        const label = salaryPerRound < 0
            ? `Contribuição pay driver ${rider.name} — Etapa ${currentRound}`
            : `Salário ${rider.name} — Etapa ${currentRound}`;

        recordTransaction(rider.teamId, 'salary', amount, label);
        const fs = teamFinancesState[rider.teamId];
        if (fs) fs.riderCosts = parseFloat((fs.riderCosts + salaryPerRound).toFixed(5));
    }

    // 3. Prize money por posição final
    finisherIds.forEach((riderId, index) => {
        const rider = grid.find(r => r.riderId === riderId);
        if (!rider || !rider.teamId) return;
        const prize = getPrizeMoney(index + 1, catKey);
        if (prize > 0) {
            recordTransaction(rider.teamId, 'prize', prize, `Prize money P${index + 1} — ${rider.name} — Etapa ${currentRound}`);
            const fs = teamFinancesState[rider.teamId];
            if (fs) fs.prizeMoney = parseFloat((fs.prizeMoney + prize).toFixed(4));
        }
    });
}

// ==========================================================================
// TRANSFERÊNCIAS
// ==========================================================================

function getTransferOptions(riderId) {
    const grid = ecosystem[activeCategory];
    if (!grid) return null;

    const rider = grid.find(r => r.riderId === riderId);
    if (!rider) return null;

    const availableTransfers = [];

    for (const team of categoriesConfig[activeCategory].teams) {
        const teamRiders = grid.filter(r => r.teamId === team.id);
        const occupiedSeats = new Set(teamRiders.map(r => r.seat));
        const availableSeats = [1, 2].filter(s => !occupiedSeats.has(s));

        if (availableSeats.length > 0) {
            const fs = teamFinancesState[team.id];
            availableTransfers.push({
                teamId:            team.id,
                teamName:          team.name,
                availableSeats,
                teamBalance:       fs ? parseFloat(fs.balance.toFixed(2)) : team.budget,
                riderSalaryPerRound: parseFloat(((rider.salary || 0) / _getRounds()).toFixed(3))
            });
        }
    }

    return {
        rider,
        currentTeam: rider.team,
        currentSeat: rider.seat,
        availableTransfers
    };
}

function executeRiderTransfer(riderId, targetTeamId, targetSeat) {
    const success = transferRider(riderId, targetTeamId, targetSeat, activeCategory);
    if (success) {
        const rider = ecosystem[activeCategory].find(r => r.riderId === riderId);
        if (rider) {
            recordTransaction(targetTeamId, 'transfer', 0, `Contratação: ${rider.name} (Assento ${targetSeat})`);
        }
        saveLocalStorage();
    }
    return success;
}

// ==========================================================================
// RESUMO FINANCEIRO
// ==========================================================================

function getTeamFinancialSummary(teamId) {
    return teamFinancesState[teamId] || null;
}

// ==========================================================================
// FORMATAÇÃO DE VALORES
// ==========================================================================

function formatMoney(value) {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '+';
    if (abs >= 1) return `${sign}€${abs.toFixed(2)}M`;
    return `${sign}€${(abs * 1000).toFixed(0)}K`;
}

function formatBalance(value) {
    const formatted = `€${Math.abs(value).toFixed(2)}M`;
    if (value < 0) return `<span style="color:#ef4444;font-weight:bold">-${formatted}</span>`;
    if (value < 1)  return `<span style="color:#f59e0b;font-weight:bold">${formatted}</span>`;
    return `<span style="color:#10b981;font-weight:bold">${formatted}</span>`;
}

// ==========================================================================
// UI: ABA FINANÇAS
// ==========================================================================

function renderFinancesTab() {
    createCategorySelectors('catTabsFinancas');

    const container = document.getElementById('financasContent');
    if (!container) return;

    try {
    // Safety: initialize if state was never populated
    if (Object.keys(teamFinancesState).length === 0) {
        initTeamFinances();
    }

    const grid    = ecosystem[activeCategory] || [];
    const config  = categoriesConfig[activeCategory];
    if (!config) { container.innerHTML = '<p style="color:#9ca3af">Categoria indisponível.</p>'; return; }

    const sortedTeams = [...config.teams].sort((a, b) => {
        const bA = teamFinancesState[a.id]?.balance ?? a.budget;
        const bB = teamFinancesState[b.id]?.balance ?? b.budget;
        return bB - bA;
    });

    let html = `
        <div class="table-res">
        <table>
            <thead>
                <tr>
                    <th style="width:27%">Equipe</th>
                    <th style="width:13%;text-align:center">Saldo</th>
                    <th style="width:10%;text-align:center">Base</th>
                    <th style="width:13%;text-align:center">Patrocínios</th>
                    <th style="width:13%;text-align:center">Prize Money</th>
                    <th style="width:14%;text-align:center">Salários/ano</th>
                    <th style="width:10%;text-align:center">Detalhe</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const team of sortedTeams) {
        const fs = teamFinancesState[team.id] || {};
        const teamRiders = grid.filter(r => r.teamId === team.id);
        const totalSalary = teamRiders.reduce((s, r) => s + (r.salary || 0), 0);
        const bal = fs.balance ?? team.budget;
        const rowBg = bal < 0 ? 'background:rgba(239,68,68,0.08);' : '';

        html += `
            <tr style="${rowBg}">
                <td style="font-weight:600;padding:8px 6px">${team.name}</td>
                <td style="text-align:center">${formatBalance(bal)}</td>
                <td style="text-align:center;color:#9ca3af">€${team.budget}M</td>
                <td style="text-align:center;color:#10b981">€${(fs.sponsorIncome || 0).toFixed(2)}M</td>
                <td style="text-align:center;color:#fbbf24">€${(fs.prizeMoney || 0).toFixed(2)}M</td>
                <td style="text-align:center;color:${totalSalary < 0 ? '#10b981' : '#f87171'}">
                    ${totalSalary < 0 ? '+' : ''}€${Math.abs(totalSalary).toFixed(2)}M
                </td>
                <td style="text-align:center">
                    <button onclick="openTeamFinanceModal('${team.id}','${activeCategory}')"
                        style="background:#374151;border:1px solid #4b5563;color:white;border-radius:4px;padding:2px 10px;cursor:pointer;font-size:0.82em">
                        💰
                    </button>
                </td>
            </tr>
        `;
    }

    html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch(e) {
        console.error('[renderFinancesTab]', e);
        if (container) container.innerHTML = `<p style="color:#ef4444;padding:12px">Erro ao carregar finanças: ${e.message}</p>`;
    }
}

// ==========================================================================
// UI: MODAL FINANCEIRO DE EQUIPE
// ==========================================================================

function openTeamFinanceModal(teamId, catKey) {
    const fs = teamFinancesState[teamId];
    if (!fs) return;

    const team    = categoriesConfig[catKey]?.teams.find(t => t.id === teamId);
    const riders  = (ecosystem[catKey] || []).filter(r => r.teamId === teamId);

    const existing = document.getElementById('modal-finance-team');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-finance-team';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1500;padding:1rem;';

    const sponsorRows = fs.sponsors.map(sp => `
        <tr>
            <td style="padding:6px 4px">${sp.name}</td>
            <td style="text-align:center;color:${sp.type === 'title' ? '#fbbf24' : '#9ca3af'}">${sp.type === 'title' ? '⭐ Título' : 'Secundário'}</td>
            <td style="text-align:center">€${sp.annualValue.toFixed(2)}M/ano</td>
            <td style="text-align:center;color:#9ca3af">€${(sp.perRace * 1000).toFixed(1)}K/etapa</td>
        </tr>`).join('') || '<tr><td colspan="4" style="color:#9ca3af;text-align:center;padding:8px">Sem patrocinadores</td></tr>';

    const riderRows = riders.map(r => {
        const isPayDriver = (r.salary || 0) < 0;
        const badge = isPayDriver ? ' <span style="background:#7c3aed;color:#fff;padding:1px 5px;border-radius:3px;font-size:0.72em;vertical-align:middle">Pay Driver</span>' : '';
        const salColor = isPayDriver ? '#10b981' : '#f87171';
        return `
        <tr>
            <td style="padding:6px 4px">${r.flag} ${r.name}${badge}</td>
            <td style="text-align:center">${r.isReal ? '⭐ Real' : '○ Regen'}</td>
            <td style="text-align:center;color:${salColor}">
                ${isPayDriver ? '+' : ''}€${Math.abs(r.salary || 0).toFixed(3)}M/ano
            </td>
            <td style="text-align:center;color:#9ca3af">${r.contractEndYear ? `Até ${r.contractEndYear}` : '—'}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="4" style="color:#9ca3af;text-align:center;padding:8px">Sem pilotos</td></tr>';

    const txLog = (fs.transactions || []).slice(0, 10).map(tx => {
        const col = tx.amount >= 0 ? '#10b981' : '#f87171';
        const sign = tx.amount >= 0 ? '+' : '';
        const amt = Math.abs(tx.amount) >= 0.01
            ? `${sign}€${Math.abs(tx.amount).toFixed(2)}M`
            : `${sign}€${(Math.abs(tx.amount) * 1000).toFixed(1)}K`;
        return `<div style="padding:4px 0;border-bottom:1px solid #1f2937;font-size:0.8em">
            <span style="color:#6b7280">[E${tx.round}]</span>
            <span style="color:${col};font-weight:600"> ${amt}</span>
            <span style="color:#d1d5db"> — ${tx.description}</span>
        </div>`;
    }).join('') || '<div style="color:#6b7280;font-size:0.82em">Nenhuma transação registrada.</div>';

    modal.innerHTML = `
        <div style="background:#1f2937;border:2px solid #fbbf24;border-radius:8px;padding:24px;max-width:640px;width:100%;max-height:88vh;overflow-y:auto;color:white">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
                <h2 style="margin:0;color:#fbbf24">💰 ${team?.name || teamId}</h2>
                <button onclick="document.getElementById('modal-finance-team').remove()" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;line-height:1">&times;</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
                <div style="background:#111827;border-radius:6px;padding:10px;text-align:center">
                    <div style="font-size:0.72em;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">Saldo Atual</div>
                    <div style="font-size:1.1em">${formatBalance(fs.balance)}</div>
                </div>
                <div style="background:#111827;border-radius:6px;padding:10px;text-align:center">
                    <div style="font-size:0.72em;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">Prize Money</div>
                    <div style="font-size:1.1em;font-weight:bold;color:#fbbf24">€${(fs.prizeMoney || 0).toFixed(2)}M</div>
                </div>
                <div style="background:#111827;border-radius:6px;padding:10px;text-align:center">
                    <div style="font-size:0.72em;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">Patrocínios</div>
                    <div style="font-size:1.1em;font-weight:bold;color:#10b981">€${(fs.sponsorIncome || 0).toFixed(2)}M</div>
                </div>
            </div>

            <h4 style="color:#fbbf24;margin:0 0 8px">Patrocinadores</h4>
            <div class="table-res" style="margin-bottom:16px">
                <table><thead><tr>
                    <th>Nome</th><th style="text-align:center">Tipo</th>
                    <th style="text-align:center">Valor Anual</th><th style="text-align:center">Por Etapa</th>
                </tr></thead><tbody>${sponsorRows}</tbody></table>
            </div>

            <h4 style="color:#fbbf24;margin:0 0 8px">Pilotos & Contratos</h4>
            <div class="table-res" style="margin-bottom:16px">
                <table><thead><tr>
                    <th>Piloto</th><th style="text-align:center">Status</th>
                    <th style="text-align:center">Salário</th><th style="text-align:center">Contrato</th>
                </tr></thead><tbody>${riderRows}</tbody></table>
            </div>

            <h4 style="color:#fbbf24;margin:0 0 8px">Últimas Transações</h4>
            <div style="background:#111827;border-radius:6px;padding:10px">${txLog}</div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
}
