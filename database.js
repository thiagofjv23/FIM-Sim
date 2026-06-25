// ==========================================================================
// ESTADO GLOBAL DO ECOSSISTEMA MUNDIAL FIM
// ==========================================================================
let currentYear = 2026;
let currentRound = 0;
const totalRoundsPerSeason = 10;
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
    { country: 'Espanha', flag: '🇪🇸', names: ['Marc', 'Joan', 'Pedro', 'Aleix', 'Jorge', 'Raúl', 'Izan', 'Sergio', 'Álvaro', 'Carlos', 'Maverick', 'Iván', 'Daniel', 'Marcos'], surnames: ['Márquez', 'Mir', 'Oliveira', 'Espargaro', 'Bezzecchi', 'Viñales', 'Acosta', 'Fernández', 'García', 'López', 'Holgado', 'Alonso'] },
    { country: 'Itália', flag: '🇮🇹', names: ['Francesco', 'Enea', 'Marco', 'Fabio', 'Luca', 'Tony', 'Celestino', 'Matteo', 'Filippo', 'Romano', 'Guido', 'Farioli'], surnames: ['Bagnaia', 'Bastianini', 'Bezzecchi', 'Di Giannantonio', 'Marini', 'Morbidelli', 'Arbolino', 'Vietti', 'Lunetta'] },
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
// GERADOR DE IDs GLOBAL
// ==========================================================================
let nextRiderId = 1000; // IDs de pilotos começam em 1000
let riderIdMap = {}; // Mapa de nome -> ID para rastreamento

function generateRiderId() {
    return nextRiderId++;
}

// ==========================================================================
// NOVA ESTRUTURA: MotoGP 2026 COM IDs DE PILOTOS
// ==========================================================================
const motogp2026 = {
  season: 2026,
  teams: [
    {
      id: 1,
      name: 'Aprilia Racing',
      manufacturer: 'Aprilia',
      riders: [
        { riderId: generateRiderId(), name: 'Marco Bezzecchi', flag: '🇮🇹', age: 28, speed: 90, potential: 92, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Jorge Martín', flag: '🇪🇸', age: 28, speed: 95, potential: 96, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 2,
      name: 'Trackhouse MotoGP Team',
      manufacturer: 'Aprilia',
      riders: [
        { riderId: generateRiderId(), name: 'Raúl Fernández', flag: '🇪🇸', age: 26, speed: 86, potential: 89, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Ai Ogura', flag: '🇯🇵', age: 25, speed: 85, potential: 90, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 3,
      name: 'Ducati Lenovo Team',
      manufacturer: 'Ducati',
      riders: [
        { riderId: generateRiderId(), name: 'Francesco Bagnaia', flag: '🇮🇹', age: 29, speed: 96, potential: 96, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Marc Márquez', flag: '🇪🇸', age: 33, speed: 95, potential: 95, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 4,
      name: 'Pertamina Enduro VR46 Racing Team',
      manufacturer: 'Ducati',
      riders: [
        { riderId: generateRiderId(), name: 'Fabio Di Giannantonio', flag: '🇮🇹', age: 28, speed: 88, potential: 89, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Franco Morbidelli', flag: '🇮🇹', age: 32, speed: 87, potential: 87, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 5,
      name: 'BK8 Gresini Racing MotoGP',
      manufacturer: 'Ducati',
      riders: [
        { riderId: generateRiderId(), name: 'Álex Márquez', flag: '🇪🇸', age: 30, speed: 88, potential: 88, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Fermín Aldeguer', flag: '🇪🇸', age: 21, speed: 86, potential: 94, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 6,
      name: 'Honda HRC Castrol',
      manufacturer: 'Honda',
      riders: [
        { riderId: generateRiderId(), name: 'Luca Marini', flag: '🇮🇹', age: 29, speed: 87, potential: 88, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Joan Mir', flag: '🇪🇸', age: 29, speed: 86, potential: 87, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 7,
      name: 'Castrol Honda LCR',
      manufacturer: 'Honda',
      riders: [
        { riderId: generateRiderId(), name: 'Johann Zarco', flag: '🇫🇷', age: 36, speed: 85, potential: 85, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Diogo Moreira', flag: '🇧🇷', age: 22, speed: 84, potential: 91, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 8,
      name: 'Red Bull KTM Factory Racing',
      manufacturer: 'KTM',
      riders: [
        { riderId: generateRiderId(), name: 'Brad Binder', flag: '🇿🇦', age: 31, speed: 90, potential: 90, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Pedro Acosta', flag: '🇪🇸', age: 22, speed: 91, potential: 98, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 9,
      name: 'Red Bull KTM Tech3',
      manufacturer: 'KTM',
      riders: [
        { riderId: generateRiderId(), name: 'Maverick Viñales', flag: '🇪🇸', age: 31, speed: 89, potential: 89, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Enea Bastianini', flag: '🇮🇹', age: 29, speed: 91, potential: 92, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 10,
      name: 'Monster Energy Yamaha MotoGP Team',
      manufacturer: 'Yamaha',
      riders: [
        { riderId: generateRiderId(), name: 'Fabio Quartararo', flag: '🇫🇷', age: 27, speed: 92, potential: 94, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Álex Rins', flag: '🇪🇸', age: 31, speed: 88, potential: 88, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 11,
      name: 'Prima Pramac Yamaha MotoGP',
      manufacturer: 'Yamaha',
      riders: [
        { riderId: generateRiderId(), name: 'Toprak Razgatlıoğlu', flag: '🇹🇷', age: 30, speed: 89, potential: 91, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Jack Miller', flag: '🇦🇺', age: 31, speed: 86, potential: 86, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    }
  ]
};

const moto22026 = {
  season: 2026,
  teams: [
    {
      id: 1,
      name: 'BLU CRU Pramac Yamaha Moto2',
      manufacturer: 'Yamaha',
      riders: [
        { riderId: generateRiderId(), name: 'Izan Guevara', flag: '🇪🇸', age: 22, speed: 81, potential: 86, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Alberto Ferrández', flag: '🇪🇸', age: 20, speed: 76, potential: 88, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 2,
      name: 'CFMOTO Aspar Team',
      manufacturer: 'CFMoto',
      riders: [
        { riderId: generateRiderId(), name: 'David Alonso', flag: '🇨🇴', age: 20, speed: 84, potential: 94, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Daniel Holgado', flag: '🇪🇸', age: 21, speed: 82, potential: 88, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 3,
      name: 'ELF Marc VDS Racing Team',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Arón Canet', flag: '🇪🇸', age: 26, speed: 85, potential: 86, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Deniz Öncü', flag: '🇹🇷', age: 22, speed: 85, potential: 85, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 4,
      name: 'Idemitsu Honda Team Asia',
      manufacturer: 'Honda',
      riders: [
        { riderId: generateRiderId(), name: 'Mario Aji', flag: '🇮🇩', age: 22, speed: 79, potential: 82, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Taiyo Furusato', flag: '🇯🇵', age: 20, speed: 80, potential: 85, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 5,
      name: 'Italjet Gresini Moto2',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Sergio García', flag: '🇪🇸', age: 23, speed: 84, potential: 89, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Alonso López', flag: '🇪🇸', age: 24, speed: 85, potential: 88, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 6,
      name: 'Italtrans Racing Team',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Adrián Huertas', flag: '🇪🇸', age: 22, speed: 79, potential: 86, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Daniel Muñoz', flag: '🇪🇸', age: 19, speed: 79, potential: 84, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 7,
      name: 'Liqui Moly Dynavolt Intact GP',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Manuel González', flag: '🇪🇸', age: 24, speed: 87, potential: 90, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Senna Agius', flag: '🇦🇺', age: 21, speed: 86, potential: 89, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 8,
      name: 'RW Racing GP',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Ayumu Sasaki', flag: '🇯🇵', age: 25, speed: 81, potential: 84, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Zonta van den Goorbergh', flag: '🇳🇱', age: 20, speed: 80, potential: 84, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 9,
      name: 'OnlyFans American Racing Team',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Filip Salač', flag: '🇨🇿', age: 24, speed: 84, potential: 84, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Joe Roberts', flag: '🇺🇸', age: 29, speed: 83, potential: 84, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 10,
      name: 'QJMotor-Frinsa-MSI',
      manufacturer: 'QJMotor',
      riders: [
        { riderId: generateRiderId(), name: 'Iván Ortolá', flag: '🇪🇸', age: 21, speed: 82, potential: 88, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Ángel Piqueras', flag: '🇪🇸', age: 19, speed: 80, potential: 90, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 11,
      name: 'Red Bull KTM Ajo',
      manufacturer: 'KTM',
      riders: [
        { riderId: generateRiderId(), name: 'Collin Veijer', flag: '🇳🇱', age: 21, speed: 84, potential: 92, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'José Antonio Rueda', flag: '🇪🇸', age: 20, speed: 83, potential: 89, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 12,
      name: 'Fantic Racing Lino Sonego',
      manufacturer: 'Fantic',
      riders: [
        { riderId: generateRiderId(), name: 'Barry Baltus', flag: '🇧🇪', age: 21, speed: 84, potential: 84, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Tony Arbolino', flag: '🇮🇹', age: 25, speed: 84, potential: 86, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    },
    {
      id: 13,
      name: 'SpeedRS Team',
      manufacturer: 'Kalex',
      riders: [
        { riderId: generateRiderId(), name: 'Celestino Vietti', flag: '🇮🇹', age: 24, speed: 85, potential: 88, isReal: true, seat: 1, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Luca Lunetta', flag: '🇮🇹', age: 20, speed: 76, potential: 86, isReal: true, seat: 2, points: 0, currentRaceScore: 0 }
      ]
    }
  ]
};

// ==========================================================================
// FUNÇÕES AUXILIARES PARA ACESSAR DADOS
// ==========================================================================

/**
 * Buscar um piloto por ID
 * @param {number} riderId - ID do piloto
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {object} Piloto com dados da equipe
 */
function findRiderById(riderId, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  
  for (const team of championship.teams) {
    for (const rider of team.riders) {
      if (rider.riderId === riderId) {
        return {
          ...rider,
          team: team.name,
          teamId: team.id,
          manufacturer: team.manufacturer
        };
      }
    }
  }
  return null;
}

/**
 * Buscar um piloto por nome e categoria
 * @param {string} riderName - Nome do piloto
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {object} Piloto com dados da equipe
 */
function findRiderByName(riderName, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  
  for (const team of championship.teams) {
    for (const rider of team.riders) {
      if (rider.name === riderName) {
        return {
          ...rider,
          team: team.name,
          teamId: team.id,
          manufacturer: team.manufacturer
        };
      }
    }
  }
  return null;
}

/**
 * Buscar uma equipe por ID
 * @param {number} teamId - ID da equipe
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {object} Equipe com seus pilotos
 */
function findTeamById(teamId, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  return championship.teams.find(t => t.id === teamId) || null;
}

/**
 * Buscar todos os pilotos de uma equipe
 * @param {string} teamName - Nome da equipe
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {array} Array de pilotos da equipe
 */
function getRidersByTeam(teamName, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  const team = championship.teams.find(t => t.name === teamName);
  
  if (!team) return [];
  
  return team.riders.map(r => ({
    ...r,
    team: team.name,
    teamId: team.id,
    manufacturer: team.manufacturer
  }));
}

/**
 * Buscar todos os pilotos de um fabricante
 * @param {string} manufacturer - Nome do fabricante
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {array} Array de pilotos do fabricante
 */
function getRidersByManufacturer(manufacturer, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  const riders = [];
  
  for (const team of championship.teams) {
    if (team.manufacturer === manufacturer) {
      riders.push(...team.riders.map(r => ({
        ...r,
        team: team.name,
        teamId: team.id,
        manufacturer: team.manufacturer
      })));
    }
  }
  return riders;
}

/**
 * Retornar todos os pilotos de uma categoria em formato grid
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {array} Array de todos os pilotos
 */
function getAllRiders(category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  const allRiders = [];
  
  for (const team of championship.teams) {
    for (const rider of team.riders) {
      allRiders.push({
        ...rider,
        team: team.name,
        teamId: team.id,
        manufacturer: team.manufacturer
      });
    }
  }
  return allRiders;
}

/**
 * Transferir piloto para nova equipe
 * @param {number} riderId - ID do piloto
 * @param {number} newTeamId - ID da nova equipe
 * @param {number} newSeat - Número do novo assento
 * @param {string} category - 'motogp' ou 'moto2'
 * @returns {boolean} Sucesso da transferência
 */
function transferRider(riderId, newTeamId, newSeat, category = 'motogp') {
  const championship = category === 'motogp' ? motogp2026 : moto22026;
  
  let riderToTransfer = null;
  let oldTeamIndex = -1;
  let oldRiderIndex = -1;
  
  // Encontrar piloto e sua equipe atual
  for (let t = 0; t < championship.teams.length; t++) {
    for (let r = 0; r < championship.teams[t].riders.length; r++) {
      if (championship.teams[t].riders[r].riderId === riderId) {
        riderToTransfer = { ...championship.teams[t].riders[r] };
        oldTeamIndex = t;
        oldRiderIndex = r;
        break;
      }
    }
    if (riderToTransfer) break;
  }
  
  if (!riderToTransfer) {
    console.error(`Piloto com ID ${riderId} não encontrado`);
    return false;
  }
  
  // Encontrar nova equipe
  const newTeamIndex = championship.teams.findIndex(t => t.id === newTeamId);
  if (newTeamIndex === -1) {
    console.error(`Equipe com ID ${newTeamId} não encontrada`);
    return false;
  }
  
  // Verificar se assento está disponível
  if (newSeat < 1 || newSeat > 2) {
    console.error(`Assento inválido. Deve ser 1 ou 2`);
    return false;
  }
  
  const newTeam = championship.teams[newTeamIndex];
  const seatOccupied = newTeam.riders.some(r => r.seat === newSeat);
  
  if (seatOccupied) {
    console.error(`Assento ${newSeat} já está ocupado em ${newTeam.name}`);
    return false;
  }
  
  // Remover piloto da equipe antiga
  championship.teams[oldTeamIndex].riders.splice(oldRiderIndex, 1);
  
  // Adicionar piloto à nova equipe
  riderToTransfer.seat = newSeat;
  riderToTransfer.points = 0; // Reset de pontos na transferência
  riderToTransfer.currentRaceScore = 0;
  newTeam.riders.push(riderToTransfer);
  
  console.log(`✔ ${riderToTransfer.name} transferido para ${newTeam.name} (Assento ${newSeat})`);
  return true;
}

/**
 * Criar piloto fictício com ID único
 * @param {string} name - Nome completo do piloto
 * @param {string} flag - Flag do país
 * @param {number} age - Idade
 * @param {number} speed - Velocidade
 * @param {number} potential - Potencial
 * @returns {object} Novo piloto com ID
 */
function createNewRider(name, flag, age, speed, potential) {
  return {
    riderId: generateRiderId(),
    name: name,
    flag: flag,
    age: age,
    speed: speed,
    potential: potential,
    isReal: false,
    seat: 0,
    points: 0,
    currentRaceScore: 0
  };
}

// ==========================================================================
// METADADOS E ESTRUTURA REAL DAS CATEGORIAS (CONFIGURAÇÃO MASTER)
// ==========================================================================
const categoriesConfig = {
    motogp: {
        name: "MotoGP™ Elite World Class",
        paisesPermitidos: ["Mundial"],
        teams: ['Ducati Lenovo Team', 'Prima Pramac Racing', 'Aprilia Racing', 'Red Bull KTM Factory', 'Monster Energy Yamaha', 'Repsol Honda Team', 'Gresini Racing MotoGP', 'Pertamina Enduro VR46 Racing', 'Castrol Honda LCR', 'Red Bull KTM Tech3', 'Trackhouse MotoGP Team']
    },
    moto2: { 
        name: "Moto2™ World Championship",
        paisesPermitidos: ["Mundial"],
        teams: ['BLU CRU Pramac Yamaha Moto2', 'CFMOTO Aspar Team', 'ELF Marc VDS Racing Team', 'Idemitsu Honda Team Asia', 'Italjet Gresini Moto2', 'Italtrans Racing Team', 'Liqui Moly Dynavolt Intact GP', 'RW Racing GP', 'OnlyFans American Racing Team', 'QJMotor-Frinsa-MSI', 'Red Bull KTM Ajo', 'Fantic Racing Lino Sonego', 'SpeedRS Team']
    },
    moto3: {
        name: "Moto3™ World Cup",
        paisesPermitidos: ["Mundial"],
        teams: ['CFMOTO Aspar Team', 'Liqui Moly Intact GP', 'MT Helmets - MSI', 'Red Bull KTM Ajo', 'Leopard Racing', 'Red Bull KTM Tech3', 'Honda Team Asia', 'BOE Motorsports', 'CIP Green Power', 'Devioser Tuning', 'Kopron Rivacold']
    },
    moto3_junior: {
        name: "FIM JuniorGP™ Moto3",
        paisesPermitidos: ["Mundial"],
        teams: ['Aspar Junior Team', 'Team Estrella Galicia 00', 'Monlau Motul School', 'Laglisse Academy', 'AC Racing Team', 'Finetwork Team', 'Artbox Junior', 'MTA Junior Team', 'AGR Team', 'Carrera Junior', 'Rins Motorsport Team']
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
        teams: ["Astra Honda Racing", "Honda Racing Thailand", "Idemitsu Racing Japan", "SIC Racing Team", "BRP Racing Australia", "Yamaha Racing ASEAN", "FIM Oceania Junior", "Honda Team Asia Junior", "Musashi RT Suzuki"]
    },
    moto4_british: {
        name: "Moto4™ British Cup",
        paisesPermitidos: ["🇬🇧", "🇮🇪"],
        teams: ['VisionTrack UK', 'Laverty Academy', 'R&G Youth', 'Irish Road Race', 'BSB Junior', 'Scotland Gun', 'Welsh Dragon', 'Oxford Products', 'Silverstone School', 'Donington Talents', 'Irish Racers']
    },
    moto4_northern: {
        name: "Moto4™ Northern Cup",
        paisesPermitidos: ["🇩🇪", "🇳🇱", "🇨🇿", "🇦🇹", "🇨🇦"],
        teams: ['ADAC Sachsen', 'Zelos Black', 'Dutch Academy', 'Brno Circuit', 'KTM Austria', 'Canada Motor', 'Intact Northern', 'Freudenberg', 'Molenaar', 'Kiefer Base', 'Nordic Alliance']
    },
    moto4_european: {
        name: "Moto4™ European Cup",
        paisesPermitidos: ["🇪🇸", "🇮🇹", "🇫🇷", "🇵🇹"],
        teams: ['Cuna de Campeones', 'Monlau Competición', 'Talento Azzurro', 'FFM Junior', 'Oliveira Fan Club', 'VR46 Base', 'Leopard Junior', 'EG 00 Junior', 'IgaxTeam', 'Cardoso ETC', 'Fau55 Team']
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
        { name: "Izan Guevara", flag: "🇪🇸", age: 22, speed: 81, potential: 86, isReal: true },
        { name: "Alberto Ferrández", flag: "🇪🇸", age: 20, speed: 76, potential: 88, isReal: true },
        { name: "David Alonso", flag: "🇨🇴", age: 20, speed: 84, potential: 94, isReal: true },
        { name: "Daniel Holgado", flag: "🇪🇸", age: 21, speed: 82, potential: 88, isReal: true },
        { name: "Arón Canet", flag: "🇪🇸", age: 26, speed: 85, potential: 86, isReal: true },
        { name: "Deniz Öncü", flag: "🇹🇷", age: 22, speed: 85, potential: 85, isReal: true },
        { name: "Mario Aji", flag: "🇮🇩", age: 22, speed: 79, potential: 82, isReal: true },
        { name: "Taiyo Furusato", flag: "🇯🇵", age: 20, speed: 80, potential: 85, isReal: true },
        { name: "Sergio García", flag: "🇪🇸", age: 23, speed: 84, potential: 89, isReal: true },
        { name: "Alonso López", flag: "🇪🇸", age: 24, speed: 85, potential: 88, isReal: true },
        { name: "Daniel Muñoz", flag: "🇪🇸", age: 19, speed: 79, potential: 84, isReal: true },
        { name: "Adrián Huertas", flag: "🇪🇸", age: 22, speed: 79, potential: 86, isReal: true },
        { name: "Manuel González", flag: "🇪🇸", age: 24, speed: 87, potential: 90, isReal: true },
        { name: "Senna Agius", flag: "🇦🇺", age: 21, speed: 86, potential: 89, isReal: true },
        { name: "Ayumu Sasaki", flag: "🇯🇵", age: 25, speed: 81, potential: 84, isReal: true },
        { name: "Zonta van den Goorbergh", flag: "🇳🇱", age: 20, speed: 80, potential: 84, isReal: true },
        { name: "Filip Salač", flag: "🇨🇿", age: 24, speed: 84, potential: 84, isReal: true },
        { name: "Joe Roberts", flag: "🇺🇸", age: 29, speed: 83, potential: 84, isReal: true },
        { name: "Iván Ortolá", flag: "🇪🇸", age: 21, speed: 82, potential: 88, isReal: true },
        { name: "Ángel Piqueras", flag: "🇪🇸", age: 19, speed: 80, potential: 90, isReal: true },
        { name: "Collin Veijer", flag: "🇳🇱", age: 21, speed: 84, potential: 92, isReal: true },
        { name: "José Antonio Rueda", flag: "🇪🇸", age: 20, speed: 83, potential: 89, isReal: true },
        { name: "Barry Baltus", flag: "🇧🇪", age: 21, speed: 84, potential: 84, isReal: true },
        { name: "Tony Arbolino", flag: "🇮🇹", age: 25, speed: 84, potential: 86, isReal: true },
        { name: "Celestino Vietti", flag: "🇮🇹", age: 24, speed: 85, potential: 88, isReal: true },
        { name: "Luca Lunetta", flag: "🇮🇹", age: 20, speed: 76, potential: 86, isReal: true }
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
    { riderId: generateRiderId(), name: 'Miguel Oliveira', flag: '🇵🇹', age: 31, speed: 85, potential: 86, isReal: true, seat: 0, points: 0, currentRaceScore: 0 },
    { riderId: generateRiderId(), name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 79, potential: 85, isReal: true, seat: 0, points: 0, currentRaceScore: 0 }
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
                riderId: generateRiderId(),
                name: fullName, 
                flag: nat.flag, 
                age: 12, 
                speed: Math.floor(Math.random() * 9) + 38,
                potential: Math.floor(Math.random() * 21) + 76,
                isReal: false, 
                points: 0, 
                currentRaceScore: 0, 
                seat: ''
            };
        }
        attempts++;
    }
    return { 
        riderId: generateRiderId(),
        name: `Regen ${Math.floor(Math.random()*8999)+1000}`, 
        flag: availableNats[0].flag, 
        age: 12, 
        speed: 40, 
        potential: 80, 
        isReal: false, 
        points: 0, 
        currentRaceScore: 0, 
        seat: '' 
    };
}

function inicializarGridsVazios() {
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        let preLoadedList = historicalSeeds[catKey] ? [...historicalSeeds[catKey]] : [];
        
        ecosystem[catKey] = [];

        for (let i = 0; i < config.teams.length; i++) {
            const teamName = config.teams[i];

            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                let rider;

                if (preLoadedList.length > 0) {
                    const preLoaded = preLoadedList.shift();
                    rider = {
                        riderId: generateRiderId(),
                        ...preLoaded,
                        seat: seatNum,
                        points: 0,
                        currentRaceScore: 0
                    };
                    uniqueNamesRegistry.add(rider.name);
                } else {
                    rider = generateFictionalNewbie(config.paisesPermitidos);
                    rider.seat = seatNum;
                    
                    if (catKey === 'moto2') { rider.speed += 36; rider.age = 19; }
                    else if (catKey === 'moto3') { rider.speed += 32; rider.age = 17; }
                    else if (catKey === 'moto3_junior') { rider.speed += 20; rider.age = 15; }
                    else if (catKey === 'rookies_cup') { rider.speed += 16; rider.age = 14; }
                }

                rider.team = teamName;
                ecosystem[catKey].push(rider);
            }
        }
    }
}

// PROFISSIONAL DE SALVAMENTO NO LOCALSTORAGE
function saveLocalStorage() {
    const dataToSave = {
        currentYear, currentRound, activeCategory, ecosystem, lastRaceData,
        uniqueNames: Array.from(uniqueNamesRegistry),
        nextRiderId: nextRiderId
    };
    localStorage.setItem('motogp_sim_save', JSON.stringify(dataToSave));
}

// INICIALIZADOR COMPATÍVEL COM LOCALSTORAGE / SESSÃO
function initializeRealEcosystem() {
    uniqueNamesRegistry.clear();
    nextRiderId = 1000;
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
            
            // Trava de Segurança Combinada (MotoGP + Moto2):
            // O sistema checa se a nova estrutura do grid e os pilotos atualizados foram carregados.
            // Se encontrar dados defasados, forçará um wipe limpo no cache.
            const hasNovaMotoGP = parsed.ecosystem && parsed.ecosystem.motogp && 
                                  parsed.ecosystem.motogp.some(p => p.name.includes("Toprak"));
            const hasNovaMoto2 = parsed.ecosystem && parsed.ecosystem.moto2 && 
                                 parsed.ecosystem.moto2.some(p => p.name.includes("Deniz Öncü") || p.name.includes("Izan Guevara"));

            if (!parsed.ecosystem || !parsed.ecosystem['moto4_asia'] || !hasNovaMotoGP || !hasNovaMoto2) {
                console.warn("Save de versão antiga ou defasada detectado. Reconstruindo matriz de dados...");
                initializeRealEcosystem();
                return;
            }
            
            currentYear = parsed.currentYear;
            currentRound = parsed.currentRound;
            activeCategory = parsed.activeCategory || 'motogp';
            ecosystem = parsed.ecosystem;
            lastRaceData = parsed.lastRaceData || null;
            uniqueNamesRegistry = new Set(parsed.uniqueNames || []);
            nextRiderId = parsed.nextRiderId || 1000;
        } catch(e) {
            initializeRealEcosystem();
        }
    } else {
        initializeRealEcosystem();
    }
});
