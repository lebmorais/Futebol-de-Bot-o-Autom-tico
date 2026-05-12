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

let teams = [];
let scheduleA = [];
let scheduleB = [];
let currentSeason = 1;
let currentLeagueTab = 'A'; // 'A' or 'B'
let myTeamId = -1;
let currentRound = 0;
let liveMatches = []; 
let currentCanvasMatch = null;
let teamAConfig, teamBConfig;

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
        teams, scheduleA, scheduleB, scheduleC, currentRound, myTeamId, currentSeason,
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

function initLeagueMenu() {
    teams = [];
    SERIE_A_TEAMS.forEach((c, i) => {
        teams.push({
            id: i, name: c.n, color: c.c, colorDark: c.d, league: 'A', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0
        });
    });
    SERIE_B_TEAMS.forEach((c, i) => {
        teams.push({
            id: i + 20, name: c.n, color: c.c, colorDark: c.d, league: 'B', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0
        });
    });

    SERIE_C_TEAMS.forEach((c, i) => {
        teams.push({
            id: i + 40, name: c.n, color: c.c, colorDark: c.d, league: 'C', state: c.state,
            fin: c.fin, spd: c.spd, stm: c.stm, pre: c.pre,
            pts: 0, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0,
            titlesA: 0, titlesB: 0, titlesC: 0
        });
    });

    scheduleA = generateRoundRobin(teams.filter(t => t.league === 'A'));
    scheduleB = generateRoundRobin(teams.filter(t => t.league === 'B'));
    scheduleC = generateRoundRobin(teams.filter(t => t.league === 'C'));

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
            let results = teams.filter(t => t.name.toLowerCase().includes(term) || t.state.toLowerCase() === term);
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
        t.titlesA = 0; t.titlesB = 0; t.titlesC = 0;
        
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
    localStorage.removeItem('botao_league_save'); // start fresh
    myFunds = 0;
    availablePoints = 0;
    myMatchHistory = [];
    myFundsText.innerText = formatCurrency(myFunds);
    
    mainMenu.classList.add('hidden');
    leagueView.classList.remove('hidden');
    currentRound = 0;
    saveGame(); // Save initial state so custom team is persisted instantly
    prepareRound();
};

continueLeagueBtn.onclick = () => {
    const saved = JSON.parse(localStorage.getItem('botao_league_save'));
    teams = saved.teams;
    teams.forEach(t => {
        if (!t.league) t.league = 'A'; // Backward compatibility
        if (t.fin === undefined) {
            let base = SERIE_A_TEAMS.find(b => b.n === t.name) || SERIE_B_TEAMS.find(b => b.n === t.name) || SERIE_C_TEAMS.find(b => b.n === t.name);
            t.fin = base ? base.fin : 15;
            t.spd = base ? base.spd : 15;
            t.stm = base ? base.stm : 15;
            t.pre = base ? base.pre : 15;
        }
        if (t.pre === undefined) {
            let base = SERIE_A_TEAMS.find(b => b.n === t.name) || SERIE_B_TEAMS.find(b => b.n === t.name) || SERIE_C_TEAMS.find(b => b.n === t.name);
            t.pre = base ? base.pre : 15;
        }
        if (t.titlesA === undefined) {
            t.titlesA = 0; t.titlesB = 0; t.titlesC = 0;
        }
    });
    scheduleA = saved.scheduleA || saved.schedule; // Backward compatibility
    scheduleB = saved.scheduleB || generateRoundRobin(teams.filter(t => t.league === 'B'));
    scheduleC = saved.scheduleC || generateRoundRobin(teams.filter(t => t.league === 'C'));
    
    currentRound = saved.currentRound;
    myTeamId = saved.myTeamId;
    currentSeason = saved.currentSeason || 1;
    if (saved.myFormation) myFormation = saved.myFormation;
    if (saved.myAttitude) myAttitude = saved.myAttitude;
    
    myFunds = saved.myFunds || 0;
    availablePoints = saved.availablePoints || 0;
    if (availablePoints > 0) {
        myFunds += availablePoints * 100000 * Math.pow(1.09, 15);
        availablePoints = 0;
    }
    myMatchHistory = saved.myMatchHistory || [];
    
    myFundsText.innerText = formatCurrency(myFunds);
    
    let myTeam = teams.find(t => t.id === myTeamId);
    if (myTeam) {
        currentLeagueTab = myTeam.league;
        document.getElementById('tab-serie-a').style.opacity = currentLeagueTab === 'A' ? '1' : '0.5';
        document.getElementById('tab-serie-b').style.opacity = currentLeagueTab === 'B' ? '1' : '0.5';
        document.getElementById('tab-serie-c').style.opacity = currentLeagueTab === 'C' ? '1' : '0.5';
    }
    
    mainMenu.classList.add('hidden');
    leagueView.classList.remove('hidden');
    
    if (currentRound >= 38) {
        // Fix for saves that got stuck on round 38
        renderStandings(); // Make sure standings are sorted before handling
        handleSeasonEnd();
    } else {
        prepareRound();
    }
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

function prepareRound() {
    let myTeam = teams.find(t => t.id === myTeamId);
    let mySchedule = myTeam.league === 'A' ? scheduleA : (myTeam.league === 'B' ? scheduleB : scheduleC);
    const roundMatches = mySchedule[currentRound];
    currentRoundText.innerText = currentRound + 1;
    
    liveMatches = [];
    currentCanvasMatch = null;

    let allRoundMatches = scheduleA[currentRound].concat(scheduleB[currentRound], scheduleC[currentRound]);

    allRoundMatches.forEach(m => {
        if (m.a === myTeamId || m.b === myTeamId) currentCanvasMatch = m;
        else liveMatches.push(m);
    });

    teamAConfig = teams.find(t => t.id === currentCanvasMatch.a);
    teamBConfig = teams.find(t => t.id === currentCanvasMatch.b);
    
    teamANameEl.innerText = teamAConfig.name;
    teamBNameEl.innerText = teamBConfig.name;
    swatchA.style.background = teamAConfig.color;
    swatchB.style.background = teamBConfig.color;

    renderLiveMatches();
    renderStandings();
    renderSchedule();
    
    showFormationScreen();
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
            const ovrA = (tA ? tA.fin + tA.spd + tA.stm + tA.pre : 0) + 10; // +10 evita divisão por zero
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
    liveMatches.filter(m => {
        const tA = teams.find(t => t.id === m.a);
        return tA && tA.league === currentLeagueTab;
    }).forEach(m => {
        const tA = teams.find(t => t.id === m.a);
        const tB = teams.find(t => t.id === m.b);
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

function renderSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    
    let myTeam = teams.find(t => t.id === myTeamId);
    let mySchedule = myTeam.league === 'A' ? scheduleA : (myTeam.league === 'B' ? scheduleB : scheduleC);
    
    // Unify matches
    let allMatches = [];
    
    for (let r = 0; r < mySchedule.length; r++) {
        let roundMatch = mySchedule[r].find(m => m.a === myTeamId || m.b === myTeamId);
        if (roundMatch) {
            allMatches.push({
                round: r + 1,
                comp: 'Brasileirão',
                match: roundMatch
            });
        }
    }
    
    allMatches.forEach(item => {
        const m = item.match;
        const isHome = m.a === myTeamId;
        const oppId = isHome ? m.b : m.a;
        const oppTeam = teams.find(t => t.id === oppId);
        
        let statusHtml = '';
        let cardClass = 'schedule-card';
        
        if (item.round - 1 < currentRound) {
            // Finished
            let myScore = isHome ? m.scoreA : m.scoreB;
            let oppScore = isHome ? m.scoreB : m.scoreA;
            let color = myScore > oppScore ? '#22c55e' : (myScore === oppScore ? '#a1a1aa' : '#ef4444');
            statusHtml = `<div style="font-size: 1.5rem; font-weight: bold; color: ${color};">${myScore} - ${oppScore}</div>`;
        } else if (item.round - 1 === currentRound) {
            // Current
            cardClass += ' current';
            statusHtml = `<div style="font-size: 1rem; color: var(--accent-color); font-weight: bold;">HOJE</div>`;
        } else {
            // Future
            statusHtml = `<div style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">A JOGAR</div>`;
        }
        
        let oppHtml = `<div style="display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.9rem; margin-top: 5px;"><div class="color-swatch" style="width: 15px; height: 15px; background: ${oppTeam.color}; margin-right: 5px;"></div> ${oppTeam.name} ${isHome ? '(C)' : '(F)'}</div>`;
        
        const card = document.createElement('div');
        card.className = cardClass;
        card.innerHTML = `
            <div style="font-size: 0.8rem; color: #a1a1aa;">Rodada ${item.round}</div>
            <div class="schedule-comp-tag">${item.comp}</div>
            ${statusHtml}
            ${oppHtml}
        `;
        scheduleList.appendChild(card);
        
        // Auto-scroll to current match
        if (item.round - 1 === currentRound) {
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 100);
        }
    });
}

function finishRound() {
    currentCanvasMatch.scoreA = scoreA;
    currentCanvasMatch.scoreB = scoreB;
    currentCanvasMatch.finished = true;
    liveMatches.forEach(m => m.finished = true);

    let allRoundMatches = scheduleA[currentRound].concat(scheduleB[currentRound], scheduleC[currentRound]);
    allRoundMatches.forEach(m => {
        let tA = teams.find(t => t.id === m.a);
        let tB = teams.find(t => t.id === m.b);
        
        tA.pld++; tB.pld++;
        tA.gf += m.scoreA; tB.gf += m.scoreB;
        tA.ga += m.scoreB; tB.ga += m.scoreA;
        tA.gd = tA.gf - tA.ga;
        tB.gd = tB.gf - tB.ga;

        if (m.scoreA > m.scoreB) { tA.pts += 3; tA.w++; tB.l++; } 
        else if (m.scoreB > m.scoreA) { tB.pts += 3; tB.w++; tA.l++; } 
        else { tA.pts += 1; tB.pts += 1; tA.d++; tB.d++; }
    });

    renderStandings();
    
    // Economy and History
    let myTeam = teams.find(t => t.id === myTeamId);
    let leagueTeams = teams.filter(t => t.league === myTeam.league).sort((a,b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.w !== a.w) return b.w - a.w;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });
    let rank = leagueTeams.findIndex(t => t.id === myTeamId); // 0 to 19
    let baseAttendance = myTeam.league === 'A' ? 25000 : (myTeam.league === 'B' ? 8000 : 2000);
    let rankBonus = myTeam.league === 'A' ? (19 - rank) * 1500 : (myTeam.league === 'B' ? (19 - rank) * 600 : (19 - rank) * 200);
    let winRate = myTeam.pld > 0 ? (myTeam.w / myTeam.pld) : 0;
    let wrBonus = baseAttendance * 0.5 * winRate;
    
    let attendance = Math.floor(baseAttendance + rankBonus + wrBonus);
    let income = attendance * 50;
    myFunds += income;
    myFundsText.innerText = formatCurrency(myFunds);
    
    let oppTeamId = currentCanvasMatch.a === myTeamId ? currentCanvasMatch.b : currentCanvasMatch.a;
    let oppTeam = teams.find(t => t.id === oppTeamId);
    let isHome = currentCanvasMatch.a === myTeamId;
    let myScore = isHome ? currentCanvasMatch.scoreA : currentCanvasMatch.scoreB;
    let oppScore = isHome ? currentCanvasMatch.scoreB : currentCanvasMatch.scoreA;
    myMatchHistory.push({
        oppName: oppTeam.name,
        oppColor: oppTeam.color,
        scoreA: myScore,
        scoreB: oppScore,
        isWin: myScore > oppScore,
        isDraw: myScore === oppScore
    });
    
    currentRound++;
    saveGame();
    renderSchedule();

    if (currentRound >= 38) {
        handleSeasonEnd();
    } else {
        showOverlayMsg(`FIM DA RODADA\n\nPúblico: ${attendance.toLocaleString('pt-BR')}\nRenda: R$ ${formatCurrency(income)}\nTotal: R$ ${formatCurrency(myFunds)}`);
    }
}

function handleSeasonEnd() {
    let sortedA = teams.filter(t => t.league === 'A').sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.w !== a.w) return b.w - a.w;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });
    let sortedB = teams.filter(t => t.league === 'B').sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.w !== a.w) return b.w - a.w;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });
    let sortedC = teams.filter(t => t.league === 'C').sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.w !== a.w) return b.w - a.w;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });

    sortedA[0].titlesA++;
    sortedB[0].titlesB++;
    sortedC[0].titlesC++;

    let relegatedA = sortedA.slice(-4);
    let promotedB = sortedB.slice(0, 4);
    let relegatedB = sortedB.slice(-4);
    let promotedC = sortedC.slice(0, 4);
    
    relegatedA.forEach(t => t.league = 'B');
    promotedB.forEach(t => t.league = 'A');
    relegatedB.forEach(t => t.league = 'C');
    promotedC.forEach(t => t.league = 'B');
    
    let infoHtml = `
        <h3 style="color:#ef4444; margin-bottom:5px;">REBAIXADOS PARA SÉRIE B:</h3>
        <p style="margin-bottom:15px; font-size:14px;">${relegatedA.map(t => t.name).join(', ')}</p>
        <h3 style="color:#22c55e; margin-bottom:5px;">PROMOVIDOS PARA SÉRIE A:</h3>
        <p style="margin-bottom:15px; font-size:14px;">${promotedB.map(t => t.name).join(', ')}</p>
        <h3 style="color:#ef4444; margin-bottom:5px;">REBAIXADOS PARA SÉRIE C:</h3>
        <p style="margin-bottom:15px; font-size:14px;">${relegatedB.map(t => t.name).join(', ')}</p>
        <h3 style="color:#22c55e; margin-bottom:5px;">PROMOVIDOS PARA SÉRIE B:</h3>
        <p style="font-size:14px;">${promotedC.map(t => t.name).join(', ')}</p>
    `;
    
    document.getElementById('season-relegation-info').innerHTML = infoHtml;
    
    overlay.classList.remove('hidden');
    overlayMsgBox.classList.add('hidden');
    overlayFormationBox.classList.add('hidden');
    teamEditModal.classList.add('hidden');
    document.getElementById('season-end-modal').classList.remove('hidden');
}

document.getElementById('btn-next-season').onclick = () => {
    teams.forEach(t => {
        t.pts = 0; t.pld = 0; t.w = 0; t.d = 0; t.l = 0; t.gf = 0; t.ga = 0; t.gd = 0;
    });
    
    scheduleA = generateRoundRobin(teams.filter(t => t.league === 'A'));
    scheduleB = generateRoundRobin(teams.filter(t => t.league === 'B'));
    scheduleC = generateRoundRobin(teams.filter(t => t.league === 'C'));
    
    currentRound = 0;
    currentSeason++;
    saveGame();
    
    document.getElementById('season-end-modal').classList.add('hidden');
    prepareRound();
};

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
    if (gameState === STATE.MATCH_OVER && currentRound < 38) {
        prepareRound();
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
                    gameState = STATE.MATCH_OVER; finishRound();
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
    let leagueKey = `titles${currentTrophyTab}`;
    let winners = teams.filter(t => t[leagueKey] > 0).sort((a,b) => b[leagueKey] - a[leagueKey]);
    
    trophyList.innerHTML = '';
    if (winners.length === 0) {
        trophyList.innerHTML = '<div style="color: #a1a1aa; text-align: center; margin-top: 20px;">Nenhum campeão registrado ainda.</div>';
        return;
    }
    
    winners.forEach((t, index) => {
        let div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        let colorBox = `<div style="width:20px; height:20px; border-radius:50%; background:${t.color}; margin-right:10px;"></div>`;
        let rankStr = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index+1}º`));
        
        div.innerHTML = `
            <div style="width: 30px; text-align: center; margin-right: 10px; font-weight: bold; color: #fbbf24; font-size: 16px;">${rankStr}</div>
            ${colorBox}
            <div style="flex: 1; font-weight: bold;">${t.name}</div>
            <div style="font-weight: bold; color: #a855f7; font-size: 16px;">${t[leagueKey]}x 🏆</div>
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
    trophyTabA.style.border = tab === 'A' ? '1px solid var(--accent-color)' : 'none';
    trophyTabA.style.opacity = tab === 'A' ? '1' : '0.5';
    trophyTabB.style.border = tab === 'B' ? '1px solid var(--accent-color)' : 'none';
    trophyTabB.style.opacity = tab === 'B' ? '1' : '0.5';
    trophyTabC.style.border = tab === 'C' ? '1px solid var(--accent-color)' : 'none';
    trophyTabC.style.opacity = tab === 'C' ? '1' : '0.5';
    renderTrophyRoom();
}

trophyTabA.onclick = () => selectTrophyTab('A');
trophyTabB.onclick = () => selectTrophyTab('B');
trophyTabC.onclick = () => selectTrophyTab('C');

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
