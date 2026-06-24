const fimPoints = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4];
const dnfReasons = [
    "Queda na Curva 1", 
    "Quebra de Motor", 
    "Pane Elétrica", 
    "Perda de Pressão Hidráulica", 
    "Desgaste excessivo do pneu dianteiro", 
    "Colisão múltipla no Paddock"
];

function triggerSimulation() {
    if (currentRound < totalRoundsPerSeason) {
        runRaceRound();
    } else {
        processYearTransition();
    }
    saveLocalStorage();
    if (typeof refreshUI === "function") refreshUI();
}

function runRaceRound() {
    currentRound++;
    
    // Objeto temporário para guardar os resultados locais desta etapa
    lastRaceData = {
        roundNum: currentRound,
        category: activeCategory,
        podium: [],
        dnfs: []
    };

    // PROCESSA APENAS A CATEGORIA VISUAL ATIVA NA CORRIDA ATUAL
    const riders = ecosystem[activeCategory];
    
    // Determina quantos pilotos darão DNF nesta corrida (Entre 1 e 4)
    const numDNFs = Math.floor(Math.random() * 4) + 1;
    
    // Seleciona índices aleatórios para sofrerem DNF
    let dnfIndices = new Set();
    while(dnfIndices.size < numDNFs) {
        dnfIndices.add(Math.floor(Math.random() * riders.length));
    }

    // Calcula os scores de performance pura
    riders.forEach((r, idx) => {
        if (dnfIndices.has(idx)) {
            r.currentRaceScore = -1; // Flag de DNF
            const reason = dnfReasons[Math.floor(Math.random() * dnfReasons.length)];
            lastRaceData.dnfs.push({ name: r.name, flag: r.flag, reason: reason });
        } else {
            // Performance baseada em velocidade + variação aleatória de pista
            r.currentRaceScore = (r.speed * 0.75) + (Math.random() * 25);
        }
    });

    // Ordena os pilotos que completaram por pontuação decrescente
    const finishers = riders.filter(r => r.currentRaceScore !== -1)
                             .sort((a, b) => b.currentRaceScore - a.currentRaceScore);

    // Salva os 3 primeiros colocados no pódio global
    if (finishers[0]) lastRaceData.podium.push(`${finishers[0].flag} ${finishers[0].name}`);
    if (finishers[1]) lastRaceData.podium.push(`${finishers[1].flag} ${finishers[1].name}`);
    if (finishers[2]) lastRaceData.podium.push(`${finishers[2].flag} ${finishers[2].name}`);

    // Distribui os pontos FIM oficiais baseados no grid final dos finalistas
    finishers.forEach((rider, index) => {
        if (index < fimPoints.length) {
            rider.points += fimPoints[index];
        }
    });
}

function processYearTransition() {
    // 1. Envelhecimento e ganho técnico linear até o teto de potencial
    for (const catKey in ecosystem) {
        ecosystem[catKey].forEach(r => {
            r.age += 1;
            if (r.speed < r.potential) {
                r.speed += Math.floor(Math.random() * 3) + 1;
                if (r.speed > r.potential) r.speed = r.potential;
            }
            if (r.age > 33) r.speed -= Math.floor(Math.random() * 2) + 1; // Declínio natural por idade
        });
    }

    // 2. Processa Aposentadoria na categoria principal (MotoGP)
    const motoGPRiders = ecosystem['motogp'];
    ecosystem['motogp'] = motoGPRiders.filter(r => {
        let chance = r.age >= 38 ? 100 : (r.age >= 35 ? 45 : (r.age >= 32 ? 15 : 0));
        if (Math.random() * 100 < chance) {
            uniqueNamesRegistry.delete(r.name);
            return false; // Fora do ecossistema
        }
        return true;
    });

    // 3. Subida Vertical Automática da Base até o Topo da Pirâmide FIM
    const flowOrder = ['motogp', 'moto3', 'moto4', 'minigp'];
    for (let i = 0; i < flowOrder.length - 1; i++) {
        const targetCat = flowOrder[i];
        const lowerCat = flowOrder[i+1];
        let structuralVacancies = 12 - ecosystem[targetCat].length;
        
        if (structuralVacancies > 0) {
            ecosystem[lowerCat].sort((a,b) => b.points - a.points); // Promove os campeões por pontos
            const promotedList = ecosystem[lowerCat].splice(0, structuralVacancies);
            promotedList.forEach(p => ecosystem[targetCat].push(p));
        }
    }

    // 4. Preenchimento de lacunas abertas na Base Absoluta (MiniGP) com Regens de 12 anos
    let baseVacancies = 12 - ecosystem['minigp'].length;
    for (let k = 0; k < baseVacancies; k++) {
        ecosystem['minigp'].push(generateFictionalNewbie());
    }

    // 5. Redistribuição e reset anual de pontos
    for (const catKey in ecosystem) {
        const cfg = categoriesConfig[catKey];
        ecosystem[catKey].forEach((r, idx) => {
            r.team = cfg.teams[Math.floor(idx / 2)];
            r.seat = (idx % 2 === 0) ? 'Piloto 1' : 'Piloto 2';
            r.points = 0;
            r.currentRaceScore = 0;
        });
    }

    currentYear++;
    currentRound = 0;
    lastRaceData = null; // Reseta painel de corrida na virada de ano
}

