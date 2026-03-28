export const DONATION_CATEGORIES = [
  "MSK",
  "Parishioner",
  "Religious Organization"
];

export const MSK_DEPARTMENTS = [
  "KAWAN I - SAN PEDRO",
  "KAWAN II - SAN JUAN",
  "KAWAN III - SANTO TOMAS",
  "KAWAN IV - SAN BARTOLOME",
  "KAWAN V - SANTIAGO I",
  "KAWAN VI - SANTIAGO I",
  "KAWAN VII - SAN SIMON",
  "KAWAN VIII - SAN FELIPE",
  "KAWAN IX - SAN MATEO",
  "KAWAN X - SAN ANDRES",
  "KAWAN XI - SAN JUDAS TADEO",
  "KAWAN XII - SAN MATIAS",
  "KAWAN XIII - SAN MATIAS",
  "KAWAN XIV"
];

export const RELIGIOUS_ORG_DEPARTMENTS = [
  "DEPARTMENT OF WORSHIP",
  "DEPARMENT OF SERVICE",
  "DEPARMENT OF FORMATION"
];

export const MSK_GROUPS: Record<string, string[]> = {
  "KAWAN I - SAN PEDRO": [
    "Our Lady of Sorrow | Masayahin",
    "Monte Carmelo | Balagasan 1",
    "Our Lady of Peñafrancia | Balagasan 2",
    "Our Lady of Lourdes | Pitong Gatang"
  ],
  "KAWAN II - SAN JUAN": [
    "Santa Filomena | Tandang Sora",
    "Santa Filomena | Pur",
    "San Pablo | Pinag isa"
  ],
  "KAWAN III - SANTO TOMAS": [
    "Our Lady of Peace | Sabina",
    "Heart of Mary | Dulong Cabana"
  ],
  "KAWAN IV - SAN BARTOLOME": [
    "San Roque | San Rogue",
    "Santa Monica | Santa Monica",
    "Santo Rosario | Santo Rosario 1"
  ],
  "KAWAN V - SANTIAGO I": [
    "Our Lady of Guadalupe | Short Cut Looban",
    "Our Lady of Fatima | Kalye Ptol",
    "Our Lady of the Most Holy Rosary | Short Cut Looban"
  ],
  "KAWAN VI - SANTIAGO I": [
    "San Rafael | Ilang Ilang"
  ],
  "KAWAN VII - SAN SIMON": [
    "San Antonio | Holywood",
    "San Juan Bautista | Flowback"
  ],
  "KAWAN VIII - SAN FELIPE": [
    "San Isidro | Pagkakaisa",
    "San Vicente de Paul | Masunurin",
    "Santa Catalina de Siena | Pagkakaisa II",
    "Sto. Niño | Tanglaw/Barera"
  ],
  "KAWAN IX - SAN MATEO": [
    "Our Lady of Miraculous Medal | Milagrosa Subd.",
    "San Ana | Narra I",
    "Our Lady of Manaog | Ipil"
  ],
  "KAWAN X - SAN ANDRES": [
    "Santa Cecilia | Rosal II",
    "st. Teresse of Avila | Ilang - Ilang",
    "San Pedro Calungsod | Riles",
    "Santa Magdalena | Sampaguita I",
    "Immaculada Concepcion | Sampaguita II"
  ],
  "KAWAN XI - SAN JUDAS TADEO": [
    "Assumption | Munting Paraiso",
    "San simon | Sitio Ravanzo",
    "Puso ni Hesus | Sacred Heart Subd."
  ],
  "KAWAN XII - SAN MATIAS": [
    "Our Lady of Fatima | Ilang - Iiang",
    "San Matias | Unson",
    "St. Teresse of Child of Jesus | Everlasting",
    "San Juan | Orgas"
  ],
  "KAWAN XIII - SAN MATIAS": [
    "Santa Rita de Casia | Langisan",
    "San Gabriel | sitio Labak",
    "San Isidro | La Tondeña"
  ],
  "KAWAN XIV": [
    "Our Lady of Fatima | Tando",
    "San Padre Pio | Ledai",
    "St. Catherine of Siena | Westland",
    "San Isidro | Masaya I",
    "San Isidro | Masaya ii Uwak",
    "San Isidro | Pagsisikap",
    "Niña Maria | Pag ibig",
    "San Judas | Pag- asa",
    "San Jose | North Employees"
  ]
};

export const RELIGIOUS_ORG_GROUPS: Record<string, string[]> = {
  "DEPARTMENT OF WORSHIP": [
    "Ministry of Altar Servers",
    "Ministry of LECTORS AND COMMENTATORS",
    "MINSTRY OF ACOLYTES",
    "MINISTRY OF LITURGICAL MUSIC",
    "MINISTRY OF USHERS AND SHERETTES",
    "APOSTOLADO NG PANALANGIN",
    "OCDS",
    "MOTHER OF BUTLEERS GULD",
    "EL SHADDAI",
    "CATHOLIC CHARISTMATIC MOVEMENT",
    "DEDALIA MILAGROSA",
    "DEL CARMEN ASSOCIATION",
    "LOVE OF JESUS",
    "OUR LADY OF GUADALUPE",
    "DAMAS Y CABALLEROS",
    "OUR LADY OF THE RULE",
    "UNITY OF CHRIST",
    "APOSTOLES",
    "CAMAREROS DE SAN FERNANDO"
  ],
  "DEPARMENT OF SERVICE": [
    "LEGION OF MARY",
    "KNIGHTS OF COLUMBUS",
    "CATHOLIC WOMENS LEAGUE (CWL)",
    "DAUGHTERS OF MARY IMMACULATE (DMI)",
    "OUR LADY OF LOURDES ASSOCIATION",
    "SAINT JOSPEH ASSOCIATION",
    "MOTHER OF PERPETUAL HELP",
    "SERCULAR FRANCISCAN ORDER (OFS)",
    "DIVINE MERCY",
    "ANAWIM",
    "DOLOROSA"
  ],
  "DEPARMENT OF FORMATION": [
    "ST. ANTHONY ASSOCIATION",
    "ANGKANG LEVITICO",
    "MINISTRY OF CATECHESIS",
    "CURSILLO",
    "PREX",
    "TIPCC",
    "CATHOLIC DEFENDER FAITH",
    "CFC CHURCH INTEGRATION",
    "MISSIONARY FAMILIES OF CHRIST",
    "COUPLES FOR CHRIST",
    "SINGLES OF CHRIST",
    "HANDMAID OF THE LORD",
    "SERVERS OF THE LORD",
    "MARRIAGE ENCOUTER (BLD)",
    "MARRIAGE ENCOUTER (PDDC)",
    "CONFRATERNITY OF IMAACULATE CHEART OF MARY"
  ]
};

// Flat list for faster typing/searching
export interface FlatMinistry {
  name: string;
  category: string;
  department: string;
}

export const ALL_MINISTRIES: FlatMinistry[] = [
  ...Object.entries(MSK_GROUPS).flatMap(([dept, groups]) =>
    groups.map(name => ({ name, category: "MSK", department: dept }))
  ),
  ...Object.entries(RELIGIOUS_ORG_GROUPS).flatMap(([dept, groups]) =>
    groups.map(name => ({ name, category: "Religious Organization", department: dept }))
  ),
  { name: "General Donation", category: "Parishioner", department: "GENERAL" },
  { name: "Tithes", category: "Parishioner", department: "GENERAL" },
  { name: "Thanksgiving", category: "Parishioner", department: "GENERAL" },
  { name: "Special Intention", category: "Parishioner", department: "GENERAL" }
];
