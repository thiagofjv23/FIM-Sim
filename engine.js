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
        try {
            saveLocalStorage();
            if (typeof refreshUI === "function") refreshUI();
        } catch (uiError) {
            console.error("[Erro UI] Falha ao tentar atualizar a interface:", uiError);
        }
    }
}

function runRaceRound() {
    currentRound++;
    lastRaceData = {};

    // A MÁGICA ESTÁ AQUI: Lê as 10 categorias do banco automaticamente (incluindo Moto2, Moto4 Asia, etc)
    const categorias = Object.keys(ecosystem);

    for (const catKey of categorias) {
        
        // Sanity Check: Pula se a categoria estiver corrompida
        if (!ecosystem[catKey] || !Array.isArray(ecosystem[catKey]) || ecosystem[catKey].length === 0) {
            continue;
        }

        try {
            lastRaceData[catKey] = {
                roundNum: currentRound,
                podium: [],
                dnfs: []
            };

            const riders = ecosystem[catKey];
            const numDNFs = Math.floor(Math.random() * 4) + 1;
            let dnfIndices = new Set();
            
            let maxAttempts = 0; 
            while(dnfIndices.size < numDNFs && maxAttempts < 20) {
                dnfIndices.add(Math.floor(Math.random() * riders.length));
                maxAttempts++;
            }

            riders.forEach((r, idx) => {
                if (dnfIndices.has(idx)) {
                    r.currentRaceScore = -1; // Flag de DNF
                    const reason = dnfReasons[Math.floor(Math.random() * dnfReasons.length)];
                    lastRaceData[catKey].dnfs.push({ name: r.name, flag: r.flag, reason: reason });
                } else {
                    let speedAtributo = Number(r.speed) || 50; 
                    r.currentRaceScore = (speedAtributo * 0.75) + (Math.random() * 25);
                }
            });

            const finishers = riders.filter(r => r.currentRaceScore !== -1)
                                     .sort((a, b) => b.currentRaceScore - a.currentRaceScore);

            if (finishers[0]) lastRaceData[catKey].podium.push(`${finishers[0].flag} ${finishers[0].name}`);
            if (finishers[1]) lastRaceData[catKey].podium.push(`${finishers[1].flag} ${finishers[1].name}`);
            if (finishers[2]) lastRaceData[catKey].podium.push(`${finishers[2].flag} ${finishers[2].name}`);

            finishers.forEach((rider, index) => {
                if (index < fimPoints.length) {
                    rider.points += fimPoints[index];
                }
            });

        } catch (error) {
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

        const mundialFlow = ['motogp', 'moto2', 'moto3', 'moto3_junior', 'rookies_cup'];
        for (let i = 0; i < mundialFlow.length - 1; i++) {
            const targetCat = mundialFlow[i];
            const lowerCat = mundialFlow[i+1];
            
            if (!ecosystem[targetCat] || !ecosystem[lowerCat]) continue; 
            
            let structuralVacancies = 22 - ecosystem[targetCat].length; 
            
            if (structuralVacancies > 0) {
                ecosystem[lowerCat].sort((a, b) => b.points - a.points); 
                const promotedList = ecosystem[lowerCat].splice(0, structuralVacancies);
                promotedList.forEach(p => ecosystem[targetCat].push(p));
            }
        }

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

        const baseCategories = ['moto4_latin', 'moto4_asia', 'moto4_british', 'moto4_northern', 'moto4_european'];
        baseCategories.forEach(catKey => {
            if (!ecosystem[catKey] || !categoriesConfig[catKey]) return; 

            let vacancies = 22 - ecosystem[catKey].length;
            const allowedNats = categoriesConfig[catKey].paisesPermitidos;

            for (let k = 0; k < vacancies; k++) {
                let newRider = generateFictionalNewbie(allowedNats);
                ecosystem[catKey].push(newRider);
            }
        });

        ['rookies_cup', 'moto3_junior'].forEach(catKey => {
            if (!ecosystem[catKey]) return;
            let vacancies = 22 - ecosystem[catKey].length;
            for (let k = 0; k < vacancies; k++) {
                ecosystem[catKey].push(generateFictionalNewbie(["Mundial"]));
            }
        });

        for (const catKey in ecosystem) {
            const cfg = categoriesConfig[catKey];
            if(!cfg || !ecosystem[catKey]) continue;

            ecosystem[catKey].forEach((r, idx) => {
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
