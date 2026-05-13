const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GOAL_WIDTH = 120;
const GOAL_Y = (HEIGHT - GOAL_WIDTH) / 2;
const BALL_RADIUS = 8;
const PLAYER_RADIUS = 15;
const FPS = 60;
const MATCH_DURATION_SEC = 90;

// DOM Elements
const mainMenu = document.getElementById('main-menu');
const leagueView = document.getElementById('league-view');
const teamGrid = document.getElementById('team-grid');
const startLeagueBtn = document.getElementById('start-league-btn');
const continueLeagueBtn = document.getElementById('continue-league-btn');
const liveMatchesList = document.getElementById('live-matches-list');
const standingsBody = document.getElementById('standings-body');
const currentRoundText = document.getElementById('current-round-text');
const swatchA = document.getElementById('swatch-a');
const swatchB = document.getElementById('swatch-b');
const teamANameEl = document.getElementById('team-a-name');
const teamBNameEl = document.getElementById('team-b-name');

const scoreAEl = document.getElementById('score-a');
const scoreBEl = document.getElementById('score-b');
const timeEl = document.getElementById('match-time');
const periodEl = document.getElementById('match-period');
const overlay = document.getElementById('overlay');
const overlayMsgBox = document.getElementById('overlay-msg-box');
const overlayFormationBox = document.getElementById('overlay-formation-box');
const overlayTitle = document.getElementById('overlay-title');
const overlayBtnNext = document.getElementById('overlay-btn-next');
const overlayBtnPlay = document.getElementById('overlay-btn-play');

const teamEditModal = document.getElementById('team-edit-modal');
const editTeamName = document.getElementById('edit-team-name');
const editTeamOvr = document.getElementById('edit-team-ovr');
const preVal = document.getElementById('pre-val');
const finVal = document.getElementById('fin-val');
const spdVal = document.getElementById('spd-val');
const stmVal = document.getElementById('stm-val');

// Economy & History UI
const myFundsText = document.getElementById('my-funds-text');
const editMyFunds = document.getElementById('edit-my-funds');
const editWinRate = document.getElementById('edit-win-rate');
const editMatchHistory = document.getElementById('edit-match-history');

// Custom Team UI
const btnOpenCustomTeam = document.getElementById('btn-open-custom-team');
const customTeamModal = document.getElementById('custom-team-modal');
const customTeamName = document.getElementById('custom-team-name');
const customTeamColor = document.getElementById('custom-team-color');
const customTeamReplace = document.getElementById('custom-team-replace');
const btnSaveCustomTeam = document.getElementById('btn-save-custom-team');
const btnCancelCustomTeam = document.getElementById('btn-cancel-custom-team');

// Trophy Room UI
const btnOpenTrophyRoom = document.getElementById('btn-open-trophy-room');
const trophyRoomModal = document.getElementById('trophy-room-modal');
const btnCloseTrophyRoom = document.getElementById('btn-close-trophy-room');
const trophyTabA = document.getElementById('trophy-tab-a');
const trophyTabB = document.getElementById('trophy-tab-b');
const trophyTabC = document.getElementById('trophy-tab-c');
const trophyList = document.getElementById('trophy-list');
let currentTrophyTab = 'A';
let previousOverlayBoxTrophy = null;

// Export/Import UI
const btnExportSave = document.getElementById('btn-export-save');
const btnImportSave = document.getElementById('btn-import-save');
const importSaveInput = document.getElementById('import-save-input');

// Speed Toggle
const btnSpeedToggle = document.getElementById('btn-speed-toggle');
btnSpeedToggle.onclick = () => {
    gameSpeed = gameSpeed === 1 ? 2 : 1;
    btnSpeedToggle.querySelector('.speed-label').innerText = gameSpeed === 1 ? '1x' : '2x';
    btnSpeedToggle.classList.toggle('active', gameSpeed === 2);
};

// Formation UI
const defVal = document.getElementById('def-val');
const midVal = document.getElementById('mid-val');
const attVal = document.getElementById('att-val');
const fCount = document.getElementById('f-count');
const formationMatchText = document.getElementById('formation-match-text');

// Game State
const STATE = { MENU: -1, STARTING: 0, PLAYING: 1, GOAL_SCORED: 2, HALF_TIME: 3, MATCH_OVER: 4, PENALTY_SETUP: 5, PENALTY_EXECUTION: 6 };

let gameState = STATE.MENU;
let scoreA = 0;
let scoreB = 0;
let timeLeft = MATCH_DURATION_SEC;
let isInjuryTime = false;
let injuryTimeTotal = 0;
let currentHalf = 1;
let frameCount = 0;
let stateTimer = 0;
let gameSpeed = 1; // 1 = normal, 2 = fast forward

let myFunds = 0;
let availablePoints = 0;
let myMatchHistory = [];

// Serie A Teams
const SERIE_A_TEAMS = [
    { n: 'Athletico-PR', c: '#c8102e', d: '#000000', fin: 14, spd: 14, stm: 15, pre: 15, state: 'PR' },
    { n: 'Atlético-MG', c: '#000000', d: '#111111', fin: 16, spd: 15, stm: 16, pre: 16, state: 'MG' },
    { n: 'Bahia', c: '#0033a0', d: '#c8102e', fin: 15, spd: 14, stm: 14, pre: 15, state: 'BA' },
    { n: 'Botafogo', c: '#000000', d: '#111111', fin: 15, spd: 14, stm: 16, pre: 12, state: 'RJ' },
    { n: 'Chapecoense', c: '#006437', d: '#ffffff', fin: 8, spd: 9, stm: 10, pre: 8, state: 'SC' },
    { n: 'Corinthians', c: '#ffffff', d: '#000000', fin: 14, spd: 13, stm: 15, pre: 15, state: 'SP' },
    { n: 'Coritiba', c: '#005f33', d: '#ffffff', fin: 9, spd: 10, stm: 10, pre: 9, state: 'PR' },
    { n: 'Cruzeiro', c: '#0f3c83', d: '#0a2756', fin: 15, spd: 15, stm: 14, pre: 15, state: 'MG' },
    { n: 'Flamengo', c: '#c3281e', d: '#000000', fin: 19, spd: 18, stm: 17, pre: 18, state: 'RJ' },
    { n: 'Fluminense', c: '#8a1538', d: '#006a4e', fin: 15, spd: 14, stm: 13, pre: 14, state: 'RJ' },
    { n: 'Grêmio', c: '#0d80bf', d: '#000000', fin: 14, spd: 14, stm: 15, pre: 14, state: 'RS' },
    { n: 'Internacional', c: '#e5053a', d: '#a60026', fin: 15, spd: 15, stm: 16, pre: 15, state: 'RS' },
    { n: 'Mirassol', c: '#ffcc00', d: '#006437', fin: 10, spd: 11, stm: 11, pre: 10, state: 'SP' },
    { n: 'Palmeiras', c: '#006437', d: '#004a28', fin: 18, spd: 18, stm: 19, pre: 18, state: 'SP' },
    { n: 'RB Bragantino', c: '#ffffff', d: '#c8102e', fin: 14, spd: 16, stm: 16, pre: 15, state: 'SP' },
    { n: 'Remo', c: '#001a33', d: '#ffffff', fin: 7, spd: 8, stm: 9, pre: 7, state: 'PA' },
    { n: 'Santos', c: '#ffffff', d: '#000000', fin: 11, spd: 12, stm: 11, pre: 12, state: 'SP' },
    { n: 'São Paulo', c: '#ff0000', d: '#000000', fin: 16, spd: 15, stm: 16, pre: 16, state: 'SP' },
    { n: 'Vasco da Gama', c: '#000000', d: '#ffffff', fin: 13, spd: 14, stm: 13, pre: 14, state: 'RJ' },
    { n: 'Vitória', c: '#c61d23', d: '#000000', fin: 11, spd: 12, stm: 11, pre: 10, state: 'BA' }
];

const SERIE_B_TEAMS = [
    { n: 'América-MG', c: '#006437', d: '#000000', fin: 9, spd: 8, stm: 9, pre: 9, state: 'MG' },
    { n: 'Athletic-MG', c: '#000000', d: '#ffffff', fin: 6, spd: 7, stm: 7, pre: 6, state: 'MG' },
    { n: 'Atlético-GO', c: '#c8102e', d: '#000000', fin: 8, spd: 9, stm: 8, pre: 8, state: 'GO' },
    { n: 'Avaí', c: '#0055a4', d: '#ffffff', fin: 7, spd: 7, stm: 8, pre: 7, state: 'SC' },
    { n: 'Botafogo-SP', c: '#e5053a', d: '#ffffff', fin: 6, spd: 6, stm: 7, pre: 6, state: 'SP' },
    { n: 'Ceará', c: '#000000', d: '#ffffff', fin: 10, spd: 9, stm: 9, pre: 10, state: 'CE' },
    { n: 'CRB', c: '#c8102e', d: '#ffffff', fin: 7, spd: 8, stm: 8, pre: 7, state: 'AL' },
    { n: 'Criciúma', c: '#ffcc00', d: '#000000', fin: 9, spd: 8, stm: 9, pre: 9, state: 'SC' },
    { n: 'Fortaleza', c: '#0033a0', d: '#c8102e', fin: 11, spd: 11, stm: 10, pre: 11, state: 'CE' },
    { n: 'Goiás', c: '#006437', d: '#ffffff', fin: 9, spd: 9, stm: 9, pre: 9, state: 'GO' },
    { n: 'Juventude', c: '#006437', d: '#ffffff', fin: 8, spd: 8, stm: 9, pre: 8, state: 'RS' },
    { n: 'Londrina', c: '#00a0e3', d: '#ffffff', fin: 5, spd: 6, stm: 6, pre: 5, state: 'PR' },
    { n: 'Náutico', c: '#e5053a', d: '#ffffff', fin: 7, spd: 6, stm: 7, pre: 6, state: 'PE' },
    { n: 'Novorizontino', c: '#ffcc00', d: '#000000', fin: 8, spd: 8, stm: 9, pre: 8, state: 'SP' },
    { n: 'Operário', c: '#000000', d: '#ffffff', fin: 7, spd: 7, stm: 8, pre: 7, state: 'PR' },
    { n: 'Ponte Preta', c: '#000000', d: '#ffffff', fin: 8, spd: 8, stm: 7, pre: 8, state: 'SP' },
    { n: 'São Bernardo', c: '#ffcc00', d: '#000000', fin: 6, spd: 7, stm: 7, pre: 6, state: 'SP' },
    { n: 'Sport', c: '#c8102e', d: '#000000', fin: 10, spd: 9, stm: 10, pre: 10, state: 'PE' },
    { n: 'Vila Nova', c: '#e5053a', d: '#ffffff', fin: 7, spd: 8, stm: 8, pre: 7, state: 'GO' },
    { n: 'Cuiabá', c: '#006437', d: '#ffcc00', fin: 9, spd: 9, stm: 9, pre: 9, state: 'MT' }
];

const SERIE_C_TEAMS = [
    { n: 'Amazonas', c: '#ffcc00', d: '#000000', fin: 4, spd: 4, stm: 4, pre: 4, state: 'AM' },
    { n: 'Anápolis', c: '#000000', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'GO' },
    { n: 'Barra-SC', c: '#00a0e3', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'SC' },
    { n: 'Botafogo-PB', c: '#000000', d: '#ffffff', fin: 4, spd: 4, stm: 5, pre: 4, state: 'PB' },
    { n: 'Brusque', c: '#ffcc00', d: '#c8102e', fin: 4, spd: 5, stm: 4, pre: 4, state: 'SC' },
    { n: 'Caxias', c: '#8a1538', d: '#000000', fin: 3, spd: 4, stm: 4, pre: 3, state: 'RS' },
    { n: 'Confiança', c: '#0033a0', d: '#ffffff', fin: 3, spd: 3, stm: 4, pre: 3, state: 'SE' },
    { n: 'Ferroviária', c: '#8a1538', d: '#ffffff', fin: 4, spd: 4, stm: 4, pre: 4, state: 'SP' },
    { n: 'Figueirense', c: '#000000', d: '#ffffff', fin: 5, spd: 5, stm: 5, pre: 5, state: 'SC' },
    { n: 'Floresta', c: '#006437', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'CE' },
    { n: 'Guarani', c: '#006437', d: '#ffffff', fin: 5, spd: 4, stm: 5, pre: 5, state: 'SP' },
    { n: 'Inter de Limeira', c: '#000000', d: '#ffffff', fin: 3, spd: 4, stm: 3, pre: 3, state: 'SP' },
    { n: 'Itabaiana', c: '#0033a0', d: '#c8102e', fin: 2, spd: 2, stm: 3, pre: 2, state: 'SE' },
    { n: 'Ituano', c: '#e5053a', d: '#000000', fin: 4, spd: 5, stm: 4, pre: 4, state: 'SP' },
    { n: 'Maranhão', c: '#0033a0', d: '#c8102e', fin: 2, spd: 3, stm: 2, pre: 2, state: 'MA' },
    { n: 'Maringá', c: '#000000', d: '#ffffff', fin: 3, spd: 4, stm: 4, pre: 3, state: 'PR' },
    { n: 'Paysandu', c: '#00a0e3', d: '#ffffff', fin: 5, spd: 5, stm: 5, pre: 5, state: 'PA' },
    { n: 'Santa Cruz', c: '#c8102e', d: '#000000', fin: 5, spd: 4, stm: 5, pre: 5, state: 'PE' },
    { n: 'Volta Redonda', c: '#ffcc00', d: '#000000', fin: 4, spd: 4, stm: 4, pre: 4, state: 'RJ' },
    { n: 'Ypiranga-RS', c: '#ffcc00', d: '#006437', fin: 3, spd: 4, stm: 4, pre: 3, state: 'RS' }
];

// Estadual-only teams (don't play Brasileirão)
const ESTADUAL_TEAMS = [
    // RJ (need 3 more -> 8 total with 5 existing)
    { n: 'Bangu', c: '#c8102e', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'RJ' },
    { n: 'Madureira', c: '#ffcc00', d: '#006437', fin: 2, spd: 3, stm: 3, pre: 2, state: 'RJ' },
    { n: 'Nova Iguaçu', c: '#ff6600', d: '#000000', fin: 3, spd: 3, stm: 3, pre: 3, state: 'RJ' },
    // MG (need 4 more -> 8)
    { n: 'Tombense', c: '#c8102e', d: '#ffffff', fin: 3, spd: 3, stm: 4, pre: 3, state: 'MG' },
    { n: 'Uberlândia', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MG' },
    { n: 'Pouso Alegre', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MG' },
    { n: 'Villa Nova-MG', c: '#c8102e', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'MG' },
    // RS (need 3 more -> 8)
    { n: 'São José-RS', c: '#e5053a', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'RS' },
    { n: 'Brasil-Pel', c: '#c8102e', d: '#000000', fin: 3, spd: 3, stm: 3, pre: 3, state: 'RS' },
    { n: 'Pelotas', c: '#000000', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'RS' },
    // PR (need 3 more -> 8)
    { n: 'Cascavel', c: '#0033a0', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'PR' },
    { n: 'Cianorte', c: '#0055a4', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'PR' },
    { n: 'Paraná Clube', c: '#0033a0', d: '#c8102e', fin: 3, spd: 3, stm: 3, pre: 3, state: 'PR' },
    // SC (need 2 more -> 8)
    { n: 'Joinville', c: '#c8102e', d: '#000000', fin: 3, spd: 3, stm: 4, pre: 3, state: 'SC' },
    { n: 'Hercílio Luz', c: '#0055a4', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'SC' },
    // BA (need 6 more -> 8)
    { n: 'Atlético-BA', c: '#0033a0', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'BA' },
    { n: 'Barcelona-BA', c: '#ffcc00', d: '#c8102e', fin: 1, spd: 2, stm: 2, pre: 1, state: 'BA' },
    { n: 'Jacuipense', c: '#e5053a', d: '#000000', fin: 2, spd: 2, stm: 2, pre: 2, state: 'BA' },
    { n: 'Juazeirense', c: '#c8102e', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'BA' },
    { n: 'Jacobina', c: '#006437', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'BA' },
    { n: 'Jequié', c: '#c8102e', d: '#000000', fin: 1, spd: 1, stm: 2, pre: 1, state: 'BA' },
    // PE (need 5 more -> 8)
    { n: 'Retrô', c: '#ffcc00', d: '#000000', fin: 3, spd: 3, stm: 3, pre: 3, state: 'PE' },
    { n: 'Afogados', c: '#c8102e', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'PE' },
    { n: 'Central', c: '#000000', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'PE' },
    { n: 'Petrolina', c: '#0033a0', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'PE' },
    { n: 'Maguary', c: '#006437', d: '#ffffff', fin: 1, spd: 1, stm: 2, pre: 1, state: 'PE' },
    // CE (need 5 more -> 8)
    { n: 'Ferroviário-CE', c: '#c8102e', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'CE' },
    { n: 'Horizonte', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'CE' },
    { n: 'Iguatu', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'CE' },
    { n: 'Barbalha', c: '#c8102e', d: '#000000', fin: 1, spd: 1, stm: 2, pre: 1, state: 'CE' },
    { n: 'Tirol', c: '#ffffff', d: '#0033a0', fin: 1, spd: 2, stm: 2, pre: 1, state: 'CE' },
    // GO (need 4 more -> 8)
    { n: 'Aparecidense', c: '#000000', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'GO' },
    { n: 'Goianésia', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'GO' },
    { n: 'Goiânia', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'GO' },
    { n: 'Goiatuba', c: '#e5053a', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'GO' },
    // PA (need 6 more -> 8)
    { n: 'Tuna Luso', c: '#0033a0', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'PA' },
    { n: 'Castanhal', c: '#ffcc00', d: '#006437', fin: 2, spd: 3, stm: 3, pre: 2, state: 'PA' },
    { n: 'Cametá', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'PA' },
    { n: 'Águia', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'PA' },
    { n: 'Independente-PA', c: '#ffcc00', d: '#c8102e', fin: 1, spd: 2, stm: 2, pre: 1, state: 'PA' },
    { n: 'Bragantino-PA', c: '#ffffff', d: '#000000', fin: 1, spd: 2, stm: 2, pre: 1, state: 'PA' },
    // AL (need 7 more -> 8)
    { n: 'CSA', c: '#0033a0', d: '#ffffff', fin: 4, spd: 4, stm: 4, pre: 4, state: 'AL' },
    { n: 'ASA', c: '#000000', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'AL' },
    { n: 'Murici', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'AL' },
    { n: 'Coruripe', c: '#e5053a', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'AL' },
    { n: 'CSE', c: '#0033a0', d: '#c8102e', fin: 1, spd: 2, stm: 2, pre: 1, state: 'AL' },
    { n: 'Penedense', c: '#c8102e', d: '#ffffff', fin: 1, spd: 1, stm: 2, pre: 1, state: 'AL' },
    { n: 'Igaci', c: '#006437', d: '#000000', fin: 1, spd: 1, stm: 1, pre: 1, state: 'AL' },
    // MT (need 7 more -> 8)
    { n: 'Luverdense', c: '#006437', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'MT' },
    { n: 'Nova Mutum', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 3, pre: 2, state: 'MT' },
    { n: 'Operário-VG', c: '#000000', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MT' },
    { n: 'Mixto', c: '#ffcc00', d: '#000000', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MT' },
    { n: 'Sport Sinop', c: '#c8102e', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'MT' },
    { n: 'Primavera-MT', c: '#006437', d: '#ffffff', fin: 1, spd: 1, stm: 2, pre: 1, state: 'MT' },
    { n: 'União-MT', c: '#0033a0', d: '#ffffff', fin: 1, spd: 1, stm: 1, pre: 1, state: 'MT' },
    // PB (need 7 more -> 8)
    { n: 'Campinense', c: '#c8102e', d: '#ffffff', fin: 3, spd: 3, stm: 4, pre: 3, state: 'PB' },
    { n: 'Treze', c: '#000000', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'PB' },
    { n: 'Sousa', c: '#ffcc00', d: '#000000', fin: 2, spd: 2, stm: 2, pre: 2, state: 'PB' },
    { n: 'Auto Esporte-PB', c: '#c8102e', d: '#000000', fin: 1, spd: 2, stm: 2, pre: 1, state: 'PB' },
    { n: 'Nacional-PB', c: '#0033a0', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'PB' },
    { n: 'CSP', c: '#ffffff', d: '#0033a0', fin: 2, spd: 2, stm: 2, pre: 2, state: 'PB' },
    { n: 'Esporte-PB', c: '#e5053a', d: '#ffffff', fin: 1, spd: 1, stm: 2, pre: 1, state: 'PB' },
    // SE (need 6 more -> 8)
    { n: 'Lagarto-SE', c: '#006437', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'SE' },
    { n: 'Sergipe', c: '#c8102e', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'SE' },
    { n: 'Falcon', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'SE' },
    { n: 'Carmópolis', c: '#ffcc00', d: '#000000', fin: 1, spd: 2, stm: 2, pre: 1, state: 'SE' },
    { n: 'América-SE', c: '#c8102e', d: '#000000', fin: 1, spd: 1, stm: 2, pre: 1, state: 'SE' },
    { n: 'Barra-SE', c: '#0033a0', d: '#ffffff', fin: 1, spd: 1, stm: 1, pre: 1, state: 'SE' },
    // MA (need 7 more -> 8)
    { n: 'Sampaio Corrêa', c: '#006437', d: '#ffcc00', fin: 4, spd: 4, stm: 4, pre: 4, state: 'MA' },
    { n: 'Moto Club', c: '#c8102e', d: '#000000', fin: 3, spd: 3, stm: 3, pre: 3, state: 'MA' },
    { n: 'Imperatriz', c: '#006437', d: '#ffffff', fin: 2, spd: 3, stm: 3, pre: 2, state: 'MA' },
    { n: 'Pinheiro', c: '#0033a0', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MA' },
    { n: 'IAPE', c: '#000000', d: '#ffcc00', fin: 2, spd: 2, stm: 2, pre: 2, state: 'MA' },
    { n: 'Tuntum', c: '#006437', d: '#ffffff', fin: 1, spd: 1, stm: 2, pre: 1, state: 'MA' },
    { n: 'Real Codó', c: '#c8102e', d: '#ffffff', fin: 1, spd: 1, stm: 1, pre: 1, state: 'MA' },
    // AM (need 7 more -> 8)
    { n: 'Manaus FC', c: '#006437', d: '#ffcc00', fin: 4, spd: 4, stm: 4, pre: 4, state: 'AM' },
    { n: 'Nacional-AM', c: '#0033a0', d: '#ffffff', fin: 3, spd: 3, stm: 3, pre: 3, state: 'AM' },
    { n: 'Fast Clube', c: '#ffcc00', d: '#c8102e', fin: 2, spd: 3, stm: 3, pre: 2, state: 'AM' },
    { n: 'Manauara', c: '#0033a0', d: '#000000', fin: 2, spd: 2, stm: 2, pre: 2, state: 'AM' },
    { n: 'Princesa', c: '#006437', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'AM' },
    { n: 'Parintins', c: '#e5053a', d: '#ffffff', fin: 1, spd: 2, stm: 2, pre: 1, state: 'AM' },
    { n: 'São Raimundo-AM', c: '#006437', d: '#000000', fin: 1, spd: 1, stm: 1, pre: 1, state: 'AM' },
    // SP extra (need 2 more -> SP already has 14 but we need to ensure 8 per estadual; these complete 16 for selection)
    { n: 'Água Santa', c: '#ffffff', d: '#0033a0', fin: 3, spd: 3, stm: 3, pre: 3, state: 'SP' },
    { n: 'Velo Clube', c: '#c8102e', d: '#ffffff', fin: 2, spd: 2, stm: 2, pre: 2, state: 'SP' },
];

const STATE_NAMES = {
    SP: 'Paulistão', RJ: 'Carioca', MG: 'Mineiro', RS: 'Gaúcho',
    PR: 'Paranaense', SC: 'Catarinense', BA: 'Baiano', PE: 'Pernambucano',
    CE: 'Cearense', GO: 'Goiano', PA: 'Paraense', AL: 'Alagoano',
    MT: 'Mato-Grossense', PB: 'Paraibano', SE: 'Sergipano', MA: 'Maranhense',
    AM: 'Amazonense'
};

const ALL_STATES = Object.keys(STATE_NAMES);

let teams = [];
let scheduleA = [];
let scheduleB = [];
let scheduleC = [];
let currentSeason = 1;
let currentLeagueTab = 'A';
let myTeamId = -1;
let currentRound = 0;
let liveMatches = [];
let currentCanvasMatch = null;
let teamAConfig, teamBConfig;

// --- New Competition State ---
let calendar = [];
let currentWeek = 0;
let currentBrasRound = 0;
let estadualData = {};
let copaBrasil = null;

let myFormation = { def: 4, mid: 4, att: 2 };
let myAttitude = 'defensive';

// Pitch Friction Options
const PITCH_TYPES = ['perfect', 'normal', 'bad'];
const PITCH_SETTINGS = { 
    perfect: { type: 'perfect', friction: 0.995, playerForceMult: 1.0 }, 
    normal: { type: 'normal', friction: 0.985, playerForceMult: 1.2 }, 
    bad: { type: 'bad', friction: 0.96, playerForceMult: 1.5 } 
};
let currentPitch = PITCH_SETTINGS['normal'];
function getPitchSettings() { return currentPitch; }

// Math Utils
function distance(p1, p2) { return Math.hypot(p2.x - p1.x, p2.y - p1.y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

let globalNotifications = [];
let penaltyKicker = null;
let penaltyGK = null;

function addNotification(msg, color) {
    globalNotifications.push({ msg, color, timer: 180 });
}

function triggerFoul(p1, p2) {
    if (gameState !== STATE.PLAYING) return;
    
    let aggressor = Math.hypot(p1.vx, p1.vy) > Math.hypot(p2.vx, p2.vy) ? p1 : p2;
    
    aggressor.cards++;
    if (aggressor.cards >= 2) {
        addNotification(`CARTÃO VERMELHO!`, '#ef4444');
        players = players.filter(p => p !== aggressor);
    } else {
        addNotification(`CARTÃO AMARELO!`, '#eab308');
    }
    
    let inBoxLeft = aggressor.x < 150 && aggressor.y > HEIGHT/2 - 150 && aggressor.y < HEIGHT/2 + 150;
    let inBoxRight = aggressor.x > WIDTH - 150 && aggressor.y > HEIGHT/2 - 150 && aggressor.y < HEIGHT/2 + 150;
    
    if (aggressor.team === 0 && inBoxLeft) { setupPenalty(1); }
    else if (aggressor.team === 1 && inBoxRight) { setupPenalty(0); }
}

function setupPenalty(shootingTeam) {
    gameState = STATE.PENALTY_SETUP;
    stateTimer = 60; 
    addNotification("PÊNALTI!", "#3b82f6");
    
    ball.vx = 0; ball.vy = 0;
    players.forEach(p => { p.vx = 0; p.vy = 0; p.cooldown = 0; });
    
    penaltyKicker = players.find(p => p.team === shootingTeam && p.role !== 'GK');
    if (!penaltyKicker) penaltyKicker = players.find(p => p.team === shootingTeam);
    penaltyGK = players.find(p => p.team !== shootingTeam && p.role === 'GK');
    
    let goalX = shootingTeam === 0 ? WIDTH : 0;
    let spotX = shootingTeam === 0 ? WIDTH - 110 : 110;
    
    ball.x = spotX; ball.y = HEIGHT / 2;
    penaltyKicker.x = shootingTeam === 0 ? spotX - 30 : spotX + 30;
    penaltyKicker.y = HEIGHT / 2;
    
    if (penaltyGK) {
        penaltyGK.x = goalX === 0 ? 15 : WIDTH - 15;
        penaltyGK.y = HEIGHT / 2;
    }
    
    players.forEach((p, i) => {
        if (p !== penaltyKicker && p !== penaltyGK) {
            p.x = WIDTH / 2 + (i * 5 - 25);
            p.y = p.team === 0 ? HEIGHT / 2 - 120 : HEIGHT / 2 + 120;
        }
    });
}

// --- League & Save System ---

function loadSavedData() {
    const saved = localStorage.getItem('botao_league_save');
    if (saved) {
        continueLeagueBtn.classList.remove('hidden');
    }
}

function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function saveGame() {
    const data = {
        version: 2,
        teams, scheduleA, scheduleB, scheduleC,
        calendar, currentWeek, currentBrasRound, currentRound,
        estadualData, copaBrasil,
        myTeamId, currentSeason,
        myFormation, myAttitude, myFunds, availablePoints, myMatchHistory
    };
    localStorage.setItem('botao_league_save', JSON.stringify(data));
}

function generateRoundRobin(leagueTeams) {
    let sch = [];
    let n = leagueTeams.length;
    let rounds = n - 1;
    let tIds = leagueTeams.map(t => t.id);
    let firstTeamId = tIds.shift();

    for (let r = 0; r < rounds; r++) {
        let roundMatches = [];
        let t1 = tIds[r % rounds];
        
        if (r % 2 === 0) roundMatches.push({ a: firstTeamId, b: t1, scoreA: 0, scoreB: 0, finished: false });
        else roundMatches.push({ a: t1, b: firstTeamId, scoreA: 0, scoreB: 0, finished: false });

        for (let i = 1; i < n / 2; i++) {
            let pA = tIds[(r + i) % rounds];
            let pB = tIds[(r + rounds - i) % rounds];
            roundMatches.push({ a: pA, b: pB, scoreA: 0, scoreB: 0, finished: false });
        }
        sch.push(roundMatches);
    }
    
    let secondHalf = sch.map(round => round.map(m => ({ a: m.b, b: m.a, scoreA: 0, scoreB: 0, finished: false })));
    return sch.concat(secondHalf);
}

function generateSingleRoundRobin(teamIds) {
    let sch = [];
    let n = teamIds.length;
    let rounds = n - 1;
    let ids = [...teamIds];
    let first = ids.shift();
    for (let r = 0; r < rounds; r++) {
        let roundMatches = [];
        let t1 = ids[r % rounds];
        if (r % 2 === 0) roundMatches.push({ a: first, b: t1, scoreA: 0, scoreB: 0, finished: false });
        else roundMatches.push({ a: t1, b: first, scoreA: 0, scoreB: 0, finished: false });
        for (let i = 1; i < n / 2; i++) {
            let pA = ids[(r + i) % rounds];
            let pB = ids[(r + rounds - i) % rounds];
            roundMatches.push({ a: pA, b: pB, scoreA: 0, scoreB: 0, finished: false });
        }
        sch.push(roundMatches);
    }
    return sch;
}

// --- Estadual Generation ---
function generateEstadual(stateCode) {
    let stateTeams = teams.filter(t => t.state === stateCode);
    // Sort by overall descending, pick top 8
    stateTeams.sort((a, b) => (b.fin + b.spd + b.stm + b.pre) - (a.fin + a.spd + a.stm + a.pre));
    stateTeams = stateTeams.slice(0, 8);
    // Shuffle
    for (let i = stateTeams.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [stateTeams[i], stateTeams[j]] = [stateTeams[j], stateTeams[i]]; }
    
    let groupA = stateTeams.slice(0, 4).map(t => t.id);
    let groupB = stateTeams.slice(4, 8).map(t => t.id);
    
    let scheduleGA = generateSingleRoundRobin(groupA); // 3 rounds
    let scheduleGB = generateSingleRoundRobin(groupB); // 3 rounds
    
    // Merge schedules: each round has matches from both groups
    let schedule = [];
    for (let r = 0; r < 3; r++) {
        schedule.push([...scheduleGA[r], ...scheduleGB[r]]);
    }
    
    return {
        teams: stateTeams.map(t => t.id),
        groups: { A: groupA, B: groupB },
        schedule: schedule,
        final: null, // { a, b, scoreA, scoreB, finished }
        champion: null,
        standings: {}
    };
}

function getEstadualGroupStandings(groupIds, schedule) {
    let st = {};
    groupIds.forEach(id => { st[id] = { pts: 0, gd: 0, gf: 0 }; });
    schedule.forEach(round => {
        round.forEach(m => {
            if (!m.finished) return;
            if (!groupIds.includes(m.a)) return;
            st[m.a].gf += m.scoreA; st[m.a].gd += m.scoreA - m.scoreB;
            st[m.b].gf += m.scoreB; st[m.b].gd += m.scoreB - m.scoreA;
            if (m.scoreA > m.scoreB) { st[m.a].pts += 3; }
            else if (m.scoreB > m.scoreA) { st[m.b].pts += 3; }
            else { st[m.a].pts += 1; st[m.b].pts += 1; }
        });
    });
    let sorted = groupIds.slice().sort((a, b) => {
        if (st[b].pts !== st[a].pts) return st[b].pts - st[a].pts;
        if (st[b].gd !== st[a].gd) return st[b].gd - st[a].gd;
        return st[b].gf - st[a].gf;
    });
    return sorted;
}

// --- Copa do Brasil Generation ---
function generateCopaBrasil() {
    // 20 Série A teams + up to 12 estadual champions
    let qualified = teams.filter(t => t.league === 'A').map(t => t.id);
    
    // Add estadual champions (non-Série-A only)
    ALL_STATES.forEach(st => {
        if (estadualData[st] && estadualData[st].champion != null) {
            let champId = estadualData[st].champion;
            if (!qualified.includes(champId)) {
                qualified.push(champId);
            }
        }
    });
    
    // If less than 32, add top Série B teams
    if (qualified.length < 32) {
        let serieB = teams.filter(t => t.league === 'B' && !qualified.includes(t.id))
            .sort((a, b) => (b.fin + b.spd + b.stm + b.pre) - (a.fin + a.spd + a.stm + a.pre));
        for (let i = 0; i < serieB.length && qualified.length < 32; i++) {
            qualified.push(serieB[i].id);
        }
    }
    
    // If still less than 32, add Série C teams
    if (qualified.length < 32) {
        let serieC = teams.filter(t => t.league === 'C' && !qualified.includes(t.id))
            .sort((a, b) => (b.fin + b.spd + b.stm + b.pre) - (a.fin + a.spd + a.stm + a.pre));
        for (let i = 0; i < serieC.length && qualified.length < 32; i++) {
            qualified.push(serieC[i].id);
        }
    }
    
    // Shuffle qualified
    for (let i = qualified.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [qualified[i], qualified[j]] = [qualified[j], qualified[i]]; }
    
    // Build first phase matchups (ida + volta)
    let phase0 = [];
    for (let i = 0; i < qualified.length; i += 2) {
        phase0.push({
            team1: qualified[i], team2: qualified[i + 1],
            leg1: { a: qualified[i], b: qualified[i + 1], scoreA: 0, scoreB: 0, finished: false },
            leg2: { a: qualified[i + 1], b: qualified[i], scoreA: 0, scoreB: 0, finished: false },
            winner: null
        });
    }
    
    copaBrasil = {
        qualified: qualified,
        phases: [phase0],
        currentPhase: 0,
        champion: null
    };
}

function advanceCopaPhase() {
    let phase = copaBrasil.phases[copaBrasil.currentPhase];
    let winners = [];
    phase.forEach(matchup => {
        let agg1 = matchup.leg1.scoreA + matchup.leg2.scoreB;
        let agg2 = matchup.leg1.scoreB + matchup.leg2.scoreA;
        if (agg1 > agg2) matchup.winner = matchup.team1;
        else if (agg2 > agg1) matchup.winner = matchup.team2;
        else {
            // Away goals
            let away1 = matchup.leg2.scoreB; // team1 away goals
            let away2 = matchup.leg1.scoreB; // team2 away goals
            if (away1 > away2) matchup.winner = matchup.team1;
            else if (away2 > away1) matchup.winner = matchup.team2;
            else matchup.winner = Math.random() < 0.5 ? matchup.team1 : matchup.team2; // Pênaltis
        }
        winners.push(matchup.winner);
    });
    
    if (winners.length === 1) {
        copaBrasil.champion = winners[0];
        if (!copaBrasil.titleAwarded) {
            let champTeam = teams.find(t => t.id === winners[0]);
            if (champTeam) {
                champTeam.titlesCopa = (champTeam.titlesCopa || 0) + 1;
            }
            copaBrasil.titleAwarded = true;
        }
        return;
    }
    
    // Build next phase
    let nextPhase = [];
    for (let i = 0; i < winners.length; i += 2) {
        nextPhase.push({
            team1: winners[i], team2: winners[i + 1],
            leg1: { a: winners[i], b: winners[i + 1], scoreA: 0, scoreB: 0, finished: false },
            leg2: { a: winners[i + 1], b: winners[i], scoreA: 0, scoreB: 0, finished: false },
            winner: null
        });
    }
    copaBrasil.phases.push(nextPhase);
    copaBrasil.currentPhase++;
}

// --- Calendar Builder ---
function buildCalendar() {
    calendar = [];
    let week = 0;
    
    // Weeks 0-2: Estadual group stage (3 rounds)
    for (let r = 0; r < 3; r++) {
        calendar.push({ week: week++, type: 'estadual_group', estadualRound: r });
    }
    // Week 3: Estadual final
    calendar.push({ week: week++, type: 'estadual_final' });
    
    // Brasileirão + Copa do Brasil interleaved
    // Copa phases at specific intervals (ida + volta pairs)
    // 5 phases - 2 legs = 10 copa weeks + 38 brasileirão weeks = 48 weeks
    let brasRound = 0;
    let copaPhase = 0;
    // Pattern: 5 bras, then [copa ida, copa volta, 6 bras] - 4, then copa ida, copa volta, 8 bras
    let copaInsertAfterBras = [5, 11, 17, 23, 29]; // After these many brasileirão rounds, insert copa
    
    while (brasRound < 38 || copaPhase < 5) {
        if (copaPhase < 5 && copaInsertAfterBras.includes(brasRound)) {
            calendar.push({ week: week++, type: 'copa_br', copaPhase: copaPhase, copaLeg: 'ida' });
            calendar.push({ week: week++, type: 'copa_br', copaPhase: copaPhase, copaLeg: 'volta' });
            copaPhase++;
        } else if (brasRound < 38) {
            calendar.push({ week: week++, type: 'brasileirao', brasRound: brasRound });
            brasRound++;
        }
    }
}

function buildSeason() {
    // Generate estaduais for all states
    estadualData = {};
    ALL_STATES.forEach(st => {
        let stateTeamCount = teams.filter(t => t.state === st).length;
        if (stateTeamCount >= 4) {
            estadualData[st] = generateEstadual(st);
        }
    });
    
    // Brasileirão schedules
    scheduleA = generateRoundRobin(teams.filter(t => t.league === 'A'));
    scheduleB = generateRoundRobin(teams.filter(t => t.league === 'B'));
    scheduleC = generateRoundRobin(teams.filter(t => t.league === 'C'));
    
    // Copa do Brasil will be generated after estaduais finish (week 4)
    copaBrasil = null;
    
    // Build the calendar
    buildCalendar();
    currentWeek = 0;
    currentBrasRound = 0;
    currentRound = 0;
}

function initLeagueMenu() {
    teams = [];
    SERIE_A_TEAMS.forEach((c, i) => {
        teams.push({
            id: i, name: c.n, color: c.c, colorDark: c.d, league: 'A', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0, estadualTitles: 0, titlesCopa: 0
        });
    });
    SERIE_B_TEAMS.forEach((c, i) => {
        teams.push({
            id: i + 20, name: c.n, color: c.c, colorDark: c.d, league: 'B', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0, estadualTitles: 0, titlesCopa: 0
        });
    });

    SERIE_C_TEAMS.forEach((c, i) => {
        teams.push({
            id: i + 40, name: c.n, color: c.c, colorDark: c.d, league: 'C', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0, estadualTitles: 0, titlesCopa: 0
        });
    });

    // Estadual-only teams
    ESTADUAL_TEAMS.forEach((c, i) => {
        teams.push({
            id: i + 100, name: c.n, color: c.c, colorDark: c.d, league: null, state: c.state,
            estadualOnly: true,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0, estadualTitles: 0, titlesCopa: 0
        });
    });

    const gridA = document.getElementById('team-grid-a');
    gridA.innerHTML = '';
    
    // Helper to render team card
    const renderTeamCard = (t, container) => {
        const div = document.createElement('div');
        div.className = 'team-card' + (myTeamId === t.id ? ' selected' : '');
        div.innerHTML = `<div class="team-card-color" style="background: ${t.color}"></div><span class="team-card-name">${t.name}</span><span style="font-size:10px; color:#a1a1aa;">${t.state}</span>`;
        div.onclick = () => {
            document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
            div.classList.add('selected');
            myTeamId = t.id;
            
            // Auto switch league tab based on selected team
            currentLeagueTab = t.league;
            document.getElementById('tab-serie-a').style.opacity = currentLeagueTab === 'A' ? '1' : '0.5';
            document.getElementById('tab-serie-b').style.opacity = currentLeagueTab === 'B' ? '1' : '0.5';
            document.getElementById('tab-serie-c').style.opacity = currentLeagueTab === 'C' ? '1' : '0.5';
            
            startLeagueBtn.classList.remove('hidden');
        };
        container.appendChild(div);
    };

    teams.filter(t => t.league === 'A').forEach(t => renderTeamCard(t, gridA));

    // Setup Search Bar
    const searchInput = document.getElementById('team-search');
    const searchResultsGrid = document.getElementById('search-results-grid');
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        searchResultsGrid.innerHTML = '';
        
        if (term.length > 0) {
            searchResultsGrid.classList.remove('hidden');
            let results = teams.filter(t => !t.estadualOnly && (t.name.toLowerCase().includes(term) || t.state.toLowerCase() === term));
            results.forEach(t => renderTeamCard(t, searchResultsGrid));
            
            if (results.length === 0) {
                searchResultsGrid.innerHTML = '<div style="color: #a1a1aa; width: 100%; text-align: center; padding: 20px;">Nenhum time encontrado.</div>';
            }
        } else {
            searchResultsGrid.classList.add('hidden');
            // If they clear the search, and had a selected team from B or C, we should probably keep it selected in memory
            // Re-render A grid just to reflect selection if it was an A team
            gridA.innerHTML = '';
            teams.filter(t => t.league === 'A').forEach(t => renderTeamCard(t, gridA));
        }
    });

    loadSavedData();
}

btnOpenCustomTeam.onclick = () => {
    customTeamModal.classList.remove('hidden');
    customTeamReplace.innerHTML = '';
    SERIE_C_TEAMS.forEach((c, i) => {
        let opt = document.createElement('option');
        opt.value = i + 40; 
        opt.innerText = c.n;
        customTeamReplace.appendChild(opt);
    });
};

btnCancelCustomTeam.onclick = () => {
    customTeamModal.classList.add('hidden');
};

btnSaveCustomTeam.onclick = () => {
    const tName = customTeamName.value.trim() || 'Custom FC';
    const tColor = customTeamColor.value;
    const tState = document.getElementById('custom-team-state').value;
    const tReplaceId = parseInt(customTeamReplace.value);
    
    let t = teams.find(x => x.id === tReplaceId);
    if (t) {
        t.name = tName;
        t.color = tColor;
        t.state = tState;
        t.fin = 0; t.spd = 0; t.stm = 0; t.pre = 0;
        t.titlesA = 0; t.titlesB = 0; t.titlesC = 0; t.estadualTitles = 0; t.titlesCopa = 0;
        
        // Triggers the search logic to refresh the grid if it was open
        document.getElementById('team-search').dispatchEvent(new Event('input'));
        
        myTeamId = tReplaceId;
        currentLeagueTab = 'C';
        document.getElementById('tab-serie-a').style.opacity = '0.5';
        document.getElementById('tab-serie-b').style.opacity = '0.5';
        document.getElementById('tab-serie-c').style.opacity = '1';
        startLeagueBtn.classList.remove('hidden');
    }
    
    customTeamModal.classList.add('hidden');
};

startLeagueBtn.onclick = () => {
    localStorage.removeItem('botao_league_save');
    myFunds = 0;
    availablePoints = 0;
    myMatchHistory = [];
    myFundsText.innerText = formatCurrency(myFunds);
    
    mainMenu.classList.add('hidden');
    leagueView.classList.remove('hidden');
    buildSeason();
    saveGame();
    prepareWeek();
};

continueLeagueBtn.onclick = () => {
    const saved = JSON.parse(localStorage.getItem('botao_league_save'));
    if (!saved.version || saved.version < 2) {
        alert('Save incompatível com a nova versão. Inicie um novo campeonato.');
        return;
    }
    teams = saved.teams;
    scheduleA = saved.scheduleA;
    scheduleB = saved.scheduleB;
    scheduleC = saved.scheduleC;
    calendar = saved.calendar || [];
    currentWeek = saved.currentWeek || 0;
    currentBrasRound = saved.currentBrasRound || 0;
    currentRound = saved.currentRound || 0;
    estadualData = saved.estadualData || {};
    copaBrasil = saved.copaBrasil || null;
    myTeamId = saved.myTeamId;
    currentSeason = saved.currentSeason || 1;
    if (saved.myFormation) myFormation = saved.myFormation;
    if (saved.myAttitude) myAttitude = saved.myAttitude;
    myFunds = saved.myFunds || 0;
    availablePoints = saved.availablePoints || 0;
    myMatchHistory = saved.myMatchHistory || [];
    myFundsText.innerText = formatCurrency(myFunds);
    
    let myTeam = teams.find(t => t.id === myTeamId);
    if (myTeam && myTeam.league) {
        currentLeagueTab = myTeam.league;
        document.getElementById('tab-serie-a').style.opacity = currentLeagueTab === 'A' ? '1' : '0.5';
        document.getElementById('tab-serie-b').style.opacity = currentLeagueTab === 'B' ? '1' : '0.5';
        document.getElementById('tab-serie-c').style.opacity = currentLeagueTab === 'C' ? '1' : '0.5';
    }
    
    mainMenu.classList.add('hidden');
    leagueView.classList.remove('hidden');
    prepareWeek();
};

// --- Team Editor ---
let editingTeamId = null;
let previousOverlayBox = null;

function getAttributeCost(val) {
    if (val < 15) {
        // Base 100k to 1M at level 15
        return 100000 * Math.pow(1.212, val);
    } else {
        // From level 15 upwards, scales much harder
        return 1000000 * Math.pow(1.415, val - 15);
    }
}

function updateEditorUI() {
    let t = teams.find(x => x.id === editingTeamId);
    finVal.innerText = t.fin; spdVal.innerText = t.spd; stmVal.innerText = t.stm; preVal.innerText = t.pre;
    let ovr = t.fin + t.spd + t.stm + t.pre;
    editTeamOvr.innerText = ovr;
    
    let isMyTeam = (editingTeamId === myTeamId);
    
    document.getElementById('edit-club-info').style.display = isMyTeam ? 'block' : 'none';
    
    const btns = document.querySelectorAll('#team-edit-modal .btn-small');
    btns.forEach(b => b.style.display = isMyTeam ? 'inline-block' : 'none');
    
    if (isMyTeam) {
        editMyFunds.innerText = formatCurrency(myFunds);
        let winRate = t.pld > 0 ? (t.w / t.pld) * 100 : 0;
        editWinRate.innerText = `${winRate.toFixed(1)}%`;
        
        let preCost = getAttributeCost(t.pre);
        let finCost = getAttributeCost(t.fin);
        let spdCost = getAttributeCost(t.spd);
        let stmCost = getAttributeCost(t.stm);
        
        document.getElementById('pre-cost').innerText = t.pre >= 25 ? 'MAX' : `R$ ${formatCurrency(preCost)}`;
        document.getElementById('fin-cost').innerText = t.fin >= 25 ? 'MAX' : `R$ ${formatCurrency(finCost)}`;
        document.getElementById('spd-cost').innerText = t.spd >= 25 ? 'MAX' : `R$ ${formatCurrency(spdCost)}`;
        document.getElementById('stm-cost').innerText = t.stm >= 25 ? 'MAX' : `R$ ${formatCurrency(stmCost)}`;
        
        document.getElementById('pre-cost').style.color = t.pre >= 25 ? '#a855f7' : (myFunds >= preCost ? '#22c55e' : '#ef4444');
        document.getElementById('fin-cost').style.color = t.fin >= 25 ? '#a855f7' : (myFunds >= finCost ? '#22c55e' : '#ef4444');
        document.getElementById('spd-cost').style.color = t.spd >= 25 ? '#a855f7' : (myFunds >= spdCost ? '#22c55e' : '#ef4444');
        document.getElementById('stm-cost').style.color = t.stm >= 25 ? '#a855f7' : (myFunds >= stmCost ? '#22c55e' : '#ef4444');
        
        editMatchHistory.innerHTML = myMatchHistory.length > 0 
            ? myMatchHistory.map(h => `<div style="padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${h.isWin ? '#22c55e' : (h.isDraw ? '#a1a1aa' : '#ef4444')}">vs <span style="color: ${h.oppColor}">${h.oppName}</span> (${h.scoreA}-${h.scoreB})</div>`).slice(-10).reverse().join('')
            : '<div style="color: #a1a1aa; text-align: center;">Nenhuma partida jogada ainda.</div>';
    } else {
        document.getElementById('pre-cost').innerText = '';
        document.getElementById('fin-cost').innerText = '';
        document.getElementById('spd-cost').innerText = '';
        document.getElementById('stm-cost').innerText = '';
    }
}

function adjustStat(stat, delta) {
    if (editingTeamId !== myTeamId) return;
    let t = teams.find(x => x.id === editingTeamId);
    
    if (delta > 0) {
        if (t[stat] >= 25) return;
        let cost = getAttributeCost(t[stat]);
        if (myFunds >= cost) {
            myFunds -= cost;
            t[stat]++;
        } else {
            return;
        }
    } else {
        if (t[stat] <= 0) return;
        let refund = getAttributeCost(t[stat] - 1);
        myFunds += refund;
        t[stat]--;
    }
    updateEditorUI();
    myFundsText.innerText = formatCurrency(myFunds);
}

document.getElementById('fin-minus').onclick = () => adjustStat('fin', -1);
document.getElementById('fin-plus').onclick = () => adjustStat('fin', 1);
document.getElementById('spd-minus').onclick = () => adjustStat('spd', -1);
document.getElementById('spd-plus').onclick = () => adjustStat('spd', 1);
document.getElementById('stm-minus').onclick = () => adjustStat('stm', -1);
document.getElementById('stm-plus').onclick = () => adjustStat('stm', 1);
document.getElementById('pre-minus').onclick = () => adjustStat('pre', -1);
document.getElementById('pre-plus').onclick = () => adjustStat('pre', 1);

document.getElementById('edit-team-save').onclick = () => {
    saveGame();
    teamEditModal.classList.add('hidden');
    
    if (previousOverlayBox) {
        previousOverlayBox.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
};

const COPA_PHASE_NAMES = ['Primeira Fase', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];
const ESTADUAL_ROUND_NAMES = { 0: 'Rodada 1', 1: 'Rodada 2', 2: 'Rodada 3' };

function getCompTagColor(type) {
    if (type === 'estadual_group' || type === 'estadual_final') return '#f97316';
    if (type === 'copa_br') return '#22c55e';
    if (type === 'brasileirao') return '#a855f7';
    return '#6b7280';
}
function getCompName(entry) {
    if (!entry) return 'Treino';
    let myTeam = teams.find(t => t.id === myTeamId);
    if (entry.type === 'estadual_group') {
        let baseName = STATE_NAMES[myTeam ? myTeam.state : ''] || 'Estadual';
        return baseName + ' - ' + (ESTADUAL_ROUND_NAMES[entry.estadualRound] || 'Fase');
    }
    if (entry.type === 'estadual_final') return (STATE_NAMES[myTeam ? myTeam.state : ''] || 'Estadual') + ' - Final';
    if (entry.type === 'copa_br') return 'Copa BR - ' + (COPA_PHASE_NAMES[entry.copaPhase] || 'Fase ' + (entry.copaPhase + 1));
    if (entry.type === 'brasileirao') return 'Brasileirão';
    return 'Treino';
}
function simulateMatchResult(m) {
    let tA = teams.find(t => t.id === m.a);
    let tB = teams.find(t => t.id === m.b);
    let ovrA = (tA ? tA.fin + tA.spd + tA.stm + tA.pre : 0) + 10;
    let ovrB = (tB ? tB.fin + tB.spd + tB.stm + tB.pre : 0) + 10;
    let chanceA = ovrA / (ovrA + ovrB);
    let goals = 2 + Math.floor(Math.random() * 4);
    m.scoreA = 0; m.scoreB = 0;
    for (let i = 0; i < goals; i++) { if (Math.random() < chanceA) m.scoreA++; else m.scoreB++; }
    m.finished = true;
}
function getMyMatchForWeek(calEntry) {
    let myTeam = teams.find(t => t.id === myTeamId);
    if (!myTeam) return null;
    if (calEntry.type === 'estadual_group') {
        let est = estadualData[myTeam.state];
        if (!est || !est.teams.includes(myTeamId)) return null;
        let round = est.schedule[calEntry.estadualRound];
        return round ? round.find(m => m.a === myTeamId || m.b === myTeamId) : null;
    }
    if (calEntry.type === 'estadual_final') {
        let est = estadualData[myTeam.state];
        if (!est || !est.final) return null;
        return (est.final.a === myTeamId || est.final.b === myTeamId) ? est.final : null;
    }
    if (calEntry.type === 'brasileirao') {
        let mySchedule = myTeam.league === 'A' ? scheduleA : (myTeam.league === 'B' ? scheduleB : scheduleC);
        let round = mySchedule[calEntry.brasRound];
        return round ? round.find(m => m.a === myTeamId || m.b === myTeamId) : null;
    }
    if (calEntry.type === 'copa_br') {
        if (!copaBrasil || !copaBrasil.qualified.includes(myTeamId)) return null;
        let phase = copaBrasil.phases[calEntry.copaPhase];
        if (!phase) return null;
        let matchup = phase.find(mu => mu.team1 === myTeamId || mu.team2 === myTeamId);
        if (!matchup || matchup.winner != null) return null;
        return calEntry.copaLeg === 'ida' ? matchup.leg1 : matchup.leg2;
    }
    return null;
}

function prepareWeek() {
    if (currentWeek >= calendar.length) { handleSeasonEnd(); return; }
    let calEntry = calendar[currentWeek];
    let myTeam = teams.find(t => t.id === myTeamId);
    
    // After estadual final, prepare estadual finals and generate Copa
    if (calEntry.type === 'estadual_final') {
        ALL_STATES.forEach(st => {
            let est = estadualData[st];
            if (!est || est.final) return;
            let winnersA = getEstadualGroupStandings(est.groups.A, est.schedule);
            let winnersB = getEstadualGroupStandings(est.groups.B, est.schedule);
            est.final = { a: winnersA[0], b: winnersB[0], scoreA: 0, scoreB: 0, finished: false };
        });
    }
    if (calEntry.type === 'brasileirao' && calEntry.brasRound === 0 && !copaBrasil) {
        ALL_STATES.forEach(st => {
            let est = estadualData[st];
            if (est && est.final && est.final.finished && !est.champion) {
                est.champion = est.final.scoreA >= est.final.scoreB ? est.final.a : est.final.b;
                let champTeam = teams.find(t => t.id === est.champion);
                if (champTeam) {
                    champTeam.estadualTitles = (champTeam.estadualTitles || 0) + 1;
                }
            }
        });
        generateCopaBrasil();
    }
    
    currentRoundText.innerText = `Sem ${currentWeek + 1}`;
    let myMatch = getMyMatchForWeek(calEntry);
    
    if (!myMatch) {
        // Simulate background matches for this week
        simulateBackgroundWeek(calEntry);
        currentWeek++;
        saveGame();
        renderSchedule();
        showOverlayMsg(`SEMANA ${currentWeek}\n\n⚽ TREINO\nSem jogo nesta semana`);
        return;
    }
    
    currentCanvasMatch = myMatch;
    liveMatches = [];
    if (calEntry.type === 'brasileirao') {
        let br = calEntry.brasRound;
        scheduleA[br].concat(scheduleB[br], scheduleC[br]).forEach(m => { if (m !== currentCanvasMatch) liveMatches.push(m); });
    } else if (calEntry.type === 'estadual_group') {
        let est = estadualData[myTeam.state];
        if (est) est.schedule[calEntry.estadualRound].forEach(m => { if (m !== currentCanvasMatch) liveMatches.push(m); });
    }
    
    teamAConfig = teams.find(t => t.id === currentCanvasMatch.a);
    teamBConfig = teams.find(t => t.id === currentCanvasMatch.b);
    teamANameEl.innerText = teamAConfig.name;
    teamBNameEl.innerText = teamBConfig.name;
    swatchA.style.background = teamAConfig.color;
    swatchB.style.background = teamBConfig.color;
    renderLiveMatches();
    renderStandings();
    renderSchedule();
    formationMatchText.innerText = `[${getCompName(calEntry)}] ${teamAConfig.name} vs ${teamBConfig.name}`;
    showFormationScreen();
}

function simulateBackgroundWeek(calEntry) {
    if (calEntry.type === 'estadual_group') {
        ALL_STATES.forEach(st => {
            let est = estadualData[st];
            if (!est) return;
            let round = est.schedule[calEntry.estadualRound];
            if (round) round.forEach(m => { if (!m.finished) simulateMatchResult(m); });
        });
    }
    if (calEntry.type === 'estadual_final') {
        ALL_STATES.forEach(st => {
            let est = estadualData[st];
            if (est && est.final && !est.final.finished && est.final.a !== myTeamId && est.final.b !== myTeamId) {
                simulateMatchResult(est.final);
                est.champion = est.final.scoreA >= est.final.scoreB ? est.final.a : est.final.b;
            }
        });
    }
    if (calEntry.type === 'brasileirao') {
        let br = calEntry.brasRound;
        scheduleA[br].concat(scheduleB[br], scheduleC[br]).forEach(m => { if (!m.finished) simulateMatchResult(m); });
        // Update standings
        scheduleA[br].concat(scheduleB[br], scheduleC[br]).forEach(m => {
            let tA = teams.find(t => t.id === m.a); let tB = teams.find(t => t.id === m.b);
            if (!tA || !tB) return;
            tA.pld++; tB.pld++; tA.gf += m.scoreA; tB.gf += m.scoreB; tA.ga += m.scoreB; tB.ga += m.scoreA;
            tA.gd = tA.gf - tA.ga; tB.gd = tB.gf - tB.ga;
            if (m.scoreA > m.scoreB) { tA.pts += 3; tA.w++; tB.l++; }
            else if (m.scoreB > m.scoreA) { tB.pts += 3; tB.w++; tA.l++; }
            else { tA.pts++; tB.pts++; tA.d++; tB.d++; }
        });
        currentBrasRound++;
    }
    if (calEntry.type === 'copa_br' && copaBrasil) {
        let phase = copaBrasil.phases[calEntry.copaPhase];
        if (phase) {
            phase.forEach(mu => {
                let leg = calEntry.copaLeg === 'ida' ? mu.leg1 : mu.leg2;
                if (!leg.finished) simulateMatchResult(leg);
            });
            if (calEntry.copaLeg === 'volta') advanceCopaPhase();
        }
    }
}

function renderSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    calendar.forEach((entry, idx) => {
        let myMatch = getMyMatchForWeek(entry);
        let compName = getCompName(entry);
        let tagColor = getCompTagColor(entry.type);
        let statusHtml = '', cardClass = 'schedule-card', oppHtml = '';
        if (myMatch) {
            let isHome = myMatch.a === myTeamId;
            let oppId = isHome ? myMatch.b : myMatch.a;
            let oppTeam = teams.find(t => t.id === oppId);
            if (idx < currentWeek && myMatch.finished) {
                let myS = isHome ? myMatch.scoreA : myMatch.scoreB, opS = isHome ? myMatch.scoreB : myMatch.scoreA;
                let c = myS > opS ? '#22c55e' : (myS === opS ? '#a1a1aa' : '#ef4444');
                statusHtml = `<div style="font-size:1.3rem;font-weight:bold;color:${c};">${myS}-${opS}</div>`;
            } else if (idx === currentWeek) { cardClass += ' current'; statusHtml = `<div style="font-size:1rem;color:var(--accent-color);font-weight:bold;">HOJE</div>`; }
            else statusHtml = `<div style="font-size:0.9rem;color:rgba(255,255,255,0.5);">A JOGAR</div>`;
            if (oppTeam) oppHtml = `<div style="display:flex;align-items:center;justify-content:center;gap:5px;font-size:0.85rem;margin-top:3px;"><div class="color-swatch" style="width:13px;height:13px;background:${oppTeam.color};"></div>${oppTeam.name}</div>`;
        } else {
            statusHtml = idx <= currentWeek ? `<div style="font-size:0.85rem;color:#6b7280;">TREINO</div>` : `<div style="font-size:0.85rem;color:rgba(255,255,255,0.3);">-</div>`;
            if (idx === currentWeek) cardClass += ' current';
        }
        let legLbl = entry.type === 'copa_br' ? ` ${entry.copaLeg === 'ida' ? 'Ida' : 'Volta'}` : '';
        const card = document.createElement('div');
        card.className = cardClass;
        card.innerHTML = `<div style="font-size:0.75rem;color:#a1a1aa;">Sem ${idx+1}</div><div class="schedule-comp-tag" style="background:${tagColor}20;color:${tagColor};">${compName}${legLbl}</div>${statusHtml}${oppHtml}`;
        scheduleList.appendChild(card);
        if (idx === currentWeek) setTimeout(() => card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 100);
    });
}

function finishWeek() {
    let calEntry = calendar[currentWeek];
    currentCanvasMatch.scoreA = scoreA;
    currentCanvasMatch.scoreB = scoreB;
    currentCanvasMatch.finished = true;
    liveMatches.forEach(m => m.finished = true);
    
    // Simulate ALL other background matches for this week type
    if (calEntry.type === 'estadual_group') {
        ALL_STATES.forEach(st => {
            let est = estadualData[st]; if (!est) return;
            let round = est.schedule[calEntry.estadualRound];
            if (round) round.forEach(m => { if (!m.finished) simulateMatchResult(m); });
        });
    }
    if (calEntry.type === 'estadual_final') {
        ALL_STATES.forEach(st => {
            let e2 = estadualData[st]; if (!e2 || !e2.final) return;
            if (!e2.final.finished) {
                simulateMatchResult(e2.final);
            }
            if (!e2.champion) {
                e2.champion = e2.final.scoreA >= e2.final.scoreB ? e2.final.a : e2.final.b;
                let champTeam = teams.find(t => t.id === e2.champion);
                if (champTeam) {
                    champTeam.estadualTitles = (champTeam.estadualTitles || 0) + 1;
                }
            }
        });
    }
    if (calEntry.type === 'brasileirao') {
        let br = calEntry.brasRound;
        scheduleA[br].concat(scheduleB[br], scheduleC[br]).forEach(m => {
            if (!m.finished) simulateMatchResult(m);
            let tA = teams.find(t => t.id === m.a); let tB = teams.find(t => t.id === m.b);
            if (!tA || !tB) return;
            tA.pld++; tB.pld++; tA.gf += m.scoreA; tB.gf += m.scoreB; tA.ga += m.scoreB; tB.ga += m.scoreA;
            tA.gd = tA.gf - tA.ga; tB.gd = tB.gf - tB.ga;
            if (m.scoreA > m.scoreB) { tA.pts += 3; tA.w++; tB.l++; }
            else if (m.scoreB > m.scoreA) { tB.pts += 3; tB.w++; tA.l++; }
            else { tA.pts++; tB.pts++; tA.d++; tB.d++; }
        });
        currentBrasRound++;
        renderStandings();
    }
    if (calEntry.type === 'copa_br' && copaBrasil) {
        let phase = copaBrasil.phases[calEntry.copaPhase];
        if (phase) {
            phase.forEach(mu => {
                let leg = calEntry.copaLeg === 'ida' ? mu.leg1 : mu.leg2;
                if (!leg.finished) simulateMatchResult(leg);
            });
            if (calEntry.copaLeg === 'volta') advanceCopaPhase();
        }
    }
    
    // Economy
    let myTeam = teams.find(t => t.id === myTeamId);
    let baseAtt = calEntry.type === 'brasileirao' ? (myTeam.league === 'A' ? 25000 : (myTeam.league === 'B' ? 8000 : 2000)) : (calEntry.type === 'copa_br' ? 15000 : 3000);
    let attendance = Math.floor(baseAtt + Math.random() * baseAtt * 0.5);
    let income = attendance * 50;
    myFunds += income;
    myFundsText.innerText = formatCurrency(myFunds);
    
    let oppTeamId = currentCanvasMatch.a === myTeamId ? currentCanvasMatch.b : currentCanvasMatch.a;
    let oppTeam = teams.find(t => t.id === oppTeamId);
    let isHome = currentCanvasMatch.a === myTeamId;
    let myScore = isHome ? currentCanvasMatch.scoreA : currentCanvasMatch.scoreB;
    let oppScore = isHome ? currentCanvasMatch.scoreB : currentCanvasMatch.scoreA;
    myMatchHistory.push({ oppName: oppTeam.name, oppColor: oppTeam.color, scoreA: myScore, scoreB: oppScore, isWin: myScore > oppScore, isDraw: myScore === oppScore });
    
    currentWeek++;
    if (calEntry.type === 'brasileirao') currentRound++;
    saveGame();
    renderSchedule();
    
    if (currentWeek >= calendar.length) {
        handleSeasonEnd();
    } else {
        let compLabel = getCompName(calEntry);
        showOverlayMsg(`FIM - ${compLabel}\n\nPúblico: ${attendance.toLocaleString('pt-BR')}\nRenda: R$ ${formatCurrency(income)}`);
    }
}

function handleSeasonEnd() {
    let sortedA = teams.filter(t => t.league === 'A').sort((a, b) => (b.pts - a.pts) || (b.w - a.w) || (b.gd - a.gd) || (b.gf - a.gf));
    let sortedB = teams.filter(t => t.league === 'B').sort((a, b) => (b.pts - a.pts) || (b.w - a.w) || (b.gd - a.gd) || (b.gf - a.gf));
    let sortedC = teams.filter(t => t.league === 'C').sort((a, b) => (b.pts - a.pts) || (b.w - a.w) || (b.gd - a.gd) || (b.gf - a.gf));
    sortedA[0].titlesA++; sortedB[0].titlesB++; sortedC[0].titlesC++;
    let relegatedA = sortedA.slice(-4), promotedB = sortedB.slice(0, 4);
    let relegatedB = sortedB.slice(-4), promotedC = sortedC.slice(0, 4);
    relegatedA.forEach(t => t.league = 'B'); promotedB.forEach(t => t.league = 'A');
    relegatedB.forEach(t => t.league = 'C'); promotedC.forEach(t => t.league = 'B');
    
    let copaChampName = copaBrasil && copaBrasil.champion ? (teams.find(t => t.id === copaBrasil.champion) || {}).name || '?' : 'N/A';
    let infoHtml = `
        <h3 style="color:#22c55e;margin-bottom:5px;">🏆 COPA DO BRASIL: ${copaChampName}</h3>
        <p style="margin-bottom:15px;font-size:14px;"></p>
        <h3 style="color:#ef4444;margin-bottom:5px;">REBAIXADOS PARA SÉRIE B:</h3>
        <p style="margin-bottom:15px;font-size:14px;">${relegatedA.map(t => t.name).join(', ')}</p>
        <h3 style="color:#22c55e;margin-bottom:5px;">PROMOVIDOS PARA SÉRIE A:</h3>
        <p style="margin-bottom:15px;font-size:14px;">${promotedB.map(t => t.name).join(', ')}</p>
        <h3 style="color:#ef4444;margin-bottom:5px;">REBAIXADOS PARA SÉRIE C:</h3>
        <p style="margin-bottom:15px;font-size:14px;">${relegatedB.map(t => t.name).join(', ')}</p>
        <h3 style="color:#22c55e;margin-bottom:5px;">PROMOVIDOS PARA SÉRIE B:</h3>
        <p style="font-size:14px;">${promotedC.map(t => t.name).join(', ')}</p>
    `;
    document.getElementById('season-relegation-info').innerHTML = infoHtml;
    overlay.classList.remove('hidden');
    overlayMsgBox.classList.add('hidden'); overlayFormationBox.classList.add('hidden');
    teamEditModal.classList.add('hidden');
    document.getElementById('season-end-modal').classList.remove('hidden');
}

document.getElementById('btn-next-season').onclick = () => {
    teams.forEach(t => { t.pts = 0; t.pld = 0; t.w = 0; t.d = 0; t.l = 0; t.gf = 0; t.ga = 0; t.gd = 0; });
    currentSeason++;
    buildSeason();
    saveGame();
    document.getElementById('season-end-modal').classList.add('hidden');
    prepareWeek();
};

function saveGame() {
    const saveData = {
        version: 2,
        teams,
        scheduleA,
        scheduleB,
        scheduleC,
        calendar,
        currentWeek,
        currentBrasRound,
        currentRound,
        estadualData,
        copaBrasil,
        myTeamId,
        currentSeason,
        myFormation,
        myAttitude,
        myFunds,
        availablePoints,
        myMatchHistory
    };
    try {
        localStorage.setItem('botao_league_save', JSON.stringify(saveData));
    } catch (e) {
        console.error("Erro ao salvar jogo:", e);
    }
}

document.getElementById('tab-serie-a').onclick = () => {
    currentLeagueTab = 'A';
    document.getElementById('tab-serie-a').style.opacity = '1';
    document.getElementById('tab-serie-b').style.opacity = '0.5';
    document.getElementById('tab-serie-c').style.opacity = '0.5';
    renderLiveMatches();
    renderStandings();
};

document.getElementById('tab-serie-b').onclick = () => {
    currentLeagueTab = 'B';
    document.getElementById('tab-serie-a').style.opacity = '0.5';
    document.getElementById('tab-serie-b').style.opacity = '1';
    document.getElementById('tab-serie-c').style.opacity = '0.5';
    renderLiveMatches();
    renderStandings();
};

document.getElementById('tab-serie-c').onclick = () => {
    currentLeagueTab = 'C';
    document.getElementById('tab-serie-a').style.opacity = '0.5';
    document.getElementById('tab-serie-b').style.opacity = '0.5';
    document.getElementById('tab-serie-c').style.opacity = '1';
    renderLiveMatches();
    renderStandings();
};

function updateLiveMatches() {
    if (gameState !== STATE.PLAYING) return;
    let updated = false;
    liveMatches.forEach(m => {
        if (Math.random() < 0.015) { 
            const tA = teams.find(t => t.id === m.a);
            const tB = teams.find(t => t.id === m.b);
            const ovrA = (tA ? tA.fin + tA.spd + tA.stm + tA.pre : 0) + 10;
            const ovrB = (tB ? tB.fin + tB.spd + tB.stm + tB.pre : 0) + 10;
            const chanceA = ovrA / (ovrA + ovrB);
            
            if (Math.random() < chanceA) m.scoreA++;
            else m.scoreB++;
            updated = true;
        }
    });
    if (updated) renderLiveMatches();
}

function renderLiveMatches() {
    liveMatchesList.innerHTML = '';
    liveMatches.forEach(m => {
        const tA = teams.find(t => t.id === m.a);
        const tB = teams.find(t => t.id === m.b);
        if (!tA || !tB) return;
        const li = document.createElement('li');
        li.className = 'match-item';
        li.innerHTML = `
            <div class="match-team right"><span class="match-team-name">${tA.name}</span><div class="color-swatch" style="background:${tA.color}"></div></div>
            <div class="match-score">${m.scoreA} - ${m.scoreB}</div>
            <div class="match-team"><div class="color-swatch" style="background:${tB.color}"></div><span class="match-team-name">${tB.name}</span></div>
        `;
        liveMatchesList.appendChild(li);
    });
}


function renderStandings() {
    let leagueTeams = teams.filter(t => t.league === currentLeagueTab);
    leagueTeams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.w !== a.w) return b.w - a.w;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });

    standingsBody.innerHTML = '';
    leagueTeams.forEach((t, i) => {
        const isMyTeam = t.id === myTeamId ? 'my-team-row' : '';
        const tr = document.createElement('tr');
        tr.className = isMyTeam;
        tr.style.cursor = 'pointer';
        tr.onclick = () => {
            if (!teamEditModal.classList.contains('hidden')) return; // Prevent double trigger
            
            editingTeamId = t.id;
            editTeamName.innerText = t.name;
            updateEditorUI();
            
            // Remember what was open
            if (!overlayMsgBox.classList.contains('hidden')) previousOverlayBox = overlayMsgBox;
            else if (!overlayFormationBox.classList.contains('hidden')) previousOverlayBox = overlayFormationBox;
            else previousOverlayBox = null;
            
            overlay.classList.remove('hidden');
            overlayMsgBox.classList.add('hidden');
            overlayFormationBox.classList.add('hidden');
            teamEditModal.classList.remove('hidden');
        };
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="text-left"><div class="team-cell"><div class="color-swatch" style="background:${t.color}"></div>${t.name}</div></td>
            <td class="pts-col">${t.pts}</td>
            <td>${t.pld}</td>
            <td>${t.w}</td>
            <td>${t.d}</td>
            <td>${t.l}</td>
            <td>${t.gd}</td>
        `;
        standingsBody.appendChild(tr);
    });
}

// --- Formation System ---

function updateFormationUI() {
    defVal.innerText = myFormation.def;
    midVal.innerText = myFormation.mid;
    attVal.innerText = myFormation.att;
    const total = myFormation.def + myFormation.mid + myFormation.att;
    fCount.innerText = total;
    if (total === 10) fCount.style.color = '#22c55e';
    else fCount.style.color = '#ef4444';
    
    const attSelect = document.getElementById('team-attitude');
    if (attSelect) attSelect.value = myAttitude;
}

function adjustFormation(pos, delta) {
    let newVal = myFormation[pos] + delta;
    if (newVal < 1 || newVal > 6) return; 
    myFormation[pos] = newVal;
    updateFormationUI();
}

document.getElementById('def-minus').onclick = () => adjustFormation('def', -1);
document.getElementById('def-plus').onclick = () => adjustFormation('def', 1);
document.getElementById('mid-minus').onclick = () => adjustFormation('mid', -1);
document.getElementById('mid-plus').onclick = () => adjustFormation('mid', 1);
document.getElementById('att-minus').onclick = () => adjustFormation('att', -1);
document.getElementById('att-plus').onclick = () => adjustFormation('att', 1);

function generateFormationArray(def, mid, att, attitude = 'defensive') {
    let formation = [{ role: 'GK', x: 0.05, y: 0.5 }];
    
    let xOffset = attitude === 'offensive' ? 0.15 : 0;

    function addLine(count, baseLineX, role) {
        let xPos = baseLineX + xOffset;
        if (count === 1) { formation.push({ role, x: xPos, y: 0.5 }); return; }
        
        let spreads = { 2: 0.3, 3: 0.5, 4: 0.6, 5: 0.7, 6: 0.8 };
        let spread = spreads[count] || 0.8;
        let startY = 0.5 - (spread / 2);
        let spacing = spread / (count - 1);
        
        for (let i = 0; i < count; i++) {
            formation.push({ role, x: xPos, y: startY + i * spacing });
        }
    }

    addLine(def, 0.2, 'DEF');
    addLine(mid, 0.45, 'MID');
    addLine(att, 0.7, 'ATT');
    return formation;
}

function getRandomFormation() {
    const validFormations = [[4,4,2], [4,3,3], [3,5,2], [5,3,2], [4,2,4], [3,4,3], [5,4,1]];
    let f = validFormations[Math.floor(Math.random() * validFormations.length)];
    let att = Math.random() > 0.5 ? 'offensive' : 'defensive';
    return generateFormationArray(f[0], f[1], f[2], att);
}

function showFormationScreen() {
    gameState = STATE.MENU;
    overlay.classList.remove('hidden');
    overlayMsgBox.classList.add('hidden');
    overlayFormationBox.classList.remove('hidden');
    formationMatchText.innerText = `${teamAConfig.name} vs ${teamBConfig.name}`;
    updateFormationUI();
}

overlayBtnPlay.onclick = () => {
    let total = myFormation.def + myFormation.mid + myFormation.att;
    if (total !== 10) { alert("Sua formação deve ter exatamente 10 jogadores de linha!"); return; }
    
    myAttitude = document.getElementById('team-attitude').value;
    saveGame(); // Save formation immediately before playing
    
    overlay.classList.add('hidden');
    let myF = generateFormationArray(myFormation.def, myFormation.mid, myFormation.att, myAttitude);
    let oppF = getRandomFormation();
    
    // Randomize pitch
    let pType = PITCH_TYPES[Math.floor(Math.random() * PITCH_TYPES.length)];
    currentPitch = PITCH_SETTINGS[pType];
    
    scoreA = 0; scoreB = 0;
    currentHalf = 1; timeLeft = MATCH_DURATION_SEC;
    isInjuryTime = false; injuryTimeTotal = 0;
    updateUI();
    resetPositions(myF, oppF, true);
    gameState = STATE.STARTING;
    stateTimer = 60;
};

function showOverlayMsg(msg) {
    overlay.classList.remove('hidden');
    overlayFormationBox.classList.add('hidden');
    overlayMsgBox.classList.remove('hidden');
    overlayTitle.innerText = msg;
}

overlayBtnNext.onclick = () => {
    overlay.classList.add('hidden');
    if (gameState === STATE.MATCH_OVER) {
        prepareWeek();
    }
};

// --- Game Classes ---

class Entity {
    constructor(x, y, radius, mass) { this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.radius = radius; this.mass = mass; }
    update(friction) {
        this.x += this.vx; this.y += this.vy;
        this.vx *= friction; this.vy *= friction;
        if (Math.abs(this.vx) < 0.05) this.vx = 0;
        if (Math.abs(this.vy) < 0.05) this.vy = 0;
    }
    checkWallCollision() {
        let isGoal = false;
        if (this.y - this.radius < 0) { this.y = this.radius; this.vy *= -0.8; } 
        else if (this.y + this.radius > HEIGHT) { this.y = HEIGHT - this.radius; this.vy *= -0.8; }
        if (this.x - this.radius < 0) {
            if (this.y > GOAL_Y && this.y < GOAL_Y + GOAL_WIDTH) { if (this.x + this.radius < -10) isGoal = 'B'; } 
            else { this.x = this.radius; this.vx *= -0.8; }
        } else if (this.x + this.radius > WIDTH) {
            if (this.y > GOAL_Y && this.y < GOAL_Y + GOAL_WIDTH) { if (this.x - this.radius > WIDTH + 10) isGoal = 'A'; } 
            else { this.x = WIDTH - this.radius; this.vx *= -0.8; }
        }
        return isGoal;
    }
}

class Ball extends Entity {
    constructor(x, y) { super(x, y, BALL_RADIUS, 1); }
    draw(ctx) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
        ctx.fill(); ctx.closePath(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }
}

class Player extends Entity {
    constructor(x, y, team, role, basePos, teamConfig, number) {
        super(x, y, PLAYER_RADIUS, 5); 
        this.team = team; this.role = role; this.baseX = basePos.x; this.baseY = basePos.y;
        this.color = teamConfig.color; this.colorDark = teamConfig.colorDark;
        this.fin = teamConfig.fin; this.spd = teamConfig.spd; this.stm = teamConfig.stm; this.pre = teamConfig.pre;
        this.actionTimer = 0; this.cooldown = 0;
        this.number = number || 1;
        this.cards = 0;
    }
    draw(ctx) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(this.x - 3, this.y - 3, this.radius * 0.1, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.3, this.color); gradient.addColorStop(1, this.colorDark);
        ctx.fillStyle = gradient; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
        ctx.fill(); ctx.closePath();
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke(); ctx.closePath();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

        // Draw Player Number
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.number, this.x, this.y + 1);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        if (this.cards > 0) {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(this.x + 5, this.y - 15, 6, 8);
            ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 5, this.y - 15, 6, 8);
        }
    }
    applyAI(ball, pitchSettings, isClosest) {
        if (gameState === STATE.MATCH_OVER || gameState === STATE.PENALTY_SETUP) {
            this.vx = 0; this.vy = 0; 
            return;
        }
        
        if (gameState === STATE.PENALTY_EXECUTION) {
            if (this !== penaltyKicker && this !== penaltyGK) return;
        } else if (gameState !== STATE.PLAYING) {
            if (this.cooldown > 0) this.cooldown--;
            const speed = Math.hypot(this.vx, this.vy);
            if (speed < 0.5 && this.cooldown <= 0) {
                const target = { x: this.baseX, y: this.baseY };
                const dist = distance(this, target);
                if (dist > 10) {
                    const angle = Math.atan2(target.y - this.y, target.x - this.x);
                    const force = Math.min(8, dist * 0.1);
                    this.vx = Math.cos(angle) * force; this.vy = Math.sin(angle) * force;
                    let speedFactor = this.spd / 25;
                    this.cooldown = 40 - speedFactor * 25;
                }
            }
            return;
        }

        if (this.cooldown > 0) { this.cooldown--; if (this.role !== 'GK') return; }

        const speed = Math.hypot(this.vx, this.vy);
        if (this.role !== 'GK' && speed > 1.0) return; 

        if (this.cooldown > 0) return;

        this.actionTimer++;
        if (this.actionTimer < 5) return;
        this.actionTimer = 0;

        const distToBall = distance(this, ball);
        
        let staminaEfficiency = 1.0 - ((25 - this.stm) * 0.02 * (1.0 - (timeLeft / MATCH_DURATION_SEC)));
        let effSpd = this.spd * staminaEfficiency;
        let effPre = (this.pre || 15) * staminaEfficiency;
        let effFin = this.fin * staminaEfficiency;
        
        let speedFactor = effSpd / 25;
        let baseFlickForce = (3.0 + speedFactor * 2.5) * pitchSettings.playerForceMult * staminaEfficiency;
        
        let strikeCooldownBase = 55 - speedFactor * 25; 
        let strikeCooldownRand = 35 - speedFactor * 15; 
        let repositionCooldown = 40 - speedFactor * 25;
        
        if (this.role === 'GK') {
            const targetY = clamp(ball.y, GOAL_Y + this.radius, GOAL_Y + GOAL_WIDTH - this.radius);
            if (distToBall < 80 && ball.x > 0 && ball.x < WIDTH) {
                const angle = Math.atan2(ball.y - this.y, ball.x - this.x);
                let gkForce = baseFlickForce * 0.45; // Slower speed (Nerf)
                
                this.vx = Math.cos(angle) * gkForce; 
                this.vy = Math.sin(angle) * gkForce;
                
                // Prevent jumping backwards into own net
                if (this.team === 0 && this.vx < -0.1) this.vx = 0.5;
                if (this.team === 1 && this.vx > 0.1) this.vx = -0.5;
                
                this.cooldown = 60; 
            } else if (Math.abs(this.y - targetY) > 10) {
                this.vy = (targetY > this.y ? 8 : -8);
                if (Math.abs(this.x - this.baseX) > 5) { this.vx = (this.baseX > this.x ? 3 : -3); }
                this.cooldown = 15;
            }
            return;
        }

        let actionRadius = 250;
        if (this.role === 'ATT') actionRadius = 400;

        if (isClosest && distToBall < actionRadius) {
            let isWrongSide = (this.team === 0 && this.x > ball.x - 5) || (this.team === 1 && this.x < ball.x + 5);
            
            if (isWrongSide) {
                let safeX = this.team === 0 ? ball.x - 40 : ball.x + 40;
                let safeY = ball.y + (this.y > ball.y ? 40 : -40);
                safeX = clamp(safeX, 20, WIDTH - 20);
                safeY = clamp(safeY, 20, HEIGHT - 20);

                const angleLaunch = Math.atan2(safeY - this.y, safeX - this.x);
                this.vx = Math.cos(angleLaunch) * baseFlickForce * 0.7; 
                this.vy = Math.sin(angleLaunch) * baseFlickForce * 0.7;
                this.cooldown = strikeCooldownBase + Math.floor(Math.random() * strikeCooldownRand); 
            } else {
                const targetGoalX = this.team === 0 ? WIDTH : 0;
                let precisionFactor = effPre / 25;
                const targetGoalY = ball.y + ((HEIGHT / 2) - ball.y) * precisionFactor;
                
                const dxGoal = targetGoalX - ball.x; const dyGoal = targetGoalY - ball.y;
                let angleToGoal = Math.atan2(dyGoal, dxGoal);
                
                let errorRange = (25 - effFin) * 0.04;
                angleToGoal += (Math.random() * errorRange * 2) - errorRange;
                
                const impactX = ball.x - Math.cos(angleToGoal) * ball.radius; const impactY = ball.y - Math.sin(angleToGoal) * ball.radius;
                const dxLaunch = impactX - this.x; const dyLaunch = impactY - this.y;
                const angleLaunch = Math.atan2(dyLaunch, dxLaunch);
                this.vx = Math.cos(angleLaunch) * baseFlickForce; this.vy = Math.sin(angleLaunch) * baseFlickForce;
                this.cooldown = strikeCooldownBase + Math.floor(Math.random() * strikeCooldownRand); 
            }
        } else {
            let targetX = this.baseX; let targetY = this.baseY;
            if (ball.x > WIDTH / 2 && this.team === 0) {
                targetX += 80;
                if (this.role === 'ATT') targetX = Math.max(targetX, ball.x - 80);
            } else if (ball.x < WIDTH / 2 && this.team === 1) {
                targetX -= 80;
                if (this.role === 'ATT') targetX = Math.min(targetX, ball.x + 80);
            }
            targetX = clamp(targetX, 50, WIDTH - 50);
            const distToTarget = distance(this, {x: targetX, y: targetY});
            if (distToTarget > 40) {
                 const dx = targetX - this.x; const dy = targetY - this.y; const angle = Math.atan2(dy, dx);
                 const force = Math.min(baseFlickForce * 0.6, distToTarget * 0.15);
                 this.vx = Math.cos(angle) * force; this.vy = Math.sin(angle) * force;
                 this.cooldown = repositionCooldown + Math.floor(Math.random() * 20);
            }
        }
    }
}

function getClosestPlayersToBall() {
    let closestA = null; let closestB = null; let minDistA = Infinity; let minDistB = Infinity;
    players.forEach(p => {
        if (p.role === 'GK') return;
        const d = distance(p, ball);
        if (p.team === 0 && d < minDistA) { minDistA = d; closestA = p; } 
        else if (p.team === 1 && d < minDistB) { minDistB = d; closestB = p; }
    });
    return { closestA, closestB };
}

let ball;
let players = [];
let matchSquadA = [];
let matchSquadB = [];

function initSquads(formA, formB) {
    matchSquadA = []; matchSquadB = [];
    
    let numberPools = {
        0: { 'GK': [1, 12], 'DEF': [2, 3, 4, 6, 13, 14, 15, 16], 'MID': [5, 8, 10, 7, 20, 17], 'ATT': [9, 11, 19, 21, 23] },
        1: { 'GK': [1, 12], 'DEF': [2, 3, 4, 6, 13, 14, 15, 16], 'MID': [5, 8, 10, 7, 20, 17], 'ATT': [9, 11, 19, 21, 23] }
    };

    function getNum(teamIdx, role) {
        if (numberPools[teamIdx][role].length > 0) return numberPools[teamIdx][role].shift();
        return Math.floor(Math.random() * 50) + 24;
    }

    formA.forEach(pos => {
        let n = getNum(0, pos.role);
        matchSquadA.push(new Player(0, 0, 0, pos.role, {x:0, y:0}, teamAConfig, n));
    });
    formB.forEach(pos => {
        let n = getNum(1, pos.role);
        matchSquadB.push(new Player(0, 0, 1, pos.role, {x:0, y:0}, teamBConfig, n));
    });
}

function resetPositions(myFormationArr, oppFormationArr, isStartOfMatch = false) {
    ball = new Ball(WIDTH / 2, HEIGHT / 2);
    players = [];

    let isMyTeamA = currentCanvasMatch.a === myTeamId;
    let formA = isMyTeamA ? myFormationArr : oppFormationArr;
    let formB = !isMyTeamA ? myFormationArr : getRandomFormation();

    if (isStartOfMatch) initSquads(formA, formB);

    function assignPositions(squad, form, teamIdx) {
        let available = squad.filter(p => p.cards < 2);
        let roleOrder = { 'GK': 0, 'DEF': 1, 'MID': 2, 'ATT': 3 };
        
        form.sort((a,b) => roleOrder[a.role] - roleOrder[b.role]);
        available.sort((a,b) => roleOrder[a.role] - roleOrder[b.role]);

        for (let i = 0; i < available.length; i++) {
            let p = available[i];
            let pos = form[i];
            
            p.role = pos.role;
            let targetX = teamIdx === 0 ? pos.x * (WIDTH/2) : WIDTH - (pos.x * (WIDTH/2));
            let targetY = teamIdx === 0 ? pos.y * HEIGHT : HEIGHT - (pos.y * HEIGHT);
            
            p.x = targetX; p.y = targetY;
            p.baseX = targetX; p.baseY = targetY;
            p.vx = 0; p.vy = 0; p.cooldown = 0;
            players.push(p);
        }
    }

    assignPositions(matchSquadA, formA, 0);
    assignPositions(matchSquadB, formB, 1);
}

function resolveCollisions() {
    const allEntities = [...players, ball];
    for (let i = 0; i < allEntities.length; i++) {
        for (let j = i + 1; j < allEntities.length; j++) {
            let e1 = allEntities[i]; let e2 = allEntities[j];
            let dx = e2.x - e1.x; let dy = e2.y - e1.y; let dist = Math.hypot(dx, dy); let minDist = e1.radius + e2.radius;
            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist; const nx = dx / dist; const ny = dy / dist;
                const totalMass = e1.mass + e2.mass; const m1Ratio = e2.mass / totalMass; const m2Ratio = e1.mass / totalMass;
                e1.x -= nx * overlap * m1Ratio; e1.y -= ny * overlap * m1Ratio; e2.x += nx * overlap * m2Ratio; e2.y += ny * overlap * m2Ratio;
                const rvx = e2.vx - e1.vx; const rvy = e2.vy - e1.vy; const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal < 0) {
                    const restitution = 0.8; let impulseMag = -(1 + restitution) * velAlongNormal;
                    impulseMag /= (1 / e1.mass) + (1 / e2.mass);
                    const impulseX = impulseMag * nx; const impulseY = impulseMag * ny;
                    e1.vx -= impulseX / e1.mass; e1.vy -= impulseY / e1.mass; e2.vx += impulseX / e2.mass; e2.vy += impulseY / e2.mass;
                    
                    if (e1 instanceof Player && e2 instanceof Player && e1.team !== e2.team) {
                        if (velAlongNormal < -4.0 && Math.random() < 0.03) {
                            triggerFoul(e1, e2);
                        }
                    }
                }
            }
        }
    }
}

function updateUI() {
    scoreAEl.innerText = scoreA; scoreBEl.innerText = scoreB;
    
    let baseMin = currentHalf === 1 ? 0 : 45;
    let elapsed = MATCH_DURATION_SEC - (isInjuryTime ? 0 : timeLeft);
    
    let inGameMinutes = baseMin + Math.floor(elapsed * 0.5);
    let inGameSeconds = (elapsed % 2) * 30;

    let displayStr = '';
    if (isInjuryTime) {
        let injuryElapsed = injuryTimeTotal - timeLeft;
        let extraMin = Math.floor(injuryElapsed * 0.5);
        let extraSec = (injuryElapsed % 2) * 30;
        let baseStr = currentHalf === 1 ? "45" : "90";
        displayStr = `${baseStr}:00 + ${extraMin.toString().padStart(2, '0')}:${extraSec.toString().padStart(2, '0')}`;
    } else {
        displayStr = `${inGameMinutes.toString().padStart(2, '0')}:${inGameSeconds.toString().padStart(2, '0')}`;
    }
    
    timeEl.innerText = displayStr;
    
    if (gameState === STATE.HALF_TIME) periodEl.innerText = 'INTERVALO';
    else if (gameState === STATE.MATCH_OVER) periodEl.innerText = 'FIM DE JOGO';
    else periodEl.innerText = currentHalf === 1 ? '1º TEMPO' : '2º TEMPO';
}

function handleGameState() {
    if (gameState === STATE.MENU) return;

    frameCount++;

    if (gameState === STATE.STARTING) {
        stateTimer--;
        if (stateTimer <= 0) gameState = STATE.PLAYING;
    }

    if (gameState === STATE.PLAYING) {
        if (frameCount % FPS === 0) {
            timeLeft--;
            updateLiveMatches();
            updateUI();
            
            if (timeLeft <= 0) {
                if (!isInjuryTime) {
                    let diff = Math.abs(scoreA - scoreB);
                    let extraMins = 0;
                    if (diff === 0) extraMins = 5 + Math.floor(Math.random() * 3);
                    else if (diff === 1) extraMins = 3 + Math.floor(Math.random() * 2);
                    
                    if (extraMins > 0) {
                        isInjuryTime = true;
                        injuryTimeTotal = extraMins * 2; // 2 real secs = 1 in-game min
                        timeLeft = injuryTimeTotal;
                        globalNotifications.push({ msg: `+${extraMins} MINUTOS`, timer: 180, color: '#ffcc00' });
                        return;
                    }
                }
                
                isInjuryTime = false;
                if (currentHalf === 1) {
                    gameState = STATE.HALF_TIME; stateTimer = 120; 
                } else {
                    gameState = STATE.MATCH_OVER; finishWeek();
                }
            }
        }
    }

    if (gameState === STATE.PENALTY_SETUP) {
        stateTimer--;
        if (stateTimer <= 0) {
            gameState = STATE.PENALTY_EXECUTION;
            stateTimer = 300; 
        }
    }

    if (gameState === STATE.PENALTY_EXECUTION) {
        stateTimer--;
        let ballSpeed = Math.hypot(ball.vx, ball.vy);
        if ((ballSpeed < 0.1 && stateTimer < 240) || stateTimer <= 0) {
            gameState = STATE.PLAYING;
        }
    }

    if (gameState === STATE.GOAL_SCORED) {
        stateTimer--;
        if (stateTimer <= 0) {
            resetPositions(generateFormationArray(myFormation.def, myFormation.mid, myFormation.att, myAttitude), getRandomFormation()); // Retain formations
            gameState = STATE.STARTING; stateTimer = 60; overlay.classList.add('hidden');
        }
    }

    if (gameState === STATE.HALF_TIME) {
        stateTimer--;
        if (stateTimer <= 0) {
            currentHalf = 2; timeLeft = MATCH_DURATION_SEC;
            isInjuryTime = false; injuryTimeTotal = 0;
            resetPositions(generateFormationArray(myFormation.def, myFormation.mid, myFormation.att, myAttitude), getRandomFormation());
            gameState = STATE.STARTING; stateTimer = 60; updateUI();
        }
    }
}

function drawPitch() {
    if (currentPitch.type === 'perfect') {
        ctx.fillStyle = '#16a34a'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < WIDTH; i += 40) { if ((i / 40) % 2 === 0) ctx.fillRect(i, 0, 40, HEIGHT); }
    } else if (currentPitch.type === 'bad') {
        ctx.fillStyle = '#65a30d'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(120, 53, 15, 0.15)'; // Muddy
        for (let i = 0; i < WIDTH; i += 60) { if ((i / 60) % 2 === 0) ctx.fillRect(i, 0, 60, HEIGHT); }
    } else {
        ctx.fillStyle = '#22c55e'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let i = 0; i < WIDTH; i += 50) { if ((i / 50) % 2 === 0) ctx.fillRect(i, 0, 50, HEIGHT); }
    }

    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.beginPath(); ctx.moveTo(WIDTH / 2, 0); ctx.lineTo(WIDTH / 2, HEIGHT); ctx.stroke();
    ctx.beginPath(); ctx.arc(WIDTH / 2, HEIGHT / 2, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(WIDTH / 2, HEIGHT / 2, 4, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeRect(0, HEIGHT / 2 - 150, 150, 300); ctx.strokeRect(WIDTH - 150, HEIGHT / 2 - 150, 150, 300);
    ctx.strokeRect(0, HEIGHT / 2 - 60, 60, 120); ctx.strokeRect(WIDTH - 60, HEIGHT / 2 - 60, 60, 120);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, GOAL_Y, 20, GOAL_WIDTH); ctx.fillRect(WIDTH - 20, GOAL_Y, 20, GOAL_WIDTH); 
}

function drawNotifications() {
    for (let i = globalNotifications.length - 1; i >= 0; i--) {
        let n = globalNotifications[i];
        n.timer--;
        if (n.timer <= 0) { globalNotifications.splice(i, 1); continue; }
        
        ctx.fillStyle = n.color;
        ctx.font = "bold 30px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(n.msg, WIDTH / 2, HEIGHT / 2 - 150 - (globalNotifications.length - i) * 40);
        ctx.shadowBlur = 0;
    }
}

function simulateStep() {
    handleGameState();
    if (gameState === STATE.MENU) return;

    const pitchSettings = getPitchSettings();
    const closest = getClosestPlayersToBall();

    players.forEach(p => {
        const isClosest = (p === closest.closestA || p === closest.closestB);
        p.applyAI(ball, pitchSettings, isClosest);
        p.update(pitchSettings.friction);
        p.checkWallCollision();
    });

    if (gameState !== STATE.MATCH_OVER) {
        ball.update(pitchSettings.friction);
        const goalScored = ball.checkWallCollision();
        
        if (goalScored && gameState === STATE.PLAYING || goalScored && gameState === STATE.PENALTY_EXECUTION) {
            if (goalScored === 'A') scoreA++;
            if (goalScored === 'B') scoreB++;
            gameState = STATE.GOAL_SCORED;
            stateTimer = 180; 
            updateUI();
            
            setTimeout(() => { if (gameState === STATE.GOAL_SCORED) showOverlayMsg('GOL!'); }, 100);
        }
    }

    resolveCollisions();
}

function loop() {
    requestAnimationFrame(loop);

    for (let step = 0; step < gameSpeed; step++) {
        simulateStep();
    }

    if (gameState === STATE.MENU) return;

    drawPitch();
    players.forEach(p => p.draw(ctx));
    ball.draw(ctx);
    drawNotifications();
}

function renderTrophyRoom() {
    trophyList.innerHTML = '';
    
    if (currentTrophyTab === 'EST' || currentTrophyTab === 'COPA') {
        let propKey = currentTrophyTab === 'EST' ? 'estadualTitles' : 'titlesCopa';
        let winners = teams.filter(t => (t[propKey] || 0) > 0).sort((a,b) => b[propKey] - a[propKey]);
        
        if (winners.length === 0) {
            trophyList.innerHTML = '<div style="color: #a1a1aa; text-align: center; margin-top: 20px;">Nenhum campeão registrado ainda.</div>';
            return;
        }
        
        winners.forEach((t, index) => {
            let div = document.createElement('div');
            div.style.cssText = 'display:flex; align-items:center; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);';
            let colorBox = `<div style="width:20px; height:20px; border-radius:50%; background:${t.color}; margin-right:10px;"></div>`;
            let rankStr = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index+1}º`));
            let extraLabel = currentTrophyTab === 'EST' ? `<div style="font-size:11px; color:#a1a1aa; margin-right:8px;">${t.state}</div>` : '';
            div.innerHTML = `
                <div style="width:30px; text-align:center; margin-right:10px; font-weight:bold; color:#fbbf24; font-size:16px;">${rankStr}</div>
                ${colorBox}
                <div style="flex:1; font-weight:bold;">${t.name}</div>
                ${extraLabel}
                <div style="font-weight:bold; color:#a855f7; font-size:16px;">${t[propKey]}x 🏆</div>
            `;
            trophyList.appendChild(div);
        });
        return;
    }
    
    let leagueKey = `titles${currentTrophyTab}`;
    let winners = teams.filter(t => t[leagueKey] > 0).sort((a,b) => b[leagueKey] - a[leagueKey]);
    
    if (winners.length === 0) {
        trophyList.innerHTML = '<div style="color: #a1a1aa; text-align: center; margin-top: 20px;">Nenhum campeão registrado ainda.</div>';
        return;
    }
    
    winners.forEach((t, index) => {
        let div = document.createElement('div');
        div.style.cssText = 'display:flex; align-items:center; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);';
        let colorBox = `<div style="width:20px; height:20px; border-radius:50%; background:${t.color}; margin-right:10px;"></div>`;
        let rankStr = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index+1}º`));
        div.innerHTML = `
            <div style="width:30px; text-align:center; margin-right:10px; font-weight:bold; color:#fbbf24; font-size:16px;">${rankStr}</div>
            ${colorBox}
            <div style="flex:1; font-weight:bold;">${t.name}</div>
            <div style="font-weight:bold; color:#a855f7; font-size:16px;">${t[leagueKey]}x 🏆</div>
        `;
        trophyList.appendChild(div);
    });
}

btnOpenTrophyRoom.onclick = () => {
    const overlayContents = overlay.querySelectorAll('.overlay-content');
    previousOverlayBoxTrophy = Array.from(overlayContents).find(el => !el.classList.contains('hidden') && el.id !== 'trophy-room-modal');
    
    overlay.classList.remove('hidden');
    overlayMsgBox.classList.add('hidden');
    overlayFormationBox.classList.add('hidden');
    teamEditModal.classList.add('hidden');
    document.getElementById('season-end-modal').classList.add('hidden');
    
    trophyRoomModal.classList.remove('hidden');
    renderTrophyRoom();
};

btnCloseTrophyRoom.onclick = () => {
    trophyRoomModal.classList.add('hidden');
    if (previousOverlayBoxTrophy) {
        previousOverlayBoxTrophy.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
};

function selectTrophyTab(tab) {
    currentTrophyTab = tab;
    const allTabs = ['A', 'B', 'C', 'EST', 'COPA'];
    allTabs.forEach(t => {
        let el = document.getElementById(`trophy-tab-${t.toLowerCase()}`);
        if (el) {
            el.style.border = tab === t ? '1px solid var(--accent-color)' : 'none';
            el.style.opacity = tab === t ? '1' : '0.5';
        }
    });
    renderTrophyRoom();
}

trophyTabA.onclick = () => selectTrophyTab('A');
trophyTabB.onclick = () => selectTrophyTab('B');
trophyTabC.onclick = () => selectTrophyTab('C');
document.getElementById('trophy-tab-est').onclick = () => selectTrophyTab('EST');
document.getElementById('trophy-tab-copa').onclick = () => selectTrophyTab('COPA');

btnExportSave.onclick = () => {
    const saved = localStorage.getItem('botao_league_save');
    if (!saved) {
        alert('Nenhum save encontrado para exportar.');
        return;
    }
    const blob = new Blob([saved], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'botao_league_save.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

btnImportSave.onclick = () => {
    importSaveInput.click();
};

importSaveInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.teams && data.currentRound !== undefined) {
                localStorage.setItem('botao_league_save', event.target.result);
                alert('Save importado com sucesso!');
                window.location.reload();
            } else {
                alert('Arquivo de save inválido.');
            }
        } catch (error) {
            alert('Erro ao ler o arquivo de save.');
        }
    };
    reader.readAsText(file);
};

// Init Application
initLeagueMenu();
loop();
