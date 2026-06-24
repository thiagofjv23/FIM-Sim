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
    // Incrementa o contador global de etapas UMA ÚNICA VEZ por clique
    currentRound++;
    
    // Inicializa o container como um objeto para mapear todas as categorias juntas
    lastRaceData = {};

    const categoriesList = ['motogp', 'moto3', 'moto4', 'minigp'];

    // LOOP UNIFICADO: Simula todas as categorias em background no mesmo instante
    categoriesList.forEach(catKey => {
        lastRaceData[catKey] = {
            roundNum: currentRound,
            podium: [],
            dnfs: []
        };

        const riders = ecosystem[catKey];
        
        // Determina abandonos desta categoria específica (1 a 4)
        const numDNFs = Math.floor(Math.random() * 4) + 1;
        let dnfIndices = new Set();
        while(dnfIndices.size < numDNFs) {
            dnfIndices.add(Math.floor(Math.random() * riders.length));
        }

        // Calcula scores individuais
        riders.forEach((r, idx) => {
            if (dnfIndices.has(idx)) {
                r.currentRaceScore = -1; // Flag de DNF
                const reason = dnfReasons[Math.floor(Math.random() * dnfReasons.length)];
                lastRaceData[catKey].dnfs.push({ name: r.name, flag: r.flag, reason: reason });
            } else {
                r.currentRaceScore = (r.speed * 0.75) + (Math.random() * 25);
            }
        });

        // Ordena os finalistas da categoria
        const finishers = riders.filter(r => r.currentRaceScore !== -1)
                                 .sort((a, b) => b.currentRaceScore - a.currentRaceScore);

        // Aloca o pódio da respectiva categoria
        if (finishers[0]) lastRaceData[catKey].podium.push(`${finishers[0].flag} ${finishers[0].name}`);
        if (finishers[1]) lastRaceData[catKey].podium.push(`${finishers[1].flag} ${finishers[1].name}`);
        if (finishers[2]) lastRaceData[catKey].podium.push(`${finishers[2].flag} ${finishers[2].name}`);

        // Distribui pontuação oficial FIM
        finishers.forEach((rider, index) => {
            if (index < fimPoints.length) {
                rider.points += fimPoints[index];
            }
        });
    });

    logEvent(`🏁 Etapa ${currentRound} finalizada para todas as categorias mundiais!`, "sys");
}

function processYearTransition() {
    // 1. Envelhecimento e ganho técnico linear até o teto de potencial (Para as 10 categorias)
    for (const catKey in ecosystem) {
        ecosystem[catKey].forEach(r => {
            r.age += 1;
            if (r.speed < r.potential) {
                r.speed += Math.floor(Math.random() * 3) + 1;
                if (r.speed > r.potential) r.speed = r.potential;
            }
            if (r.age > 33) r.speed -= Math.floor(Math.random() * 2) + 1; 
        });
    }

    // 2. Processa Aposentadoria na MotoGP (Série de Elite)
    const motoGPRiders = ecosystem['motogp'];
    ecosystem['motogp'] = motoGPRiders.filter(r => {
        let chance = r.age >= 38 ? 100 : (r.age >= 35 ? 45 : (r.age >= 32 ? 15 : 0));
        if (Math.random() * 100 < chance) {
            uniqueNamesRegistry.delete(r.name);
            return false; 
        }
        return true;
    });

    // 3. Subida Vertical Automática da Pirâmide Mundial (Grids de 22 pilotos)
    // Fluxo principal de acesso: Rookies Cup -> JuniorGP -> Moto3 -> Moto2 -> MotoGP
    const mundialFlow = ['motogp', 'moto2', 'moto3', 'moto3_junior', 'rookies_cup'];
    
    for (let i = 0; i < mundialFlow.length - 1; i++) {
        const targetCat = mundialFlow[i];
        const lowerCat = mundialFlow[i+1];
        let structuralVacancies = 22 - ecosystem[targetCat].length; // Agora são 22 vagas por grid
        
        if (structuralVacancies > 0) {
            ecosystem[lowerCat].sort((a, b) => b.points - a.points); 
            const promotedList = ecosystem[lowerCat].splice(0, structuralVacancies);
            promotedList.forEach(p => ecosystem[targetCat].push(p));
        }
    }

    // 4. Alimentação da Rookies Cup através das Copas Regionais Moto4
    let rookiesVacancies = 22 - ecosystem['rookies_cup'].length;
    if (rookiesVacancies > 0) {
        const regionals = ['moto4_latin', 'moto4_asia', 'moto4_british', 'moto4_northern', 'moto4_european'];
        let regionalCandidates = [];

        // Coleta os melhores de cada regional para disputar as vagas mundiais
        regionals.forEach(regKey => {
            ecosystem[regKey].sort((a, b) => b.points - a.points);
            regionalCandidates.push(...ecosystem[regKey].slice(0, 4));
        });

        // Ordena os candidatos da base por desempenho na temporada
        regionalCandidates.sort((a, b) => b.points - a.points);
        const promotedToRookies = regionalCandidates.slice(0, rookiesVacancies);

        // Remove os promovidos de suas categorias regionais antigas e insere na Rookies Cup
        promotedToRookies.forEach(p => {
            for (const regKey of regionals) {
                const idx = ecosystem[regKey].indexOf(p);
                if (idx !== -1) {
                    ecosystem[regKey].splice(idx, 1);
                    break;
                }
            }
            ecosystem['rookies_cup'].push(p);
        });
    }

    // 5. Preenchimento de Vagas das Categorias de Base com Regens de 12 anos (Com Regras de País!)
    const baseCategories = ['moto4_latin', 'moto4_asia', 'moto4_british', 'moto4_northern', 'moto4_european'];
    
    baseCategories.forEach(catKey => {
        let vacancies = 22 - ecosystem[catKey].length;
        
        // Puxa a lista de bandeiras/países permitidos configurada no database.js para esta categoria
        const allowedNats = categoriesConfig[catKey].paisesPermitidos;

        for (let k = 0; k < vacancies; k++) {
            // Invoca a função geradora passando os países permitidos como argumento
            let newRider = generateFictionalNewbie(allowedNats);
            ecosystem[catKey].push(newRider);
        }
    });

    // Caso a Rookies Cup ou JuniorGP ainda tenham vagas residuais por falta de candidatos
    ['rookies_cup', 'moto3_junior'].forEach(catKey => {
        let vacancies = 22 - ecosystem[catKey].length;
        for (let k = 0; k < vacancies; k++) {
            ecosystem[catKey].push(generateFictionalNewbie(["Mundial"]));
        }
    });

    // 6. Redistribuição de contratos e reset anual de pontuação para o ano seguinte
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
    lastRaceData = null; 
    logEvent(`🗓️ Virada de temporada concluída! Bem-vindo a ${currentYear}.`, "sys");
}
