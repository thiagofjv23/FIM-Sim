// ==========================================================================
// ESTADO GLOBAL DO ECOSSISTEMA MUNDIAL FIM
// ==========================================================================
let currentYear = 2026;
let currentRound = 0;
const totalRoundsPerSeason = 5;
let activeCategory = 'motogp';
let uniqueNamesRegistry = new Set();
let lastRaceData = null;

// Objeto que conterá os grids ativos de todas as 10 categorias
let ecosystem = {
    motogp: [], moto2: [], moto3: [], moto3_junior: [], rookies_cup: [],
    moto4_latin: [], moto4_asia: [], moto4_british: [], moto4_northern: [], moto4_european: []
};

// ==========================================================================
// BANCO DE DADOS DE PAÍSES, BANDEIRAS E NOMES (REGENS DA BASE)
// ==========================================================================
const natData = [
    // Mundiais / Europa Sul (Espanha e Itália dominam quantitativamente)
    { country: 'Espanha', flag: '🇪🇸', names: ['Marc', 'Joan', 'Pedro', 'Aleix', 'Jorge', 'Raúl', 'Izan', 'Sergio', 'Álvaro', 'Carlos', 'Maverick', 'Iván', 'Daniel'], surnames: ['Martín', 'Mir', 'Acosta', 'Espargaró', 'Fernández', 'Guevara', 'García', 'Cano', 'Ortolá', 'Holgado', 'Piqueras'] },
    { country: 'Itália', flag: '🇮🇹', names: ['Francesco', 'Enea', 'Marco', 'Fabio', 'Luca', 'Tony', 'Celestino', 'Matteo', 'Filippo', 'Romano', 'Guido'], surnames: ['Bagnaia', 'Bastianini', 'Bezzecchi', 'Marini', 'Arbolino', 'Vietti', 'Foggia', 'Rossi', 'Pini', 'Lunetta'] },
    { country: 'França', flag: '🇫🇷', names: ['Fabio', 'Johann', 'Lorenzo', 'Alan'], surnames: ['Quartararo', 'Zarco', 'Fellon', 'Techer'] },
    { country: 'Portugal', flag: '🇵🇹', names: ['Miguel', 'Ivo', 'Diogo'], surnames: ['Oliveira', 'Lopes', 'Correia'] },
    
    // América Latina (Latin Cup)
    { country: 'Brasil', flag: '🇧🇷', names: ['Diogo', 'Eric', 'Alex', 'David', 'Felipe', 'Gustavo', 'Murilo'], surnames: ['Moreira', 'Granado', 'Barros', 'Santos', 'Aguiar', 'Cardozo', 'Gomez'] },
    { country: 'Colômbia', flag: '🇨🇴', names: ['David', 'Juan', 'Alonso', 'Santiago'], surnames: ['Alonso', 'Ospina', 'Palacio', 'Hernández'] },
    { country: 'Argentina', flag: '🇦🇷', names: ['Valentin', 'Sebastian', 'Marco'], surnames: ['Perrone', 'Porto', 'Solorza'] },
    { country: 'México', flag: '🇲🇽', names: ['Adolfo', 'Enrique'], surnames: ['Delgado', 'Perez'] },

    // Ásia e Oceania (Asia Cup)
    { country: 'Japão', flag: '🇯🇵', names: ['Takaaki', 'Ai', 'Ayumu', 'Ryusei', 'Kaito', 'Taiyo', 'Tatsuki'], surnames: ['Nakagami', 'Ogura', 'Sasaki', 'Yamanaka', 'Toba', 'Furusato', 'Suzuki'] },
    { country: 'Indonésia', flag: '🇮🇩', names: ['Mario', 'Fadillah', 'Veda'], surnames: ['Aji', 'Aditama', 'Ega Pratama'] },
    { country: 'Filipinas', flag: '🇵🇭', names: ['McKinley', 'Kyle'], surnames: ['Paz', 'Ezequiel'] },
    { country: 'Qatar', flag: '🇶🇦', names: ['Saeed', 'Abdullah'], surnames: ['Al-Sulaiti', 'Al-Qubaisi'] },
    { country: 'Malásia', flag: '🇲🇾', names: ['Hafizh', 'Syahrin', 'Zaquan'], surnames: ['Syahrin', 'Anuar', 'Baba'] },
    { country: 'Austrália', flag: '🇦🇺', names: ['Jack', 'Remy', 'Jacob', 'Senna'], surnames: ['Miller', 'Gardner', 'Roulstone', 'Agius'] },

    // Reino Unido e Irlanda (British Cup)
    { country: 'Reino Unido', flag: '🇬🇧', names: ['Sam', 'Jake', 'Scott', 'John', 'Ethan', 'Max'], surnames: ['Lowes', 'Dixon', 'Redding', 'McPhee', 'Sparks', 'Cook'] },
    { country: 'Irlanda', flag: '🇮🇪', names: ['Rhys', 'Casey'], surnames: ['Irwin', 'Tobin'] },

    // Europa Central / Norte / América do Norte (Northern Cup)
    { country: 'Alemanha', flag: '🇩🇪', names: ['Stefan', 'Marcel', 'Lukas'], surnames: ['Bradl', 'Schrötter', 'Tulovic'] },
    { country: 'Países Baixos', flag: '🇳🇱', names: ['Collin', 'Bo'], surnames: ['Veijer', 'Bendsneyder'] },
    { country: 'Chéquia', flag: '🇨🇿', names: ['Filip', 'Jakub'], surnames: ['Salač', 'Kornfeil'] },
    { country: 'Áustria', flag: '🇦🇹', names: ['Leo', 'Maximilian'], surnames: ['Rammerstorfer', 'Kofler'] },
    { country: 'Canadá', flag: '🇨🇦', names: ['Ben', 'Torin'], surnames: ['Young', 'Collins'] }
];

// ==========================================================================
// CONFIGURAÇÃO MASTER DAS 10 CATEGORIAS DA PIRÂMIDE FIM (11 TIMES POR CLASSE)
// ==========================================================================
const categoriesConfig = {
    // 1. ELITE MUNDIAL
    motogp: {
        name: "MotoGP™ Elite World Class",
        paisesPermitidos: ["Mundial"],
        teams: ['Ducati Lenovo Team', 'Prima Pramac Racing', 'Aprilia Racing', 'Red Bull KTM Factory', 'Monster Energy Yamaha', 'Repsol Honda Team', 'Gresini Racing MotoGP', 'Pertamina Enduro VR46', 'Trackhouse Racing', 'Red Bull KTM Tech3', 'LCR Honda Castrol']
    },
    // 2. ACESSO MUNDIAL
    moto2: {
        name: "Moto2™ World Championship",
        paisesPermitidos: ["Mundial"],
        teams: ['Red Bull KTM Ajo M2', 'SpeedUp Racing', 'MT Helmets - MSI M2', 'Elf Marc VDS Racing', 'Italtrans Racing Team', 'Fantic Racing', 'Preicanos Racing', 'RW Racing GP', 'Idemitsu Honda Asia M2', 'Yamaha VR46 Master Camp', 'Forward Racing Team']
    },
    // 3. ENTRADA MUNDIAL
    moto3: {
        name: "Moto3™ World Cup",
        paisesPermitidos: ["Mundial"],
        teams: ['CFMOTO Aspar Team', 'Red Bull KTM Ajo M3', 'Liqui Moly Intact GP', 'MT Helmets - MSI M3', 'Leopard Racing', 'Honda Team Asia M3', 'BOE Motorsports', 'CIP Green Power', 'MLav Racing', 'Rivacold Snipers', 'Red Bull KTM Tech3 M3']
    },
    // 4. TALENTOS INTERNACIONAIS
    moto3_junior: {
        name: "FIM JuniorGP™ Moto3",
        paisesPermitidos: ["Mundial"],
        teams: ['Aspar Junior Team', 'Team Estrella Galicia 00', 'Monlau Motul School', 'Laglisse Academy', 'AC Racing Team', 'STV Lagemaat Racing', 'Artbox Junior', 'MTA Junior Team', 'AGR Team', 'Cardoso Racing', 'Hawkers Karbium M3']
    },
    // 5. COPA DE IGUALDADE MECÂNICA ELEVADA
    rookies_cup: {
        name: "Red Bull MotoGP™ Rookies Cup",
        paisesPermitidos: ["Mundial"],
        teams: ['Rookies Team Austria', 'Rookies Team Spain', 'Rookies Team Italy', 'Rookies Team France', 'Rookies Team Americas', 'Rookies Team Pacific', 'Rookies Team Asia', 'Rookies Team Deutschland', 'Rookies Team UK', 'Rookies Team Nordic', 'Rookies Team Iberia']
    },
    // 6. COPA REGIONAL: AMÉRICA LATINA
    moto4_latin: {
        name: "Moto4™ FIM Latin Cup",
        paisesPermitidos: ["🇧🇷", "🇨🇴", "🇦🇷", "🇲🇽"],
        teams: ['Yamaha IMS Racing', 'Honda Alex Barros Team', 'Team Colombia Motorsport', 'Kawasaki Argentina GP', 'Team Mexico Junior', 'Petronas Latin America', 'LS2 Helmet Racing', 'Mobil1 Junior Cup', 'Estrella Galicia LATAM', 'Red Bull Brazil Talents', 'Pirelli Latin Squad']
    },
    // 7. COPA REGIONAL: ÁSIA / OCEANIA
    moto4_asia: {
        name: "Moto4™ FIM Asia Cup",
        paisesPermitidos: ["🇯🇵", "🇮🇩", "🇵🇭", "🇶🇦", "🇲🇾", "🇦🇺"],
        teams: ['Honda Asia Talent Team', 'Astra Honda Racing Indonesia', 'Yamaha Thailand Youth', 'Team Suzuki Philippines', 'Qatar Racing Academy', 'Petronas Sprinta Junior', 'KTM Australia Talents', 'Team Japan Rising', 'Idemitsu Asia Squad', 'Shell Advance Asia Track', 'Yokohama Racing Project']
    },
    // 8. COPA REGIONAL: REINO UNIDO E IRLANDA
    moto4_british: {
        name: "Moto4™ British Talent Cup",
        paisesPermitidos: ["🇬🇧", "🇮🇪"],
        teams: ['VisionTrack Racing', 'Michael Laverty Academy', 'R&G Racing Academy', 'Irish Road Race Talents', 'British Superbike Junior', 'Team Scotland Young Gun', 'Welsh Dragon Racing', 'Oxford Products Squad', 'KTM UK Youth Development', 'Dynavolt British Star', 'Silverstone Track School']
    },
    // 9. COPA REGIONAL: EUROPA CENTRAL E NORTE
    moto4_northern: {
        name: "Moto4™ Northern Talent Cup",
        paisesPermitidos: ["🇩🇪", "🇳🇱", "🇨🇿", "🇦🇹", "🇨🇦"],
        teams: ['ADAC Sachsen e.V.', 'Zelos Black Knights', 'Dutch Racing Academy', 'Brno Circuit Junior Team', 'KTM Austria Northern', 'Team Canada Motor', 'Intact GP Northern Squad', 'LCR Northern Development', 'Freudenberg Racing', 'Molenaar Racing', 'Kiefer Racing Base']
    },
    // 10. COPA REGIONAL: EUROPA SUL E OESTE
    moto4_european: {
        name: "Moto4™ European Talent Cup",
        paisesPermitidos: ["🇪🇸", "🇮🇹", "🇫🇷", "🇵🇹"],
        teams: ['Cuna de Campeones', 'Monlau Competición', 'Talento Azzurro FMI', 'French FFM Junior Squad', 'Miguel Oliveira Fan Club', 'VR46 Riders Academy Base', 'Leopard Junior European', 'Estrella Galicia Junior ETC', 'IgaxTeam Europe', 'Cardoso Racing ETC', 'Fau55 Tey Racing']
    }
};

// ==========================================================================
// FUNÇÃO PROFISSIONAL DE SALVAMENTO NO LOCALSTORAGE
// ==========================================================================
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

// ==========================================================================
// ALGORITMO CORRIGIDO E SEGURO DE GERAÇÃO DE REGENS REGIONAIS (DIRETRIZ 3)
// ==========================================================================
function generateFictionalNewbie(allowedCountries) {
    let availableNats = natData;
    
    // Filtra as nacionalidades de acordo com as restrições da propriedade 'paisesPermitidos'
    if (allowedCountries && allowedCountries.length > 0 && !allowedCountries.includes("Mundial")) {
        availableNats = natData.filter(n => allowedCountries.includes(n.flag));
    }
    
    // Fallback de segurança caso a lista filtrada falhe
    if (availableNats.length === 0) availableNats = natData;

    let attempts = 0;
    while (attempts < 1000) {
        const nat = availableNats[Math.floor(Math.random() * availableNats.length)];
        const name = nat.names[Math.floor(Math.random() * nat.names.length)];
        const surname = nat.surnames[Math.floor(Math.random() * nat.surnames.length)];
        const fullName = `${name} ${surname}`;

        // Garante a unicidade absoluta de nomes no ecossistema de dados
        if (!uniqueNamesRegistry.has(fullName)) {
            uniqueNamesRegistry.add(fullName);
            return {
                name: fullName,
                flag: nat.flag,
                age: 12, // Pilotos ingressam na base rigidamente com 12 anos
                speed: Math.floor(Math.random() * 11) + 38, // Atributo inicial entre 38 e 48
                potential: Math.floor(Math.random() * 21) + 78, // Potencial entre 78 e 98
                isReal: false,
                points: 0,
                currentRaceScore: 0,
                team: '',
                seat: ''
            };
        }
        attempts++;
    }

    // Gerador de contingência crítica para evitar loops infinitos
    const fallbackNat = availableNats[0];
    const emergencyName = `Rider ${Math.floor(Math.random() * 9000) + 1000}`;
    return { name: emergencyName, flag: fallbackNat.flag, age: 12, speed: 40, potential: 80, isReal: false, points: 0, currentRaceScore: 0, team: '', seat: '' };
}

// ==========================================================================
// SEEDING COMPLETO E AUTOMÁTICO: SEQUESTRADOR DE GRIDS (22 PILOTOS POR CLASSE)
// ==========================================================================
function initializeRealEcosystem() {
    uniqueNamesRegistry.clear();
    
    // Lista de sementes reais de destaque para injetar personalidade nas classes superiores
    const topSeeds = {
        motogp: [
            { name: 'Francesco Bagnaia', flag: '🇮🇹', age: 29, speed: 94, potential: 96, isReal: true },
            { name: 'Jorge Martín', flag: '🇪🇸', age: 28, speed: 93, potential: 95, isReal: true },
            { name: 'Marc Márquez', flag: '🇪🇸', age: 33, speed: 92, potential: 93, isReal: true },
            { name: 'Enea Bastianini', flag: '🇮🇹', age: 28, speed: 89, potential: 91, isReal: true },
            { name: 'Pedro Acosta', flag: '🇪🇸', age: 22, speed: 88, potential: 97, isReal: true },
            { name: 'Brad Binder', flag: '🇿🇦', age: 30, speed: 87, potential: 89, isReal: true },
            { name: 'Fabio Quartararo', flag: '🇫🇷', age: 27, speed: 88, potential: 92, isReal: true },
            { name: 'Maverick Viñales', flag: '🇪🇸', age: 31, speed: 86, potential: 87, isReal: true },
            { name: 'Marco Bezzecchi', flag: '🇮🇹', age: 27, speed: 85, potential: 89, isReal: true },
            { name: 'Franco Morbidelli', flag: '🇮🇹', age: 31, speed: 84, potential: 85, isReal: true },
            { name: 'Alex Márquez', flag: '🇪🇸', age: 30, speed: 84, potential: 86, isReal: true },
            { name: 'Aleix Espargaró', flag: '🇪🇸', age: 36, speed: 84, potential: 84, isReal: true }
        ],
        moto2: [
            { name: 'Fermín Aldeguer', flag: '🇪🇸', age: 21, speed: 87, potential: 95, isReal: true },
            { name: 'Alonso López', flag: '🇪🇸', age: 24, speed: 84, potential: 89, isReal: true },
            { name: 'Sergio García', flag: '🇪🇸', age: 23, speed: 85, potential: 91, isReal: true },
            { name: 'Ai Ogura', flag: '🇯🇵', age: 25, speed: 86, potential: 92, isReal: true },
            { name: 'Joe Roberts', flag: '🇺🇸', age: 29, speed: 83, potential: 84, isReal: true },
            { name: 'Aron Canet', flag: '🇪🇸', age: 26, speed: 84, potential: 86, isReal: true },
            { name: 'Celestino Vietti', flag: '🇮🇹', age: 24, speed: 82, potential: 88, isReal: true },
            { name: 'Tony Arbolino', flag: '🇮🇹', age: 25, speed: 83, potential: 87, isReal: true },
            { name: 'Manuel González', flag: '🇪🇸', age: 23, speed: 82, potential: 89, isReal: true },
            { name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 81, potential: 83, isReal: true },
            { name: 'Marcos Ramírez', flag: '🇪🇸', age: 28, speed: 80, potential: 81, isReal: true },
            { name: 'Filip Salač', flag: '🇨🇿', age: 24, speed: 79, potential: 83, isReal: true }
        ],
        moto3: [
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
    };

    // Varre as 10 categorias configuradas
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        ecosystem[catKey] = [];
        
        let seedsInjetados = topSeeds[catKey] || [];
        
        // Loop para preencher exatamente as 11 equipes da categoria
        for (let i = 0; i < 11; i++) {
            const teamName = config.teams[i];
            
            // Cada equipe obrigatoriamente recebe 2 pilotos (Mapeando o grid estrito de 22 vagas)
            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                let rider;
                
                // Se ainda existirem pilotos de elite manuais disponíveis, use-os
                if (seedsInjetados.length > 0) {
                    rider = seedsInjetados.shift();
                    uniqueNamesRegistry.add(rider.name);
                } else {
                    // Caso contrário, gera um piloto regional seguindo as restrições de passaporte da FIM
                    rider = generateFictionalNewbie(config.paisesPermitidos);
                    // Eleva levemente o ranking inicial caso o regen surja em categorias intermediárias mundiais
                    if (catKey === 'moto2') { rider.speed += 30; rider.age = 19; }
                    else if (catKey === 'moto3') { rider.speed += 25; rider.age = 17; }
                    else if (catKey === 'moto3_junior') { rider.speed += 15; rider.age = 15; }
                    else if (catKey === 'rookies_cup') { rider.speed += 10; rider.age = 14; }
                }

                // Vincula os contratos da escuderia e assento correspondente
                rider.team = teamName;
                rider.seat = `Piloto ${seatNum}`;
                rider.points = 0;
                rider.currentRaceScore = 0;

                ecosystem[catKey].push(rider);
            }
        }
    }

    currentRound = 0;
    currentYear = 2026;
    lastRaceData = null;
    
    saveLocalStorage();
    
    if (typeof initUI === "function") initUI();
    console.log("🏁 Banco de Dados FIM expandido com sucesso! Grid escalado para 220 pilotos.");
}

// ==========================================================================
// CAPTURA DE INICIALIZAÇÃO AO INICIAR A SESSÃO
// ==========================================================================
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
