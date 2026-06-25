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

// BANCO DE DADOS DE PAÍSES — NOMES POPULACIONAIS COMUNS
// Versão 2.0 — 38 países, ~480 nomes, SEM sobreposição com pilotos reais do ecossistema
const natData = [

    // ── EUROPA OCIDENTAL ──────────────────────────────────────────────────────

    { country: 'Espanha', flag: '🇪🇸',
      names: ['Pablo', 'Javier', 'Eduardo', 'Roberto', 'Luis', 'Antonio',
              'Jaime', 'Víctor', 'Óscar', 'Rubén', 'Emilio', 'Hugo',
              'Gonzalo', 'Fernando', 'Alfonso', 'Rodrigo', 'Ernesto',
              'Ignacio', 'Cristian', 'Julio', 'Ricardo', 'Tomás'],
      surnames: ['Martínez', 'Sánchez', 'Navarro', 'Molina', 'Reyes',
                 'Herrero', 'Castillo', 'Vega', 'Rubio', 'Moreno',
                 'Ortega', 'Cruz', 'Delgado', 'Campos', 'Aguilar',
                 'Peña', 'Ibáñez', 'Serrano', 'Ramos', 'Nieto'] },

    { country: 'Itália', flag: '🇮🇹',
      names: ['Gianluca', 'Simone', 'Matteo', 'Alessandro', 'Michele',
              'Riccardo', 'Roberto', 'Leonardo', 'Giacomo', 'Vincenzo',
              'Salvatore', 'Emanuele', 'Gianmarco', 'Cristian', 'Daniele',
              'Stefano', 'Edoardo', 'Nicola', 'Claudio', 'Massimo'],
      surnames: ['Conti', 'Ferretti', 'Benedetti', 'Messina', 'De Luca',
                 'Romano', 'Amato', 'Greco', 'Bruno', 'Lombardi',
                 'Pellegrini', 'Ferrara', 'Gallo', 'Leone', 'Marrone',
                 'Esposito', 'Ricci', 'Barbieri', 'Cattaneo', 'Fabbri'] },

    { country: 'França', flag: '🇫🇷',
      names: ['Clément', 'Antoine', 'Pierre', 'Théo', 'Lucas', 'Florian',
              'Guillaume', 'Alexis', 'Nicolas', 'Julien', 'Baptiste',
              'Thomas', 'Romain', 'Simon', 'Hugo', 'Axel', 'Arthur',
              'Maxime', 'Mathieu', 'Etienne'],
      surnames: ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard',
                 'Petit', 'Durand', 'Leroy', 'Simon', 'Laurent',
                 'Michel', 'Bertrand', 'Fontaine', 'Leblanc', 'Garnier',
                 'Moreau', 'Girard', 'Bonnet', 'Rousseau', 'Blanc'] },

    { country: 'Portugal', flag: '🇵🇹',
      names: ['Tiago', 'Rúben', 'Gonçalo', 'André', 'Luís', 'Nuno',
              'Filipe', 'João', 'Vasco', 'Rodrigo', 'Bruno', 'Hugo',
              'Rafael', 'António', 'Tomás', 'Dinis', 'Martim'],
      surnames: ['Ferreira', 'Silva', 'Costa', 'Rodrigues', 'Pinto',
                 'Carvalho', 'Sousa', 'Almeida', 'Santos', 'Martins',
                 'Gomes', 'Marques', 'Figueiredo', 'Correia', 'Matos'] },

    { country: 'Alemanha', flag: '🇩🇪',
      names: ['Jonas', 'Moritz', 'Tobias', 'Fabian', 'Julian', 'Niklas',
              'Lars', 'Patrick', 'Dominik', 'Felix', 'Florian', 'Leon',
              'Tim', 'Hendrik', 'Jannis', 'Kai', 'Bastian', 'Simon', 'Sven'],
      surnames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber',
                 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
                 'Richter', 'Klein', 'Wolf', 'Zimmermann', 'Neumann',
                 'Krüger', 'Schwarz', 'Braun', 'Lange', 'Werner'] },

    { country: 'Países Baixos', flag: '🇳🇱',
      names: ['Daan', 'Luuk', 'Niek', 'Thijs', 'Jasper', 'Wouter',
              'Bram', 'Stef', 'Joris', 'Lars', 'Sander', 'Pieter',
              'Koen', 'Floris', 'Timo', 'Stan', 'Ruben'],
      surnames: ['de Jong', 'de Vries', 'Bakker', 'Janssen', 'Visser',
                 'Smit', 'Meijer', 'Bos', 'Mulder', 'de Graaf',
                 'Kok', 'Brouwer', 'van Dijk', 'Vermeer', 'Kuipers'] },

    { country: 'Bélgica', flag: '🇧🇪',
      names: ['Thomas', 'Nathan', 'Lennart', 'Nico', 'Livio', 'Brecht',
              'Simon', 'Tibo', 'Jarne', 'Niels', 'Robbe', 'Mathis',
              'Pieter', 'Axel', 'Wout', 'Remi'],
      surnames: ['Peeters', 'Maes', 'Claes', 'Janssen', 'Martens',
                 'Leclercq', 'Willems', 'Jacobs', 'Vermeersch', 'Bogaert',
                 'Goossens', 'Hermans', 'Desmet', 'Declercq', 'Nijs'] },

    { country: 'Suíça', flag: '🇨🇭',
      names: ['Dominique', 'Jonas', 'Robin', 'Kevin', 'Romain', 'Jan',
              'Tobias', 'Sven', 'Andrin', 'Severin', 'Fabian', 'Elia',
              'Yanick', 'Nils', 'Gilles'],
      surnames: ['Keller', 'Zimmermann', 'Brunner', 'Meier', 'Steiner',
                 'Gerber', 'Baumann', 'Bucher', 'Frei', 'Huber',
                 'Moser', 'Wenger', 'Zürcher', 'Jost', 'Eigenmann'] },

    { country: 'Áustria', flag: '🇦🇹',
      names: ['Hannes', 'Michael', 'Lukas', 'Stefan', 'Philipp',
              'Julian', 'Patrick', 'Bernhard', 'Christoph', 'Florian',
              'Jakob', 'Andreas', 'Markus', 'Dominik', 'Raphael'],
      surnames: ['Gruber', 'Huber', 'Mayer', 'Steiner', 'Schwarz',
                 'Reiter', 'Berger', 'Haider', 'Pichler', 'Wimmer',
                 'Egger', 'Fuchs', 'Hofer', 'Mayr', 'Bauer'] },

    { country: 'Chéquia', flag: '🇨🇿',
      names: ['Karel', 'Martin', 'Ondřej', 'Tomáš', 'Lukáš', 'Vojtěch',
              'Petr', 'Jan', 'Radek', 'Pavel', 'Michal', 'Zdeněk',
              'Jiří', 'Marek', 'Libor', 'Václav'],
      surnames: ['Novák', 'Dvořák', 'Procházka', 'Krejčí', 'Pokorný',
                 'Blažek', 'Kučera', 'Kratochvíl', 'Veselý', 'Horáček',
                 'Šimánek', 'Pospíšil', 'Fišer', 'Mareš', 'Kopecký'] },

    { country: 'Finlândia', flag: '🇫🇮',
      names: ['Mika', 'Sami', 'Jesse', 'Heikki', 'Riku', 'Juho', 'Aaro',
              'Patrik', 'Valtteri', 'Tuomas', 'Joonas', 'Teemu', 'Ville',
              'Aleksi', 'Elias', 'Niko', 'Lauri'],
      surnames: ['Mäkinen', 'Virtanen', 'Heikkinen', 'Koskinen', 'Häkkinen',
                 'Leinonen', 'Korhonen', 'Mattila', 'Niemi', 'Ojala',
                 'Laine', 'Hämäläinen', 'Kettunen', 'Peltonen', 'Saarinen'] },

    { country: 'Suécia', flag: '🇸🇪',
      names: ['Anton', 'Oscar', 'Pontus', 'Jesper', 'Erik', 'Henrik',
              'Gustav', 'Victor', 'Linus', 'Oliver', 'William', 'Simon',
              'Axel', 'Mattias', 'Jonathan', 'Marcus'],
      surnames: ['Bergström', 'Lindqvist', 'Svensson', 'Gustafsson',
                 'Pettersson', 'Johansson', 'Nilsson', 'Andersson',
                 'Eriksson', 'Larsson', 'Persson', 'Olsson', 'Lindberg',
                 'Danielsson', 'Magnusson'] },

    { country: 'Noruega', flag: '🇳🇴',
      names: ['Ole', 'Henrik', 'Sander', 'Tobias', 'Lars', 'Magnus',
              'Kristoffer', 'Martin', 'Morten', 'Eirik', 'Anders',
              'Håkon', 'Stian', 'Emil', 'Øyvind', 'Eivind'],
      surnames: ['Hansen', 'Berg', 'Larsen', 'Pedersen', 'Andersen',
                 'Dahl', 'Strand', 'Lie', 'Bakken', 'Fjeld',
                 'Eriksen', 'Haugen', 'Moen', 'Nygaard', 'Solberg'] },

    { country: 'Polônia', flag: '🇵🇱',
      names: ['Kamil', 'Piotr', 'Mateusz', 'Bartosz', 'Michał', 'Krzysztof',
              'Tomasz', 'Arkadiusz', 'Rafał', 'Grzegorz', 'Marek',
              'Łukasz', 'Damian', 'Paweł', 'Kacper', 'Adrian'],
      surnames: ['Wiśniewski', 'Kowalski', 'Wójcik', 'Nowak', 'Zieliński',
                 'Kamiński', 'Grabowski', 'Mazur', 'Krawczyk', 'Piotrowski',
                 'Jankowski', 'Woźniak', 'Adamczyk', 'Dudek', 'Pawlak'] },

    { country: 'Hungria', flag: '🇭🇺',
      names: ['Bálint', 'Tamás', 'Richárd', 'Dániel', 'Ádám', 'Márk',
              'Péter', 'Zoltán', 'Gábor', 'László', 'Attila',
              'Krisztián', 'Csaba', 'Bence', 'Norbert', 'Szabolcs'],
      surnames: ['Kovács', 'Nagy', 'Horváth', 'Szabó', 'Tóth', 'Simon',
                 'Molnár', 'Fekete', 'Varga', 'Balogh', 'Papp',
                 'Takács', 'Lukács', 'Kiss', 'Farkas'] },

    { country: 'Eslovênia', flag: '🇸🇮',
      names: ['Luka', 'Matej', 'Rok', 'Matic', 'Blaž', 'Tim', 'Žan',
              'Jure', 'Aleš', 'Gregor', 'Anže', 'Tilen', 'Miha', 'Gal'],
      surnames: ['Kovač', 'Baškovič', 'Pintarič', 'Fajfar', 'Černe',
                 'Vidmar', 'Novak', 'Zupan', 'Kos', 'Šuhada',
                 'Oblak', 'Kranjc', 'Rožič', 'Kopitar', 'Golobič'] },

    { country: 'Croácia', flag: '🇭🇷',
      names: ['Ivan', 'Mate', 'Roko', 'Marko', 'Tomislav', 'Damir',
              'Nikola', 'Ante', 'Stjepan', 'Domagoj', 'Karlo',
              'Duje', 'Marin', 'Josip', 'Toni'],
      surnames: ['Perić', 'Jurić', 'Blažević', 'Marić', 'Novak',
                 'Knežević', 'Vuković', 'Šimić', 'Babić', 'Barišić',
                 'Kovačević', 'Grgić', 'Filipović', 'Mikulić', 'Rukavina'] },

    { country: 'Irlanda', flag: '🇮🇪',
      names: ['Niall', 'Darragh', 'Conor', 'Cian', 'Eoin', 'Seán',
              'Ronan', 'Tadhg', 'Oisín', 'Cathal', 'Fionn',
              'Ciarán', 'Pádraic', 'Donnacha', 'Rían'],
      surnames: ['Murphy', 'Walsh', 'Byrne', 'Ryan', 'O\'Brien',
                 'Kelly', 'McCarthy', 'Doyle', 'Connolly', 'O\'Sullivan',
                 'Fitzgerald', 'Gallagher', 'O\'Connor', 'Brennan', 'Burke'] },

    { country: 'Reino Unido', flag: '🇬🇧',
      names: ['Bradley', 'Danny', 'Tarran', 'Rory', 'Oli', 'James',
              'Callum', 'Liam', 'Owen', 'Ben', 'Luke', 'Tom',
              'Harry', 'Jamie', 'Dean', 'Charlie', 'Aaron', 'Tyler', 'Kieran'],
      surnames: ['Davies', 'Harris', 'Birchall', 'O\'Halloran', 'Iddon',
                 'Bridewell', 'Jones', 'Williams', 'Brown', 'Taylor',
                 'Evans', 'Thomas', 'Walker', 'Wilson', 'Robinson',
                 'Wright', 'Clarke', 'Hall', 'Allen', 'Green'] },

    // ── AMÉRICAS ──────────────────────────────────────────────────────────────

    { country: 'Brasil', flag: '🇧🇷',
      names: ['Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Henrique',
              'Igor', 'Thiago', 'Leonardo', 'Vitor', 'André', 'Caio',
              'Guilherme', 'Rodrigo', 'Renan', 'William', 'Davi', 'Eduardo'],
      surnames: ['Oliveira', 'Silva', 'Costa', 'Souza', 'Pereira', 'Lima',
                 'Ferreira', 'Carvalho', 'Rodrigues', 'Alves', 'Barbosa',
                 'Nascimento', 'Ribeiro', 'Melo', 'Araújo', 'Monteiro',
                 'Cavalcanti', 'Freitas', 'Correia', 'Nunes'] },

    { country: 'Colômbia', flag: '🇨🇴',
      names: ['Sebastián', 'Alejandro', 'Camilo', 'Nicolás', 'Andrés',
              'Felipe', 'Julián', 'Esteban', 'Diego', 'Mauricio',
              'Luis', 'Tomás', 'Jhon', 'Wilmar', 'Cristian'],
      surnames: ['Hernández', 'Rodríguez', 'Martínez', 'López', 'García',
                 'Gómez', 'Vargas', 'Romero', 'Torres', 'Ramírez',
                 'Ríos', 'Cardona', 'Morales', 'Patiño', 'Castañeda'] },

    { country: 'Argentina', flag: '🇦🇷',
      names: ['Ezequiel', 'Facundo', 'Matías', 'Nicolás', 'Tomás',
              'Agustín', 'Luciano', 'Bruno', 'Leandro', 'Rodrigo',
              'Emanuel', 'Damián', 'Nahuel', 'Ignacio', 'Santiago'],
      surnames: ['Fernández', 'González', 'Rodríguez', 'Martínez', 'López',
                 'García', 'Jiménez', 'Romero', 'Suárez', 'Díaz',
                 'Muñoz', 'Álvarez', 'Ruiz', 'Ramos', 'Castro'] },

    { country: 'Chile', flag: '🇨🇱',
      names: ['Matías', 'Diego', 'Ignacio', 'Felipe', 'Tomás', 'Rodrigo',
              'Pablo', 'Francisco', 'Alejandro', 'Camilo', 'Cristóbal',
              'Gonzalo', 'Nicolás', 'Sebastián', 'Bastián'],
      surnames: ['Muñoz', 'Rojas', 'Torres', 'Fuentes', 'Vargas',
                 'Flores', 'Espinoza', 'Núñez', 'Soto', 'Contreras',
                 'Riquelme', 'Ibáñez', 'Reyes', 'Cifuentes', 'Garrido'] },

    { country: 'México', flag: '🇲🇽',
      names: ['Diego', 'Roberto', 'Emilio', 'Rodrigo', 'Erick', 'Alexis',
              'Enrique', 'Fernando', 'Alejandro', 'Gerardo', 'Eduardo',
              'Mauricio', 'Andrés', 'Héctor', 'Arturo'],
      surnames: ['Gutiérrez', 'Herrera', 'Morales', 'Jiménez', 'Román',
                 'Ramírez', 'Cruz', 'Vega', 'Flores', 'Mendoza',
                 'Reyes', 'Castillo', 'Ríos', 'Peña', 'Salinas'] },

    { country: 'Estados Unidos', flag: '🇺🇸',
      names: ['Cameron', 'Garrett', 'Kyle', 'Blake', 'Tyler', 'Cody',
              'Chase', 'Dustin', 'Tommy', 'Austin', 'Brandon', 'Zach',
              'Derek', 'Logan', 'Travis', 'Brett', 'Mason', 'Colton'],
      surnames: ['Thompson', 'Richardson', 'Henderson', 'Mitchell', 'Walker',
                 'Coleman', 'Harrison', 'Patterson', 'Hughes',
                 'Reed', 'Perry', 'Sanders', 'Powell', 'Rogers',
                 'Griffin', 'Brooks', 'Warren', 'Hayes', 'Murray'] },

    { country: 'Canadá', flag: '🇨🇦',
      names: ['Jordan', 'Tyler', 'Nathan', 'Liam', 'Ryan', 'Cole',
              'Owen', 'Ethan', 'Logan', 'Brandon', 'Connor', 'Hunter',
              'Spencer', 'Reid', 'Zac', 'Wyatt'],
      surnames: ['MacDonald', 'Tremblay', 'Gauthier', 'Lefebvre', 'Bouchard',
                 'Roy', 'Gagnon', 'Morin', 'Côté', 'Poirier',
                 'Beaulieu', 'Chartrand', 'Pelletier', 'Simard', 'Lacroix'] },

    // ── ÁSIA & OCEANIA ────────────────────────────────────────────────────────

    { country: 'Japão', flag: '🇯🇵',
      names: ['Hiroki', 'Ryo', 'Yuki', 'Kohta', 'Shoya', 'Kenji',
              'Naoki', 'Daisuke', 'Wataru', 'Koji', 'Yusuke',
              'Kenta', 'Tatsuya', 'Shinya', 'Masato', 'Haruki', 'Daiki'],
      surnames: ['Yamamoto', 'Watanabe', 'Tanaka', 'Ito', 'Kato',
                 'Kobayashi', 'Shimizu', 'Inoue', 'Hayashi', 'Kimura',
                 'Matsumoto', 'Fujiwara', 'Ishikawa', 'Okamoto', 'Nakamura',
                 'Hashimoto', 'Aoki', 'Goto', 'Endo', 'Saito'] },

    { country: 'Tailândia', flag: '🇹🇭',
      names: ['Natchanon', 'Thitipong', 'Kittipan', 'Peerapong', 'Wirojana',
              'Kawin', 'Anupab', 'Pongpat', 'Sirisak', 'Natthawee',
              'Thanawat', 'Supphachai', 'Panupan', 'Worawit', 'Kritsada'],
      surnames: ['Kaewsan', 'Piyapatama', 'Buasri', 'Rattanakon',
                 'Saisuwan', 'Jirarat', 'Khumkhong', 'Wannapong',
                 'Chaiyaphum', 'Boonpiam', 'Srisomporn', 'Phomphian',
                 'Kerdnoi', 'Suwannatat', 'Thongrak'] },

    { country: 'Indonésia', flag: '🇮🇩',
      names: ['Rheza', 'Galang', 'Andi', 'Dimas', 'Herjun', 'Wahyu',
              'Rizky', 'Bagas', 'Arief', 'Reza', 'Ilham', 'Bima',
              'Fajar', 'Satria', 'Yudha', 'Raka', 'Aldino'],
      surnames: ['Dhewantara', 'Irawan', 'Putra', 'Santoso', 'Setiawan',
                 'Nugroho', 'Permana', 'Kurniawan', 'Wijaya', 'Pratama',
                 'Gunawan', 'Saputra', 'Kusuma', 'Wibowo', 'Prasetyo'] },

    { country: 'Malásia', flag: '🇲🇾',
      names: ['Zaqhwan', 'Adam', 'Shafiq', 'Idham', 'Nabil', 'Haziq',
              'Raihan', 'Irfan', 'Azri', 'Amirul', 'Farid',
              'Khairul', 'Izzat', 'Harith', 'Arif'],
      surnames: ['Zaidi', 'Razali', 'Azlan', 'Rosli', 'Ramli',
                 'Zulkifli', 'Osman', 'Hashim', 'Ibrahim', 'Abdullah',
                 'Ahmad', 'Hassan', 'Ismail', 'Yusof', 'Hamid'] },

    { country: 'Coreia do Sul', flag: '🇰🇷',
      names: ['Minjun', 'Seunghyun', 'Junho', 'Jeonghoon', 'Hyunjun',
              'Woojin', 'Sanghoon', 'Taehun', 'Yoonseo', 'Jungwoo',
              'Hyunsoo', 'Donghwan', 'Sungmin', 'Junghyun', 'Daehyun'],
      surnames: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang',
                 'Yoon', 'Jang', 'Lim', 'Oh', 'Kwon', 'Shin',
                 'Han', 'Cho', 'Seo'] },

    { country: 'Índia', flag: '🇮🇳',
      names: ['Anish', 'Kavin', 'Rajiv', 'Sarthak', 'Yash', 'Akhil',
              'Nikhil', 'Deepak', 'Arjun', 'Vikram', 'Rahul',
              'Aditya', 'Karthik', 'Rohan', 'Pranav', 'Dhruv'],
      surnames: ['Shetty', 'Kumar', 'Patel', 'Singh', 'Sharma',
                 'Verma', 'Gupta', 'Nair', 'Reddy', 'Joshi',
                 'Mehta', 'Shah', 'Pillai', 'Rao', 'Iyer'] },

    { country: 'Filipinas', flag: '🇵🇭',
      names: ['Angelo', 'John', 'Mark', 'Francis', 'Josef', 'Dustin',
              'Christian', 'Joshua', 'Ian', 'Jerome', 'Bryan',
              'Kevin', 'Ryan', 'Justin'],
      surnames: ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Del Rosario',
                 'Ramos', 'Flores', 'Garcia', 'Torres', 'Castro',
                 'Gonzalez', 'Soriano', 'Aquino', 'Villanueva', 'Dela Cruz'] },

    { country: 'Qatar', flag: '🇶🇦',
      names: ['Nasser', 'Mohammed', 'Abdulrahman', 'Khalid', 'Fahad',
              'Abdullah', 'Ali', 'Omar', 'Khalifa', 'Jasim',
              'Rashid', 'Sultan', 'Faisal', 'Jassem', 'Turki'],
      surnames: ['Al-Mansouri', 'Al-Kuwari', 'Al-Attiyah', 'Al-Naimi',
                 'Al-Thani', 'Al-Marri', 'Al-Sulaiti', 'Al-Mohannadi',
                 'Al-Baker', 'Al-Emadi', 'Al-Misnad', 'Al-Hajri',
                 'Al-Kaabi', 'Al-Nuaimi', 'Al-Rashidi'] },

    { country: 'Austrália', flag: '🇦🇺',
      names: ['Billy', 'Josh', 'Broc', 'Travis', 'Harrison', 'Aaron',
              'Luke', 'Ben', 'Ryan', 'Tom', 'Dylan', 'Liam',
              'Ethan', 'Mitchell', 'Nathan', 'Cameron', 'Jye', 'Dean'],
      surnames: ['Anderson', 'Thompson', 'Roberts', 'Cooper', 'Hall',
                 'Wilson', 'Clark', 'Lewis', 'Robinson', 'White',
                 'Martin', 'Jackson', 'Harris', 'Wood', 'King',
                 'Turner', 'Hughes', 'Hill', 'Clarke', 'Mitchell'] },

    { country: 'Nova Zelândia', flag: '🇳🇿',
      names: ['Slade', 'Rogan', 'Hamish', 'Sam', 'Ben', 'Dylan',
              'Callum', 'Ethan', 'Mitchell', 'Hunter', 'Charlie',
              'Tyler', 'Brodie', 'Brendon', 'Jamie'],
      surnames: ['Wilson', 'Ferguson', 'Thomson', 'Mackay', 'Fraser',
                 'Campbell', 'Robertson', 'Murray', 'Scott', 'Stewart',
                 'Reid', 'Anderson', 'Morrison', 'Henderson', 'Paterson'] },

    // ── ÁFRICA & ORIENTE MÉDIO ────────────────────────────────────────────────

    { country: 'África do Sul', flag: '🇿🇦',
      names: ['Darryn', 'Sheridan', 'Garrett', 'Rogan', 'Dylan', 'Cameron',
              'Dean', 'Warren', 'Chad', 'Jody', 'Gareth',
              'Kyle', 'Tristan', 'Brendon', 'Ryno'],
      surnames: ['Van Zyl', 'Peterson', 'Hendrikse', 'De Wet', 'Smith',
                 'Cronje', 'Joubert', 'Du Toit', 'Nel', 'Botha',
                 'Pretorius', 'Van Der Berg', 'Swanepoel', 'Kruger', 'Steyn'] },

    { country: 'Turquia', flag: '🇹🇷',
      names: ['Emirhan', 'Baran', 'Kaan', 'Alp', 'Onur', 'Burak',
              'Arda', 'Umut', 'Serhat', 'Kerem', 'Mert', 'Yiğit',
              'Enes', 'Berkay', 'Furkan'],
      surnames: ['Yıldız', 'Demir', 'Kaya', 'Şahin', 'Çelik',
                 'Arslan', 'Doğan', 'Aydın', 'Erdoğan', 'Güneş',
                 'Yılmaz', 'Koç', 'Özdemir', 'Şaşmaz', 'Polat'] }
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
