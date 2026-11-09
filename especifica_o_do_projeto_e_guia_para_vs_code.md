# Valorant Manager (VCT Transfer & Tactical Simulator)

> **Documento de Arquitetura de Software & Requisitos do Produto (PRD)**
> **Versão:** 2.0 (Atualizado para expansão na Fase 2)
> **Target Environment:** Node.js, React 18+ (Vite), Tailwind CSS, Lucide React, Windows 10 (PowerShell)

## 1. Visão Geral do Produto

O **Valorant Manager** é um web app interativo de gestão futebolística/eSports aplicado ao cenário competitivo global de VALORANT (VCT). O projeto combina:

* **Football Manager:** Profundidade de contratos, orçamentos, recrutamento e scouting de talentos.

* **Braslol:** Interface ágil, navegação rápida e ciclos de simulação intuitivos.

* **ValorantSimulator.com:** Análise de confrontos diretos e simulação tática.

* **FIFA Ultimate Team:** Cartas visuais de atletas com atributos numéricos (1-99) destacados.

### 1.1 Estética Visual (UI/UX)

* **Tema:** Dark mode agressivo inspirado no cliente oficial do VALORANT.

* **Cores Principais:**

  * Primária/Highlight: Vermelho Valorant (`#ff4655`)

  * Fundo Principal: `#0f1923`

  * Painéis e Cards: `#111827` (Gray-900)

  * Bordas e Divisores: `#1f2937` / `#374151`

  * Texto Principal: `#ece8e1`

* **Tipografia:** Caixas altas (UPPERCASE) para títulos, fontes condensadas/sans-serif.

## 2. Perfil Padrão do Usuário (Head Coach / General Manager)

```
{
  "managerName": "Andreus Vinícius Araújo de Andrade",
  "originCity": "Wanel Ville",
  "coachLevel": 25,
  "overallRating": 82,
  "reputation": "National Prospect"
}

```

## 3. Regras de Negócio do VCT & Economia

### 3.1 Regras Oficiais Riot Games (Roster Rules)

1. **Trava de Importação (Import Rule):**

   * Cada escalação titular (5 jogadores ativos) só pode conter **no máximo 1 jogador importado** (nacionalidade de região diferente da liga da organização).

   * Se o usuário tentar escalar um 2º importado como titular, o sistema deve barrar a alteração e emitir um aviso: `[RULE VIOLATION] Maximum 1 Import Player allowed in Active Lineup`.

2. **Tamanho do Elenco:**

   * **Ativos (Starting 5):** Exatamente 5 jogadores.

   * **Reservas (Substitutes):** De 1 a 2 jogadores no banco.

3. **Composição Tática Obrigatória (Roles):**

   * Duelista (Duelist)

   * Iniciador (Initiator)

   * Controlador (Controller)

   * Sentinela (Sentinel)

   * Flex (Coringa / Quinta função livre)

### 3.2 Tiers Financeiros & Salary Caps (Orçamentos Anuais)

| Tier | Categoria | Budget Total (Cap Anual) | Exemplo de Franquias | Exemplo de Meta da Diretoria | 
| ----- | ----- | ----- | ----- | ----- | 
| **Tier S** | Gigantes Mundiais | US\$ 6.000.000 a US$ 8.500.000 | LOUD, Sentinels, FNATIC, EDG | Ser Campeão do Champions / Masters | 
| **Tier A** | Contendores Fortes | US\$ 3.000.000 a US$ 5.000.000 | Leviatán, NRG, Team Heretics, Gen.G | Chegar aos Playoffs Internacionais | 
| **Tier B** | Orçamento Enxuto | US\$ 1.000.000 a US$ 2.500.000 | MIBR, KRÜ, BBL Esports | Classificar para os Playoffs Locais | 
| **Tier C** | Tier 2 / Challenger | US\$ 400.000 a US$ 800.000 | Galorys, 2GAME, Apeks | Subir para a Liga Franquiada (Ascension) | 

## 4. Atributos dos Jogadores e Fórmulas do Sistema

### 4.1 Os 6 Pilares de Atributos (Notas de 1 a 99)

1. **MEC (Mecânica / Mira):** Precisão do tiro, Headshot %, velocidade de reação e poder de fogo puro.

2. **IQ (Game Sense / QI de Jogo):** Posicionamento, leitura de mapa, capacidade de vencer clutches.

3. **UTI (Utilidade):** Eficiência e precisão na execução de habilidades (bangs, smokes, traps).

4. **ENT (Entry / Agressividade):** Taxa de abertura de espaço e obtenção do First Blood.

5. **FLE (Flexibilidade):** Capacidade de manter o alto desempenho quando forçado a jogar fora da sua Role Principal (*Role Swap*).

6. **MEN (Mental / Comunicação):** Calma sob pressão, resiliência no retake e liderança.

### 4.2 Atributos Complementares (Perfil)

* **Role Principal:** `Duelist`, `Initiator`, `Controller`, `Sentinel`, `Flex`

* **Role Secundária:** Role alternativa onde o jogador rende bem sem grande penalidade.

* **IsIGL (Booleano):** Indica se o jogador exerce a função de In-Game Leader.

* **Region / Nationality:** `Americas (BR/NA/LATAM)`, `EMEA`, `Pacific`, `China`.

* **Potential (1-99):** Teto máximo de evolução. Jogadores jovens (< 20 anos) evoluem 3x mais rápido.

### 4.3 Fórmulas Lógicas do Engine

#### Formula 1: Cálculo de Overall Individual

```
// O Overall Base é a média ponderada com peso maior em MEC e IQ
BaseOverall = Math.round((MEC * 0.25) + (IQ * 0.25) + (UTI * 0.15) + (ENT * 0.15) + (FLE * 0.10) + (MEN * 0.10));

```

#### Formula 2: Penalidade de Role Swap

Se um jogador for escalado em uma Role diferente da sua Principal e Secundária:

```
// Quanto maior o atributo FLE (Flexibilidade), menor a penalidade sofrida
PenaltyMultiplier = (100 - FLE) * 0.003; // Exemplo: FLE 80 gera apenas 6% de perda
EffectiveOverall = Math.round(BaseOverall * (1 - PenaltyMultiplier));

```

#### Formula 3: Buff de IGL (Liderança)

Na escalação dos 5 titulares:

* Se houver pelo menos 1 jogador com a tag `IsIGL: true`, o time recebe um **Buff de Sinergia de +3 a +5 pontos** no atributo `MEN` coletivo durante simulações.

* Se a equipe jogar sem IGL, sofre uma **Penalidade de -5 no IQ Coletivo** em momentos de clutch.

#### Formula 4: Custo de Transferência (Market Value)

```
// O valor base de compra é calculado exponencialmente pelo Overall e corrigido pela Idade
BaseValue = Math.pow(BaseOverall, 3.2) * 12;
AgeFactor = Age < 21 ? 1.4 : (Age > 26 ? 0.75 : 1.0);
MarketValue = Math.round(BaseValue * AgeFactor);

```

## 5. Estrutura de Arquitetura do Código (React + Vite)

Abaixo está a árvore exata criada no projeto local:

```
valorant-manager/
 ┣ src/
 ┃ ┣ assets/              # Imagens e logos
 ┃ ┣ components/          # Componentes Reutilizáveis
 ┃ ┃ ┣ layout/            # Sidebar.jsx, Header.jsx
 ┃ ┃ ┣ ui/                # Button.jsx, Badge.jsx, Modal.jsx
 ┃ ┃ ┗ player/            # PlayerCard.jsx, PlayerRow.jsx, StatBar.jsx
 ┃ ┣ context/             # Gerenciamento de Estado Global
 ┃ ┃ ┗ GameContext.jsx    # Estado do Treinador, Org, Elenco, Mercado e Saldo
 ┃ ┣ data/                # Banco de Dados Mock
 ┃ ┃ ┣ players.json       # Lista de ~30 a 50 jogadores do cenário mundial
 ┃ ┃ ┗ teams.json         # Lista de organizações do VCT e Challengers
 ┃ ┣ pages/               # Telas da Aplicação
 ┃ ┃ ┣ SetupManager.jsx   # Tela 1: Registro do Treinador
 ┃ ┃ ┣ SelectOrg.jsx      # Tela 2: Propostas de Emprego
 ┃ ┃ ┣ Dashboard.jsx      # Tela 3: Painel Geral do Clube
 ┃ ┃ ┣ TransferMarket.jsx # Tela 4: Mercado de Transferências (Fase 2)
 ┃ ┃ ┗ SquadManagement.jsx# Tela 5: Montagem Tática do Elenco (Fase 3)
 ┃ ┣ utils/               # Funções Utilitárias e Fórmulas
 ┃ ┃ ┣ calculators.js     # Fórmulas de Overall, Role Swap e Preço
 ┃ ┃ ┗ formatters.js      # Formatação de Moedas e Status
 ┃ ┣ App.jsx              # Roteador Principal / Renderizador por Estado
 ┃ ┗ main.jsx             # Entry Point React
 ┣ package.json
 ┗ valorant-simulator-context.md

```

## 6. Esquema do Banco de Dados Mock (`src/data/players.json`)

Exemplo de estrutura JSON para popular a base de testes:

```
[
  {
    "id": "p1",
    "name": "Erick Santos",
    "nickname": "aspas",
    "age": 23,
    "nationality": "Brazil",
    "region": "Americas",
    "primaryRole": "Duelist",
    "secondaryRole": "Flex",
    "isIGL": false,
    "currentTeam": "Leviatán",
    "marketValue": 2800000,
    "salary": 450000,
    "stats": {
      "MEC": 98,
      "IQ": 92,
      "UTI": 85,
      "ENT": 97,
      "FLE": 88,
      "MEN": 90
    },
    "potential": 99
  },
  {
    "id": "p2",
    "name": "Matias Delipetro",
    "nickname": "Saadhak",
    "age": 27,
    "nationality": "Argentina",
    "region": "Americas",
    "primaryRole": "Flex",
    "secondaryRole": "Initiator",
    "isIGL": true,
    "currentTeam": "LOUD",
    "marketValue": 1900000,
    "salary": 380000,
    "stats": {
      "MEC": 84,
      "IQ": 96,
      "UTI": 92,
      "ENT": 78,
      "FLE": 95,
      "MEN": 98
    },
    "potential": 96
  },
  {
    "id": "p3",
    "name": "Tyson Ngo",
    "nickname": "TenZ",
    "age": 24,
    "nationality": "Canada",
    "region": "Americas",
    "primaryRole": "Controller",
    "secondaryRole": "Initiator",
    "isIGL": false,
    "currentTeam": "Sentinels",
    "marketValue": 2400000,
    "salary": 420000,
    "stats": {
      "MEC": 95,
      "IQ": 88,
      "UTI": 90,
      "ENT": 89,
      "FLE": 86,
      "MEN": 87
    },
    "potential": 96
  }
]

```

## 7. Roadmap Completo de Desenvolvimento

* \[x\] **Fase 1: Estrutura Base & Identidade do GM**

  * \[x\] Criação do Contexto Global (`GameContext.jsx`).

  * \[x\] Tela de Perfil do Treinador (`SetupManager.jsx`).

  * \[x\] Seleção de Franquia com cálculo de orçamentos e Tiers (`SelectOrg.jsx`).

  * \[x\] Painel de Boas-Vindas (`Dashboard.jsx`).

* \[x\] **Fase 2: Mercado de Transferências (CONCLUÍDO)**

  * \[x\] Tela `TransferMarket.jsx` com suporte a busca e filtros por Role, Região, Preço e Rating.

  * \[x\] Sistema de Contratação: Deduzir o `marketValue` do orçamento (`budget`) da organização.

  * \[x\] Sistema de Venda/Desligamento: Rescisão contratual ou listagem no mercado.

  * \[x\] Validação da Regra de 1 Import durante a negociação.

  * \[x\] Filtro rápido para "Free Agents" (jogadores sem clube).

* \[x\] **Fase 3: Montagem Tática & Gestão do Elenco (CONCLUÍDO)**

  * \[x\] Tela `SquadManagement.jsx` com visualização dos 5 Slots Titulares e 2 Reservas.

  * \[x\] Indicador de Validação Tática: Sinalizador se faltar Duelista, Controlador, Sentinela ou Iniciador.

  * \[x\] Mecânica de Drag-and-Drop ou Seleção por Slot para troca de posição.

  * \[x\] Cálculo automático de Overall do Time com bônus de IGL e perda por Role Swap.

* \[ \] **Fase 4: Motor de Simulação de Partidas e Progressão (PRÓXIMO OBJETIVO)**

  * \[ \] Algoritmo de simulação de confrontos no estilo ValorantSimulator.com.

  * \[ \] Evolução de estatísticas de jovens talentos após partidas simuladas.

* \[ \] **Fase 5: Polimento, UI e Deploy Automático**

  * \[ \] Animações de revelação de contratação estilo FIFA.

  * \[ \] Instruções para commit e Deploy na Vercel via GitHub.

## 8. Instruções Diretas para a IA do VS Code (Gemini / Copilot / Cursor)

Ao instruir a IA no VS Code para executar a **Fase 2**, utilize o seguinte prompt de comando:

> **Prompt para enviar no Chat do VS Code:**
> *"Por favor, leia o arquivo `valorant-simulator-context.md` completo. Com base nas especificações da Fase 2, crie os seguintes arquivos dentro do projeto:*
>
> 1. `src/utils/calculators.js` *(Com as funções de cálculo de Overall, Preço e Verificação da Regra de Import)*
>
> 2. `src/data/players.json` *(Preenchido com pelo menos 15 jogadores das regiões Americas, EMEA e Pacific)*
>
> 3. `src/pages/TransferMarket.jsx` *(A interface do mercado com tabela, cards, filtros por Role/Região/Preço, e botão de 'Comprar/Assinar')*
>
> 4. *Atualize o `src/context/GameContext.jsx` para suportar as ações `buyPlayer`, `sellPlayer` e atualização do saldo disponível.*
>
> *Siga estritamente o tema visual escuro (`#0f1923`, `#111827`, `#ff4655`) e garanta que o código esteja pronto para rodar no Vite sem erros de importação."*