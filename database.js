// ESTADO GLOBAL DO ECOSSISTEMA
let currentYear = 2026;
let currentRound = 0;
const totalRoundsPerSeason = 5;
let activeCategory = 'motogp';
let uniqueNamesRegistry = new Set();
let ecosystem = { motogp: [], moto3: [], moto4: [], minigp: [] };
let lastRaceData = null; // Armazena p1, p2, p3 e DNFs da última corrida simulada

// BANCO DE DADOS DE PAÍSES PARA GERADORES ALEATÓRIOS (REGENS COM 12 ANOS)
const natData = [
    { country: 'Espanha', flag: '🇪🇸', names: ['Marc', 'Joan', 'Pedro', 'Aleix', 'Jorge', 'Raúl', 'Izan', 'Daniel', 'Sergio', 'Álvaro'], surnames: ['Martín', 'Mir', 'Acosta', 'Espargaró', 'Fernández', 'Guevara', 'Pedrosa', 'García'] },
    { country: 'Itália', flag: '🇮🇹', names: ['Francesco', 'Enea', 'Marco', 'Fabio', 'Luca', 'Tony', 'Celestino', 'Matteo'], surnames: ['Bagnaia', 'Bastianini', 'Bezzecchi', 'Marini', 'Arbolino', 'Vietti', 'Foggia'] },
    { country: 'Japão', flag: '🇯🇵', names: ['Hiroshi', 'Takaaki', 'Ai', 'Ayumu', 'Ryusei', 'Kaito'], surnames: ['Tanaka', 'Nakagami', 'Ogura', 'Sasaki', 'Yamanaka', 'Toba'] },
    { country: 'Brasil', flag: '🇧🇷', names: ['Diogo', 'Eric', 'Alex', 'David', 'Felipe', 'Gustavo'], surnames: ['Moreira', 'Granado', 'Barros', 'Santos', 'Aguiar', 'Cardozo'] },
    { country: 'Colômbia', flag: '🇨🇴', names: ['David', 'Juan', 'Alonso'], surnames: ['Alonso', 'Ospina', 'Cardozo'] },
    { country: 'França', flag: '🇫🇷', names: ['Fabio', 'Johann', 'Lorenzo'], surnames: ['Quartararo', 'Zarco', 'Fellon'] }
];

// ESTRUTURA FIXA DE EQUIPES E PILOTOS REAIS (PROPORÇÃO 6 TIMES x 2 PILOTOS = 12 POR GRID)
const categoriesConfig = {
    motogp: {
        name: "MotoGP™ Elite",
        teams: ['Ducati Lenovo Team', 'Prima Pramac Racing', 'Aprilia Racing', 'Red Bull KTM Factory', 'Monster Energy Yamaha', 'Repsol Honda Team'],
        initialRiders: [
            { name: 'Francesco Bagnaia', flag: '🇮🇹', age: 29, speed: 94, potential: 96, isReal: true },
            { name: 'Jorge Martín', flag: '🇪🇸', age: 28, speed: 93, potential: 95, isReal: true },
            { name: 'Marc Márquez', flag: '🇪🇸', age: 33, speed: 92, potential: 93, isReal: true },
            { name: 'Enea Bastianini', flag: '🇮🇹', age: 28, speed: 89, potential: 91, isReal: true },
            { name: 'Pedro Acosta', flag: '🇪🇸', age: 22, speed: 88, potential: 97, isReal: true },
            { name: 'Brad Binder', flag: '🇿🇦', age: 30, speed: 87, potential: 89, isReal: true },
            { name: 'Fabio Quartararo', flag: '🇫🇷', age: 27, speed: 88, potential: 92, isReal: true },
            { name: 'Maverick Viñales', flag: '🇪🇸', age: 31, speed: 86, potential: 87, isReal: true },
            { name: 'Marco Bezzecchi', flag: '🇮🇹', age: 27, speed: 85, potential: 89, isReal: true },
            { name: 'Aleix Espargaró', flag: '🇪🇸', age: 36, speed: 84, potential: 84, isReal: true },
            { name: 'Johann Zarco', flag: '🇫🇷', age: 35, speed: 83, potential: 83, isReal: true },
            { name: 'Alex Márquez', flag: '🇪🇸', age: 30, speed: 84, potential: 85, isReal: true }
        ]
    },
    moto3: {
        name: "Moto3™ World Cup",
        teams: ['CFMOTO Aspar Team', 'Red Bull KTM Ajo', 'Liqui Moly Intact GP', 'MT Helmets - MSI', 'Leopard Racing', 'Honda Team Asia'],
        initialRiders: [
            { name: 'David Alonso', flag: '🇨🇴', age: 20, speed: 85, potential: 96, isReal: true },
            { name: 'Collin Veijer', flag: '🇳🇱', age: 21, speed: 82, potential: 93, isReal: true },
            { name: 'Iván Ortolá', flag: '🇪🇸', age: 21, speed: 81, potential: 91, isReal: true },
            { name: 'Daniel Holgado', flag: '🇪🇸', age: 21, speed: 80, potential: 89, isReal: true },
            { name: 'Ángel Piqueras', flag: '🇪🇸', age: 19, speed: 78, potential: 94, isReal: true },
            { name: 'José Antonio Rueda', flag: '🇪🇸', age: 20, speed: 77, potential: 88, isReal: true },
            { name: 'David Muñoz', flag: '🇪🇸', age: 20, speed: 76, potential: 87, isReal: true },
            { name: 'Luca Lunetta', flag: '🇮🇹', age: 20, speed: 75, potential: 88, isReal: true },
            { name: 'Taiyo Furusato', flag: '🇯🇵', age: 21, speed: 76, potential: 86, isReal: true },
            { name: 'Ryusei Yamanaka', flag: '🇯🇵', age: 24, speed: 74, potential: 76, isReal: true },
            { name: 'Adrian Fernández', flag: '🇪🇸', age: 21, speed: 73, potential: 81, isReal: true },
            { name: 'Jacob Roulstone', flag: '🇦🇺', age: 21, speed: 72, potential: 83, isReal: true }
        ]
    },
    moto4: {
        name: "Moto4™ JuniorGP",
        teams: ['Cuna de Campeones', 'Monlau Motul School', 'Estrella Galicia 00', 'Igax Team', 'Artbox Team', 'Hawkers Karbium'],
        initialRiders: [
            { name: 'Carlos Cano', flag: '🇪🇸', age: 16, speed: 68, potential: 91, isReal: true },
            { name: 'Valentin Perrone', flag: '🇦🇷', age: 18, speed: 66, potential: 89, isReal: true },
            { name: 'Brian Uriarte', flag: '🇪🇸', age: 18, speed: 67, potential: 88, isReal: true },
            { name: 'Máximo Quiles', flag: '🇪🇸', age: 18, speed: 65, potential: 90, isReal: true },
            { name: 'Álvaro Carpe', flag: '🇪🇸', age: 19, speed: 66, potential: 87, isReal: true },
            { name: 'Rico Salmela', flag: '🇫🇮', age: 18, speed: 63, potential: 84, isReal: true },
            { name: 'Guido Pini', flag: '🇮🇹', age: 18, speed: 64, potential: 86, isReal: true },
            { name: 'Jesus Rios', flag: '🇪🇸', age: 19, speed: 62, potential: 82, isReal: true },
            { name: 'Cormac Buchanan', flag: '🇳🇿', age: 19, speed: 60, potential: 80, isReal: true },
            { name: 'Eddie O Shea', flag: '🇬🇧', age: 19, speed: 59, potential: 78, isReal: true },
            { name: 'Ruché Moodley', flag: '🇿🇦', age: 19, speed: 58, potential: 77, isReal: true },
            { name: 'Leo Rammerstorfer', flag: '🇦🇹', age: 20, speed: 57, potential: 74, isReal: true }
        ]
    },
    minigp: {
        name: "FIM MiniGP™ Base",
        teams: ['bLU cRU Academy', 'MiniGP Spain', 'MiniGP Italy', 'MiniGP United Kingdom', 'MiniGP France', 'MiniGP Brazil Team'],
        initialRiders: [
            { name: 'Ethan Sparks', flag: '🇬🇧', age: 13, speed: 45, potential: 85, isReal: true },
            { name: 'Enzo Zaragoza', flag: '🇪🇸', age: 13, speed: 46, potential: 88, isReal: true },
            { name: 'Izan Rodriguez', flag: '🇪🇸', age: 12, speed: 44, potential: 86, isReal: true },
            { name: 'Gabriel Da Silva', flag: '🇧🇷', age: 13, speed: 42, potential: 82, isReal: true },
            { name: 'Matteo Farioli', flag: '🇮🇹', age: 14, speed: 45, potential: 80, isReal: true },
            { name: 'Yuto Suzuki', flag: '🇯🇵', age: 12, speed: 43, potential: 85, isReal: true },
            { name: 'Oliver Morgan', flag: '🇺🇸', age: 13, speed: 41, potential: 79, isReal: true },
            { name: 'Lucas Rossi', flag: '🇮🇹', age: 12, speed: 42, potential: 83, isReal: true },
            { name: 'Jean Clerc', flag: '🇫🇷', age: 14, speed: 40, potential: 76, isReal: true },
            { name: 'Alejandro Ospina', flag: '🇨🇴', age: 13, speed: 41, potential: 81, isReal: true },
            { name: 'Jack West', flag: '🇦🇺', age: 14, speed: 43, potential: 78, isReal: true },
            { name: 'Diogo Aguiar Jr', flag: '🇧🇷', age: 12, speed: 40, potential: 84, isReal: true }
        ]
    }
};

// SALVAMENTO NO LOCALSTORAGE
function saveLocalStorage() {
    const dataToSave = {
        currentYear,
        currentRound,
        activeCategory,
        ecosystem,
        lastRaceData,
        uniqueNames: Array.from(uniqueNamesRegistry)
    };
    localStorage.setItem('motogp_sim_save', JSON.stringify(dataToSave));
}

// INICIALIZAÇÃO E CARREGAMENTO
function initializeRealEcosystem() {
    uniqueNamesRegistry.clear();
    
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        ecosystem[catKey] = [];
        
        for (let i = 0; i < 6; i++) {
            const teamName = config.teams[i];
            const r1Data = config.initialRiders[i * 2];
            const r2Data = config.initialRiders[i * 2 + 1];

            ecosystem[catKey].push({ ...r1Data, team: teamName, seat: 'Piloto 1', points: 0, currentRaceScore: 0 });
            ecosystem[catKey].push({ ...r2Data, team: teamName, seat: 'Piloto 2', points: 0, currentRaceScore: 0 });
            
            uniqueNamesRegistry.add(r1Data.name);
            uniqueNamesRegistry.add(r2Data.name);
        }
    }

    currentRound = 0;
    currentYear = 2026;
    lastRaceData = null;
    
    saveLocalStorage();
    
    // Alerta o script de UI para renderizar
    if (typeof initUI === "function") initUI();
    logEvent("✔ Banco de Dados Oficial reconfigurado com sucesso!", "sys");
}

function generateFictionalNewbie() {
    let attempts = 0;
    while (attempts < 500) {
        const nat = natData[Math.floor(Math.random() * natData.length)];
        const name = nat.names[Math.floor(Math.random() * nat.names.length)];
        const surname = nat.surnames[Math.floor(Math.random() * nat.surnames.length)];
        const fullName = `${name} ${surname}`;

        if (!uniqueNamesRegistry.has(fullName)) {
            uniqueNamesRegistry.add(fullName);
            return {
                name: fullName, flag: nat.flag, age: 12, // Sempre entram com 12 anos na base
                speed: Math.floor(Math.random() * 9) + 38, // 38 a 46
                potential: Math.floor(Math.random() * 24) + 75, // 75 a 98
                isReal: false, points: 0, currentRaceScore: 0, team: '', seat: ''
            };
        }
        attempts++;
    }
    return { name: `Regen ${Math.floor(Math.random()*900)}`, flag: '🏳️', age: 12, speed: 40, potential: 80, isReal: false, points: 0, currentRaceScore: 0, team: '', seat: '' };
}

// AUTO-EXECUÇÃO AO CARREGAR O ARQUIVO DATABASE
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('motogp_sim_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentYear = parsed.currentYear;
            currentRound = parsed.currentRound;
            activeCategory = parsed.activeCategory || 'motogp';
            ecosystem = parsed.ecosystem;
            lastRaceData = parsed.lastRaceData || null;
            uniqueNamesRegistry = new Set(parsed.uniqueNames || []);
        } catch(e) {
            initializeRealEcosystem();
        }
    } else {
        initializeRealEcosystem();
    }
});

