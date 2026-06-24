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
    moto2: { 
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
        name: "Idemitsu Moto4 Asia Cup",
        paisesPermitidos: ["🇯🇵", "🇮🇩", "🇲🇾", "🇹🇭", "🇦🇺", "🇵🇭", "🇶🇦", "🇮🇳", "🇳🇿"],
        teams: ["Astra Honda Racing", "Honda Racing Thailand", "Idemitsu Racing Japan", "SIC Racing Team", "BRP Racing Australia", "Yamaha Racing ASEAN", "FIM Oceania Junior", "Honda Team Asia Junior", "Philippines Racing Team", "TVS Racing India", "QMMF Racing"]
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
        { name: "Francesco Bagnaia", flag: "🇮🇹", age: 29, speed: 96, potential: 96, isReal: true },
        { name: "Marc Márquez", flag: "🇪🇸", age: 33, speed: 95, potential: 95, isReal: true },
        { name: "Jorge Martín", flag: "🇪🇸", age: 28, speed: 95, potential: 96, isReal: true },
        { name: "Fabio Quartararo", flag: "🇫🇷", age: 27, speed: 92, potential: 94, isReal: true },
        { name: "Pedro Acosta", flag: "🇪🇸", age: 22, speed: 91, potential: 98, isReal: true },
        { name: "Enea Bastianini", flag: "🇮🇹", age: 29, speed: 91, potential: 92, isReal: true },
        { name: "Brad Binder", flag: "🇿🇦", age: 31, speed: 90, potential: 90, isReal: true },
        { name: "Marco Bezzecchi", flag: "🇮🇹", age: 28, speed: 90, potential: 92, isReal: true },
        { name: "Maverick Viñales", flag: "🇪🇸", age: 31, speed: 89, potential: 89, isReal: true },
        { name: "Toprak Razgatlıoğlu", flag: "🇹🇷", age: 30, speed: 89, potential: 91, isReal: true },
        { name: "Álex Márquez", flag: "🇪🇸", age: 30, speed: 88, potential: 88, isReal: true },
        { name: "Álex Rins", flag: "🇪🇸", age: 31, speed: 88, potential: 88, isReal: true },
        { name: "Fabio Di Giannantonio", flag: "🇮🇹", age: 28, speed: 88, potential: 89, isReal: true },
        { name: "Franco Morbidelli", flag: "🇮🇹", age: 32, speed: 87, potential: 87, isReal: true },
        { name: "Luca Marini", flag: "🇮🇹", age: 29, speed: 87, potential: 88, isReal: true },
        { name: "Fermín Aldeguer", flag: "🇪🇸", age: 21, speed: 86, potential: 94, isReal: true },
        { name: "Raúl Fernández", flag: "🇪🇸", age: 26, speed: 86, potential: 89, isReal: true },
        { name: "Joan Mir", flag: "🇪🇸", age: 29, speed: 86, potential: 87, isReal: true },
        { name: "Jack Miller", flag: "🇦🇺", age: 31, speed: 86, potential: 86, isReal: true },
        { name: "Johann Zarco", flag: "🇫🇷", age: 36, speed: 85, potential: 85, isReal: true },
        { name: "Ai Ogura", flag: "🇯🇵", age: 25, speed: 85, potential: 90, isReal: true },
        { name: "Diogo Moreira", flag: "🇧🇷", age: 22, speed: 84, potential: 91, isReal: true }
    ],
    moto2: [
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
    ],
    moto4_asia: [
        { name: 'Veda Ega Pratama', flag: '🇮🇩', age: 15, speed: 68, potential: 90, isReal: true },
        { name: 'Reykat Fadillah', flag: '🇮🇩', age: 15, speed: 65, potential: 84, isReal: true },
        { name: 'Jakkreephat Phuettisan', flag: '🇹🇭', age: 16, speed: 67, potential: 86, isReal: true },
        { name: 'Kiattisak Singhapong', flag: '🇹🇭', age: 15, speed: 64, potential: 81, isReal: true },
        { name: 'Zen Mitani', flag: '🇯🇵', age: 16, speed: 69, potential: 92, isReal: true },
        { name: 'Riichi Takahira', flag: '🇯🇵', age: 15, speed: 66, potential: 85, isReal: true },
        { name: 'Farish Hafiy', flag: '🇲🇾', age: 15, speed: 65, potential: 83, isReal: true },
        { name: 'Farhan Naqib', flag: '🇲🇾', age: 14, speed: 62, potential: 80, isReal: true },
        { name: 'Carter Paige', flag: '🇦🇺', age: 15, speed: 64, potential: 82, isReal: true },
        { name: 'Hudson Paige', flag: '🇦🇺', age: 14, speed: 63, potential: 85, isReal: true },
        { name: 'Arai Agaska', flag: '🇮🇩', age: 16, speed: 66, potential: 87, isReal: true },
        { name: 'Kitsada Tanachot', flag: '🇹🇭', age: 15, speed: 63, potential: 81, isReal: true },
        { name: 'Marianos Nikolis', flag: '🇦🇺', age: 16, speed: 65, potential: 82, isReal: true },
        { name: 'Levi Russo', flag: '🇦🇺', age: 14, speed: 61, potential: 79, isReal: true },
        { name: 'Ryota Ogiwara', flag: '🇯🇵', age: 15, speed: 67, potential: 89, isReal: true },
        { name: 'Sota Ogiwara', flag: '🇯🇵', age: 14, speed: 64, potential: 86, isReal: true },
        { name: 'Alfonsi Daquigan', flag: '🇵🇭', age: 15, speed: 62, potential: 80, isReal: true },
        { name: 'Eane Jaye Sobretodo', flag: '🇵🇭', age: 16, speed: 60, potential: 77, isReal: true },
        { name: 'Chiranth Vishwanath', flag: '🇮🇳', age: 16, speed: 61, potential: 79, isReal: true },
        { name: 'Rakshith Dave', flag: '🇮🇳', age: 15, speed: 59, potential: 76, isReal: true },
        { name: 'Hamad Al-Sahouti', flag: '🇶🇦', age: 16, speed: 63, potential: 84, isReal: true },
        { name: 'Saad Al-Harqan', flag: '🇶🇦', age: 15, speed: 58, potential: 75, isReal: true }
    ]
};

// ==========================================================================
// 2.5 FREE AGENTS (Pilotos sem assento oficial no início do save)
// ==========================================================================
const freeAgents = [
    { name: 'Miguel Oliveira', flag: '🇵🇹', age: 31, speed: 85, potential: 86, isReal: true },
    { name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 79, potential: 85, isReal: true }
];

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
                name: fullName, flag: nat.flag, age: 12, 
                speed: Math.floor(Math.random() * 9) + 38,
                potential: Math.floor(Math.random() * 21) + 76,
                isReal: false, points: 0, currentRaceScore: 0, team: '', seat: ''
            };
        }
        attempts++;
    }
    return { name: `Regen ${Math.floor(Math.random()*8999)+1000}`, flag: availableNats[0].flag, age: 12, speed: 40, potential: 80, isReal: false, points: 0, currentRaceScore: 0, team: '', seat: '' };
}

function inicializarGridsVazios() {
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        let preLoadedList = historicalSeeds[catKey] ? [...historicalSeeds[catKey]] : [];
        
        ecosystem[catKey] = [];

        for (let i = 0; i < 11; i++) {
            const teamName = config.teams[i];

            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                let rider;

                if (preLoadedList.length > 0) {
                    rider = preLoadedList.shift();
                    uniqueNamesRegistry.add(rider.name);
                } else {
                    rider = generateFictionalNewbie(config.paisesPermitidos);
                    
                    if (catKey === 'moto2') { rider.speed += 36; rider.age = 19; }
                    else if (catKey === 'moto3') { rider.speed += 32; rider.age = 17; }
                    else if (catKey === 'moto3_junior') { rider.speed += 20; rider.age = 15; }
                    else if (catKey === 'rookies_cup') { rider.speed += 16; rider.age = 14; }
                }

                rider.team = teamName;
                rider.seat = `Piloto ${seatNum}`;
                rider.points = 0;
                rider.currentRaceScore = 0;

                ecosystem[catKey].push(rider);
            }
        }
    }
}

// PROFISSIONAL DE SALVAMENTO NO LOCALSTORAGE
function saveLocalStorage() {
    const dataToSave = {
        currentYear, currentRound, activeCategory, ecosystem, lastRaceData,
        uniqueNames: Array.from(uniqueNamesRegistry)
    };
    localStorage.setItem('motogp_sim_save', JSON.stringify(dataToSave));
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
    if (typeof logEvent === "function") logEvent("✔ Ecossistema Road to MotoGP™ carregado com sucesso!", "sys");
}

// AGENTE DE CARREGAMENTO AUTO-EXECUTÁVEL (COM FAILSAFE)
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('motogp_sim_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // Nova Trava de Segurança Aprimorada:
            // Além de conferir se a classe asiática existe, agora o sistema checa ativamente se
            // a nova base de dados da MotoGP foi aplicada buscando pelo Toprak. Se não encontrar,
            // ele forçará o recarregamento descartando o Miguel/Somkiat do cache antigo.
            const hasNovaAtualizacao = parsed.ecosystem && parsed.ecosystem.motogp && 
                                       parsed.ecosystem.motogp.some(p => p.name.includes("Toprak"));

            if (!parsed.ecosystem || !parsed.ecosystem['moto4_asia'] || !hasNovaAtualizacao) {
                console.warn("Save de versão antiga ou desatualizado detectado. Reconstruindo matriz de dados...");
                initializeRealEcosystem();
                return;
            }
            
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
