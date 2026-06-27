// ==========================================================================
// ROAD TO MOTOGP™ - CORE DATABASE & GLOBAL STATE (SEASON 2026)
// V3.2 - Moto3 2026 Grid Completo (13 equipes / 26 pilotos reais)
// ==========================================================================

let currentYear = 2026;
let currentRound = 0;
const totalRoundsPerSeason = 10;
let activeCategory = 'motogp';
let uniqueNamesRegistry = new Set();
let lastRaceData = null;

// Máquina de Estados Global (The Single Source of Truth)
let ecosystem = {
    motogp: [], moto2: [], moto3: [], moto3_junior: [], rookies_cup: [],
    moto4_latin: [], moto4_asia: [], moto4_british: [], moto4_northern: [], moto4_european: []
};
let teamFinancesState = {};
let lastYearTransfers = [];

// ==========================================================================
// BANCO DE DADOS DE PAÍSES — NOMES POPULACIONAIS COMUNS
// Versão 2.0 — 38 países, ~480 nomes, SEM sobreposição com pilotos reais
// ==========================================================================
const natData = [

    // ── EUROPA OCIDENTAL ──────────────────────────────────────────────────────
    { country: 'Espanha', flag: '🇪🇸',
      names: ['Pablo', 'Javier', 'Eduardo', 'Roberto', 'Luis', 'Antonio', 'Jaime', 'Víctor', 'Óscar', 'Rubén', 'Emilio', 'Hugo', 'Gonzalo', 'Fernando', 'Alfonso', 'Rodrigo', 'Ernesto', 'Ignacio', 'Cristian', 'Julio', 'Ricardo', 'Tomás'],
      surnames: ['Martínez', 'Sánchez', 'Navarro', 'Molina', 'Reyes', 'Herrero', 'Castillo', 'Vega', 'Rubio', 'Moreno', 'Ortega', 'Cruz', 'Delgado', 'Campos', 'Aguilar', 'Peña', 'Ibáñez', 'Serrano', 'Ramos', 'Nieto'] },

    { country: 'Itália', flag: '🇮🇹',
      names: ['Gianluca', 'Simone', 'Matteo', 'Alessandro', 'Michele', 'Riccardo', 'Roberto', 'Leonardo', 'Giacomo', 'Vincenzo', 'Salvatore', 'Emanuele', 'Gianmarco', 'Cristian', 'Daniele', 'Stefano', 'Edoardo', 'Nicola', 'Claudio', 'Massimo'],
      surnames: ['Conti', 'Ferretti', 'Benedetti', 'Messina', 'De Luca', 'Romano', 'Amato', 'Greco', 'Bruno', 'Lombardi', 'Pellegrini', 'Ferrara', 'Gallo', 'Leone', 'Marrone', 'Esposito', 'Ricci', 'Barbieri', 'Cattaneo', 'Fabbri'] },

    { country: 'França', flag: '🇫🇷',
      names: ['Clément', 'Antoine', 'Pierre', 'Théo', 'Lucas', 'Florian', 'Guillaume', 'Alexis', 'Nicolas', 'Julien', 'Baptiste', 'Thomas', 'Romain', 'Simon', 'Hugo', 'Axel', 'Arthur', 'Maxime', 'Mathieu', 'Etienne'],
      surnames: ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Simon', 'Laurent', 'Michel', 'Bertrand', 'Fontaine', 'Leblanc', 'Garnier', 'Moreau', 'Girard', 'Bonnet', 'Rousseau', 'Blanc'] },

    { country: 'Portugal', flag: '🇵🇹',
      names: ['Tiago', 'Rúben', 'Gonçalo', 'André', 'Luís', 'Nuno', 'Filipe', 'João', 'Vasco', 'Rodrigo', 'Bruno', 'Hugo', 'Rafael', 'António', 'Tomás', 'Dinis', 'Martim'],
      surnames: ['Ferreira', 'Silva', 'Costa', 'Rodrigues', 'Pinto', 'Carvalho', 'Sousa', 'Almeida', 'Santos', 'Martins', 'Gomes', 'Marques', 'Figueiredo', 'Correia', 'Matos'] },

    { country: 'Alemanha', flag: '🇩🇪',
      names: ['Jonas', 'Moritz', 'Tobias', 'Fabian', 'Julian', 'Niklas', 'Lars', 'Patrick', 'Dominik', 'Felix', 'Florian', 'Leon', 'Tim', 'Hendrik', 'Jannis', 'Kai', 'Bastian', 'Simon', 'Sven'],
      surnames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Richter', 'Klein', 'Wolf', 'Zimmermann', 'Neumann', 'Krüger', 'Schwarz', 'Braun', 'Lange', 'Werner'] },

    { country: 'Países Baixos', flag: '🇳🇱',
      names: ['Daan', 'Luuk', 'Niek', 'Thijs', 'Jasper', 'Wouter', 'Bram', 'Stef', 'Joris', 'Lars', 'Sander', 'Pieter', 'Koen', 'Floris', 'Timo', 'Stan', 'Ruben'],
      surnames: ['de Jong', 'de Vries', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'Bos', 'Mulder', 'de Graaf', 'Kok', 'Brouwer', 'van Dijk', 'Vermeer', 'Kuipers'] },

    { country: 'Bélgica', flag: '🇧🇪',
      names: ['Thomas', 'Nathan', 'Lennart', 'Nico', 'Livio', 'Brecht', 'Simon', 'Tibo', 'Jarne', 'Niels', 'Robbe', 'Mathis', 'Pieter', 'Axel', 'Wout', 'Remi'],
      surnames: ['Peeters', 'Maes', 'Claes', 'Janssen', 'Martens', 'Leclercq', 'Willems', 'Jacobs', 'Vermeersch', 'Bogaert', 'Goossens', 'Hermans', 'Desmet', 'Declercq', 'Nijs'] },

    { country: 'Suíça', flag: '🇨🇭',
      names: ['Dominique', 'Jonas', 'Robin', 'Kevin', 'Romain', 'Jan', 'Tobias', 'Sven', 'Andrin', 'Severin', 'Fabian', 'Elia', 'Yanick', 'Nils', 'Gilles'],
      surnames: ['Keller', 'Zimmermann', 'Brunner', 'Meier', 'Steiner', 'Gerber', 'Baumann', 'Bucher', 'Frei', 'Huber', 'Moser', 'Wenger', 'Zürcher', 'Jost', 'Eigenmann'] },

    { country: 'Áustria', flag: '🇦🇹',
      names: ['Hannes', 'Michael', 'Lukas', 'Stefan', 'Philipp', 'Julian', 'Patrick', 'Bernhard', 'Christoph', 'Florian', 'Jakob', 'Andreas', 'Markus', 'Dominik', 'Raphael'],
      surnames: ['Gruber', 'Huber', 'Mayer', 'Steiner', 'Schwarz', 'Reiter', 'Berger', 'Haider', 'Pichler', 'Wimmer', 'Egger', 'Fuchs', 'Hofer', 'Mayr', 'Bauer'] },

    { country: 'Chéquia', flag: '🇨🇿',
      names: ['Karel', 'Martin', 'Ondřej', 'Tomáš', 'Lukáš', 'Vojtěch', 'Petr', 'Jan', 'Radek', 'Pavel', 'Michal', 'Zdeněk', 'Jiří', 'Marek', 'Libor', 'Václav'],
      surnames: ['Novák', 'Dvořák', 'Procházka', 'Krejčí', 'Pokorný', 'Blažek', 'Kučera', 'Kratochvíl', 'Veselý', 'Horáček', 'Šimánek', 'Pospíšil', 'Fišer', 'Mareš', 'Kopecký'] },

    { country: 'Finlândia', flag: '🇫🇮',
      names: ['Mika', 'Sami', 'Jesse', 'Heikki', 'Riku', 'Juho', 'Aaro', 'Patrik', 'Valtteri', 'Tuomas', 'Joonas', 'Teemu', 'Ville', 'Aleksi', 'Elias', 'Niko', 'Lauri'],
      surnames: ['Mäkinen', 'Virtanen', 'Heikkinen', 'Koskinen', 'Häkkinen', 'Leinonen', 'Korhonen', 'Mattila', 'Niemi', 'Ojala', 'Laine', 'Hämäläinen', 'Kettunen', 'Peltonen', 'Saarinen'] },

    { country: 'Suécia', flag: '🇸🇪',
      names: ['Anton', 'Oscar', 'Pontus', 'Jesper', 'Erik', 'Henrik', 'Gustav', 'Victor', 'Linus', 'Oliver', 'William', 'Simon', 'Axel', 'Mattias', 'Jonathan', 'Marcus'],
      surnames: ['Bergström', 'Lindqvist', 'Svensson', 'Gustafsson', 'Pettersson', 'Johansson', 'Nilsson', 'Andersson', 'Eriksson', 'Larsson', 'Persson', 'Olsson', 'Lindberg', 'Danielsson', 'Magnusson'] },

    { country: 'Noruega', flag: '🇳🇴',
      names: ['Ole', 'Henrik', 'Sander', 'Tobias', 'Lars', 'Magnus', 'Kristoffer', 'Martin', 'Morten', 'Eirik', 'Anders', 'Håkon', 'Stian', 'Emil', 'Øyvind', 'Eivind'],
      surnames: ['Hansen', 'Berg', 'Larsen', 'Pedersen', 'Andersen', 'Dahl', 'Strand', 'Lie', 'Bakken', 'Fjeld', 'Eriksen', 'Haugen', 'Moen', 'Nygaard', 'Solberg'] },

    { country: 'Polônia', flag: '🇵🇱',
      names: ['Kamil', 'Piotr', 'Mateusz', 'Bartosz', 'Michał', 'Krzysztof', 'Tomasz', 'Arkadiusz', 'Rafał', 'Grzegorz', 'Marek', 'Łukasz', 'Damian', 'Paweł', 'Kacper', 'Adrian'],
      surnames: ['Wiśniewski', 'Kowalski', 'Wójcik', 'Nowak', 'Zieliński', 'Kamiński', 'Grabowski', 'Mazur', 'Krawczyk', 'Piotrowski', 'Jankowski', 'Woźniak', 'Adamczyk', 'Dudek', 'Pawlak'] },

    { country: 'Hungria', flag: '🇭🇺',
      names: ['Bálint', 'Tamás', 'Richárd', 'Dániel', 'Ádám', 'Márk', 'Péter', 'Zoltán', 'Gábor', 'László', 'Attila', 'Krisztián', 'Csaba', 'Bence', 'Norbert', 'Szabolcs'],
      surnames: ['Kovács', 'Nagy', 'Horváth', 'Szabó', 'Tóth', 'Simon', 'Molnár', 'Fekete', 'Varga', 'Balogh', 'Papp', 'Takács', 'Lukács', 'Kiss', 'Farkas'] },

    { country: 'Eslovênia', flag: '🇸🇮',
      names: ['Luka', 'Matej', 'Rok', 'Matic', 'Blaž', 'Tim', 'Žan', 'Jure', 'Aleš', 'Gregor', 'Anže', 'Tilen', 'Miha', 'Gal'],
      surnames: ['Kovač', 'Baškovič', 'Pintarič', 'Fajfar', 'Černe', 'Vidmar', 'Novak', 'Zupan', 'Kos', 'Šuhada', 'Oblak', 'Kranjc', 'Rožič', 'Kopitar', 'Golobič'] },

    { country: 'Croácia', flag: '🇭🇷',
      names: ['Ivan', 'Mate', 'Roko', 'Marko', 'Tomislav', 'Damir', 'Nikola', 'Ante', 'Stjepan', 'Domagoj', 'Karlo', 'Duje', 'Marin', 'Josip', 'Toni'],
      surnames: ['Perić', 'Jurić', 'Blažević', 'Marić', 'Novak', 'Knežević', 'Vuković', 'Šimić', 'Babić', 'Barišić', 'Kovačević', 'Grgić', 'Filipović', 'Mikulić', 'Rukavina'] },

    { country: 'Irlanda', flag: '🇮🇪',
      names: ['Niall', 'Darragh', 'Conor', 'Cian', 'Eoin', 'Seán', 'Ronan', 'Tadhg', 'Oisín', 'Cathal', 'Fionn', 'Ciarán', 'Pádraic', 'Donnacha', 'Rían'],
      surnames: ['Murphy', 'Walsh', 'Byrne', 'Ryan', 'O\'Brien', 'Kelly', 'McCarthy', 'Doyle', 'Connolly', 'O\'Sullivan', 'Fitzgerald', 'Gallagher', 'O\'Connor', 'Brennan', 'Burke'] },

    { country: 'Reino Unido', flag: '🇬🇧',
      names: ['Bradley', 'Danny', 'Tarran', 'Rory', 'Oli', 'James', 'Callum', 'Liam', 'Owen', 'Ben', 'Luke', 'Tom', 'Harry', 'Jamie', 'Dean', 'Charlie', 'Aaron', 'Tyler', 'Kieran'],
      surnames: ['Davies', 'Harris', 'Birchall', 'O\'Halloran', 'Iddon', 'Bridewell', 'Jones', 'Williams', 'Brown', 'Taylor', 'Evans', 'Thomas', 'Walker', 'Wilson', 'Robinson', 'Wright', 'Clarke', 'Hall', 'Allen', 'Green'] },

    // ── AMÉRICAS ──────────────────────────────────────────────────────────────

    { country: 'Brasil', flag: '🇧🇷',
      names: ['Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Henrique', 'Igor', 'Thiago', 'Leonardo', 'Vitor', 'André', 'Caio', 'Guilherme', 'Rodrigo', 'Renan', 'William', 'Davi', 'Eduardo'],
      surnames: ['Oliveira', 'Silva', 'Costa', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Carvalho', 'Rodrigues', 'Alves', 'Barbosa', 'Nascimento', 'Ribeiro', 'Melo', 'Araújo', 'Monteiro', 'Cavalcanti', 'Freitas', 'Correia', 'Nunes'] },

    { country: 'Colômbia', flag: '🇨🇴',
      names: ['Sebastián', 'Alejandro', 'Camilo', 'Nicolás', 'Andrés', 'Felipe', 'Julián', 'Esteban', 'Diego', 'Mauricio', 'Luis', 'Tomás', 'Jhon', 'Wilmar', 'Cristian'],
      surnames: ['Hernández', 'Rodríguez', 'Martínez', 'López', 'García', 'Gómez', 'Vargas', 'Romero', 'Torres', 'Ramírez', 'Ríos', 'Cardona', 'Morales', 'Patiño', 'Castañeda'] },

    { country: 'Argentina', flag: '🇦🇷',
      names: ['Ezequiel', 'Facundo', 'Matías', 'Nicolás', 'Tomás', 'Agustín', 'Luciano', 'Bruno', 'Leandro', 'Rodrigo', 'Emanuel', 'Damián', 'Nahuel', 'Ignacio', 'Santiago'],
      surnames: ['Fernández', 'González', 'Rodríguez', 'Martínez', 'López', 'García', 'Jiménez', 'Romero', 'Suárez', 'Díaz', 'Muñoz', 'Álvarez', 'Ruiz', 'Ramos', 'Castro'] },

    { country: 'Chile', flag: '🇨🇱',
      names: ['Matías', 'Diego', 'Ignacio', 'Felipe', 'Tomás', 'Rodrigo', 'Pablo', 'Francisco', 'Alejandro', 'Camilo', 'Cristóbal', 'Gonzalo', 'Nicolás', 'Sebastián', 'Bastián'],
      surnames: ['Muñoz', 'Rojas', 'Torres', 'Fuentes', 'Vargas', 'Flores', 'Espinoza', 'Núñez', 'Soto', 'Contreras', 'Riquelme', 'Ibáñez', 'Reyes', 'Cifuentes', 'Garrido'] },

    { country: 'México', flag: '🇲🇽',
      names: ['Diego', 'Roberto', 'Emilio', 'Rodrigo', 'Erick', 'Alexis', 'Enrique', 'Fernando', 'Alejandro', 'Gerardo', 'Eduardo', 'Mauricio', 'Andrés', 'Héctor', 'Arturo'],
      surnames: ['Gutiérrez', 'Herrera', 'Morales', 'Jiménez', 'Román', 'Ramírez', 'Cruz', 'Vega', 'Flores', 'Mendoza', 'Reyes', 'Castillo', 'Ríos', 'Peña', 'Salinas'] },

    { country: 'Estados Unidos', flag: '🇺🇸',
      names: ['Cameron', 'Garrett', 'Kyle', 'Blake', 'Tyler', 'Cody', 'Chase', 'Dustin', 'Tommy', 'Austin', 'Brandon', 'Zach', 'Derek', 'Logan', 'Travis', 'Brett', 'Mason', 'Colton'],
      surnames: ['Thompson', 'Richardson', 'Henderson', 'Mitchell', 'Walker', 'Coleman', 'Harrison', 'Patterson', 'Hughes', 'Reed', 'Perry', 'Sanders', 'Powell', 'Rogers', 'Griffin', 'Brooks', 'Warren', 'Hayes', 'Murray'] },

    { country: 'Canadá', flag: '🇨🇦',
      names: ['Jordan', 'Tyler', 'Nathan', 'Liam', 'Ryan', 'Cole', 'Owen', 'Ethan', 'Logan', 'Brandon', 'Connor', 'Hunter', 'Spencer', 'Reid', 'Zac', 'Wyatt'],
      surnames: ['MacDonald', 'Tremblay', 'Gauthier', 'Lefebvre', 'Bouchard', 'Roy', 'Gagnon', 'Morin', 'Côté', 'Poirier', 'Beaulieu', 'Chartrand', 'Pelletier', 'Simard', 'Lacroix'] },

    // ── ÁSIA & OCEANIA ────────────────────────────────────────────────────────

    { country: 'Japão', flag: '🇯🇵',
      names: ['Hiroki', 'Ryo', 'Yuki', 'Kohta', 'Shoya', 'Kenji', 'Naoki', 'Daisuke', 'Wataru', 'Koji', 'Yusuke', 'Kenta', 'Tatsuya', 'Shinya', 'Masato', 'Haruki', 'Daiki'],
      surnames: ['Yamamoto', 'Watanabe', 'Tanaka', 'Ito', 'Kato', 'Kobayashi', 'Shimizu', 'Inoue', 'Hayashi', 'Kimura', 'Matsumoto', 'Fujiwara', 'Ishikawa', 'Okamoto', 'Nakamura', 'Hashimoto', 'Aoki', 'Goto', 'Endo', 'Saito'] },

    { country: 'Tailândia', flag: '🇹🇭',
      names: ['Natchanon', 'Thitipong', 'Kittipan', 'Peerapong', 'Wirojana', 'Kawin', 'Anupab', 'Pongpat', 'Sirisak', 'Natthawee', 'Thanawat', 'Supphachai', 'Panupan', 'Worawit', 'Kritsada'],
      surnames: ['Kaewsan', 'Piyapatama', 'Buasri', 'Rattanakon', 'Saisuwan', 'Jirarat', 'Khumkhong', 'Wannapong', 'Chaiyaphum', 'Boonpiam', 'Srisomporn', 'Phomphian', 'Kerdnoi', 'Suwannatat', 'Thongrak'] },

    { country: 'Indonésia', flag: '🇮🇩',
      names: ['Rheza', 'Galang', 'Andi', 'Dimas', 'Herjun', 'Wahyu', 'Rizky', 'Bagas', 'Arief', 'Reza', 'Ilham', 'Bima', 'Fajar', 'Satria', 'Yudha', 'Raka', 'Aldino'],
      surnames: ['Dhewantara', 'Irawan', 'Putra', 'Santoso', 'Setiawan', 'Nugroho', 'Permana', 'Kurniawan', 'Wijaya', 'Pratama', 'Gunawan', 'Saputra', 'Kusuma', 'Wibowo', 'Prasetyo'] },

    { country: 'Malásia', flag: '🇲🇾',
      names: ['Zaqhwan', 'Adam', 'Shafiq', 'Idham', 'Nabil', 'Haziq', 'Raihan', 'Irfan', 'Azri', 'Amirul', 'Farid', 'Khairul', 'Izzat', 'Harith', 'Arif'],
      surnames: ['Zaidi', 'Razali', 'Azlan', 'Rosli', 'Ramli', 'Zulkifli', 'Osman', 'Hashim', 'Ibrahim', 'Abdullah', 'Ahmad', 'Hassan', 'Ismail', 'Yusof', 'Hamid'] },

    { country: 'Coreia do Sul', flag: '🇰🇷',
      names: ['Minjun', 'Seunghyun', 'Junho', 'Jeonghoon', 'Hyunjun', 'Woojin', 'Sanghoon', 'Taehun', 'Yoonseo', 'Jungwoo', 'Hyunsoo', 'Donghwan', 'Sungmin', 'Junghyun', 'Daehyun'],
      surnames: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Yoon', 'Jang', 'Lim', 'Oh', 'Kwon', 'Shin', 'Han', 'Cho', 'Seo'] },

    { country: 'Índia', flag: '🇮🇳',
      names: ['Anish', 'Kavin', 'Rajiv', 'Sarthak', 'Yash', 'Akhil', 'Nikhil', 'Deepak', 'Arjun', 'Vikram', 'Rahul', 'Aditya', 'Karthik', 'Rohan', 'Pranav', 'Dhruv'],
      surnames: ['Shetty', 'Kumar', 'Patel', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Nair', 'Reddy', 'Joshi', 'Mehta', 'Shah', 'Pillai', 'Rao', 'Iyer'] },

    { country: 'Filipinas', flag: '🇵🇭',
      names: ['Angelo', 'John', 'Mark', 'Francis', 'Josef', 'Dustin', 'Christian', 'Joshua', 'Ian', 'Jerome', 'Bryan', 'Kevin', 'Ryan', 'Justin'],
      surnames: ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Del Rosario', 'Ramos', 'Flores', 'Garcia', 'Torres', 'Castro', 'Gonzalez', 'Soriano', 'Aquino', 'Villanueva', 'Dela Cruz'] },

    { country: 'Qatar', flag: '🇶🇦',
      names: ['Nasser', 'Mohammed', 'Abdulrahman', 'Khalid', 'Fahad', 'Abdullah', 'Ali', 'Omar', 'Khalifa', 'Jasim', 'Rashid', 'Sultan', 'Faisal', 'Jassem', 'Turki'],
      surnames: ['Al-Mansouri', 'Al-Kuwari', 'Al-Attiyah', 'Al-Naimi', 'Al-Thani', 'Al-Marri', 'Al-Sulaiti', 'Al-Mohannadi', 'Al-Baker', 'Al-Emadi', 'Al-Misnad', 'Al-Hajri', 'Al-Kaabi', 'Al-Nuaimi', 'Al-Rashidi'] },

    { country: 'Austrália', flag: '🇦🇺',
      names: ['Billy', 'Josh', 'Broc', 'Travis', 'Harrison', 'Aaron', 'Luke', 'Ben', 'Ryan', 'Tom', 'Dylan', 'Liam', 'Ethan', 'Mitchell', 'Nathan', 'Cameron', 'Jye', 'Dean'],
      surnames: ['Anderson', 'Thompson', 'Roberts', 'Cooper', 'Hall', 'Wilson', 'Clark', 'Lewis', 'Robinson', 'White', 'Martin', 'Jackson', 'Harris', 'Wood', 'King', 'Turner', 'Hughes', 'Hill', 'Clarke', 'Mitchell'] },

    { country: 'Nova Zelândia', flag: '🇳🇿',
      names: ['Slade', 'Rogan', 'Hamish', 'Sam', 'Ben', 'Dylan', 'Callum', 'Ethan', 'Mitchell', 'Hunter', 'Charlie', 'Tyler', 'Brodie', 'Brendon', 'Jamie'],
      surnames: ['Wilson', 'Ferguson', 'Thomson', 'Mackay', 'Fraser', 'Campbell', 'Robertson', 'Murray', 'Scott', 'Stewart', 'Reid', 'Anderson', 'Morrison', 'Henderson', 'Paterson'] },

    // ── ÁFRICA & ORIENTE MÉDIO ────────────────────────────────────────────────

    { country: 'África do Sul', flag: '🇿🇦',
      names: ['Darryn', 'Sheridan', 'Garrett', 'Rogan', 'Dylan', 'Cameron', 'Dean', 'Warren', 'Chad', 'Jody', 'Gareth', 'Kyle', 'Tristan', 'Brendon', 'Ryno'],
      surnames: ['Van Zyl', 'Peterson', 'Hendrikse', 'De Wet', 'Smith', 'Cronje', 'Joubert', 'Du Toit', 'Nel', 'Botha', 'Pretorius', 'Van Der Berg', 'Swanepoel', 'Kruger', 'Steyn'] },

    { country: 'Turquia', flag: '🇹🇷',
      names: ['Emirhan', 'Baran', 'Kaan', 'Alp', 'Onur', 'Burak', 'Arda', 'Umut', 'Serhat', 'Kerem', 'Mert', 'Yiğit', 'Enes', 'Berkay', 'Furkan'],
      surnames: ['Yıldız', 'Demir', 'Kaya', 'Şahin', 'Çelik', 'Arslan', 'Doğan', 'Aydın', 'Erdoğan', 'Güneş', 'Yılmaz', 'Koç', 'Özdemir', 'Şaşmaz', 'Polat'] }
];

// ==========================================================================
// GERADOR DE IDs GLOBAL
// ==========================================================================
let nextRiderId = 1000;

function generateRiderId() {
    return nextRiderId++;
}

// ==========================================================================
// ARQUITETURA RELACIONAL: CONFIGURAÇÃO DE CATEGORIAS E EQUIPES (OBJETOS)
// ==========================================================================
const categoriesConfig = {
    motogp: {
        name: "MotoGP™ Elite World Class",
        minAge: 18, maxAge: 50,
        paisesPermitidos: ["Mundial"],
        teams: [
            { id: 't_mgp_ducati', name: 'Ducati Lenovo Team', manufacturer: 'Ducati', bikePerformance: 98, mechanicCompetence: 95, reputation: 99, aiPersonality: 'resultados_imediatos', academyLink: 'ducati', nationalBias: null, budget: 45, targetPosition: 1, morale: 90 },
            { id: 't_mgp_pramac', name: 'Prima Pramac Yamaha', manufacturer: 'Yamaha', bikePerformance: 88, mechanicCompetence: 90, reputation: 90, aiPersonality: 'resultados_imediatos', academyLink: 'yamaha_blucru', nationalBias: null, budget: 25, targetPosition: 5, morale: 80 },
            { id: 't_mgp_aprilia', name: 'Aprilia Racing', manufacturer: 'Aprilia', bikePerformance: 92, mechanicCompetence: 88, reputation: 92, aiPersonality: 'conservadora', academyLink: 'aprilia', nationalBias: ['🇮🇹'], budget: 30, targetPosition: 3, morale: 85 },
            { id: 't_mgp_ktm', name: 'Red Bull KTM Factory', manufacturer: 'KTM', bikePerformance: 94, mechanicCompetence: 92, reputation: 94, aiPersonality: 'caca_talentos', academyLink: 'ktm', nationalBias: null, budget: 35, targetPosition: 2, morale: 88 },
            { id: 't_mgp_yamaha', name: 'Monster Energy Yamaha', manufacturer: 'Yamaha', bikePerformance: 89, mechanicCompetence: 94, reputation: 96, aiPersonality: 'resultados_imediatos', academyLink: 'yamaha_blucru', nationalBias: null, budget: 40, targetPosition: 4, morale: 80 },
            { id: 't_mgp_hrc', name: 'Honda HRC Castrol', manufacturer: 'Honda', bikePerformance: 84, mechanicCompetence: 89, reputation: 95, aiPersonality: 'conservadora', academyLink: 'honda', nationalBias: null, budget: 40, targetPosition: 7, morale: 75 },
            { id: 't_mgp_gresini', name: 'Gresini Racing MotoGP', manufacturer: 'Ducati', bikePerformance: 96, mechanicCompetence: 85, reputation: 88, aiPersonality: 'caca_talentos', academyLink: 'ducati', nationalBias: ['🇮🇹', '🇪🇸'], budget: 15, targetPosition: 6, morale: 90 },
            { id: 't_mgp_vr46', name: 'Pertamina Enduro VR46', manufacturer: 'Ducati', bikePerformance: 95, mechanicCompetence: 87, reputation: 89, aiPersonality: 'caca_talentos', academyLink: 'vr46', nationalBias: ['🇮🇹'], budget: 18, targetPosition: 6, morale: 85 },
            { id: 't_mgp_lcr', name: 'Castrol Honda LCR', manufacturer: 'Honda', bikePerformance: 83, mechanicCompetence: 85, reputation: 82, aiPersonality: 'conservadora', academyLink: 'honda', nationalBias: null, budget: 12, targetPosition: 9, morale: 80 },
            { id: 't_mgp_tech3', name: 'Red Bull KTM Tech3', manufacturer: 'KTM', bikePerformance: 93, mechanicCompetence: 86, reputation: 86, aiPersonality: 'caca_talentos', academyLink: 'ktm', nationalBias: null, budget: 20, targetPosition: 8, morale: 88 },
            { id: 't_mgp_trackhouse', name: 'Trackhouse MotoGP', manufacturer: 'Aprilia', bikePerformance: 91, mechanicCompetence: 84, reputation: 85, aiPersonality: 'resultados_imediatos', academyLink: 'aprilia', nationalBias: ['🇺🇸'], budget: 18, targetPosition: 8, morale: 82 }
        ]
    },
    moto2: {
        name: "Moto2™ World Championship",
        minAge: 18, maxAge: 50,
        paisesPermitidos: ["Mundial"],
        teams: [
            { id: 't_m2_pramac', name: 'BLU CRU Pramac Yamaha Moto2', manufacturer: 'Yamaha', bikePerformance: 88, mechanicCompetence: 85, reputation: 88, aiPersonality: 'caca_talentos', academyLink: 'yamaha_blucru', nationalBias: null, budget: 5, targetPosition: 5, morale: 80 },
            { id: 't_m2_aspar', name: 'CFMOTO Aspar Team', manufacturer: 'CFMoto', bikePerformance: 92, mechanicCompetence: 90, reputation: 92, aiPersonality: 'caca_talentos', academyLink: 'aspar', nationalBias: ['🇪🇸'], budget: 7, targetPosition: 2, morale: 90 },
            { id: 't_m2_marcvds', name: 'ELF Marc VDS Racing', manufacturer: 'Kalex', bikePerformance: 90, mechanicCompetence: 92, reputation: 94, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: null, budget: 8, targetPosition: 3, morale: 85 },
            { id: 't_m2_honda', name: 'Idemitsu Honda Team Asia', manufacturer: 'Kalex', bikePerformance: 85, mechanicCompetence: 84, reputation: 85, aiPersonality: 'conservadora', academyLink: 'honda_asia', nationalBias: ['🇯🇵', '🇮🇩', '🇹🇭'], budget: 6, targetPosition: 7, morale: 80 },
            { id: 't_m2_gresini', name: 'Italjet Gresini Moto2', manufacturer: 'Kalex', bikePerformance: 89, mechanicCompetence: 86, reputation: 87, aiPersonality: 'resultados_imediatos', academyLink: 'ducati', nationalBias: ['🇮🇹'], budget: 5, targetPosition: 4, morale: 85 },
            { id: 't_m2_italtrans', name: 'Italtrans Racing Team', manufacturer: 'Kalex', bikePerformance: 86, mechanicCompetence: 87, reputation: 86, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇮🇹'], budget: 4, targetPosition: 8, morale: 80 },
            { id: 't_m2_intact', name: 'Liqui Moly Intact GP', manufacturer: 'Kalex', bikePerformance: 88, mechanicCompetence: 89, reputation: 89, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇩🇪'], budget: 6, targetPosition: 6, morale: 85 },
            { id: 't_m2_rw', name: 'RW Racing GP', manufacturer: 'Kalex', bikePerformance: 84, mechanicCompetence: 83, reputation: 80, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇳🇱'], budget: 3, targetPosition: 10, morale: 80 },
            { id: 't_m2_american', name: 'American Racing Team', manufacturer: 'Kalex', bikePerformance: 87, mechanicCompetence: 85, reputation: 84, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇺🇸'], budget: 5, targetPosition: 8, morale: 82 },
            { id: 't_m2_msi', name: 'QJMotor-Frinsa-MSI', manufacturer: 'Boscoscuro', bikePerformance: 94, mechanicCompetence: 88, reputation: 90, aiPersonality: 'caca_talentos', academyLink: 'msi', nationalBias: ['🇪🇸'], budget: 8, targetPosition: 1, morale: 95 },
            { id: 't_m2_ajo', name: 'Red Bull KTM Ajo', manufacturer: 'Kalex', bikePerformance: 93, mechanicCompetence: 94, reputation: 95, aiPersonality: 'caca_talentos', academyLink: 'ktm', nationalBias: null, budget: 10, targetPosition: 1, morale: 92 },
            { id: 't_m2_fantic', name: 'Fantic Racing Lino Sonego', manufacturer: 'Kalex', bikePerformance: 87, mechanicCompetence: 85, reputation: 83, aiPersonality: 'resultados_imediatos', academyLink: 'vr46', nationalBias: ['🇮🇹'], budget: 4, targetPosition: 7, morale: 80 },
            { id: 't_m2_speedrs', name: 'SpeedRS Team', manufacturer: 'Kalex', bikePerformance: 85, mechanicCompetence: 84, reputation: 81, aiPersonality: 'conservadora', academyLink: null, nationalBias: null, budget: 3, targetPosition: 9, morale: 75 }
        ]
    },
    // ── MOTO3 2026 — 13 EQUIPES REAIS ────────────────────────────────────────
    moto3: {
        name: "Moto3™ World Championship",
        minAge: 18, maxAge: 28,
        paisesPermitidos: ["Mundial"],
        teams: [
            { id: 't_m3_sic58',   name: 'SIC58 Squadra Corse',              manufacturer: 'Honda',  bikePerformance: 87, mechanicCompetence: 86, reputation: 86, aiPersonality: 'conservadora',        academyLink: null,         nationalBias: ['🇮🇹'],               budget: 3, targetPosition: 6,  morale: 80 },
            { id: 't_m3_msi',     name: 'AEON Credit - MT Helmets - MSI',   manufacturer: 'Honda',  bikePerformance: 84, mechanicCompetence: 82, reputation: 81, aiPersonality: 'conservadora',        academyLink: 'msi',        nationalBias: ['🇯🇵', '🇲🇾'],        budget: 2, targetPosition: 8,  morale: 78 },
            { id: 't_m3_gryd',    name: 'GRYD Racing',                       manufacturer: 'Honda',  bikePerformance: 82, mechanicCompetence: 80, reputation: 76, aiPersonality: 'caca_talentos',       academyLink: null,         nationalBias: ['🇬🇧', '🇦🇺'],        budget: 1, targetPosition: 9,  morale: 75 },
            { id: 't_m3_honda',   name: 'Honda Team Asia',                   manufacturer: 'Honda',  bikePerformance: 86, mechanicCompetence: 85, reputation: 87, aiPersonality: 'conservadora',        academyLink: 'honda_asia', nationalBias: ['🇯🇵', '🇮🇩', '🇹🇭'], budget: 3, targetPosition: 5,  morale: 82 },
            { id: 't_m3_snipers', name: 'Rivacold Snipers Team',             manufacturer: 'Honda',  bikePerformance: 83, mechanicCompetence: 81, reputation: 78, aiPersonality: 'conservadora',        academyLink: null,         nationalBias: ['🇮🇹'],               budget: 2, targetPosition: 8,  morale: 78 },
            { id: 't_m3_cip',     name: 'CIP Green Power',                   manufacturer: 'KTM',    bikePerformance: 82, mechanicCompetence: 80, reputation: 78, aiPersonality: 'conservadora',        academyLink: null,         nationalBias: ['🇫🇷', '🇪🇸'],        budget: 1, targetPosition: 9,  morale: 75 },
            { id: 't_m3_code',    name: 'CODE Motorsports',                  manufacturer: 'Honda',  bikePerformance: 81, mechanicCompetence: 78, reputation: 72, aiPersonality: 'caca_talentos',       academyLink: null,         nationalBias: ['🇦🇺', '🇳🇿', '🇿🇦'], budget: 1, targetPosition: 10, morale: 75 },
            { id: 't_m3_mta',     name: 'LEVELUP - MTA',                     manufacturer: 'Honda',  bikePerformance: 85, mechanicCompetence: 83, reputation: 80, aiPersonality: 'caca_talentos',       academyLink: null,         nationalBias: ['🇮🇹', '🇪🇸'],        budget: 2, targetPosition: 7,  morale: 80 },
            { id: 't_m3_intact',  name: 'Liqui Moly Dynavolt Intact GP',     manufacturer: 'Honda',  bikePerformance: 87, mechanicCompetence: 87, reputation: 88, aiPersonality: 'caca_talentos',       academyLink: null,         nationalBias: ['🇩🇪', '🇪🇸'],        budget: 4, targetPosition: 5,  morale: 85 },
            { id: 't_m3_tech3',   name: 'Red Bull KTM Tech3',                manufacturer: 'KTM',    bikePerformance: 88, mechanicCompetence: 86, reputation: 87, aiPersonality: 'caca_talentos',       academyLink: 'ktm',        nationalBias: null,                    budget: 3, targetPosition: 4,  morale: 82 },
            { id: 't_m3_aspar',   name: 'CFMOTO Gaviota Aspar Team',         manufacturer: 'CFMoto', bikePerformance: 91, mechanicCompetence: 88, reputation: 91, aiPersonality: 'caca_talentos',       academyLink: 'aspar',      nationalBias: ['🇪🇸'],               budget: 4, targetPosition: 2,  morale: 90 },
            { id: 't_m3_leopard', name: 'Leopard Racing',                    manufacturer: 'Honda',  bikePerformance: 90, mechanicCompetence: 90, reputation: 92, aiPersonality: 'resultados_imediatos', academyLink: null,         nationalBias: null,                    budget: 4, targetPosition: 2,  morale: 88 },
            { id: 't_m3_ajo',     name: 'Red Bull KTM Ajo',                  manufacturer: 'KTM',    bikePerformance: 93, mechanicCompetence: 92, reputation: 94, aiPersonality: 'caca_talentos',       academyLink: 'ktm',        nationalBias: null,                    budget: 5, targetPosition: 1,  morale: 92 }
        ]
    },
    moto3_junior: {
        name: "FIM JuniorGP™ Moto3",
        minAge: 16, maxAge: 25,
        paisesPermitidos: ["Mundial"],
        teams: [
            { id: 't_jgp_aspar', name: 'Aspar Junior Team', manufacturer: 'KTM', bikePerformance: 85, mechanicCompetence: 80, reputation: 85, aiPersonality: 'caca_talentos', academyLink: 'aspar', nationalBias: ['🇪🇸'], budget: 2, targetPosition: 1, morale: 85 },
            { id: 't_jgp_eg00', name: 'Team Estrella Galicia 00', manufacturer: 'Honda', bikePerformance: 84, mechanicCompetence: 82, reputation: 84, aiPersonality: 'caca_talentos', academyLink: 'monlau', nationalBias: ['🇪🇸'], budget: 2, targetPosition: 2, morale: 85 },
            { id: 't_jgp_monlau', name: 'Monlau Motul School', manufacturer: 'KTM', bikePerformance: 82, mechanicCompetence: 80, reputation: 80, aiPersonality: 'caca_talentos', academyLink: 'monlau', nationalBias: ['🇪🇸'], budget: 1.5, targetPosition: 3, morale: 80 },
            { id: 't_jgp_laglisse', name: 'Laglisse Academy', manufacturer: 'Husqvarna', bikePerformance: 80, mechanicCompetence: 78, reputation: 79, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇪🇸'], budget: 1, targetPosition: 5, morale: 80 },
            { id: 't_jgp_ac', name: 'AC Racing Team', manufacturer: 'KTM', bikePerformance: 78, mechanicCompetence: 75, reputation: 75, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇮🇹'], budget: 0.8, targetPosition: 6, morale: 75 },
            { id: 't_jgp_finetwork', name: 'Finetwork Team', manufacturer: 'KTM', bikePerformance: 79, mechanicCompetence: 77, reputation: 76, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇪🇸'], budget: 1, targetPosition: 5, morale: 80 },
            { id: 't_jgp_artbox', name: 'Artbox Junior', manufacturer: 'Honda', bikePerformance: 77, mechanicCompetence: 74, reputation: 72, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇪🇸', '🇬🇧'], budget: 0.5, targetPosition: 8, morale: 75 },
            { id: 't_jgp_mta', name: 'MTA Junior Team', manufacturer: 'KTM', bikePerformance: 81, mechanicCompetence: 79, reputation: 81, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇮🇹'], budget: 1.2, targetPosition: 4, morale: 80 },
            { id: 't_jgp_agr', name: 'AGR Team', manufacturer: 'KTM', bikePerformance: 80, mechanicCompetence: 78, reputation: 78, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇪🇸'], budget: 1, targetPosition: 6, morale: 75 },
            { id: 't_jgp_carrera', name: 'Carrera Junior', manufacturer: 'Honda', bikePerformance: 76, mechanicCompetence: 73, reputation: 70, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇪🇸'], budget: 0.5, targetPosition: 9, morale: 70 },
            { id: 't_jgp_rins', name: 'Rins Motorsport Team', manufacturer: 'Yamaha', bikePerformance: 79, mechanicCompetence: 76, reputation: 77, aiPersonality: 'caca_talentos', academyLink: 'rins', nationalBias: ['🇪🇸'], budget: 0.8, targetPosition: 5, morale: 80 }
        ]
    },
    rookies_cup: {
        name: "Red Bull MotoGP™ Rookies Cup",
        minAge: 15, maxAge: 19,
        paisesPermitidos: ["Mundial"],
        teams: Array.from({length: 11}, (_, i) => ({
            id: `t_rkc_${i+1}`, name: `Rookies Team ${String.fromCharCode(65+i)}`, manufacturer: 'KTM',
            bikePerformance: 70, mechanicCompetence: 70, reputation: 70,
            aiPersonality: 'draft_centralizado', academyLink: 'ktm', nationalBias: null,
            budget: 0, targetPosition: 5, morale: 80
        }))
    },
    moto4_latin: {
        name: "Moto4™ Latin Cup",
        minAge: 14, maxAge: 21,
        paisesPermitidos: ["🇧🇷", "🇨🇴", "🇦🇷", "🇨🇱"],
        teams: [
            { id: 't_m4l_yamaha', name: 'Yamaha IMS', manufacturer: 'Yamaha', bikePerformance: 65, mechanicCompetence: 65, reputation: 65, aiPersonality: 'resultados_imediatos', academyLink: 'yamaha_blucru', nationalBias: ['🇧🇷'], budget: 0.8, targetPosition: 2, morale: 80 },
            { id: 't_m4l_barros', name: 'Alex Barros Honda', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 67, reputation: 70, aiPersonality: 'caca_talentos', academyLink: 'barros', nationalBias: ['🇧🇷'], budget: 1, targetPosition: 1, morale: 85 },
            { id: 't_m4l_colombia', name: 'Colombia Moto', manufacturer: 'CFMoto', bikePerformance: 62, mechanicCompetence: 60, reputation: 55, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇨🇴'], budget: 0.3, targetPosition: 6, morale: 75 },
            { id: 't_m4l_argentina', name: 'Argentina GP', manufacturer: 'KTM', bikePerformance: 64, mechanicCompetence: 62, reputation: 58, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇦🇷'], budget: 0.4, targetPosition: 4, morale: 75 },
            { id: 't_m4l_chile', name: 'Chile Speed', manufacturer: 'Yamaha', bikePerformance: 61, mechanicCompetence: 59, reputation: 52, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇨🇱'], budget: 0.2, targetPosition: 8, morale: 70 },
            { id: 't_m4l_conex', name: 'Latin Conex', manufacturer: 'Honda', bikePerformance: 63, mechanicCompetence: 61, reputation: 56, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: null, budget: 0.4, targetPosition: 5, morale: 75 },
            { id: 't_m4l_ls2', name: 'LS2 Squad', manufacturer: 'Kawasaki', bikePerformance: 60, mechanicCompetence: 58, reputation: 50, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇦🇷'], budget: 0.2, targetPosition: 9, morale: 70 },
            { id: 't_m4l_mobil', name: 'Mobil1 LATAM', manufacturer: 'Honda', bikePerformance: 66, mechanicCompetence: 64, reputation: 62, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: null, budget: 0.6, targetPosition: 3, morale: 80 },
            { id: 't_m4l_pirelli', name: 'Pirelli America', manufacturer: 'Yamaha', bikePerformance: 67, mechanicCompetence: 66, reputation: 66, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇧🇷'], budget: 0.7, targetPosition: 2, morale: 80 },
            { id: 't_m4l_gomez', name: 'Gomez Racing', manufacturer: 'CFMoto', bikePerformance: 59, mechanicCompetence: 55, reputation: 45, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇨🇴'], budget: 0.1, targetPosition: 10, morale: 65 },
            { id: 't_m4l_andes', name: 'Andes Talents', manufacturer: 'KTM', bikePerformance: 62, mechanicCompetence: 60, reputation: 54, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇨🇱'], budget: 0.3, targetPosition: 7, morale: 75 }
        ]
    },
    moto4_asia: {
        name: "Idemitsu Moto4 Asia Cup",
        minAge: 14, maxAge: 21,
        paisesPermitidos: ["🇯🇵", "🇮🇩", "🇲🇾", "🇹🇭", "🇦🇺", "🇵🇭", "🇶🇦", "🇮🇳", "🇳🇿"],
        teams: [
            { id: 't_m4a_astra', name: 'Astra Honda Racing', manufacturer: 'Honda', bikePerformance: 72, mechanicCompetence: 70, reputation: 75, aiPersonality: 'caca_talentos', academyLink: 'astra', nationalBias: ['🇮🇩'], budget: 1.5, targetPosition: 2, morale: 85 },
            { id: 't_m4a_thai', name: 'Honda Racing Thailand', manufacturer: 'Honda', bikePerformance: 70, mechanicCompetence: 68, reputation: 72, aiPersonality: 'resultados_imediatos', academyLink: 'honda_asia', nationalBias: ['🇹🇭'], budget: 1.2, targetPosition: 3, morale: 85 },
            { id: 't_m4a_idemitsu', name: 'Idemitsu Racing Japan', manufacturer: 'Honda', bikePerformance: 75, mechanicCompetence: 72, reputation: 78, aiPersonality: 'caca_talentos', academyLink: 'honda_asia', nationalBias: ['🇯🇵'], budget: 2, targetPosition: 1, morale: 90 },
            { id: 't_m4a_sic', name: 'SIC Racing Team', manufacturer: 'Yamaha', bikePerformance: 68, mechanicCompetence: 65, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'sic', nationalBias: ['🇲🇾'], budget: 1, targetPosition: 4, morale: 80 },
            { id: 't_m4a_brp', name: 'BRP Racing Australia', manufacturer: 'KTM', bikePerformance: 65, mechanicCompetence: 64, reputation: 65, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇦🇺'], budget: 0.6, targetPosition: 6, morale: 75 },
            { id: 't_m4a_asean', name: 'Yamaha Racing ASEAN', manufacturer: 'Yamaha', bikePerformance: 69, mechanicCompetence: 67, reputation: 70, aiPersonality: 'resultados_imediatos', academyLink: 'yamaha_blucru', nationalBias: ['🇲🇾', '🇮🇩', '🇹🇭', '🇵🇭'], budget: 1.1, targetPosition: 3, morale: 80 },
            { id: 't_m4a_oceania', name: 'FIM Oceania Junior', manufacturer: 'KTM', bikePerformance: 64, mechanicCompetence: 62, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇦🇺', '🇳🇿'], budget: 0.5, targetPosition: 7, morale: 75 },
            { id: 't_m4a_htaj', name: 'Honda Team Asia Junior', manufacturer: 'Honda', bikePerformance: 71, mechanicCompetence: 69, reputation: 73, aiPersonality: 'caca_talentos', academyLink: 'honda_asia', nationalBias: ['🇯🇵', '🇮🇩', '🇹🇭', '🇲🇾', '🇮🇳'], budget: 1.3, targetPosition: 2, morale: 85 },
            { id: 't_m4a_musashi', name: 'Musashi RT Suzuki', manufacturer: 'Suzuki', bikePerformance: 66, mechanicCompetence: 65, reputation: 64, aiPersonality: 'conservadora', academyLink: null, nationalBias: ['🇯🇵'], budget: 0.7, targetPosition: 5, morale: 75 }
        ]
    },
    moto4_british: {
        name: "Moto4™ British Cup",
        minAge: 14, maxAge: 21,
        paisesPermitidos: ["🇬🇧", "🇮🇪"],
        teams: [
            { id: 't_m4b_1', name: 'VisionTrack UK', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: 'visiontrack', nationalBias: ['🇬🇧'], budget: 0.8, targetPosition: 2, morale: 80 },
            { id: 't_m4b_2', name: 'Laverty Academy', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: 'laverty', nationalBias: ['🇮🇪'], budget: 0.8, targetPosition: 2, morale: 80 },
            { id: 't_m4b_3', name: 'R&G Youth', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.5, targetPosition: 5, morale: 75 },
            { id: 't_m4b_4', name: 'Irish Road Race', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇮🇪'], budget: 0.5, targetPosition: 5, morale: 75 },
            { id: 't_m4b_5', name: 'BSB Junior', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.6, targetPosition: 4, morale: 75 },
            { id: 't_m4b_6', name: 'Scotland Gun', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.4, targetPosition: 7, morale: 75 },
            { id: 't_m4b_7', name: 'Welsh Dragon', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.4, targetPosition: 7, morale: 75 },
            { id: 't_m4b_8', name: 'Oxford Products', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.7, targetPosition: 3, morale: 80 },
            { id: 't_m4b_9', name: 'Silverstone School', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.6, targetPosition: 4, morale: 75 },
            { id: 't_m4b_10', name: 'Donington Talents', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇬🇧'], budget: 0.4, targetPosition: 8, morale: 75 },
            { id: 't_m4b_11', name: 'Irish Racers', manufacturer: 'Honda', bikePerformance: 65, mechanicCompetence: 65, reputation: 60, aiPersonality: 'resultados_imediatos', academyLink: null, nationalBias: ['🇮🇪'], budget: 0.3, targetPosition: 9, morale: 70 }
        ]
    },
    moto4_northern: {
        name: "Moto4™ Northern Cup",
        minAge: 14, maxAge: 21,
        paisesPermitidos: ["🇩🇪", "🇳🇱", "🇨🇿", "🇦🇹", "🇨🇦"],
        teams: [
            { id: 't_m4n_1', name: 'ADAC Sachsen', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: 'adac', nationalBias: ['🇩🇪'], budget: 0.8, targetPosition: 2, morale: 80 },
            { id: 't_m4n_2', name: 'Zelos Black', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: null, budget: 0.5, targetPosition: 5, morale: 75 },
            { id: 't_m4n_3', name: 'Dutch Academy', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇳🇱'], budget: 0.6, targetPosition: 4, morale: 75 },
            { id: 't_m4n_4', name: 'Brno Circuit', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇨🇿'], budget: 0.5, targetPosition: 6, morale: 75 },
            { id: 't_m4n_5', name: 'KTM Austria', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: 'ktm', nationalBias: ['🇦🇹'], budget: 1, targetPosition: 1, morale: 85 },
            { id: 't_m4n_6', name: 'Canada Motor', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇨🇦'], budget: 0.4, targetPosition: 7, morale: 70 },
            { id: 't_m4n_7', name: 'Intact Northern', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇩🇪'], budget: 0.7, targetPosition: 3, morale: 80 },
            { id: 't_m4n_8', name: 'Freudenberg', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇩🇪'], budget: 0.6, targetPosition: 4, morale: 75 },
            { id: 't_m4n_9', name: 'Molenaar', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇳🇱'], budget: 0.5, targetPosition: 5, morale: 75 },
            { id: 't_m4n_10', name: 'Kiefer Base', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇩🇪'], budget: 0.5, targetPosition: 6, morale: 75 },
            { id: 't_m4n_11', name: 'Nordic Alliance', manufacturer: 'KTM', bikePerformance: 66, mechanicCompetence: 66, reputation: 62, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: null, budget: 0.4, targetPosition: 8, morale: 70 }
        ]
    },
    moto4_european: {
        name: "Moto4™ European Cup",
        minAge: 14, maxAge: 21,
        paisesPermitidos: ["🇪🇸", "🇮🇹", "🇫🇷", "🇵🇹"],
        teams: [
            { id: 't_m4e_1', name: 'Cuna de Campeones', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'cuna', nationalBias: ['🇪🇸'], budget: 0.8, targetPosition: 2, morale: 80 },
            { id: 't_m4e_2', name: 'Monlau Competición', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'monlau', nationalBias: ['🇪🇸'], budget: 1, targetPosition: 1, morale: 85 },
            { id: 't_m4e_3', name: 'Talento Azzurro', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'fmi', nationalBias: ['🇮🇹'], budget: 0.9, targetPosition: 2, morale: 80 },
            { id: 't_m4e_4', name: 'FFM Junior', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'ffm', nationalBias: ['🇫🇷'], budget: 0.7, targetPosition: 4, morale: 75 },
            { id: 't_m4e_5', name: 'Oliveira Fan Club', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'oliveira', nationalBias: ['🇵🇹'], budget: 0.6, targetPosition: 5, morale: 75 },
            { id: 't_m4e_6', name: 'VR46 Base', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'vr46', nationalBias: ['🇮🇹'], budget: 0.9, targetPosition: 3, morale: 80 },
            { id: 't_m4e_7', name: 'Leopard Junior', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇮🇹'], budget: 0.8, targetPosition: 3, morale: 80 },
            { id: 't_m4e_8', name: 'EG 00 Junior', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'monlau', nationalBias: ['🇪🇸'], budget: 0.8, targetPosition: 4, morale: 80 },
            { id: 't_m4e_9', name: 'IgaxTeam', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: null, nationalBias: ['🇪🇸'], budget: 0.5, targetPosition: 7, morale: 75 },
            { id: 't_m4e_10', name: 'Cardoso ETC', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'cardoso', nationalBias: ['🇪🇸'], budget: 0.6, targetPosition: 6, morale: 75 },
            { id: 't_m4e_11', name: 'Fau55 Team', manufacturer: 'Honda', bikePerformance: 68, mechanicCompetence: 68, reputation: 68, aiPersonality: 'caca_talentos', academyLink: 'fau55', nationalBias: ['🇪🇸'], budget: 0.5, targetPosition: 8, morale: 75 }
        ]
    }
};

// ==========================================================================
// EXTRAÇÃO E SEEDING DOS PILOTOS REAIS (TEMPORADAS RECENTES)
// ==========================================================================
const historicalSeeds = {
    motogp: [
        { name: "Francesco Bagnaia", flag: "🇮🇹", age: 29, speed: 96, potential: 96, consistency: 94, isReal: true },
        { name: "Jorge Martín", flag: "🇪🇸", age: 28, speed: 95, potential: 96, consistency: 89, isReal: true },
        { name: "Marc Márquez", flag: "🇪🇸", age: 33, speed: 95, potential: 95, consistency: 85, isReal: true },
        { name: "Pedro Acosta", flag: "🇪🇸", age: 22, speed: 91, potential: 98, consistency: 82, isReal: true },
        { name: "Enea Bastianini", flag: "🇮🇹", age: 29, speed: 91, potential: 92, consistency: 86, isReal: true },
        { name: "Fabio Quartararo", flag: "🇫🇷", age: 27, speed: 92, potential: 94, consistency: 88, isReal: true },
        { name: "Brad Binder", flag: "🇿🇦", age: 31, speed: 90, potential: 90, consistency: 90, isReal: true },
        { name: "Marco Bezzecchi", flag: "🇮🇹", age: 28, speed: 90, potential: 92, consistency: 83, isReal: true },
        { name: "Maverick Viñales", flag: "🇪🇸", age: 31, speed: 89, potential: 89, consistency: 80, isReal: true },
        { name: "Toprak Razgatlıoğlu", flag: "🇹🇷", age: 30, speed: 89, potential: 91, consistency: 88, isReal: true },
        { name: "Álex Márquez", flag: "🇪🇸", age: 30, speed: 88, potential: 88, consistency: 84, isReal: true },
        { name: "Fermín Aldeguer", flag: "🇪🇸", age: 21, speed: 86, potential: 94, consistency: 78, isReal: true },
        { name: "Fabio Di Giannantonio", flag: "🇮🇹", age: 28, speed: 88, potential: 89, consistency: 85, isReal: true },
        { name: "Franco Morbidelli", flag: "🇮🇹", age: 32, speed: 87, potential: 87, consistency: 82, isReal: true },
        { name: "Luca Marini", flag: "🇮🇹", age: 29, speed: 87, potential: 88, consistency: 91, isReal: true },
        { name: "Álex Rins", flag: "🇪🇸", age: 31, speed: 88, potential: 88, consistency: 81, isReal: true },
        { name: "Raúl Fernández", flag: "🇪🇸", age: 26, speed: 86, potential: 89, consistency: 80, isReal: true },
        { name: "Joan Mir", flag: "🇪🇸", age: 29, speed: 86, potential: 87, consistency: 83, isReal: true },
        { name: "Jack Miller", flag: "🇦🇺", age: 31, speed: 86, potential: 86, consistency: 78, isReal: true },
        { name: "Johann Zarco", flag: "🇫🇷", age: 36, speed: 85, potential: 85, consistency: 86, isReal: true },
        { name: "Ai Ogura", flag: "🇯🇵", age: 25, speed: 85, potential: 90, consistency: 88, isReal: true },
        { name: "Diogo Moreira", flag: "🇧🇷", age: 22, speed: 84, potential: 91, consistency: 82, isReal: true }
    ],
    moto2: [
        { name: "Izan Guevara", flag: "🇪🇸", age: 22, speed: 81, potential: 86, consistency: 80, isReal: true },
        { name: "Alberto Ferrández", flag: "🇪🇸", age: 20, speed: 76, potential: 88, consistency: 75, isReal: true },
        { name: "David Alonso", flag: "🇨🇴", age: 20, speed: 84, potential: 94, consistency: 85, isReal: true },
        { name: "Daniel Holgado", flag: "🇪🇸", age: 21, speed: 82, potential: 88, consistency: 82, isReal: true },
        { name: "Arón Canet", flag: "🇪🇸", age: 26, speed: 85, potential: 86, consistency: 80, isReal: true },
        { name: "Deniz Öncü", flag: "🇹🇷", age: 22, speed: 85, potential: 85, consistency: 78, isReal: true },
        { name: "Mario Aji", flag: "🇮🇩", age: 22, speed: 79, potential: 82, consistency: 81, isReal: true },
        { name: "Taiyo Furusato", flag: "🇯🇵", age: 20, speed: 80, potential: 85, consistency: 76, isReal: true },
        { name: "Sergio García", flag: "🇪🇸", age: 23, speed: 84, potential: 89, consistency: 86, isReal: true },
        { name: "Alonso López", flag: "🇪🇸", age: 24, speed: 85, potential: 88, consistency: 81, isReal: true },
        { name: "Daniel Muñoz", flag: "🇪🇸", age: 19, speed: 79, potential: 84, consistency: 77, isReal: true },
        { name: "Adrián Huertas", flag: "🇪🇸", age: 22, speed: 79, potential: 86, consistency: 80, isReal: true },
        { name: "Manuel González", flag: "🇪🇸", age: 24, speed: 87, potential: 90, consistency: 88, isReal: true },
        { name: "Senna Agius", flag: "🇦🇺", age: 21, speed: 86, potential: 89, consistency: 82, isReal: true },
        { name: "Ayumu Sasaki", flag: "🇯🇵", age: 25, speed: 81, potential: 84, consistency: 85, isReal: true },
        { name: "Zonta van den Goorbergh", flag: "🇳🇱", age: 20, speed: 80, potential: 84, consistency: 79, isReal: true },
        { name: "Filip Salač", flag: "🇨🇿", age: 24, speed: 84, potential: 84, consistency: 83, isReal: true },
        { name: "Joe Roberts", flag: "🇺🇸", age: 29, speed: 83, potential: 84, consistency: 82, isReal: true },
        { name: "Iván Ortolá", flag: "🇪🇸", age: 21, speed: 82, potential: 88, consistency: 81, isReal: true },
        { name: "Ángel Piqueras", flag: "🇪🇸", age: 19, speed: 80, potential: 90, consistency: 78, isReal: true },
        { name: "Collin Veijer", flag: "🇳🇱", age: 21, speed: 84, potential: 92, consistency: 87, isReal: true },
        { name: "José Antonio Rueda", flag: "🇪🇸", age: 20, speed: 83, potential: 89, consistency: 84, isReal: true },
        { name: "Barry Baltus", flag: "🇧🇪", age: 21, speed: 84, potential: 84, consistency: 80, isReal: true },
        { name: "Tony Arbolino", flag: "🇮🇹", age: 25, speed: 84, potential: 86, consistency: 83, isReal: true },
        { name: "Celestino Vietti", flag: "🇮🇹", age: 24, speed: 85, potential: 88, consistency: 84, isReal: true },
        { name: "Luca Lunetta", flag: "🇮🇹", age: 20, speed: 76, potential: 86, consistency: 75, isReal: true }
    ],
    // ── MOTO3 2026 — 26 PILOTOS REAIS EM ORDEM DE EQUIPE ─────────────────────
    // Ordem espelha categoriesConfig.moto3.teams (2 pilotos por time)
    moto3: [
        // SIC58 Squadra Corse
        { name: 'Leo Rammerstorfer',  flag: '🇦🇹', age: 22, speed: 74, potential: 81, consistency: 74, isReal: true },
        { name: "Casey O'Gorman",     flag: '🇮🇪', age: 21, speed: 73, potential: 80, consistency: 74, isReal: true },
        // AEON Credit - MT Helmets - MSI
        { name: 'Ryusei Yamanaka',    flag: '🇯🇵', age: 26, speed: 75, potential: 77, consistency: 80, isReal: true },
        { name: 'Hakim Danish',       flag: '🇲🇾', age: 24, speed: 74, potential: 76, consistency: 76, isReal: true },
        // GRYD Racing
        { name: "Eddie O'Shea",       flag: '🇬🇧', age: 19, speed: 71, potential: 84, consistency: 72, isReal: true },
        { name: 'Joel Kelso',         flag: '🇦🇺', age: 23, speed: 74, potential: 80, consistency: 74, isReal: true },
        // Honda Team Asia
        { name: 'Veda Pratama',       flag: '🇮🇩', age: 19, speed: 70, potential: 85, consistency: 72, isReal: true },
        { name: 'Zen Mitani',         flag: '🇯🇵', age: 19, speed: 71, potential: 87, consistency: 73, isReal: true },
        // Rivacold Snipers Team
        { name: 'Nicola Carraro',     flag: '🇮🇹', age: 19, speed: 69, potential: 82, consistency: 70, isReal: true },
        { name: 'Jesús Ríos',         flag: '🇪🇸', age: 20, speed: 68, potential: 80, consistency: 70, isReal: true },
        // CIP Green Power
        { name: 'Adrián Cruces',      flag: '🇪🇸', age: 20, speed: 72, potential: 82, consistency: 73, isReal: true },
        { name: 'Scott Ogden',        flag: '🇬🇧', age: 24, speed: 72, potential: 78, consistency: 75, isReal: true },
        // CODE Motorsports
        { name: 'Cormac Buchanan',    flag: '🇳🇿', age: 22, speed: 73, potential: 82, consistency: 75, isReal: true },
        { name: 'Ruche Moodley',      flag: '🇿🇦', age: 21, speed: 67, potential: 79, consistency: 68, isReal: true },
        // LEVELUP - MTA
        { name: 'Matteo Bertelle',    flag: '🇮🇹', age: 20, speed: 70, potential: 82, consistency: 72, isReal: true },
        { name: 'Joel Esteban',       flag: '🇪🇸', age: 23, speed: 79, potential: 83, consistency: 78, isReal: true },
        // Liqui Moly Dynavolt Intact GP
        { name: 'David Almansa',      flag: '🇪🇸', age: 21, speed: 73, potential: 83, consistency: 74, isReal: true },
        { name: 'David Muñoz',        flag: '🇪🇸', age: 20, speed: 71, potential: 81, consistency: 73, isReal: true },
        // Red Bull KTM Tech3
        { name: 'Rico Salmela',       flag: '🇫🇮', age: 21, speed: 78, potential: 87, consistency: 78, isReal: true },
        { name: 'Valentin Perrone',   flag: '🇦🇷', age: 22, speed: 76, potential: 84, consistency: 76, isReal: true },
        // CFMOTO Gaviota Aspar Team
        { name: 'Máximo Quiles',      flag: '🇪🇸', age: 20, speed: 82, potential: 92, consistency: 82, isReal: true },
        { name: 'Marco Morelli',      flag: '🇦🇷', age: 21, speed: 69, potential: 81, consistency: 72, isReal: true },
        // Leopard Racing
        { name: 'Adrián Fernández',   flag: '🇪🇸', age: 24, speed: 76, potential: 79, consistency: 78, isReal: true },
        { name: 'Guido Pini',         flag: '🇮🇹', age: 20, speed: 75, potential: 84, consistency: 75, isReal: true },
        // Red Bull KTM Ajo
        { name: 'Brian Uriarte',      flag: '🇪🇸', age: 21, speed: 80, potential: 88, consistency: 80, isReal: true },
        { name: 'Álvaro Carpe',       flag: '🇪🇸', age: 21, speed: 81, potential: 90, consistency: 83, isReal: true }
    ],
    // ── MOTO3 JUNIOR — pilotos promovidos removidos, vagas viram regens ───────
    moto3_junior: [],
    // ── ROOKIES CUP — Perrone e Rammerstorfer promovidos à Moto3 ─────────────
    rookies_cup: [
        { name: 'Carter Thompson', flag: '🇦🇺', age: 18, speed: 61, potential: 83, consistency: 72, isReal: true }
    ],
    moto4_asia: [
        // Veda Pratama e Zen Mitani removidos (promovidos à Moto3)
        { name: 'Reykat Fadillah',      flag: '🇮🇩', age: 15, speed: 65, potential: 84, consistency: 70, isReal: true },
        { name: 'Jakkreephat Phuettisan',flag: '🇹🇭', age: 16, speed: 67, potential: 86, consistency: 72, isReal: true },
        { name: 'Kiattisak Singhapong', flag: '🇹🇭', age: 15, speed: 64, potential: 81, consistency: 68, isReal: true },
        { name: 'Riichi Takahira',      flag: '🇯🇵', age: 15, speed: 66, potential: 85, consistency: 71, isReal: true },
        { name: 'Farish Hafiy',         flag: '🇲🇾', age: 15, speed: 65, potential: 83, consistency: 69, isReal: true },
        { name: 'Farhan Naqib',         flag: '🇲🇾', age: 14, speed: 62, potential: 80, consistency: 65, isReal: true },
        { name: 'Carter Paige',         flag: '🇦🇺', age: 15, speed: 64, potential: 82, consistency: 70, isReal: true },
        { name: 'Hudson Paige',         flag: '🇦🇺', age: 14, speed: 63, potential: 85, consistency: 67, isReal: true },
        { name: 'Arai Agaska',          flag: '🇮🇩', age: 16, speed: 66, potential: 87, consistency: 72, isReal: true },
        { name: 'Kitsada Tanachot',     flag: '🇹🇭', age: 15, speed: 63, potential: 81, consistency: 66, isReal: true },
        { name: 'Marianos Nikolis',     flag: '🇦🇺', age: 16, speed: 65, potential: 82, consistency: 68, isReal: true },
        { name: 'Levi Russo',           flag: '🇦🇺', age: 14, speed: 61, potential: 79, consistency: 64, isReal: true },
        { name: 'Ryota Ogiwara',        flag: '🇯🇵', age: 15, speed: 67, potential: 89, consistency: 73, isReal: true },
        { name: 'Sota Ogiwara',         flag: '🇯🇵', age: 14, speed: 64, potential: 86, consistency: 70, isReal: true },
        { name: 'Alfonsi Daquigan',     flag: '🇵🇭', age: 15, speed: 62, potential: 80, consistency: 65, isReal: true },
        { name: 'Eane Jaye Sobretodo',  flag: '🇵🇭', age: 16, speed: 60, potential: 77, consistency: 62, isReal: true },
        { name: 'Chiranth Vishwanath',  flag: '🇮🇳', age: 16, speed: 61, potential: 79, consistency: 63, isReal: true },
        { name: 'Rakshith Dave',        flag: '🇮🇳', age: 15, speed: 59, potential: 76, consistency: 60, isReal: true },
        { name: 'Hamad Al-Sahouti',     flag: '🇶🇦', age: 16, speed: 63, potential: 84, consistency: 67, isReal: true },
        { name: 'Saad Al-Harqan',       flag: '🇶🇦', age: 15, speed: 58, potential: 75, consistency: 58, isReal: true }
    ]
};

// ==========================================================================
// FREE AGENTS (Pilotos sem equipe inicial)
// ==========================================================================
const freeAgents = [
    { riderId: generateRiderId(), name: 'Miguel Oliveira', flag: '🇵🇹', age: 31, speed: 85, potential: 86, consistency: 84, isReal: true, teamId: null, seat: 0, points: 0, currentRaceScore: 0 },
    { riderId: generateRiderId(), name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 79, potential: 85, consistency: 75, isReal: true, teamId: null, seat: 0, points: 0, currentRaceScore: 0 }
];

// ==========================================================================
// ALGORITMO HÍBRIDO DE PREENCHIMENTO E GERAÇÃO
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
            const generatedAge = Math.floor(Math.random() * 5) + 12;
            const baseSpeed = Math.floor(Math.random() * 9) + 38;

            return {
                riderId: generateRiderId(),
                name: fullName,
                flag: nat.flag,
                age: generatedAge,
                speed: baseSpeed,
                potential: Math.floor(Math.random() * 21) + 76,
                consistency: Math.floor(Math.random() * 41) + 50,
                isPayDriver: Math.random() < 0.30,
                isReal: false,
                points: 0,
                currentRaceScore: 0,
                seat: 0,
                teamId: null,
                teamName: '',
                manufacturer: ''
            };
        }
        attempts++;
    }
    return { riderId: generateRiderId(), name: `Regen ${Math.floor(Math.random()*8999)+1000}`, flag: availableNats[0].flag, age: 14, speed: 40, potential: 80, consistency: 60, isPayDriver: Math.random() < 0.30, isReal: false, points: 0, currentRaceScore: 0, seat: 0, teamId: null };
}

function inicializarGridsVazios() {
    for (const catKey in categoriesConfig) {
        const config = categoriesConfig[catKey];
        let preLoadedList = historicalSeeds[catKey] ? [...historicalSeeds[catKey]] : [];

        ecosystem[catKey] = [];

        // FIX V3.2: loop dinâmico — suporta qualquer número de equipes por categoria
        for (let i = 0; i < config.teams.length; i++) {
            const teamObj = config.teams[i];

            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                let rider;

                if (preLoadedList.length > 0) {
                    const preLoaded = preLoadedList.shift();
                    rider = {
                        riderId: generateRiderId(),
                        ...preLoaded,
                        teamId: teamObj.id,
                        team: teamObj.name,
                        manufacturer: teamObj.manufacturer,
                        seat: seatNum,
                        points: 0,
                        currentRaceScore: 0
                    };
                    uniqueNamesRegistry.add(rider.name);
                } else {
                    rider = generateFictionalNewbie(config.paisesPermitidos);
                    rider.teamId = teamObj.id;
                    rider.team = teamObj.name;
                    rider.manufacturer = teamObj.manufacturer;
                    rider.seat = seatNum;

                    const { minAge, maxAge } = config;
                    if (catKey === 'moto2') { rider.speed += 36; }
                    else if (catKey === 'moto3') { rider.speed += 32; }
                    else if (catKey === 'moto3_junior') { rider.speed += 20; }
                    else if (catKey === 'rookies_cup' || catKey.includes('moto4')) { rider.speed += 16; }
                    rider.age = Math.min(Math.max(rider.age, minAge), maxAge);
                }

                // Financial fields — calculated after rider object is ready
                if (typeof calculateRiderSalary === 'function') {
                    rider.salary = calculateRiderSalary(rider, catKey);
                    rider.marketValue = calculateMarketValue(rider, catKey);
                } else {
                    rider.salary = 0;
                    rider.marketValue = 0;
                }
                rider.contractEndYear = currentYear + Math.floor(Math.random() * 3) + 1;
                rider.stats = rider.stats || { wins: 0, podiums: 0, poles: 0, races: 0, dnfs: 0 };

                ecosystem[catKey].push(rider);
            }
        }
    }
}

// ==========================================================================
// FUNÇÕES AUXILIARES DE ENGENHARIA
// ==========================================================================

function findRiderById(riderId, category = 'motogp') {
    const grid = ecosystem[category] || [];
    return grid.find(r => r.riderId === riderId) || null;
}

function findTeamById(teamId, category = 'motogp') {
    const teams = categoriesConfig[category]?.teams || [];
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;

    const riders = ecosystem[category].filter(r => r.teamId === teamId);
    return { ...team, riders };
}

function getAllRiders(category = 'motogp') {
    return ecosystem[category] || [];
}

function transferRider(riderId, newTeamId, newSeat, category = 'motogp') {
    const grid = ecosystem[category];
    const riderIndex = grid.findIndex(r => r.riderId === riderId);

    if (riderIndex === -1) {
        console.error(`[Transações] Piloto ID ${riderId} não encontrado na categoria ${category}`);
        return false;
    }

    const newTeam = categoriesConfig[category].teams.find(t => t.id === newTeamId);
    if (!newTeam) {
        console.error(`[Transações] Equipe ID ${newTeamId} não encontrada`);
        return false;
    }

    const seatOccupied = grid.some(r => r.teamId === newTeamId && r.seat === newSeat);
    if (seatOccupied) {
        console.error(`[Transações] Assento ${newSeat} já está ocupado na ${newTeam.name}`);
        return false;
    }

    grid[riderIndex].teamId = newTeam.id;
    grid[riderIndex].team = newTeam.name;
    grid[riderIndex].manufacturer = newTeam.manufacturer;
    grid[riderIndex].seat = newSeat;
    grid[riderIndex].points = 0;
    grid[riderIndex].currentRaceScore = 0;

    console.log(`[Transações] ✔ ${grid[riderIndex].name} assinou com ${newTeam.name} (Assento ${newSeat})`);
    return true;
}

// ==========================================================================
// SIMULAÇÃO DE CORRIDA - CORREÇÃO GLOBAL
// ==========================================================================
function triggerSimulation() {
    try {
        _triggerSimulationCore();
    } catch (err) {
        console.error('[triggerSimulation] Erro:', err);
        if (typeof logEvent === 'function') logEvent(`⚠️ Erro na simulação: ${err.message}`, 'warn');
    }
}

function runYearEndTransfers() {
    lastYearTransfers = [];

    // Passo 1: liberar riders acima de maxAge ou com contrato vencido
    for (const cat in ecosystem) {
        const maxAge = (categoriesConfig[cat] && categoriesConfig[cat].maxAge) || Infinity;
        ecosystem[cat] = ecosystem[cat].filter(r => {
            const overAge  = r.age > maxAge;
            const expired  = r.contractEndYear && r.contractEndYear < currentYear;
            if (overAge || expired) {
                r.teamId = null; r.team = null; r.seat = 0;
                r.points = 0; r.currentRaceScore = 0;
                const motivo = overAge ? `${r.age}a > limite ${maxAge}` : `contrato vencido ${r.contractEndYear}`;
                lastYearTransfers.push({ type: 'saida', rider: { name: r.name, flag: r.flag, age: r.age, isReal: r.isReal }, cat, motivo });
                freeAgents.push(r);
                if (typeof logEvent === 'function')
                    logEvent(`📤 ${r.flag} ${r.name} → Free Agent (${motivo})`, 'sys');
                return false;
            }
            return true;
        });
    }

    // Passo 2: preencher assentos vazios em cada categoria
    for (const cat in ecosystem) {
        const config   = categoriesConfig[cat];
        const { minAge, maxAge } = config;
        const grid     = ecosystem[cat];

        for (const teamObj of config.teams) {
            for (let seatNum = 1; seatNum <= 2; seatNum++) {
                const occupied = grid.some(r => r.teamId === teamObj.id && r.seat === seatNum);
                if (occupied) continue;

                let pool = freeAgents.filter(r => !r.teamId && r.age >= minAge && r.age <= maxAge);

                if (teamObj.nationalBias && teamObj.nationalBias.length) {
                    const biased = pool.filter(r => teamObj.nationalBias.includes(r.flag));
                    if (biased.length) pool = biased;
                }

                if (teamObj.aiPersonality === 'caca_talentos') {
                    pool.sort((a, b) => b.potential - a.potential);
                } else if (teamObj.aiPersonality === 'conservadora') {
                    pool.sort((a, b) => ((b.speed + b.consistency) / 2) - ((a.speed + a.consistency) / 2));
                } else {
                    pool.sort((a, b) => b.speed - a.speed);
                }

                let chosen = pool[0];

                // Sem candidatos na faixa etária → gerar novo jovem para repor o pipeline
                if (!chosen) {
                    const newbie = generateFictionalNewbie(config.paisesPermitidos);
                    newbie.age = minAge;
                    if (typeof calculateRiderSalary === 'function') {
                        newbie.salary      = calculateRiderSalary(newbie, cat);
                        newbie.marketValue = calculateMarketValue(newbie, cat);
                    }
                    newbie.stats = { wins: 0, podiums: 0, poles: 0, races: 0, dnfs: 0 };
                    chosen = newbie;
                }

                chosen.teamId          = teamObj.id;
                chosen.team            = teamObj.name;
                chosen.manufacturer    = teamObj.manufacturer;
                chosen.seat            = seatNum;
                chosen.points          = 0;
                chosen.currentRaceScore = 0;
                chosen.contractEndYear  = currentYear + Math.floor(Math.random() * 3) + 1;
                if (typeof calculateRiderSalary === 'function')
                    chosen.salary = calculateRiderSalary(chosen, cat);

                const idxInFA = freeAgents.indexOf(chosen);
                if (idxInFA !== -1) freeAgents.splice(idxInFA, 1);
                grid.push(chosen);

                lastYearTransfers.push({ type: 'entrada', rider: { name: chosen.name, flag: chosen.flag, age: chosen.age, isReal: chosen.isReal }, cat, team: teamObj.name, seat: seatNum });

                if (typeof logEvent === 'function')
                    logEvent(`📥 ${chosen.flag} ${chosen.name} contratado por ${teamObj.name} (${cat.toUpperCase()}, assento ${seatNum})`, 'sys');
            }
        }
    }
}

function _triggerSimulationCore() {
    const RACE_POINTS = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    // 1. Temporada completa → virar o ano e resetar todos
    if (currentRound >= totalRoundsPerSeason) {
        currentYear++;
        currentRound = 0;

        // Incrementar idade (grid + free agents)
        for (const cat in ecosystem)
            ecosystem[cat].forEach(r => { r.points = 0; r.currentRaceScore = 0; r.age = (r.age || 0) + 1; });
        freeAgents.forEach(r => { r.age = (r.age || 0) + 1; });

        // Mercado de transferências
        runYearEndTransfers();

        if (typeof logEvent === 'function') logEvent(`🏆 Temporada ${currentYear - 1} encerrada! Começando ${currentYear}.`, "sys");
        saveLocalStorage();
        if (typeof refreshUI === 'function') refreshUI();
        if (document.getElementById('yearIndicator')) document.getElementById('yearIndicator').textContent = `Temporada ${currentYear}`;
        return;
    }

    // 2. Avança a rodada UMA única vez para o mundo inteiro
    currentRound++;
    const round = currentRound;
    
    let activeCategoryResult = null; // Vai guardar o pódio só da aba que está aberta

    // 3. LOOP MÁGICO: Simula a corrida em TODAS as categorias!
    for (const catKey in ecosystem) {
        const grid = ecosystem[catKey];
        if (!grid || grid.length === 0) continue;

        // Gerar scores de corrida com aleatoriedade
        const raceEntries = grid.map(rider => {
            const base = rider.speed * 0.55 + rider.consistency * 0.30 + rider.potential * 0.10;
            const luck = (Math.random() - 0.48) * 22;
            return { rider, score: base + luck };
        });

        // Determinar DNFs (Abandonos)
        const dnfCandidates = [...raceEntries].sort(() => Math.random() - 0.5);
        const dnfCount = Math.min(4, Math.max(0, Math.floor(Math.random() * grid.length * 0.12)));
        const dnfSet = new Set(dnfCandidates.slice(0, dnfCount).map(e => e.rider.riderId));

        const finishers = raceEntries
            .filter(e => !dnfSet.has(e.rider.riderId))
            .sort((a, b) => b.score - a.score);

        const dnfRiders = raceEntries.filter(e => dnfSet.has(e.rider.riderId));

        // Atribuir pontos para a categoria que está sendo rodada no loop
        finishers.forEach((entry, idx) => {
            const pts = RACE_POINTS[idx] || 0;
            entry.rider.points = (entry.rider.points || 0) + pts;
            entry.rider.currentRaceScore = pts;
            if (entry.rider.stats) {
                entry.rider.stats.races++;
                if (idx === 0) { entry.rider.stats.wins++; entry.rider.stats.podiums++; }
                else if (idx === 1 || idx === 2) entry.rider.stats.podiums++;
            }
        });
        
        dnfRiders.forEach(entry => {
            entry.rider.currentRaceScore = 0;
            if (entry.rider.stats) { entry.rider.stats.races++; entry.rider.stats.dnfs++; }
        });

        const teamPts = {};
        grid.forEach(r => { teamPts[r.teamId] = (teamPts[r.teamId] || 0) + (r.points || 0); });

        // Distribuir Finanças e Prize Money para as equipes dessa categoria
        const finisherIds = finishers.map(e => e.rider.riderId);
        if (typeof processRaceFinances === 'function') {
            try {
                processRaceFinances(finisherIds, catKey);
            } catch(e) {
                console.warn('[Finanças] Erro ao processar finanças da etapa:', e.message);
            }
        }

        // Disparar Log de vitória
        const winner = finishers[0]?.rider;
        if (winner && typeof logEvent === 'function') {
            logEvent(`🏁 Etapa ${round}/${totalRoundsPerSeason} (${catKey.toUpperCase()}): <strong>${winner.flag} ${winner.name}</strong> vence!`, "race");
        }

        // Separar o resultado apenas da aba que o usuário está vendo para renderizar o Widget do Pódio
        if (catKey === activeCategory) {
            activeCategoryResult = {
                round,
                catKey,
                finishers: finishers.map(e => ({ riderId: e.rider.riderId, name: e.rider.name, teamId: e.rider.teamId, team: e.rider.team, flag: e.rider.flag })),
                dnfs: dnfRiders.map(e => ({ riderId: e.rider.riderId, name: e.rider.name, team: e.rider.team, flag: e.rider.flag })),
                teamPoints: teamPts
            };
        }
    }

    // 4. Salva no lastRaceData apenas os dados da aba que estava aberta para o pódio não bugar
    lastRaceData = activeCategoryResult;

    saveLocalStorage();
    if (typeof refreshUI === 'function') refreshUI();
}


// ==========================================================================
// BOOTSTRAP E ARMAZENAMENTO DE SESSÃO
// ==========================================================================

function saveLocalStorage() {
    const dataToSave = {
        currentYear, currentRound, activeCategory, ecosystem, lastRaceData,
        uniqueNames: Array.from(uniqueNamesRegistry),
        nextRiderId: nextRiderId,
        teamFinancesState,
        freeAgents,
        lastYearTransfers
    };
    localStorage.setItem('motogp_sim_save', JSON.stringify(dataToSave));
}

function initializeRealEcosystem() {
    uniqueNamesRegistry.clear();
    nextRiderId = 1000;
    inicializarGridsVazios();
    currentRound = 0;
    currentYear = 2026;
    lastRaceData = null;
    lastYearTransfers = [];
    teamFinancesState = {};
    freeAgents.splice(0);
    freeAgents.push(
        { riderId: generateRiderId(), name: 'Miguel Oliveira', flag: '🇵🇹', age: 31, speed: 85, potential: 86, consistency: 84, isReal: true, teamId: null, seat: 0, points: 0, currentRaceScore: 0 },
        { riderId: generateRiderId(), name: 'Somkiat Chantra', flag: '🇹🇭', age: 27, speed: 79, potential: 85, consistency: 75, isReal: true, teamId: null, seat: 0, points: 0, currentRaceScore: 0 }
    );
    if (typeof initTeamFinances === 'function') initTeamFinances();

    saveLocalStorage();

    if (typeof initUI === "function") initUI();
    if (typeof logEvent === "function") logEvent("✔ Banco de Dados V3.2 (Moto3 2026 — 13 equipes / 26 pilotos reais) carregado com sucesso!", "sys");
}

// ==========================================================================
// CORREÇÃO DO BOOTSTRAP (Substitua o final do seu engine.js por isso)
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('motogp_sim_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.ecosystem && parsed.currentYear) {
                currentYear         = parsed.currentYear;
                currentRound        = parsed.currentRound || 0;
                activeCategory      = parsed.activeCategory || 'motogp';
                ecosystem           = parsed.ecosystem;
                for (const cat in ecosystem) {
                    const minAge = (categoriesConfig[cat] && categoriesConfig[cat].minAge) || 12;
                    ecosystem[cat].forEach(r => { if (!r.age) r.age = minAge; });
                }
                lastRaceData        = parsed.lastRaceData || null;
                uniqueNamesRegistry = new Set(parsed.uniqueNames || []);
                nextRiderId         = parsed.nextRiderId || 1000;
                if (parsed.teamFinancesState && Object.keys(parsed.teamFinancesState).length > 0) {
                    teamFinancesState = parsed.teamFinancesState;
                } else if (typeof initTeamFinances === 'function') {
                    initTeamFinances();
                }
                if (parsed.freeAgents && Array.isArray(parsed.freeAgents)) {
                    freeAgents.splice(0);
                    parsed.freeAgents.forEach(r => freeAgents.push(r));
                }
                lastYearTransfers = parsed.lastYearTransfers || [];
            } else {
                initializeRealEcosystem();
            }
        } catch (e) {
            console.error("[Sistema] Erro ao ler save. Resetando...", e);
            initializeRealEcosystem();
        }
    } else {
        initializeRealEcosystem();
    }
});

