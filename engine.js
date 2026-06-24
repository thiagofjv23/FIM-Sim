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
    try {
        if (currentRound < totalRoundsPerSeason) {
            runRaceRound();
        } else {
            processYearTransition();
        }
    } catch (error) {
        console.error("[Erro Crítico Motor] Falha grave na camada de simulação principal:", error);
    } finally {
        // 3. GARANTIA DE ATUALIZAÇÃO DA UI (Finally)
        // Este bloco executará SEMPRE, aconteça o que acontecer (até se houver bugs acima)
        try {
            saveLocalStorage();
            if (typeof refreshUI === "function") refreshUI();
            
            // Caso suas funções de atualizar a tela tenham outros nomes no seu index.html:
            if (typeof atualizarUI === "function") atualizarUI();
            if (typeof renderizarTabelas === "function") renderizarTabelas();
        } catch (uiError) {
            console.error("[Erro UI] Falha ao tentar atualizar a interface:", uiError);
        }
    }
}

function runRaceRound() {
    // Incrementa o contador global de etapas UMA ÚNICA VEZ por clique
    currentRound++;
    lastRaceData = {};

    // Pega as categorias dinamicamente pelo que existe de verdade no banco
    const categorias = Object.keys(ecosystem);

    // LOOP UNIFICADO E PROTEGIDO (for...of permite o uso do 'continue')
    for (const catKey of categorias) {
        
        // 1. VERIFICAÇÃO DE INTEGRIDADE (Sanity Check)
        if (!ecosystem[catKey] || !Array.isArray(ecosystem[catKey]) || ecosystem[catKey].length === 0) {
            console.warn(`[Sanity Check] Categoria "${catKey}" vazia ou inexistente. Pulando...`);
            continue;
        }

        // 2. ISOLAMENTO DE ERROS (Try/Catch)
        try {
            lastRaceData[catKey] = {
                roundNum: currentRound,
                podium: [],
                dnfs: []
            };

            const riders = ecosystem[catKey];
            
            // Determina abandonos desta categoria específica (1 a 4)
            const numDNFs = Math.floor(Math.random() * 4) + 1;
            let dnfIndices = new Set();
            
            // Trava de segurança no While para não entrar em loop infinito se houver poucos pilotos
            let maxAttempts = 0; 
            while(dnfIndices.size < numDNFs && maxAttempts < 20) {
                dnfIndices.add(Math.floor(Math.random() * riders.length));
                maxAttempts++;
            }

            // Calcula scores individuais
            riders.forEach((r, idx) => {
                if (dnfIndices.has(idx)) {
                    r.currentRaceScore = -1; // Flag de DNF
                    const reason = dnfReasons[Math.floor(Math.random() * dnfReasons.length)];
                    lastRaceData[catKey].dnfs.push({ name: r.name, flag: r.flag, reason: reason });
                } else {
                    // Garantia de que a speed seja tratada como número, evitando NaN
                    let speedAtributo = Number(r.speed) || 50; 
                    r.currentRaceScore = (speedAtributo * 0.75) + (Math.random() * 25);
                }
            });

            // Ordena os finalistas da categoria (Excluindo DNFs)
            const finishers = riders.filter(r => r.currentRaceScore !== -1)
                                     .sort((a, b) => b.currentRaceScore - a.currentRaceScore);

            // Aloca o pódio da respectiva categoria de forma segura
            if (finishers[0]) lastRaceData[catKey].podium.push(`${finishers[0].flag} ${finishers[0].name}`);
            if (finishers[1]) lastRaceData[catKey].podium.push(`${finishers[1].flag} ${finishers[1].name}`);
            if (finishers[2]) lastRaceData[catKey].podium.push(`${finishers[2].flag} ${finishers[2].name}`);

            // Distribui pontuação oficial FIM
            finishers.forEach((rider, index) => {
                if (index < fimPoints.length) {
                    rider.points += fimPoints[index];
                }
            });

        } catch (error) {
            // Se uma categoria bugar (ex: variável escrita errada), ele avisa mas CONTINUA as outras
            console.warn(`[Bug Isolado] Erro ao simular a corrida de ${catKey}:`, error);
            continue;
        }
    }

    if (typeof logEvent === "function") {
        logEvent(`🏁 Etapa ${currentRound} finalizada para todas as categorias mundiais!`, "sys");
    }
}

function processYearTransition() {
    try {
        // 1. Envelhecimento e ganho técnico linear até o teto de potencial
        for (const catKey in ecosystem) {
            if(!ecosystem[catKey] || !Array.isArray(ecosystem[catKey])) continue;

            ecosystem[catKey].forEach(r => {
                r.age = (Number(r.age) || 16) + 1;
                if (r.speed < r.potential) {
                    r.speed += Math.floor(Math.random() * 3) + 1;
                    if (r.speed > r.potential) r.speed = r.potential;
                }
                if (r.age > 33) r.speed -= Math.floor(Math.random() * 2) + 1; 
            });
        }

        // 2. Processa Aposentadoria na MotoGP
        if (ecosystem['motogp']) {
            const motoGPRiders = ecosystem['motogp'];
            ecosystem['motogp'] = motoGPRiders.filter(r => {
                let chance = r.age >= 38 ? 100 : (r.age >= 35 ? 45 : (r.age >= 32 ? 15 : 0));
                if (Math.random() * 100 < chance) {
                    uniqueNamesRegistry.delete(r.name);
                    return false; 
                }
                return true;
            });
        }

        // 3. Subida Vertical Automática da Pirâmide Mundial (Grids de 22 pilotos)
        const mundialFlow = ['motogp', 'moto2', 'moto3', 'moto3_junior', 'rookies_cup'];
        
        for (let i = 0; i < mundialFlow.length - 1; i++) {
            const targetCat = mundialFlow[i];
            const lowerCat = mundialFlow[i+1];
            
            if (!ecosystem[targetCat] || !ecosystem[lowerCat]) continue; // Sanity check de transição
            
            let structuralVacancies = 22 - ecosystem[targetCat].length; 
            
            if (structuralVacancies > 0) {
                ecosystem[lowerCat].sort((a, b) => b.points - a.points); 
                const promotedList = ecosystem[lowerCat].splice(0, structuralVacancies);
                promotedList.forEach(p => ecosystem[targetCat].push(p));
            }
        }

        // 4. Alimentação da Rookies Cup através das Copas Regionais Moto4
        if (ecosystem['rookies_cup']) {
            let rookiesVacancies = 22 - ecosystem['rookies_cup'].length;
            if (rookiesVacancies > 0) {
                const regionals = ['moto4_latin', 'moto4_asia', 'moto4_british', 'moto4_northern', 'moto4_european'];
                let regionalCandidates = [];

                regionals.forEach(regKey => {
                    if (ecosystem[regKey] && ecosystem[regKey].length > 0) {
                        ecosystem[regKey].sort((a, b) => b.points - a.points);
                        regionalCandidates.push(...ecosystem[regKey].slice(0, 4));
                    }
                });

                regionalCandidates.sort((a, b) => b.points - a.points);
                const promotedToRookies = regionalCandidates.slice(0, rookiesVacancies);

                promotedToRookies.forEach(p => {
                    for (const regKey of regionals) {
                        if(!ecosystem[regKey]) continue;
                        const idx = ecosystem[regKey].indexOf(p);
                        if (idx !== -1) {
                            ecosystem[regKey].splice(idx, 1);
                            break;
                        }
                    }
                    ecosystem['rookies_cup'].push(p);
                });
            }
        }

        // 5. Preenchimento de Vagas das Categorias de Base com Regens de 12 anos
        const baseCategories = ['moto4_latin', 'moto4_asia', 'moto4_british', 'moto4_northern', 'moto4_european'];
        
        baseCategories.forEach(catKey => {
            if (!ecosystem[catKey] || !categoriesConfig[catKey]) return; // Proteção

            let vacancies = 22 - ecosystem[catKey].length;
            const allowedNats = categoriesConfig[catKey].paisesPermitidos;

            for (let k = 0; k < vacancies; k++) {
                let newRider = generateFictionalNewbie(allowedNats);
                ecosystem[catKey].push(newRider);
            }
        });

        // Caso a Rookies Cup ou JuniorGP ainda tenham vagas residuais
        ['rookies_cup', 'moto3_junior'].forEach(catKey => {
            if (!ecosystem[catKey]) return;
            let vacancies = 22 - ecosystem[catKey].length;
            for (let k = 0; k < vacancies; k++) {
                ecosystem[catKey].push(generateFictionalNewbie(["Mundial"]));
            }
        });

        // 6. Redistribuição de contratos e reset anual de pontuação
        for (const catKey in ecosystem) {
            const cfg = categoriesConfig[catKey];
            if(!cfg || !ecosystem[catKey]) continue;

            ecosystem[catKey].forEach((r, idx) => {
                // Prevenção de erro caso falte times configurados na lista de times
                let teamIndex = Math.floor(idx / 2);
                r.team = cfg.teams[teamIndex] || "Equipe Independente";
                r.seat = (idx % 2 === 0) ? 'Piloto 1' : 'Piloto 2';
                r.points = 0;
                r.currentRaceScore = 0;
            });
        }

        currentYear++;
        currentRound = 0;
        lastRaceData = null; 
        if (typeof logEvent === "function") logEvent(`🗓️ Virada de temporada concluída! Bem-vindo a ${currentYear}.`, "sys");

    } catch (transitionError) {
        console.error("[Erro Transição] Ocorreu um problema ao avançar de ano:", transitionError);
    }
}
