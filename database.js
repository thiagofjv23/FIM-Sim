// ==========================================================================
// ESTADO GLOBAL DO ECOSSISTEMA MUNDIAL FIM
// ==========================================================================
let currentYear = 2026;
let currentRound = 0;
const totalRoundsPerSeason = 5;
let activeCategory = 'motogp';
let uniqueNamesRegistry = new Set();
let lastRaceData = null;

// Objeto principal que gerencia as inscrições ativas das 10 categorias
let ecosystem = {
    motogp: [], moto2: [], moto3: [], moto3_junior: [], rookies_cup: [],
    moto4_latin: [], moto4_asia: [], moto4_british: [], moto4_northern: [], moto4_european: []
};

// BANCO DE DADOS DE PAÍSES PARA GERADORES ALEATÓRIOS (REGENS DA BASE)
const natData = [
    { country: 'Espanha', flag: '🇪🇸', names: ['Marc', 'Joan', 'Pedro', 'Aleix', 'Jorge', 'Raúl', 'Izan', 'Sergio', 'Álvaro', 'Carlos', 'Maverick', 'Iván', 'Daniel', 'Marcos'], surnames: ['Martín', 'Mir', 'Acosta', 'Espargaró', 'Fernández', 'Guevara', 'García', 'Cano', 'Ortolá', 'Holgado', 'Piqueras', 'Almansa'] },
    { country: 'Itália', flag: '🇮🇹', names: ['Francesco', 'Enea', 'Marco', 'Fabio', 'Luca', 'Tony', 'Celestino', 'Matteo', 'Filippo', 'Romano', 'Guido', 'Farioli'], surnames: ['Bagnaia', 'Bastianini', 'Bezzecchi', 'Marini', 'Arbolino', 'Vietti', 'Foggia', 'Rossi', 'Pini', 'Lunetta', 'Bertelle'] },
    { country: 'Japão', flag: '🇯🇵', names: ['Takaaki', 'Ai', 'Ayumu', 'Ryusei', 'Kaito', 'Taiyo', 'Tatsuki'], surnames: ['Nakagami', 'Ogura', 'Sasaki', 'Yamanaka', 'Toba', 'Furusato', 'Suzuki'] },
    { country: 'França', flag: '🇫🇷', names: ['Fabio', 'Johann', 'Lorenzo', 'Alan'], surnames: ['Quartararo', 'Zarco', 'Fellon', 'Techer'] },
    { country: 'Portugal', flag: '🇵🇹', names: ['Miguel', 'Ivo'], surnames: ['Oliveira', 'Lopes'] },
    { country: 'Brasil', flag: '🇧🇷', names: ['Diogo', 'Eric', 'Alex', 'Felipe', 'Gustavo', 'Murilo'], surnames: ['Moreira', 'Granado', 'Barros', 'Santos', 'Aguiar', 'Cardozo'] },
    { country: 'Colômbia', flag: '🇨🇴', names: ['David', 'Juan', 'Santiago'], surnames: ['Alonso', 'Ospina', 'Palacio'] },
    { country: 'Argentina', flag: '🇦🇷', names: ['Valentin', 'Marco'], surnames: ['Perrone', 'Solorza'] },
    { country: 'Chile', flag: '🇨🇱', names: ['Maximilian', 'Benjamín'], surnames: ['Scheib', 'Heredia'] },
    { country: 'Indonésia', flag: '🇮🇩', names: ['Mario', 'Fadillah', 'Veda'], surnames: ['Aji', 'Aditama', 'Ega'] },
    { country: 'Malásia', flag: '🇲🇾', names: ['Hafizh', 'Syahrin'], surnames: ['Syahrin', 'Anuar'] },
    { country: 'Austrália', flag: '🇦🇺', names: ['Jack', 'Remy', 'Jacob', 'Senna'], surnames: ['Miller', 'Gardner', 'Roulstone', 'Agius'] },
    { country: 'Reino Unido', flag: '🇬🇧', names: ['Sam', 'Jake', 'Scott', 'John', 'Ethan', 'Max'], surnames: ['Lowes', 'Dixon', 'Redding', 'McPhee', 'Sparks', 'Cook'] },
    { country: 'Irlanda', flag: '🇮🇪', names: ['Rhys', 'Casey'], surnames: ['Irwin', 'Tobin'] },
    { country: 'Alemanha', flag: '🇩🇪', names: ['Stefan', 'Marcel', 'Lukas'], surnames: ['Bradl', 'Schrötter', 'Tulovic'] },
    { country: 'Países Baixos', flag: '🇳🇱', names: ['Collin', 'Bo'], surnames: ['Veijer', 'Bendsneyder'] },
    { country: 'Chéquia', flag: '🇨🇿', names: ['Filip', 'Jakub'], surnames: ['Salač', 'Kornfeil'] },
    { country: 'Áustria', flag: '🇦🇹', names: ['Leo', 'Maximilian'], surnames: ['Rammerstorfer', 'Kofler'] },
    { country: 'Canadá', flag: '🇨🇦', names: ['Ben', 'Torin'], surnames: ['Young', 'Collins'] }
];

// ==========================================================================
// 1. METADADOS E ESTRUTURA REAL DAS CATEGORIAS (CONFIGURAÇÃO MASTER)
// ==========================================================================
const categoriesConfig = {
    motogp: {
        name: "MotoGP™ Elite World Class",
        paisesPermitidos: ["Mundial"],
        teams: ['Ducati Lenovo Team', 'Prima Pramac Racing', 'Aprilia Racing', 'Red Bull KTM Factory', 'Monster Energy Yamaha', 'Repsol Honda Team', 'Gresini Racing MotoGP', 'Pertamina Enduro VR46', 'Trackhouse Racing', 'Red Bull KTM Tech3', 'LCR Honda Castrol']
    },
    crypto2: { // Chave identificadora simplificada para o engine
        name: "Moto2™ World Championship",
        paisesPermitidos: ["Mundial"],
        teams: ['MT Helmets - MSI', 'Red Bull KTM Ajo', 'Beta Tools SpeedUp', 'Elf Marc VDS Racing', 'Italtrans Racing Team', 'Fantic Racing', 'OnlyFans American Racing', 'Yamaha VR46 Master Camp', 'QJMOTOR Gresini', 'Liqui Moly Intact GP', 'RW Racing GP']
    },
    moto3: {
        name: "Moto3™ World Cup",
        paisesPermitidos: ["Mundial"],
        teams: ['CFMOTO Aspar Team', 'Liqui Moly Intact GP', 'MT Helmets - MSI', 'Red Bull KTM Ajo', 'Leopard Racing', 'Red Bull KTM Tech3', 'Honda Team Asia', 'BOE Motorsports', 'CIP Green Power', 'Rivacold Snipers', 'SIC58 Squadra Corse']
    },
    moto3_junior: {
        name: "FIM JuniorGP™ Moto3",
        paisesPermitidos: ["Mundial"],
        teams: ['Aspar Junior Team', 'Team Estrella Galicia 00', 'Monlau Motul School', 'Laglisse Academy', 'AC Racing Team', 'Finetwork Team', 'Artbox Junior', 'MTA Junior Team', 'AGR Team', 'Cardoso Racing', 'Fau55 Tey Racing']
    },
    rookies_cup: {
        name: "Red Bull MotoGP™ Rookies Cup",
        paisesPermitidos: ["Mundial"],
        teams: ['Rookies Team A', 'Rookies Team B', 'Rookies Team C', 'Rookies Team D', 'Rookies Team E', 'Rookies Team F', 'Rookies Team G', 'Rookies Team H', 'Rookies Team I', 'Rookies Team J', 'Rookies Team K']
    },
    moto4_latin: {
        name: "Moto4™ Latin Cup",
        paisesPermitidos: ["🇧🇷", "🇨🇴", "🇦🇷", "🇨🇱"],
        teams: ['Yamaha IMS', 'Alex Barros Honda', 'Colombia Moto', 'Argentina GP', 'Chile Speed', 'Latin Conex', 'LS2 Squad', 'Mobil1 LATAM', 'Pirelli America', 'Gomez Racing', 'Andes Talents']
    },
    moto4_asia: {
        name: "Moto4™ Asia Cup",
        paisesPermitidos: ["🇯🇵", "🇮🇩", "🇲🇾", "🇦🇺"],
        teams: ['Honda Asia Talent', 'Astra Honda Indo', 'Yamaha Thai Youth', 'KTM Australia', 'Malaysian Sprinta', 'Japan Rising', 'Oceania Squad', 'Idemitsu Asia', 'Shell Advance', 'Melbourne Base', 'Tokyo Project']
    },
    moto4_british: {
        name: "Moto4™ British Cup",
        paisesPermitidos: ["🇬🇧", "🇮🇪"],
        teams: ['VisionTrack UK', 'Laverty Academy', 'R&G Youth', 'Irish Road Race', 'BSB Junior', 'Scotland Gun', 'Welsh Dragon', 'Oxford Products', 'Silverstone School', 'Donington Talents', 'Irish Squad']
    },
    moto4_northern: {
        name: "Moto4™ Northern Cup",
        paisesPermitidos: ["🇩🇪", "🇳🇱", "🇨🇿", "🇦🇹", "🇨🇦"],
        teams: ['ADAC Sachsen', 'Zelos Black', 'Dutch Academy', 'Brno Circuit', 'KTM Austria', 'Canada Motor', 'Intact Northern', 'Freudenberg', 'Molenaar', 'Kiefer Base', 'Nordic Alliance']
    },
    moto4_european: {
        name: "Moto4™ European Cup",
        paisesPermitidos: ["🇪🇸", "🇮🇹", "🇫🇷", "🇵🇹"],
        teams: ['Cuna de Campeones', 'Monlau Competición', 'Talento Azzurro', 'FFM Junior', 'Oliveira Fan Club', 'VR46 Base', 'Leopard Junior', 'EG 00 Junior', 'IgaxTeam', 'Cardoso ETC', 'Fau55 Tey']
    }
};

// ==========================================================================
// 2. EXTRAÇÃO E SEEDING DOS PILOTOS REAIS (TEMPORADAS RECENTES)
// ==========================================================================
const historicalSeeds = {
    motogp: [
        { name: 'Francesco Bagnaia', flag: '🇮🇹', age: 29, speed: 95, potential: 97, isReal: true },
        { name: 'Marc Márquez', flag: '🇪🇸', age: 33, speed: 94, potential: 95, isReal: true },
        { name: 'Miguel Oliveira', flag: '🇵🇹', age: 31, speed: 85, potential: 86, isReal: true },
        { name: 'Jack Miller', flag: '🇦🇺', age: 31, speed: 83, potential: 84, isReal: true },
        { name: 'Jorge Martín', flag: '🇪🇸', age: 28, speed: 94, potential: 96, isReal: true },
        { name: 'Marco Bezzecchi', flag: '🇮🇹', age: 27, speed: 87, potential: 91, isReal: true },
        { name: 'Brad Binder', flag: '🇿🇦', age: 30, speed: 89, potential: 91, isReal: true },
        { name: 'Pedro Acosta', flag: '🇪🇸', age: 22, speed: 91, potential: 98, isReal: true },
        { name: 'Fabio Quartararo', flag: '🇫🇷', age: 27, speed: 89, potential: 93, isReal: true },
        { name: 'Álex Rins', flag: '🇪🇸', age: 30, speed: 85, potential: 86, isReal: true },
        { name: 'Luca Marini', flag: '🇮🇹', age: 28, speed: 82, potential: 86, isReal: true },
        { name: 'Joan Mir', flag: '🇪🇸', age: 28, speed: 83, potential: 85, isReal: true },
        { name: 'Álex Márquez', flag: '🇪🇸', age: 30, speed: 86, potential: 88, isReal: true },
        { name: 'Fermín Aldeguer', flag: '🇪🇸', age: 21, speed: 82, potential: 93, isReal: true },
        { name: 'Fabio Di Giannantonio', flag: '🇮🇹', age: 27, speed: 88, potential: 91, isReal: true },
        { name: 'Franco Morbidelli', flag: '🇮🇹', age: 31, speed: 85, potential: 87, isReal: true },
        { name: 'Raúl Fernández', flag: '🇪🇸', age: 25, speed: 84, potential: 88, isReal: true },
        { name: 'Ai Ogura', flag: '🇯🇵', age: 25, speed: 83, potential: 92, isReal: true },
        { name: 'Enea Bastianini', flag: '🇮🇹', age: 28, speed: 90, potential: 92, isReal: true },
        { name: 'Maverick Viñales', flag: '🇪🇸', age: 31, speed: 88, potential: 89, isReal: true },
        { name: 'Johann Zarco', flag: '🇫🇷', age: 35, speed: 84, potential: 85, isReal: true },
        { name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 79, potential: 85, isReal: true }
    ],
    crypto2: [
        { name: 'Sergio García', flag: '🇪🇸', age: 23, speed: 85, potential: 92, isReal: true },
        { name: 'Alonso López', flag: '🇪🇸', age: 24, speed: 84, potential: 89, isReal: true },
        { name: 'Tony Arbolino', flag: '🇮🇹', age: 25, speed: 83, potential: 88, isReal: true },
        { name: 'Jake Dixon', flag: '🇬🇧', age: 30, speed: 82, potential: 83, isReal: true },
        { name: 'Aron Canet', flag: '🇪🇸', age: 26, speed: 84, potential: 86, isReal: true },
        { name: 'Celestino Vietti', flag: '🇮🇹', age: 24, speed: 82, potential: 87, isReal: true },
        { name: 'Joe Roberts', flag: '🇺🇸', age: 29, speed: 83, potential: 84, isReal: true },
        { name: 'Marcos Ramírez', flag: '🇪🇸', age: 28, speed: 80, potential: 81, isReal: true },
        { name: 'Manuel González', flag: '🇪🇸', age: 23, speed: 83, potential: 90, isReal: true },
        { name: 'Albert Arenas', flag: '🇪🇸', age: 29, speed: 79, potential: 80, isReal: true },
        { name: 'Diogo Moreira', flag: '🇧🇷', age: 22, speed: 78, potential: 89, isReal: true },
        { name: 'Filip Salač', flag: '🇨🇿', age: 24, speed: 78, potential: 82, isReal: true }
    ],
    moto3: [
        { name: 'David Alonso', flag: '🇨🇴', age: 20, speed: 86, potential: 96, isReal: true },
        { name: 'Joel Esteban', flag: '🇪🇸', age: 21, speed: 74, potential: 85, isReal: true },
        { name: 'Collin Veijer', flag: '🇳🇱', age: 21, speed: 83, potential: 93, isReal: true },
        { name: 'Tatsuki Suzuki', flag: '🇯🇵', age: 28, speed: 76, potential: 77, isReal: true },
        { name: 'Iván Ortolá', flag: '🇪🇸', age: 21, speed: 82, potential: 91, isReal: true },
        { name: 'Ryusei Yamanaka', flag: '🇯🇵', age: 24, speed: 75, potential: 77, isReal: true },
        { name: 'José Antonio Rueda', flag: '🇪🇸', age: 20, speed: 78, potential: 89, isReal: true },
        { name: 'Ángel Piqueras', flag: '🇪🇸', age: 19, speed: 79, potential: 94, isReal: true },
        { name: 'Adrián Fernández', flag: '🇪🇸', age: 21, speed: 75, potential: 80, isReal: true },
        { name: 'Daniel Holgado', flag: '🇪🇸', age: 21, speed: 81, potential: 88, isReal: true },
        { name: 'Jacob Roulstone', flag: '🇦🇺', age: 21, speed: 73, potential: 84, isReal: true },
        { name: 'Taiyo Furusato', flag: '🇯🇵', age: 21, speed: 77, potential: 86, isReal: true }
    ],
    moto3_junior: [
        { name: 'Álvaro Carpe', flag: '🇪🇸', age: 19, speed: 67, potential: 89, isReal: true },
        { name: 'Máximo Quiles', flag: '🇪🇸', age: 18, speed: 66, potential: 91, isReal: true },
        { name: 'Brian Uriarte', flag: '🇪🇸', age: 18, speed: 65, potential: 88, isReal: true },
        { name: 'Rico Salmela', flag: '🇫🇮', age: 18, speed: 63, potential: 86, isReal: true },
        { name: 'Guido Pini', flag: '🇮🇹', age: 18, speed: 64, potential: 87, isReal: true },
        { name: 'Cormac Buchanan', flag: '🇳🇿', age: 19, speed: 61, potential: 81, isReal: true }
    ],
    rookies_cup: [
        { name: 'Valentin Perrone', flag: '🇦🇷', age: 18, speed: 65, potential: 88, isReal: true },
        { name: 'Hakim Danish', flag: '🇲🇾', age: 19, speed: 60, potential: 82, isReal: true },
        { name: 'Carter Thompson', flag: '🇦🇺', age: 18, speed: 61, potential: 83, isReal: true },
        { name: 'Leo Rammerstorfer', flag: '🇦🇹', age: 20, speed: 58, potential: 76, isReal: true }
    ]
};

// ==========================================================================
// 3. A REDE DE SEGURANÇA (ALGORITMO DE PREENCHIMENTO HÍBRIDO)
// ==========================================================================
function generateFictionalNewbie(allowedCountries) {
    let availableNats = natData;
    
    if (allowedCountries && allowedCountries.length > 0 && !allowedCountries.includes("Mundial")) {
        availableNats = natData.filter(n => allowedCountries.includes(n.flag));
    }
    if (availableNats.length === 0) availableNats = natData;

    let attempts = 0;
    while (attempts < 1000) {
        const nat = availableNats[Math.floor(Math.random() * availableNats.length)];
        const name = nat.names[Math.floor(Math.random() * nat.names.length)];
        const surname = nat.surnames[Math.floor(Math.random() * nat.surnames.length)];
        const fullName = `${name} ${surname}`;

        if (!uniqueNamesRegistry.has(fullName)) {
            uniqueNamesRegistry.add(fullName);
            return {
                name: fullName, flag: nat.flag, age: 12, // Ingressam rigorosamente com 12 anos
                speed: Math.floor(Math.random() * 9) + 38, // 38 a 46 base
                potential: Math.floor(Math.random() * 21) + 76, // 76 a 96 potencial
                isReal: false, points: 0, currentRaceScore: 0, team: '', seat: ''
            };
        }
        attempts++;
    }
    return { name: `Regen ${Math.floor(Math.random()*8999)+1000}`, flag: availableNats[0].flag, age: 12, speed: 40, potential: 80, isReal: false, points: 0, currentRaceScore: 0, team: '', seat: '' };
}

function inicializarGridsVazios() {
    // Varre todas as 10 categorias estruturadas
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        let preLoadedList = historicalSeeds[catKey] || [];
        
        // Limpa o grid da categoria antes de estruturar
        ecosystem[catKey] = [];

        // Preenche rigorosamente as 11 equipes (22 assentos)
        for (let i = 0; i < 11; i++) {
            const teamName = config.teams[i];

            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                let rider;

                // Se houver semente real disponível, faz o resgate de dados
                if (preLoadedList.length > 0) {
                    rider = preLoadedList.shift();
                    uniqueNamesRegistry.add(rider.name);
                } else {
                    // Caso contrário, ativa a Rede de Segurança Regional
                    rider = generateFictionalNewbie(config.paisesPermitidos);
                    
                    // Incremento técnico coerente caso o bot preencha classes de acesso superiores
                    if (catKey === 'crypto2') { rider.speed += 36; rider.age = 19; }
                    else if (catKey === 'moto3') { rider.speed += 32; rider.age = 17; }
                    else if (catKey === 'moto3_junior') { rider.speed += 20; rider.age = 15; }
                    else if (catKey === 'rookies_cup') { rider.speed += 16; rider.age = 14; }
                }

                // Ajusta os contratos fixos de box
                rider.team = teamName;
                rider.seat = `Piloto ${seatNum}`;
                rider.points = 0;
                rider.currentRaceScore = 0;

                ecosystem[catKey].push(rider);
            }
        }
    }
}

// INICIALIZADOR COMPATÍVEL COM LOCALSTORAGE / SESSÃO
function initializeRealEcosystem() {
    uniqueNamesRegistry.clear();
    inicializarGridsVazios();
    
    currentRound = 0;
    currentYear = 2026;
    lastRaceData = null;
    
    saveLocalStorage();
    
    if (typeof initUI === "function") initUI();
    logEvent("✔ Ecossistema Road to MotoGP™ carregado com 220 pilotos reais e regens regionais!", "sys");
}

function saveLocalStorage() {
    const dataToSave = {
        currentYear, currentRound, activeCategory, ecosystem, lastRaceData,
        uniqueNames: Array.from(uniqueNamesRegistry)
    };
    localStorage.setItem('motogp_sim_save', JSON.stringify(dataToSave));
}

// AGENTE DE CARREGAMENTO AUTO-EXECUTÁVEL
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
