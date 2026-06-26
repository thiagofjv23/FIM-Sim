// ==========================================================================
// ROAD TO MOTOGP™ - RACE ENGINE & MATH RESOLUTION
// ==========================================================================

const FIM_POINTS_SYSTEM = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

/**
 * Retorna os pesos matemáticos da categoria atual.
 */
function getCategoryWeights(categoryKey) {
    if (categoryKey === 'motogp') return { bike: 0.50, rider: 0.40, rng: 0.10 };
    if (categoryKey === 'rookies_cup') return { bike: 0.0, rider: 0.90, rng: 0.10 };
    return { bike: 0.35, rider: 0.55, rng: 0.10 }; // Padrão Moto2, Moto3, Moto4
}

/**
 * Motor central de cálculo probabilístico de uma corrida individual
 */
function simulateRaceForCategory(categoryKey) {
    const grid = ecosystem[categoryKey];
    if (!grid || grid.length === 0) return null;

    const weights = getCategoryWeights(categoryKey);
    const results = [];
    const dnfs = [];

    grid.forEach(rider => {
        // Inicializa stats caso o piloto ainda não tenha
        if (!rider.stats) rider.stats = { wins: 0, podiums: 0, poles: 0, races: 0, dnfs: 0 };
        rider.stats.races++; // Computa a largada

        // Recupera os dados da equipe para os cálculos mecânicos
        const teamData = findTeamById(rider.teamId, categoryKey);
        
        // Se houver anomalia relacional (fallback defensivo)
        const bikePerf = teamData ? teamData.bikePerformance : 60;
        let mechComp = teamData ? teamData.mechanicCompetence : 60;
        const morale = teamData ? teamData.morale : 80;

        // Moral afeta diretamente o pitwall (Mecânicos trabalham melhor felizes)
        if (morale < 70) mechComp -= 5;
        if (morale >= 90) mechComp += 5;

        // -------------------------------------------------------------
        // FASE 1: O FILTRO DE DNF (ABANDONOS)
        // -------------------------------------------------------------
        const rngCrash = Math.floor(Math.random() * 100) + 1;
        const rngMechanical = Math.floor(Math.random() * 100) + 1;

        // A Consistência do piloto é o escudo contra quedas
        const crashThreshold = Math.max(5, 100 - rider.consistency); 
        
        // A Competência Mecânica é o escudo contra estouro de motor
        const mechanicalThreshold = Math.max(2, 100 - mechComp);

        if (rngCrash <= crashThreshold) {
            rider.stats.dnfs++;
            rider.currentRaceScore = 0;
            dnfs.push({ name: rider.name, flag: rider.flag, reason: "Queda (Lowside/Highside)" });
            return; // Interrompe o loop deste piloto, ele está fora da prova
        }

        if (rngMechanical <= mechanicalThreshold) {
            rider.stats.dnfs++;
            rider.currentRaceScore = 0;
            dnfs.push({ name: rider.name, flag: rider.flag, reason: "Falha Mecânica" });
            return; 
        }

        // -------------------------------------------------------------
        // FASE 2: RACE SCORE (RITMO DE CORRIDA)
        // -------------------------------------------------------------
        // RNG do dia (Sorte/Inspiração) flutua de -5 a +10
        const dayFormRNG = (Math.random() * 15) - 5; 
        const activeRiderSpeed = rider.speed + dayFormRNG;

        // A Fórmula Mágica
        const finalScore = 
            (activeRiderSpeed * weights.rider) + 
            (bikePerf * weights.bike) + 
            (Math.random() * 100 * weights.rng);

        rider.currentRaceScore = finalScore;
        results.push(rider);
    });

    // -------------------------------------------------------------
    // FASE 3: ORDENAÇÃO E PONTUAÇÃO
    // -------------------------------------------------------------
    // Ordena do maior Score (mais rápido) para o menor
    results.sort((a, b) => b.currentRaceScore - a.currentRaceScore);

    // Distribui os pontos da FIM
    results.forEach((rider, index) => {
        if (index < FIM_POINTS_SYSTEM.length) {
            rider.points += FIM_POINTS_SYSTEM[index];
        }

        // Alimenta as estatísticas vitais do Perfil de Piloto
        if (index === 0) rider.stats.wins++;
        if (index <= 2) rider.stats.podiums++;
    });

    // Retorna o pacote formatado para a UI renderizar o Painel Principal
    return {
        roundNum: currentRound + 1,
        podium: results.slice(0, 3).map(r => ({ display: `${r.flag} ${r.name}` })),
        dnfs: dnfs
    };
}

/**
 * Função global atrelada ao botão "Simular Etapa / Ano" no HTML
 */
function triggerSimulation() {
    if (currentRound >= totalRoundsPerSeason) {
        // GATILHO PARA A INTERTEMPORADA (Próxima Feature)
        alert("Fim da Temporada! O script de R&D de Intertemporada e Renovações deve rodar aqui.");
        return;
    }

    lastRaceData = {};
    let globalLog = [];

    // Roda a simulação para TODAS as categorias simultaneamente
    for (const catKey in ecosystem) {
        const raceResult = simulateRaceForCategory(catKey);
        
        if (raceResult) {
            lastRaceData[catKey] = raceResult;
            
            // Grava no Log o Vencedor de cada categoria
            if (raceResult.podium[0]) {
                globalLog.push(`🏆 [${categoriesConfig[catKey].name}] Vencedor: ${raceResult.podium[0].display}`);
            }
        }
    }

    // Avança o contador do campeonato
    currentRound++;
    
    // Imprime as vitórias no console interno do jogo
    globalLog.forEach(msg => logEvent(msg, ''));

    // Salva o progresso e atualiza a tela
    saveLocalStorage();
    refreshUI();
}
