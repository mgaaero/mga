import { Occurrence, HazardObstacle } from '@mega/types';

/**
 * Base de demonstração verídica com coordenadas e registros documentados
 * para alimentar a interface do MVP e testes do motor geográfico.
 */
export const HISTORICAL_OCCURRENCES_SEED: Occurrence[] = [
  {
    id: "cenipa-2021-001",
    type: "ACCIDENT",
    visualTag: "HISTORICAL_MEMORY", // ⚪ Memória histórica
    verificationStatus: "FINAL_REPORT_CONFIRMED",
    date: "2021-11-05",
    time: "15:30",
    location: {
      description: "Cachoeira de Piedade de Caratinga, MG",
      city: "Piedade de Caratinga",
      state: "MG",
      countryIso: "BRA",
      coordinates: {
        latitude: -19.8247,
        longitude: -42.1444,
        elevationFt: 2150
      }
    },
    aircraft: {
      registration: "PT-ONJ",
      model: "Beechcraft King Air C90A",
      manufacturer: "Beech Aircraft",
      serialNumber: "LJ-1078",
      aircraftCategory: "Avião"
    },
    operatorName: "PEC Táxi Aéreo",
    flightPhase: "Aproximação Final / Tráfego",
    fatalities: 5,
    injuries: 0,
    summary: "Colisão contra cabo para-raios de linha de transmissão de energia durante procedimento de aproximação visual para o aeródromo de Caratinga (SNCT).",
    investigationFindings: "Relatório Final CENIPA A-145/CENIPA/2021: O cabo não possuía sinalização obrigatória por estar fora da Zona de Proteção do Aeródromo, mas representava obstáculo com contraste desfavorável à visibilidade.",
    source: {
      slug: "cenipa",
      name: "Centro de Investigação e Prevenção de Acidentes Aeronáuticos",
      officialAgency: "Força Aérea Brasileira / SIPAER",
      recordIdentifier: "A-145/CENIPA/2021",
      reportUrl: "https://sistema.cenipa.fab.mil.br/relatorios/A-145-CENIPA-2021.pdf",
      publicationDate: "2023-05-15"
    },
    peopleInvolved: [
      {
        fullName: "Marília Dias Mendonça",
        role: "PUBLIC_FIGURE",
        publicSignificance: "Cantora e compositora brasileira",
        sourceReference: "Relatório Oficial CENIPA / Noticiário Oficial"
      },
      {
        fullName: "Geraldo Martins de Medeiros Júnior",
        role: "PILOT",
        sourceReference: "Relatório Oficial CENIPA"
      }
    ]
  },
  {
    id: "cenipa-2007-002",
    type: "ACCIDENT",
    visualTag: "HISTORICAL_MEMORY", // ⚪ Memória histórica
    verificationStatus: "FINAL_REPORT_CONFIRMED",
    date: "2007-07-17",
    time: "18:54",
    location: {
      description: "Aeroporto de Congonhas (SBSP), São Paulo, SP",
      city: "São Paulo",
      state: "SP",
      countryIso: "BRA",
      coordinates: {
        latitude: -23.6261,
        longitude: -46.6564,
        elevationFt: 2631
      }
    },
    aircraft: {
      registration: "PR-MBK",
      model: "Airbus A320-233",
      manufacturer: "Airbus",
      serialNumber: "0788",
      aircraftCategory: "Avião"
    },
    operatorName: "TAM Linhas Aéreas",
    flightPhase: "Pouso",
    fatalities: 199,
    injuries: 13,
    summary: "Excursão de pista na cabeceira 35L de Congonhas sob chuva e pista recém-recapeada sem grooving, colidindo com prédio de cargas da TAM Express.",
    investigationFindings: "Relatório Final CENIPA A-054/CENIPA/2007: Posicionamento assimétrico das manetes de empuxo durante pouso com reversor inoperante e condições meteorológicas adversas.",
    source: {
      slug: "cenipa",
      name: "Centro de Investigação e Prevenção de Acidentes Aeronáuticos",
      officialAgency: "Força Aérea Brasileira / SIPAER",
      recordIdentifier: "A-054/CENIPA/2007",
      reportUrl: "https://sistema.cenipa.fab.mil.br/relatorios/A-054-CENIPA-2007.pdf",
      publicationDate: "2009-11-20"
    }
  },
  {
    id: "ntsb-2009-001",
    type: "ACCIDENT",
    visualTag: "HISTORICAL_MEMORY", // ⚪ Memória histórica
    verificationStatus: "FINAL_REPORT_CONFIRMED",
    date: "2009-01-15",
    time: "15:31",
    location: {
      description: "Hudson River, New York City, NY",
      city: "New York",
      state: "NY",
      countryIso: "USA",
      coordinates: {
        latitude: 40.7695,
        longitude: -74.0076,
        elevationFt: 0
      }
    },
    aircraft: {
      registration: "N106US",
      model: "Airbus A320-214",
      manufacturer: "Airbus",
      serialNumber: "1044",
      aircraftCategory: "Avião"
    },
    operatorName: "US Airways (Flight 1549)",
    flightPhase: "Subida Inicial",
    fatalities: 0,
    injuries: 100,
    summary: "Pouso forçado no Rio Hudson após perda total de empuxo em ambos os motores devido à ingestão de bando de gansos-do-canadá logo após a decolagem do aeroporto LaGuardia (KLGA).",
    investigationFindings: "Relatório Final NTSB/AAR-10/03: Decisão impecável da tripulação e procedimento de valamento bem-sucedido.",
    source: {
      slug: "ntsb",
      name: "National Transportation Safety Board",
      officialAgency: "United States Federal Government",
      recordIdentifier: "DCA09MA026",
      reportUrl: "https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1003.pdf",
      publicationDate: "2010-05-04"
    },
    peopleInvolved: [
      {
        fullName: "Chesley 'Sully' Sullenberger",
        role: "PILOT",
        publicSignificance: "Comandante do Voo 1549",
        sourceReference: "Relatório Oficial NTSB"
      }
    ]
  },
  {
    id: "cenipa-recent-2024-001",
    type: "HAZARD_ALERT",
    visualTag: "RECENT_ALERT", // 🔴 Vermelho: Ocorrência recente / alerta ativo
    verificationStatus: "PRELIMINARY",
    date: "2024-08-09",
    time: "13:22",
    location: {
      description: "Vinhedo, SP - Bairro Capela",
      city: "Vinhedo",
      state: "SP",
      countryIso: "BRA",
      coordinates: {
        latitude: -23.0336,
        longitude: -46.9942,
        elevationFt: 2360
      }
    },
    aircraft: {
      registration: "PS-VPB",
      model: "ATR-72-500 (ATR 72-212A)",
      manufacturer: "ATR",
      serialNumber: "908",
      aircraftCategory: "Avião"
    },
    operatorName: "Voepass Linhas Aéreas (Voo 2283)",
    flightPhase: "Cruzeiro / Descida",
    fatalities: 62,
    injuries: 0,
    summary: "Perda de sustentação em voo com parafuso chato após entrada em zona de severa formação de gelo atmosférico (icing).",
    investigationFindings: "Relatório Preliminar CENIPA A-102/CENIPA/2024: A investigação técnica em andamento registrou degradação aerodinâmica e múltiplos acionamentos dos detectores de gelo.",
    source: {
      slug: "cenipa",
      name: "Centro de Investigação e Prevenção de Acidentes Aeronáuticos",
      officialAgency: "Força Aérea Brasileira / SIPAER",
      recordIdentifier: "A-102/CENIPA/2024",
      publicationDate: "2024-09-06"
    }
  }
];

export const HAZARDS_SEED: HazardObstacle[] = [
  {
    id: "haz-mg-001",
    type: "TRANSMISSION_LINE",
    status: "ACTIVE_EXISTING", // 🟠 Laranja
    description: "Linha de Distribuição 69kV da CEMIG com cabos suspensos sobre o vale de aproximação de Caratinga.",
    coordinates: {
      latitude: -19.8240,
      longitude: -42.1438,
      elevationFt: 2160
    },
    heightAglFt: 115,
    lightingType: "Sem balizamento noturno / Esferas de aviso instaladas posteriormente",
    sourceAgency: "CEMIG / SIPAER / Notificação de Segurança de Voo",
    verifiedAt: "2023-06-01"
  },
  {
    id: "haz-sp-002",
    type: "COMMUNICATION_TOWER",
    status: "ACTIVE_EXISTING",
    description: "Antena de Telecomunicação em topo de elevação próxima à Serra da Cantareira.",
    coordinates: {
      latitude: -23.4180,
      longitude: -46.6190,
      elevationFt: 3800
    },
    heightAglFt: 280,
    heightAmslFt: 4080,
    lightingType: "Luzes Estroboscópicas Vermelhas L-864",
    sourceAgency: "DECEA / Cartas IFR ROTAER",
    verifiedAt: "2024-01-10"
  }
];

