# MGA — Documentação de Limitações Técnicas: Flight Profile & Topografia

> **Status Operacional: Não certificado para navegação aérea ativa ou separação vertical de obstáculos.**
> **Finalidade estrita: Conscientização situacional preliminar e planejamento de inteligência.**

---

### 1. Parâmetros do Modelo Topográfico & Relevo
- **Fonte de Referência Altimétrica**: Modelo Digital de Terreno (SRTM 90m / ALOS World 3D) em áreas continentais e levantamentos batimétricos IHO para zonas costeiras.
- **Datum Vertical**: EGM96 (Earth Gravitational Model 1996) / MSL (Mean Sea Level).
- **Datum Horizontal**: WGS84 (EPSG:4326), calculado via algoritmos elipsoidais exatos Karney (*GeographicLib*).
- **Unidade de Medida de Altitude**: Pés (*feet* - ft) e Níveis de Voo (*Flight Levels* - FL) calibrados sob atmosfera padrão ICAO (ISA: 1013.25 hPa / 29.92 inHg).
- **Resolução Espacial**: Amostragem interpolada ao longo da linha geodésica Great Circle com pontos de controle a cada ~20 km.

---

### 2. Tratamento de Obstáculos Artificiais
- **Base de Alimentação**: FAA Digital Obstacle File (DOF), Cartas de Obstáculos de Aeródromo ICAO Tipo A/B e Notificações DECEA (ROTAER).
- **Natureza dos Obstáculos**: Linhas de transmissão de energia elétrica suspensas, torres estaiadas de telecomunicação, aerogeradores e antenas.
- **Atenção Crítica**: Obstáculos erguidos temporariamente (guindastes, obras civis, mastros não notificados) podem **não constar** nas bases públicas antes de emissão formal de NOTAM.

---

### 3. Limitações de Segurança Operacional Obrigatórias
1. **Não-Substituição de Procedimentos ATS/IFR**: O perfil vertical MGA **não calcula nem valida** Altitudes Mínimas de Setor (MSA), Altitudes Mínimas em Rota (MEA/MORA) ou gradientes mínimos de subida/aproximação frustrada (MAP).
2. **Separação de Tráfego e Relevo**: A tripulação em comando (PIC) deve cumprir obrigatoriamente as cartas oficiais publicadas pelo DECEA (Brasil), FAA (EUA) ou autoridade local do país sobrevoado.
3. **Condições Meteorológicas Reais**: O perfil exibe altitudes nominais barométricas ISA e não corrige altitudes por desvios de temperatura extrema (correção por frio), pressão atmosférica local (QNH) ou turbulência de montanha (*mountain waves*).

