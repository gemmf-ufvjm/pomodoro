// --- Elementos Globais ---
let body, modeRadios, timerStatus, timeDisplay, startPauseButton, resetButton, focusLogButton, focusSwitchButton,
    focusResetOnLogCheckbox, focusOptionsDiv, taskInput, categoryInput, categorySuggestions, sessionNotesInput,
    settingsSection, pomodoroSettingsDiv, cycleSequenceList, addSequenceBtn, longBreakIntervalInput,
    longBreakDurationInput, pomodoroPresetsDiv, customGoalsSection, customGoalsList, addGoalForm,
    newGoalNameInput, newGoalTypeSelect, newGoalTargetInput, addGoalButton, logTableBody, logEmptyMessage,
    downloadLogButton, clearLogButton, tabButtons, tabContents, resetAllButton, themeToggleButton,
    audioPlayer, statCyclesToday, statFocusToday, statBreakToday, exportDataButton, importFileInput,
    importDataButton, toastNotification, currentYearSpan,
    // Novos v3.2+ (sem PiP)
    saveTaskBtn, saveCategoryBtn, taskSuggestions,
    dailyProgressBarFill, dailyGoalMarkers, dailyProgressLabel, quoteDisplay, volumeControl, volumeValueSpan,
    browserNotificationsCheckbox, notificationPermissionStatus, requestNotificationPermissionButton,
    newGoalCategoryInput, sessionGoalInput,
    // Novos v3.3+
    soundSelectWork, soundSelectBreak, playSoundTestWork, playSoundTestBreak,
    autoStartWorkCheckbox, autoStartBreakCheckbox, addManualLogButton, manualLogModal, manualLogForm,
    cancelManualLogButton, manualTaskInput, manualCategoryInput, manualDurationInput, manualDateInput, manualTimeInput, manualNotesInput,
    // Novos para Gerenciar Itens Salvos (Adicionado)
    manageSavedItemsBtn, manageSavedItemsModal, closeManageModalBtn, savedTasksListUl, savedCategoriesListUl,
    // Elementos Stats
    textStatFocusWorkToday, textStatFocusWorkWeek, textStatCyclesToday, textStatCyclesWeek, textStatAvgSession,
    textStatTotalFocusWorkAll, textStatTotalCyclesAll, textStatBreakToday, textStatBreakWeek,
    textStatTotalBreakAll, textStatRatioToday, textStatRatioWeek;

// --- Variáveis de Estado ---
let timerMode = 'pomodoro';
let timerInterval = null;
let timeLeft = 0; // Segundos
let currentSequence = [];
let currentStepIndex = 0;
let currentRepetition = 1;
let cyclesSinceLongBreak = 0;
let isWorking = true;
let isFocusing = true;
let isPaused = true;
let logEntries = [];
let customGoals = [];
let currentTheme = 'light';
let resetFocusOnLog = false;
let toastTimeout = null;
let soundUrls = {};
let userInteracted = false;
// Novas v3.2+ (sem PiP)
let savedTasks = [];
let savedCategories = [];
// REMOVED: let isPipActive = false;
const DAILY_FOCUS_TARGET = 180; // Meta diária padrão em minutos para a barra
let motivationalQuotes = [];
let currentVolume = 0.7;
let browserNotificationsEnabled = false;
let notificationPermission = 'default';
// Novas v3.3+
let selectedSoundWork = 'bell';
let selectedSoundBreak = 'ting';
let autoStartWorkEnabled = false;
let autoStartBreakEnabled = false;
let autoStartTimeout = null; // Timeout para delay do auto-start

// --- Configuração Gráficos ---
const chartElements = {
    category: { ctx: null, chart: null, noData: null, canvas: null },
    task: { ctx: null, chart: null, noData: null, canvas: null },
    dailyActivity: { ctx: null, chart: null, noData: null, canvas: null },
    focusBreak: { ctx: null, chart: null, noData: null, canvas: null },
    timeOfDay: { ctx: null, chart: null, noData: null, canvas: null },
};

// --- Inicialização ---
async function initializeApp() {
    console.log("--- Initializing App v3.3 (No PiP) ---"); // Mensagem atualizada
    try {
        assignDOMElements();
        initializeChartElements();
        loadTheme();
        loadSettingsAndData(); // Carrega tudo (settings, log, saved items)
        loadInitialTimerMode();
        initializeAppUI(); // Configura UI inicial com dados carregados
        initializeTimer(); // Define estado inicial do timer
        setupEventListeners();
        if(currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
        await loadMotivationalQuotes();
        displayRandomQuote();
        checkNotificationPermission(); // Verifica e atualiza UI da permissão
        console.log("--- App Initialized Successfully (v3.3 - No PiP) ---");
    } catch (error) {
        console.error("FATAL ERROR during initializeApp:", error);
        showToast("Erro crítico ao iniciar. Verifique o console (F12).", "error", 10000);
    }
}

// --- Atribuição de Elementos DOM ---
function assignDOMElements() {
    console.log("Assigning DOM Elements...");
    body = document.getElementById('body');
    modeRadios = document.querySelectorAll('input[name="timer-mode"]');
    timerStatus = document.getElementById('timer-status');
    timeDisplay = document.getElementById('time-display');
    startPauseButton = document.getElementById('start-pause-button');
    resetButton = document.getElementById('reset-button');
    focusLogButton = document.getElementById('focus-log-button');
    focusSwitchButton = document.getElementById('focus-switch-button');
    focusResetOnLogCheckbox = document.getElementById('focus-reset-on-log');
    focusOptionsDiv = document.querySelector('.focus-options');
    taskInput = document.getElementById('task-input');
    categoryInput = document.getElementById('category-input');
    categorySuggestions = document.getElementById('category-suggestions');
    sessionNotesInput = document.getElementById('session-notes');
    settingsSection = document.getElementById('settings-section');
    pomodoroSettingsDiv = document.getElementById('pomodoro-settings');
    cycleSequenceList = document.getElementById('cycle-sequence-list');
    addSequenceBtn = document.getElementById('add-sequence-btn');
    longBreakIntervalInput = document.getElementById('long-break-interval');
    longBreakDurationInput = document.getElementById('long-break-duration');
    pomodoroPresetsDiv = document.querySelector('.pomodoro-presets');
    customGoalsSection = document.querySelector('.custom-goals-section');
    customGoalsList = document.getElementById('custom-goals-list');
    addGoalForm = document.querySelector('.add-goal-form');
    newGoalNameInput = document.getElementById('new-goal-name');
    newGoalTypeSelect = document.getElementById('new-goal-type');
    newGoalTargetInput = document.getElementById('new-goal-target');
    addGoalButton = document.getElementById('add-goal-btn');
    logTableBody = document.getElementById('log-body');
    logEmptyMessage = document.getElementById('log-empty-message');
    downloadLogButton = document.getElementById('download-log-button');
    clearLogButton = document.getElementById('clear-log-button');
    tabButtons = document.querySelectorAll('.tab-button');
    tabContents = document.querySelectorAll('.tab-content');
    resetAllButton = document.getElementById('reset-all-button');
    themeToggleButton = document.getElementById('theme-toggle-button');
    audioPlayer = document.getElementById('audio-player');
    statCyclesToday = document.getElementById('stat-cycles-today');
    statFocusToday = document.getElementById('stat-focus-today');
    statBreakToday = document.getElementById('stat-break-today');
    exportDataButton = document.getElementById('export-data-button');
    importFileInput = document.getElementById('import-file-input');
    importDataButton = document.getElementById('import-data-button');
    toastNotification = document.getElementById('toast-notification');
    currentYearSpan = document.getElementById('current-year');
    // v3.2+ (sem PiP)
    // REMOVED: pipButton = document.getElementById('pip-button');
    // REMOVED: pipCanvas = document.getElementById('pip-canvas');
    // REMOVED: pipVideo = document.getElementById('pip-video');
    // REMOVED: if (pipCanvas) pipCanvasCtx = pipCanvas.getContext('2d');
    saveTaskBtn = document.getElementById('save-task-btn');
    saveCategoryBtn = document.getElementById('save-category-btn');
    taskSuggestions = document.getElementById('task-suggestions');
    dailyProgressBarFill = document.getElementById('daily-progress-fill');
    dailyGoalMarkers = document.getElementById('daily-goal-markers');
    dailyProgressLabel = document.getElementById('daily-progress-label');
    quoteDisplay = document.getElementById('quote-display');
    volumeControl = document.getElementById('volume-control');
    volumeValueSpan = document.getElementById('volume-value');
    browserNotificationsCheckbox = document.getElementById('browser-notifications-enabled');
    notificationPermissionStatus = document.getElementById('notification-permission-status');
    requestNotificationPermissionButton = document.getElementById('request-notification-permission');
    newGoalCategoryInput = document.getElementById('new-goal-category');
    sessionGoalInput = document.getElementById('session-goal');
    // v3.3+
    soundSelectWork = document.getElementById('sound-select-work');
    soundSelectBreak = document.getElementById('sound-select-break');
    playSoundTestWork = document.getElementById('play-sound-test-work');
    playSoundTestBreak = document.getElementById('play-sound-test-break');
    autoStartWorkCheckbox = document.getElementById('auto-start-work');
    autoStartBreakCheckbox = document.getElementById('auto-start-break');
    addManualLogButton = document.getElementById('add-manual-log-button');
    manualLogModal = document.getElementById('manual-log-modal');
    manualLogForm = document.getElementById('manual-log-form');
    cancelManualLogButton = document.getElementById('cancel-manual-log');
    manualTaskInput = document.getElementById('manual-task');
    manualCategoryInput = document.getElementById('manual-category');
    manualDurationInput = document.getElementById('manual-duration');
    manualDateInput = document.getElementById('manual-date');
    manualTimeInput = document.getElementById('manual-time');
    manualNotesInput = document.getElementById('manual-notes');
    // ADICIONADO: Gerenciar Itens Salvos
    manageSavedItemsBtn = document.getElementById('manage-saved-items-btn');
    manageSavedItemsModal = document.getElementById('manage-saved-items-modal');
    closeManageModalBtn = document.getElementById('close-manage-modal');
    savedTasksListUl = document.getElementById('saved-tasks-list');
    savedCategoriesListUl = document.getElementById('saved-categories-list');

    // Text Stats
    textStatFocusWorkToday = document.getElementById('text-stat-focus-work-today');
    textStatFocusWorkWeek = document.getElementById('text-stat-focus-work-week');
    textStatCyclesToday = document.getElementById('text-stat-cycles-today');
    textStatCyclesWeek = document.getElementById('text-stat-cycles-week');
    textStatAvgSession = document.getElementById('text-stat-avg-session');
    textStatTotalFocusWorkAll = document.getElementById('text-stat-total-focus-work-all');
    textStatTotalCyclesAll = document.getElementById('text-stat-total-cycles-all');
    textStatBreakToday = document.getElementById('text-stat-break-today');
    textStatBreakWeek = document.getElementById('text-stat-break-week');
    textStatTotalBreakAll = document.getElementById('text-stat-total-break-all');
    textStatRatioToday = document.getElementById('text-stat-ratio-today');
    textStatRatioWeek = document.getElementById('text-stat-ratio-week');

    // Sound URLs
    soundUrls = {
        alarm_clock: document.getElementById('sound-url-alarm_clock')?.dataset.url, bell: document.getElementById('sound-url-bell')?.dataset.url,
        digital: document.getElementById('sound-url-digital')?.dataset.url, chime: document.getElementById('sound-url-chime')?.dataset.url,
        success: document.getElementById('sound-url-success')?.dataset.url, ting: document.getElementById('sound-url-ting')?.dataset.url,
        flute: document.getElementById('sound-url-flute')?.dataset.url, none: null };
    console.log("DOM Elements Assigned.");
}

// --- Inicialização dos Gráficos ---
function initializeChartElements() {
    console.log("Initializing Chart Elements...");
    const chartsToInit = ['category', 'task', 'dailyActivity', 'focusBreak', 'timeOfDay'];
    chartsToInit.forEach(key => {
        try {
            chartElements[key].canvas = document.getElementById(`${key}Chart`);
            if (chartElements[key].canvas) {
                chartElements[key].ctx = chartElements[key].canvas.getContext('2d');
                chartElements[key].noData = document.getElementById(`${key}Chart-no-data`);
                // Destruir gráfico antigo se existir (evita problemas de re-renderização)
                if (chartElements[key].chart) {
                    chartElements[key].chart.destroy();
                    chartElements[key].chart = null;
                }
            } else {
                 console.warn(`Canvas element not found for chart: ${key}Chart`);
            }
        } catch (e) {
            console.error(`Error initializing chart element ${key}:`, e);
        }
    });
}

// --- Carrega Configs, Log, Tarefas/Categorias Salvas ---
function loadSettingsAndData() {
    console.log("Loading Settings & Data...");
    loadLogFromLocalStorage();
    loadSettings(); // Carrega tudo de localStorage.pomodoroSettings_v3.3
    loadSavedItems(); // Popula datalists com tasks/cats salvas
}

// --- Inicialização da UI ---
function initializeAppUI() {
    console.log("Initializing App UI...");
    try {
        updateModeUI();
        updateSequenceUI();
        updateCustomGoalsUI();
        updateLogTable();
        updateCharts(); // Renderiza gráficos iniciais
        populateCategorySuggestions(); // Popula datalist categorias
        populateTaskSuggestions(); // Popula datalist tarefas
        updateMiniDashboard();
        updateTextStats();
        updateDailyProgressBar();
        // Aplicar settings na UI
        if (soundSelectWork) soundSelectWork.value = selectedSoundWork;
        if (soundSelectBreak) soundSelectBreak.value = selectedSoundBreak;
        if (focusResetOnLogCheckbox) focusResetOnLogCheckbox.checked = resetFocusOnLog;
        if (volumeControl) volumeControl.value = currentVolume;
        if (audioPlayer) audioPlayer.volume = currentVolume;
        if (volumeValueSpan) volumeValueSpan.textContent = `${Math.round(currentVolume * 100)}%`;
        if (browserNotificationsCheckbox) browserNotificationsCheckbox.checked = browserNotificationsEnabled;
        if (autoStartWorkCheckbox) autoStartWorkCheckbox.checked = autoStartWorkEnabled;
        if (autoStartBreakCheckbox) autoStartBreakCheckbox.checked = autoStartBreakEnabled;
        setupTabs();
        toggleGoalCategoryInput(); // Garante estado inicial correto
    } catch (error) {
        console.error("Error during initializeAppUI:", error);
    }
}

// --- Configuração Inicial do Timer ---
function initializeTimer() {
    console.log("Initializing Timer State...");
    try {
        clearTimeout(autoStartTimeout); // Limpa qualquer auto-start pendente
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        let initialTime = 0; // Tempo inicial padrão

        if (timerMode === 'pomodoro') {
            if (!Array.isArray(currentSequence) || currentSequence.length === 0) {
                console.warn("Pomodoro sequence empty/invalid, resetting to default.");
                currentSequence = [{ work: 25, break: 5, reps: 4 }];
                updateSequenceUI(); // Atualiza UI se resetou a sequência
            }
            currentStepIndex = 0;
            currentRepetition = 1;
            cyclesSinceLongBreak = 0;
            isWorking = true;
            initialTime = (currentSequence[0]?.work || 25) * 60;
        } else { // Modo Focus
            isFocusing = true;
            initialTime = 0;
        }
        timeLeft = initialTime;

        if(sessionNotesInput) sessionNotesInput.value = '';
        if(sessionGoalInput) sessionGoalInput.value = ''; // Limpa meta da sessão ao iniciar

        updateDisplay();
        updateButtonAndStatus();
        updateBodyClass();
    } catch (error) {
        console.error("Error during initializeTimer:", error);
    }
}

// --- Atualiza Toda a UI ---
function updateAllUI() {
    try {
        updateDisplay();
        updateButtonAndStatus();
        updateBodyClass();
        checkCustomGoals(); // Verifica e atualiza metas
        updateCustomGoalsUI(); // Garante UI das metas
        updateLogTable();
        updateCharts(); // Atualiza todos os gráficos
        populateCategorySuggestions(); // Atualiza caso novas cats surjam
        populateTaskSuggestions(); // Atualiza caso novas tasks surjam
        updateMiniDashboard();
        updateTextStats();
        updateDailyProgressBar(); // Atualiza a barra de progresso
    } catch (error) {
        console.error("Error during updateAllUI:", error);
    }
}

// --- Atualiza Display do Tempo ---
function updateDisplay() {
    if (!timeDisplay) return;
    try {
        const minutes = Math.floor(Math.abs(timeLeft) / 60);
        const seconds = Math.abs(timeLeft) % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;

        const phase = getPhaseName();
        let titleTime = formattedTime;
        let titlePhase = phase;

        if (isPaused) {
             titleTime = `(Pausado)`;
             // Define o estado "Pronto" corretamente
             if (timerInterval === null) { // Se timer está parado (não apenas pausado)
                 if (timerMode === 'focus' && timeLeft === 0) {
                     titlePhase = isFocusing ? 'Pronto p/ Foco' : 'Pronto p/ Descanso';
                 } else if (timerMode === 'pomodoro') {
                     titlePhase = `Pronto p/ ${phase}`;
                 } else {
                     titlePhase = "Pronto"; // Fallback
                 }
             } else {
                 titlePhase = `Pausado - ${phase}`; // Pausado no meio da contagem
             }
        }

        document.title = `${titleTime} - ${titlePhase} | Pomoverso`;

        // REMOVED: Atualiza Canvas do PiP se ativo
        // REMOVED: if (isPipActive && pipCanvasCtx) {
        // REMOVED:      drawPipCanvas();
        // REMOVED: }
    } catch (error) {
        console.error("Error updating display:", error);
    }
}

// --- Atualiza Botões e Status ---
function updateButtonAndStatus() {
    if (!startPauseButton || !timerStatus || !focusLogButton || !focusSwitchButton || !focusOptionsDiv) {
        console.warn("One or more button/status elements not found in updateButtonAndStatus");
        return;
    }
    try {
        const startIcon = '<i class="fa-solid fa-play"></i>';
        const pauseIcon = '<i class="fa-solid fa-pause"></i>';
        const logIcon = '<i class="fa-solid fa-save"></i>';
        const switchIcon = '<i class="fa-solid fa-repeat"></i>';

        startPauseButton.disabled = false;

        // Desabilita reset se: pausado E (timer nunca iniciado OU (pomodoro no início do trabalho) OU (foco zerado))
        const pomodoroAtStart = timerMode === 'pomodoro' && isWorking && currentRepetition === 1 && timeLeft === (currentSequence[currentStepIndex]?.work || 0) * 60;
        const focusAtStart = timerMode === 'focus' && timeLeft === 0;
        resetButton.disabled = isPaused && (timerInterval === null || pomodoroAtStart || focusAtStart);

        const currentPhaseName = getPhaseName();

        if (isPaused) {
            startPauseButton.innerHTML = `${startIcon} Iniciar`;
            startPauseButton.classList.add('paused');
            if (timerInterval === null) { // Nunca iniciado nesta fase
                 if (timerMode === 'pomodoro') {
                    timerStatus.textContent = `Pronto para ${currentPhaseName}`;
                 } else { // Modo foco, tempo 0
                     timerStatus.textContent = `Pronto para ${isFocusing ? 'Foco' : 'Descanso Livre'}`;
                     startPauseButton.innerHTML = `${startIcon} ${isFocusing ? 'Iniciar Foco' : 'Iniciar Descanso'}`;
                 }
            } else { // Foi pausado no meio
                 timerStatus.textContent = `Pausado - ${currentPhaseName}`;
            }
        } else { // Timer rodando
            startPauseButton.innerHTML = `${pauseIcon} Pausar`;
            startPauseButton.classList.remove('paused');
            timerStatus.textContent = `Em andamento - ${currentPhaseName}`;
        }

        // Controle dos botões específicos do modo Focus
        const isPomodoro = timerMode === 'pomodoro';
        focusOptionsDiv.style.display = isPomodoro ? 'none' : 'block';
        // Botão Logar: visível no modo foco se o tempo for > 0
        focusLogButton.style.display = (!isPomodoro && timeLeft > 0) ? 'inline-flex' : 'none';
        // Botão Alternar: SEMPRE visível no modo foco
        focusSwitchButton.style.display = isPomodoro ? 'none' : 'inline-flex';

        if (!isPomodoro) {
            // Texto do botão Alternar muda para o *destino* da ação
            focusSwitchButton.innerHTML = `${switchIcon} ${isFocusing ? 'Iniciar Descanso' : 'Iniciar Foco'}`;
            focusLogButton.innerHTML = `${logIcon} Registrar ${isFocusing ? 'Foco' : 'Descanso'}`;
        }

    } catch (error) {
        console.error("Error updating button status:", error);
    }
}

// --- Atualiza Classe do Body ---
function updateBodyClass() {
    if (!body) return;
    try {
        body.classList.remove('state-working', 'state-breaking', 'state-focus', 'state-focus-break');
        if (!isPaused) {
            if (timerMode === 'pomodoro') {
                body.classList.add(isWorking ? 'state-working' : 'state-breaking');
            } else { // Modo Focus
                body.classList.add(isFocusing ? 'state-focus' : 'state-focus-break');
            }
        }
    } catch (error) {
        console.error("Error updating body class:", error);
    }
}

// --- Atualiza UI Baseado no Modo ---
function updateModeUI() {
    const isPomodoro = timerMode === 'pomodoro';
    if (pomodoroSettingsDiv) pomodoroSettingsDiv.style.display = isPomodoro ? 'block' : 'none';
    // Garante visibilidade correta dos controles de Foco
    if (focusLogButton) focusLogButton.style.display = 'none'; // Esconde inicialmente
    if (focusSwitchButton) focusSwitchButton.style.display = isPomodoro ? 'none' : 'inline-flex'; // Mostra se for modo Foco
    if (focusOptionsDiv) focusOptionsDiv.style.display = isPomodoro ? 'none' : 'block';
    try {
        const radio = document.querySelector(`input[name="timer-mode"][value="${timerMode}"]`);
        if (radio) radio.checked = true;
    } catch (e) { console.error("Error setting mode radio:", e); }
}

// --- Obtém Nome da Fase ---
function getPhaseName(initial = false) {
    try {
        if (timerMode === 'pomodoro') {
            const step = currentSequence[currentStepIndex];
            // Verifica se é long break apenas se houver um step válido
            const isLong = step ? isLongBreak() : false;
            if (isWorking) {
                return initial ? 'Ciclo de Trabalho' : 'Trabalho';
            } else {
                // Se não houver step (sequência vazia?), assume descanso curto
                if (!step) return initial ? 'Descanso Curto' : 'Descanso Curto';
                return isLong ? (initial ? 'Descanso Longo' : 'Descanso Longo') : (initial ? 'Descanso Curto' : 'Descanso Curto');
            }
        } else { // Modo Focus
            return isFocusing ? (initial ? 'Foco' : 'Foco') : (initial ? 'Descanso Livre' : 'Descanso Livre');
        }
    } catch (e) {
        console.error("Error in getPhaseName:", e);
        return "Erro";
    }
}

// --- Verifica se é Descanso Longo ---
function isLongBreak() {
    if(timerMode !== 'pomodoro' || isWorking) return false; // Só se aplica a pomodoro em descanso
    try {
        const intervalSetting = parseInt(longBreakIntervalInput?.value || '0');
        // Verifica se o descanso longo está ativo e se o número de ciclos *completados* atingiu o intervalo
        return intervalSetting > 0 && cyclesSinceLongBreak >= intervalSetting;
    } catch (e) {
        console.error("Error in isLongBreak:", e);
        return false;
    }
}

// --- Mostra Notificação Toast ---
function showToast(message, type = 'info', duration = 3000) {
    if (!toastNotification) return;
    try {
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
        else if (type === 'error') iconClass = 'fa-times-circle';

        toastNotification.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${message}`;
        toastNotification.className = `toast ${type}`; // Define classes base e tipo
        toastNotification.classList.add('show'); // Mostra o toast

        // Limpa timeout anterior se houver
        clearTimeout(toastTimeout);

        // Define novo timeout para esconder
        toastTimeout = setTimeout(() => {
            if (toastNotification) toastNotification.classList.remove('show');
        }, duration);
    } catch (error) {
        console.error("Error showing toast:", error);
    }
}

// --- Tick do Timer ---
function timerTick() {
    if (isPaused) return;
    try {
        if (timerMode === 'pomodoro') {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else { // Fim da fase Pomodoro
                clearInterval(timerInterval);
                timerInterval = null;
                const wasWorking = isWorking;
                const phaseJustEnded = getPhaseName();
                const step = currentSequence[currentStepIndex];
                let durationToLog = 0;

                if (wasWorking && step) { durationToLog = step.work; }
                else if (!wasWorking && step) { durationToLog = isLongBreak() ? parseInt(longBreakDurationInput?.value || '15') : step.break; }

                if(durationToLog > 0) { // Só loga se houve duração
                    logCycle(phaseJustEnded, durationToLog);
                }
                playNotification(wasWorking ? 'work' : 'break'); // Toca som específico da fase
                displayRandomQuote(); // Mostra nova citação
                checkAndShowBrowserNotification(phaseJustEnded); // Tenta notificação do navegador

                switchPhaseSetup(); // Prepara a próxima fase (define isWorking, timeLeft, etc.)

                // Verifica se deve iniciar automaticamente a *próxima* fase
                const shouldAutoStart = (isWorking && autoStartWorkEnabled) || (!isWorking && autoStartBreakEnabled);

                if (shouldAutoStart && timeLeft > 0) { // Só inicia se a próxima fase tiver tempo > 0
                    isPaused = false; // Não pausa
                    showToast(`${phaseJustEnded} concluído! Iniciando ${getPhaseName()}...`, 'success', 2500);
                    // Pequeno delay antes de iniciar o timer para a transição ser visível
                    clearTimeout(autoStartTimeout);
                    autoStartTimeout = setTimeout(() => {
                        if (!isPaused) { // Verifica se não foi pausado manualmente nesse meio tempo
                           startTimer(); // Inicia o novo timer
                        }
                    }, 1500); // Delay de 1.5s
                } else {
                    isPaused = true; // Pausa normal
                     showToast(`${phaseJustEnded} concluído! Pronto para ${getPhaseName()}.`, 'success');
                }

                updateDisplay(); // Atualiza display para nova fase
                updateButtonAndStatus();
                updateBodyClass();
            }
        } else { // Modo Focus (contador crescente)
            timeLeft++;
            updateDisplay();
             // Habilita botões se estavam desabilitados (ex: Logar, Resetar)
            if(timeLeft === 1 && focusLogButton) {
                 focusLogButton.style.display = 'inline-flex';
                 if(resetButton.disabled) resetButton.disabled = false;
            }
        }
    } catch (error) {
        console.error("Error during timerTick:", error);
        pauseTimer(); // Pausa em caso de erro
        showToast("Erro no timer. Verifique o console.", "error");
    }
}


// --- Inicia o Timer ---
function startTimer() {
    if (isPaused) {
        try {
            isPaused = false;
            clearTimeout(autoStartTimeout); // Cancela auto-start se iniciar manualmente
            clearInterval(timerInterval); // Limpa intervalo antigo

            // Se for modo Pomodoro, estava em pausa, era descanso e o tempo acabou,
            // reconfigura para o próximo trabalho antes de iniciar.
            if (timerMode === 'pomodoro' && !isWorking && timeLeft <= 0 && timerInterval === null) {
                console.log("Starting next work cycle after break completed.");
                switchPhaseSetup(); // Configura para o próximo trabalho
                updateDisplay(); // Atualiza o display com o tempo do trabalho
            }
            // Garante que tempo não seja negativo no pomodoro
            if (timerMode === 'pomodoro' && timeLeft < 0) timeLeft = 0;

            // Inicia o novo intervalo
            timerInterval = setInterval(timerTick, 1000);
            updateButtonAndStatus();
            updateBodyClass();
        } catch (error) {
            console.error("Error starting timer:", error);
            isPaused = true; // Garante que o estado reflita a falha
            showToast("Erro ao iniciar o timer.", "error");
        }
    }
}

// --- Pausa o Timer ---
function pauseTimer() {
    if (!isPaused) {
        isPaused = true;
        clearTimeout(autoStartTimeout); // Cancela auto-start se pausar
        clearInterval(timerInterval);
        // Não reseta timerInterval para null aqui, para sabermos que foi pausado
        updateButtonAndStatus();
        updateBodyClass();
        updateDisplay(); // Atualiza título para (Pausado)
    }
}

// --- Reseta o Timer ---
function resetTimer() {
    try {
        pauseTimer(); // Garante pausa e cancela auto-start/intervalo
        timerInterval = null; // Indica que foi parado/resetado
        initializeTimer(); // Reinicializa tempo e estado para o início da fase atual
        updateAllUI(); // Atualiza toda a UI
        showToast("Timer resetado.", "info");
    } catch (error) {
        console.error("Error resetting timer:", error);
        showToast("Erro ao resetar o timer.", "error");
    }
}

// --- Alterna Iniciar/Pausar ---
function toggleStartPause() {
    // Registra interação do usuário para permitir áudio
    if (!userInteracted) {
        userInteracted = true;
        const initialAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        initialAudio.volume = 0.01;
        initialAudio.play().catch(e => console.warn("Initial silent audio play failed (expected on some browsers):", e));
        console.log("User interaction detected. Audio enabled.");
    }

    try {
        if (isPaused) {
            startTimer();
        } else {
            pauseTimer();
        }
    } catch (error) {
        console.error("Error toggling start/pause:", error);
        showToast("Erro ao iniciar/pausar.", "error");
    }
}


// --- Configura a Próxima Fase (Pomodoro) ---
function switchPhaseSetup() {
    if (timerMode !== 'pomodoro') return;
    try {
        const wasWorking = isWorking;
        let nextTime = 0;

        // Incrementa contador para descanso longo APÓS trabalho
        if (wasWorking) {
            cyclesSinceLongBreak++;
        }

        const intervalSetting = parseInt(longBreakIntervalInput?.value || '0');
        // Verifica se deve ser descanso longo (APÓS um ciclo de trabalho)
        const shouldBeLongBreak = wasWorking && intervalSetting > 0 && cyclesSinceLongBreak >= intervalSetting;

        if (shouldBeLongBreak) {
            isWorking = false; // Próxima fase é descanso longo
            nextTime = parseInt(longBreakDurationInput?.value || '15') * 60;
            cyclesSinceLongBreak = 0; // Reseta contador AO INICIAR descanso longo
            console.log("Setting up: Long Break");
        } else {
            const currentStep = currentSequence[currentStepIndex];
            if (!currentStep) {
                console.error("Invalid sequence step:", currentStepIndex, currentSequence);
                showToast("Erro na sequência. Resetando.", "error");
                initializeTimer(); return; // Reseta para evitar erros
            }

            if (wasWorking) { // Terminou trabalho -> Descanso curto ou próximo trabalho
                if (currentStep.break > 0) {
                    isWorking = false; // Vai para descanso
                    nextTime = currentStep.break * 60;
                    console.log(`Setting up: Short Break (Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
                } else { // Sem descanso, avança direto para o próximo trabalho
                    isWorking = true; // Continua trabalho
                    moveToNextRepOrStep(); // Avança repetição/passo
                    const nextStep = currentSequence[currentStepIndex]; // Pega o NOVO passo
                    nextTime = (nextStep?.work || 0) * 60; // Tempo do NOVO passo
                    console.log(`Setting up: Next Work (No break - Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
                }
            } else { // Terminou descanso -> Próximo trabalho
                isWorking = true; // Vai para trabalho
                moveToNextRepOrStep(); // Avança repetição/passo
                const nextStep = currentSequence[currentStepIndex]; // Pega o NOVO passo
                nextTime = (nextStep?.work || 0) * 60; // Tempo do NOVO passo
                console.log(`Setting up: Next Work (After break - Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
            }
        }

        timeLeft = nextTime;
        if (sessionNotesInput) sessionNotesInput.value = ''; // Limpa notas para a nova fase
        if(sessionGoalInput) sessionGoalInput.value = ''; // Limpa meta da sessão
    } catch (error) {
        console.error("Error during switchPhaseSetup:", error);
        showToast("Erro ao mudar de fase. Resetando.", "error");
        initializeTimer(); // Reseta em caso de erro grave
    }
}

// --- Avança Rep/Passo (Pomodoro) ---
function moveToNextRepOrStep() {
    try {
        // Verifica se a sequência e o passo atual são válidos
        if (!Array.isArray(currentSequence) || currentSequence.length === 0 || !currentSequence[currentStepIndex]) {
             console.error("Cannot move to next step: Invalid sequence or step index.", currentStepIndex, currentSequence);
             currentStepIndex = 0; // Reseta para o início da sequência
             currentRepetition = 1;
             return;
        }

        const currentStep = currentSequence[currentStepIndex];

        if (currentRepetition < currentStep.reps) {
            currentRepetition++;
            console.log(`Incrementing Repetition to ${currentRepetition} for Step ${currentStepIndex + 1}`);
        } else { // Última repetição do passo atual, avança para o próximo passo
            currentStepIndex++;
            currentRepetition = 1; // Reseta repetição para o novo passo
            console.log(`Moving to Step ${currentStepIndex + 1}`);
            if (currentStepIndex >= currentSequence.length) { // Chegou ao fim da sequência
                console.log("Sequence Finished. Resetting to beginning.");
                currentStepIndex = 0; // Volta ao primeiro passo
                cyclesSinceLongBreak = 0; // Reseta contador de descanso longo ao reiniciar a sequência
                showToast("Sequência Pomodoro Completa! Reiniciando...", "success", 4000);
            }
        }
    } catch (error) {
        console.error("Error moving to next rep/step:", error);
        // Tenta resetar para um estado seguro
        currentStepIndex = 0;
        currentRepetition = 1;
        cyclesSinceLongBreak = 0;
        showToast("Erro ao avançar na sequência.", "error");
    }
}

// --- Alterna Foco/Descanso (Modo Focus) ---
function switchFocusBreak() {
    if (timerMode !== 'focus') return;
    try {
        let shouldLog = false;
        const currentTime = timeLeft;
        const currentPhaseType = isFocusing ? 'Foco' : 'Descanso Livre';
        const durationToLog = Math.max(0, Math.floor(currentTime / 60));

        if (currentTime > 0) {
            if (confirm(`Registrar os ${durationToLog} minutos de ${currentPhaseType} atuais antes de alternar?`)) {
                shouldLog = true;
            }
        }

        if (shouldLog) {
            logCycle(currentPhaseType, durationToLog); // Loga o tempo atual ANTES de resetar
        }

        // Alterna o estado
        isFocusing = !isFocusing;
        timeLeft = 0; // Reseta o tempo
        isPaused = true; // Pausa para o usuário iniciar
        clearInterval(timerInterval);
        timerInterval = null; // Indica parado
        if (sessionNotesInput) sessionNotesInput.value = '';
        if (sessionGoalInput) sessionGoalInput.value = ''; // Limpa meta da sessão

        updateDisplay();
        updateButtonAndStatus(); // Atualiza botões/status para o novo estado
        updateBodyClass();
        showToast(`Modo alterado para ${getPhaseName()}. Pronto para iniciar.`, "info");
    } catch (error) {
        console.error("Error switching focus/break:", error);
        showToast("Erro ao alternar foco/descanso.", "error");
    }
}


// --- Gerenciamento da Sequência Pomodoro (UI e Lógica) ---
function updateSequenceUI() {
    if (!cycleSequenceList) return;
    try {
        cycleSequenceList.innerHTML = ''; // Limpa a lista atual
        if (!Array.isArray(currentSequence)) currentSequence = []; // Garante que é array

        currentSequence.forEach((step, index) => {
            const item = document.createElement('div');
            item.classList.add('sequence-item');
            item.dataset.index = index; // Guarda o índice no elemento
            // Cria o HTML para o item da sequência
            item.innerHTML = `
                <span>Bloco ${index + 1}:
                    <input type="number" value="${step.work}" min="1" class="seq-work" data-prop="work" title="Minutos de Trabalho"> min Trab /
                    <input type="number" value="${step.break}" min="0" class="seq-break" data-prop="break" title="Minutos de Descanso (0 = sem descanso)"> min Desc -
                    Repetir <input type="number" value="${step.reps}" min="1" class="seq-reps" data-prop="reps" title="Número de Repetições"> vez(es)
                </span>
                <button class="remove-sequence-btn" title="Remover Bloco"><i class="fa-solid fa-trash-can"></i></button>
            `;
            cycleSequenceList.appendChild(item);

            // Adiciona listeners específicos para este item (importante!)
            const removeBtn = item.querySelector('.remove-sequence-btn');
            if (removeBtn) {
                 removeBtn.addEventListener('click', handleRemoveSequence);
            }
            item.querySelectorAll('input[type="number"]').forEach(input => {
                input.addEventListener('change', handleSequenceInputChange);
                 // Previne digitação de 'e', '+', '-' em inputs number
                input.addEventListener('keydown', (e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                    }
                });
            });
        });
    } catch (error) {
        console.error("Error updating sequence UI:", error);
    }
}

function handleAddSequence() {
    try {
        if (!Array.isArray(currentSequence)) currentSequence = [];
        // Adiciona um novo bloco padrão no final
        currentSequence.push({ work: 25, break: 5, reps: 1 });
        updateSequenceUI(); // Reconstrói a UI com o novo item e listeners
        saveSettings(); // Salva a nova sequência

        // Se o timer estava parado e zerado no modo Pomodoro, reinicializa
        // para garantir que ele pegue a sequência atualizada se for iniciado.
        if (isPaused && timerInterval === null && timerMode === 'pomodoro') {
            initializeTimer(); // Recalcula timeLeft baseado no primeiro passo (se existir)
            updateAllUI(); // Atualiza a UI com o novo tempo
        }
        showToast("Bloco adicionado à sequência.", "success");
    } catch (error) {
        console.error("Error adding sequence:", error);
        showToast("Erro ao adicionar bloco.", "error");
    }
}

function handleRemoveSequence(event) {
    try {
        const button = event.currentTarget;
        const item = button.closest('.sequence-item'); // Encontra o item pai
        if (!item) return;
        const indexToRemove = parseInt(item.dataset.index); // Pega o índice do dataset

        if (Array.isArray(currentSequence) && !isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentSequence.length) {
            currentSequence.splice(indexToRemove, 1); // Remove o item do array
            updateSequenceUI(); // Reconstrói a UI
            saveSettings(); // Salva

            // Se a remoção afetou o passo atual ou futuro, e o timer está parado, reinicializa
            if (isPaused && timerInterval === null && timerMode === 'pomodoro') {
                // Se o índice removido for menor ou igual ao atual, ou se a sequência ficou vazia
                if (indexToRemove <= currentStepIndex || currentSequence.length === 0) {
                     initializeTimer();
                     updateAllUI();
                }
            }
            showToast("Bloco removido da sequência.", "info");
        } else {
             console.warn("Could not remove sequence item at index:", indexToRemove);
        }
    } catch (error) {
        console.error("Error removing sequence:", error);
        showToast("Erro ao remover bloco.", "error");
    }
}

function handleSequenceInputChange(event) {
    try {
        const input = event.target;
        const item = input.closest('.sequence-item');
        if (!item || !Array.isArray(currentSequence)) return;

        const index = parseInt(item.dataset.index);
        const prop = input.dataset.prop; // 'work', 'break', or 'reps'
        const step = currentSequence[index];

        if (!step || !prop) {
            console.warn("Could not update sequence: Invalid step or property", index, prop);
            return; // Sai se o passo ou a propriedade não for encontrada
        }

        let value = parseInt(input.value);
        const minVal = (prop === 'break') ? 0 : 1; // Mínimo 0 para break, 1 para work/reps

        // Validação do valor
        if (isNaN(value) || value < minVal) {
            value = step[prop]; // Restaura valor antigo se inválido
            input.value = value; // Atualiza o input visualmente
            showToast(`Valor inválido para ${prop}. Mínimo: ${minVal}.`, "warning");
            return;
        }

        // Atualiza o valor no array currentSequence
        step[prop] = value;
        console.log(`Sequence step ${index + 1} updated: ${prop} = ${value}`);

        saveSettings(); // Salva a mudança

        // Se a mudança afetou o tempo da FASE ATUAL enquanto está PRONTO para iniciar
        if (isPaused && timerInterval === null && timerMode === 'pomodoro' && index === currentStepIndex) {
             if ((isWorking && prop === 'work') || (!isWorking && prop === 'break')) {
                timeLeft = value * 60;
                updateDisplay();
             }
        }
         // Se alterou o primeiro passo enquanto resetado (caso especial)
         else if(isPaused && timerInterval === null && timerMode === 'pomodoro' && index === 0 && prop === 'work' && currentStepIndex === 0) {
            initializeTimer(); // Reinicializa para pegar o novo tempo
            updateAllUI();
         }

    } catch (error) {
        console.error("Error handling sequence input change:", error);
        showToast("Erro ao atualizar sequência.", "error");
    }
}

function applyPomodoroPreset(event) {
    try {
        const button = event.target.closest('.preset-btn');
        if (!button) return; // Sai se o clique não foi num botão de preset

        const work = parseInt(button.dataset.work);
        const breakVal = parseInt(button.dataset.break);
        const reps = parseInt(button.dataset.reps);

        if (!isNaN(work) && !isNaN(breakVal) && !isNaN(reps)) {
            // Define a sequência como um array com apenas este preset
            currentSequence = [{ work, break: breakVal, reps }];
            updateSequenceUI(); // Atualiza a UI da sequência
            saveSettings(); // Salva a nova sequência padrão

            // Se estiver no modo Pomodoro, reseta o timer para aplicar o preset imediatamente
            if (timerMode === 'pomodoro') {
                initializeTimer(); // Isso vai pausar, zerar e definir timeLeft para o novo work
                updateAllUI(); // Atualiza toda a UI
            }
            showToast(`Preset ${work}/${breakVal} (${reps}x) aplicado.`, "success");
        } else {
             console.error("Invalid preset data:", button.dataset);
             showToast("Erro ao aplicar preset: dados inválidos.", "error");
        }
    } catch (error) {
        console.error("Error applying preset:", error);
        showToast("Erro ao aplicar preset.", "error");
    }
}


// --- Registro de Ciclos ---
function logCycle(explicitType = null, explicitDuration = null) {
    try {
        const now = new Date();
        let durationMinutes;
        let type;
        let logTimeSource = timeLeft;

        // Determina o tipo e duração
        if (timerMode === 'pomodoro') {
            type = explicitType ?? (isWorking ? "Trabalho" : (isLongBreak() ? "Descanso Longo" : "Descanso Curto"));
            durationMinutes = explicitDuration ?? 0; // Usa duração explícita do ciclo
            console.log(`[Log Pomodoro] Type: ${type}, Explicit Duration: ${durationMinutes}`);
        } else { // Modo Focus
            type = explicitType ?? (isFocusing ? 'Foco' : 'Descanso Livre');
            // Usa tempo acumulado SE for log manual (explicitType null), senão usa o explícito (passado pelo switch)
            durationMinutes = (explicitType === null) ? Math.max(0, Math.floor(logTimeSource / 60)) : (explicitDuration ?? 0);
            console.log(`[Log Focus] Type: ${type}, Duration: ${durationMinutes}, ExplicitDuration: ${explicitDuration}, TimeLeft: ${logTimeSource}`);
        }

        // Não registra se a duração for zero ou menos
        if (durationMinutes <= 0) {
            console.log("[LogCycle] Skipping log: Duration is 0.");
            if (timerMode === 'focus' && explicitType === null) { // Tentativa manual falhou
                showToast("Nada para registrar (duração 0).", "info");
                 if (!resetFocusOnLog && sessionNotesInput) sessionNotesInput.value = ''; // Limpa notas se não for resetar
                 if (sessionGoalInput) sessionGoalInput.value = ''; // Limpa meta
            }
            return;
        }

        const logEntry = {
            task: taskInput?.value.trim() || "Não especificado",
            category: categoryInput?.value.trim() || "Sem categoria",
            notes: sessionNotesInput?.value.trim() || "",
            type: type,
            duration: durationMinutes,
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: now.toISOString()
        };

        logEntries.push(logEntry);
        // Ordena logEntries por timestamp (mais recente primeiro na memória, invertido na tabela)
        logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        saveLogToLocalStorage();

        let resetHappened = false;

        // Resetar APENAS para logs MANUAIS no modo FOCUS (explicitType null) e se checkbox marcado
        if (timerMode === 'focus' && explicitType === null && resetFocusOnLog) {
             console.log("[LogCycle] Manual Focus log + Reset checkbox. Calling resetTimer()...");
             resetTimer(); // Chama a função que reseta e atualiza a UI
             resetHappened = true; // Marca que o reset ocorreu
             showToast(`${type} (${durationMinutes} min) registrado! Timer zerado.`, 'success');
        } else {
             // Se não resetou (por qualquer motivo), mostra toast normal e limpa notas/meta (resetTimer já faria isso)
              if (timerMode === 'focus' && explicitType === null) {
                 showToast(`${type} (${durationMinutes} min) registrado!`, 'success');
                 if (sessionNotesInput) sessionNotesInput.value = '';
                 if (sessionGoalInput) sessionGoalInput.value = ''; // Limpa meta da sessão tbm
              }
              // Para logs automáticos (pomodoro) ou de switch, não mostra toast aqui (já mostrado no timerTick/switchFocusBreak)
        }

        // Atualiza UI SE o reset NÃO aconteceu (resetTimer já chama updateAllUI)
        if (!resetHappened) {
            console.log("[LogCycle] No reset triggered by log, calling updateAllUI().");
            updateAllUI(); // Atualiza stats, gráficos, tabela, etc.
        } else {
             console.log("[LogCycle] Reset triggered by log, updateAllUI() was called within resetTimer().");
        }

    } catch (error) {
        console.error("Error logging cycle:", error);
        showToast("Erro ao registrar o ciclo.", "error");
    }
}

// --- Gerenciamento do Log (UI e Lógica) ---
function updateLogTable() {
    if (!logTableBody || !logEmptyMessage) return;
    try {
        logTableBody.innerHTML = ''; // Limpa a tabela
        if (logEntries.length === 0) {
            logEmptyMessage.style.display = 'block'; // Mostra mensagem de vazio
            return; // Sai se não há logs
        }
        logEmptyMessage.style.display = 'none'; // Esconde mensagem de vazio

        // Cria as linhas da tabela (já está ordenada por timestamp na memória)
        logEntries.forEach((entry) => {
            const row = logTableBody.insertRow();
            row.insertCell(0).textContent = entry.task;
            row.insertCell(1).textContent = entry.category;
            const notesCell = row.insertCell(2);
            notesCell.textContent = entry.notes;
            notesCell.title = entry.notes; // Mostra nota completa no hover
            row.insertCell(3).textContent = entry.type;
            row.insertCell(4).textContent = entry.duration;
            row.insertCell(5).textContent = entry.date;
            row.insertCell(6).textContent = entry.time;
            const actionCell = row.insertCell(7);
            // Adiciona botão de deletar com o timestamp como identificador
            actionCell.innerHTML = `<button class="delete-log-btn" data-timestamp="${entry.timestamp}" title="Apagar Registro"><i class="fa-solid fa-trash-can"></i></button>`;
        });
    } catch (error) {
        console.error("Error updating log table:", error);
    }
}

function deleteLogEntry(timestamp) {
     if (!timestamp) {
         console.error("Delete failed: Invalid timestamp provided.");
         showToast("Erro ao apagar: ID inválido.", "error");
         return;
     }
     // Encontra a entrada para mostrar detalhes na confirmação
     const entryToDelete = logEntries.find(e => e.timestamp === timestamp);
     if (!entryToDelete) {
         console.error("Could not find log entry to delete with timestamp:", timestamp);
         showToast("Erro: Registro não encontrado para apagar.", 'error');
         return;
     }

     if (!confirm(`Tem certeza que deseja apagar este registro?\n\nTarefa: ${entryToDelete.task}\nData: ${entryToDelete.date} - ${entryToDelete.duration} min`)) {
        return; // Cancela se o usuário não confirmar
     }

    try {
        const initialLength = logEntries.length;
        // Filtra o array, mantendo apenas as entradas cujo timestamp NÃO é o que queremos deletar
        logEntries = logEntries.filter(entry => entry.timestamp !== timestamp);

        if (logEntries.length < initialLength) {
            saveLogToLocalStorage(); // Salva o array modificado
            updateAllUI(); // Atualiza a UI completa (tabela, stats, gráficos)
            showToast(`Registro apagado.`, 'info');
            console.log("Log entry deleted:", timestamp);
        } else {
            // Isso não deveria acontecer se a entrada foi encontrada antes
            console.error("Inconsistency: Could not find log entry to delete after confirming:", timestamp);
            showToast("Erro: Registro não encontrado para apagar.", 'error');
        }
    } catch (error) {
        console.error("Error deleting log entry:", error);
        showToast("Erro ao apagar registro.", "error");
    }
}

function clearLog() {
    try {
        if (logEntries.length === 0) {
             showToast("O registro já está vazio.", "info");
             return;
        }
        if (confirm("Limpar TODOS os registros? Esta ação é irreversível!")) {
            logEntries = []; // Esvazia o array
            saveLogToLocalStorage(); // Salva o array vazio
            updateAllUI(); // Atualiza a UI completa
            showToast("Tabela de logs limpa.", "success");
            console.log("Log table cleared.");
        }
    } catch (error) {
        console.error("Error clearing log:", error);
        showToast("Erro ao limpar o log.", "error");
    }
}

// --- Salvar Tarefa/Categoria ---
function saveTaskOrCategory(type) { // 'task' or 'category'
    const input = type === 'task' ? taskInput : categoryInput;
    const list = type === 'task' ? savedTasks : savedCategories;
    const suggestionsDatalist = type === 'task' ? taskSuggestions : categorySuggestions;

    if (!input || !list || !suggestionsDatalist) return;
    const value = input.value.trim();

    if (value && !list.includes(value)) {
        list.push(value);
        list.sort((a, b) => a.localeCompare(b)); // Mantém ordenado alfabeticamente
        saveSettings(); // Salva a lista atualizada nas configurações gerais

        // Atualiza o datalist específico
        if (type === 'task') {
            populateTaskSuggestions();
        } else {
            populateCategorySuggestions();
        }

        showToast(`${type === 'task' ? 'Tarefa' : 'Categoria'} "${value}" salva!`, "success");
        // input.value = ''; // Opcional: Limpar input após salvar
    } else if (!value) {
        showToast(`Digite ${type === 'task' ? 'uma tarefa' : 'uma categoria'} para salvar.`, "info");
    } else {
        showToast(`${type === 'task' ? 'Tarefa' : 'Categoria'} já existe.`, "info");
    }
}

// --- Popular Sugestões de Tarefas/Categorias ---
function populateTaskSuggestions() {
    populateSuggestions(taskSuggestions, savedTasks, []); // Sem padrões fixos para tarefas
}

function populateCategorySuggestions() {
    const defaultOptions = ["Trabalho", "Estudo", "Projeto Pessoal", "Leitura", "Exercício", "Organização", "Lazer"];
    populateSuggestions(categorySuggestions, savedCategories, defaultOptions);
}

function populateSuggestions(datalistElement, savedItems, defaultOptions = []) {
     if (!datalistElement || !Array.isArray(savedItems)) return;
     try {
        // Combina padrões e salvos, remove duplicatas e ordena
        const allSuggestions = [...new Set([...defaultOptions, ...savedItems])].sort((a,b) => a.localeCompare(b)); // Ordem alfabética

        datalistElement.innerHTML = ''; // Limpa
        allSuggestions.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            datalistElement.appendChild(option);
        });
     } catch(e) { console.error("Error populating suggestions:", e); }
}

// --- Gerenciamento de Metas ---
function addCustomGoal() {
    if (!newGoalNameInput || !newGoalTypeSelect || !newGoalTargetInput || !newGoalCategoryInput) return;
    try {
        const name = newGoalNameInput.value.trim();
        const type = newGoalTypeSelect.value;
        const target = parseInt(newGoalTargetInput.value);
        const category = newGoalCategoryInput.value.trim() || null; // Pega categoria se visível e preenchida

        // Validação
        if (!name) { showToast("Dê um nome para a meta.", "warning"); newGoalNameInput.focus(); return; }
        if (isNaN(target) || target <= 0) { showToast("Valor da meta deve ser um número positivo.", "warning"); newGoalTargetInput.focus(); return; }

        // Validação de Categoria para tipos específicos
        const needsCategory = type === 'category_minutes_today' || type === 'total_category_minutes';
        if (needsCategory && !category) {
            showToast("Selecione ou digite uma categoria para este tipo de meta.", "warning");
            newGoalCategoryInput.focus();
            return;
        }

        const newGoal = {
            id: `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`, // ID único
            name: name,
            type: type,
            target: target,
            category: needsCategory ? category : null, // Armazena categoria se aplicável
            achieved: false, // Começa como não atingida
            achievedTimestamp: null // Data de conclusão
        };

        if (!Array.isArray(customGoals)) customGoals = []; // Garante que é array
        customGoals.push(newGoal);
        saveSettings(); // Salva as metas junto com outras configurações
        updateCustomGoalsUI(); // Atualiza a lista na tela
        checkCustomGoals(); // Verifica imediatamente se a nova meta já foi atingida

        // Limpa o formulário
        newGoalNameInput.value = '';
        newGoalTargetInput.value = '';
        newGoalCategoryInput.value = ''; // Limpa categoria
        newGoalTypeSelect.selectedIndex = 0;
        toggleGoalCategoryInput(); // Esconde campo de categoria

        showToast(`Meta "${name}" adicionada!`, "success");
    } catch (error) {
        console.error("Error adding custom goal:", error);
        showToast("Erro ao adicionar meta.", "error");
    }
}

function removeCustomGoal(id) {
    try {
        if (!Array.isArray(customGoals)) return;
        const index = customGoals.findIndex(goal => goal.id === id);
        if (index > -1) {
            const goalName = customGoals[index].name;
            // Confirmação antes de remover
            if (confirm(`Tem certeza que deseja remover a meta "${goalName}"?`)) {
                customGoals.splice(index, 1); // Remove a meta do array
                saveSettings(); // Salva as configurações atualizadas
                updateCustomGoalsUI(); // Atualiza a lista na tela
                updateDailyProgressBar(); // Atualiza marcadores na barra
                showToast(`Meta "${goalName}" removida.`, "info");
            }
        } else {
            console.warn("Could not find goal to remove with ID:", id);
            showToast("Erro: Meta não encontrada para remover.", "error");
        }
    } catch (error) {
        console.error("Error removing custom goal:", error);
        showToast("Erro ao remover meta.", "error");
    }
}

function toggleGoalCategoryInput() {
    if(!newGoalTypeSelect || !newGoalCategoryInput) return;
    const selectedType = newGoalTypeSelect.value;
    const needsCategory = selectedType === 'category_minutes_today' || selectedType === 'total_category_minutes';
    newGoalCategoryInput.style.display = needsCategory ? 'block' : 'none';
    newGoalCategoryInput.classList.toggle('visible', needsCategory); // Adiciona/remove classe para CSS
}

function checkCustomGoals() {
    try {
        if (!Array.isArray(customGoals) || customGoals.length === 0) return; // Sai se não há metas

        let settingChanged = false; // Flag para saber se alguma meta foi atingida agora
        const todayStr = getTodayDateString();

        // Calcula os totais necessários uma vez
        const counts = {
            focusWorkMinutesToday: getTotalTimeToday(logEntries, ['Foco', 'Trabalho', 'Manual']), // Inclui Manual
            cyclesToday: countItemsToday(logEntries, 'Trabalho'),
            focusSessionsToday: countFocusSessionsToday(logEntries),
            consecutiveDays: countConsecutiveDays(logEntries, ['Foco', 'Trabalho', 'Manual']), // Inclui Manual
            totalFocusWorkMinutes: logEntries.filter(l => ['Foco', 'Trabalho', 'Manual'].includes(l.type)).reduce((sum, l) => sum + (l.duration || 0), 0), // Inclui Manual
            totalCycles: logEntries.filter(l => l.type === 'Trabalho').length,
            totalFocusSessions: countFocusSessionsTotal(logEntries),
        };

        customGoals.forEach(goal => {
            // Só verifica metas que ainda não foram atingidas
            if (!goal.achieved) {
                let currentProgress = 0;
                // Determina o progresso baseado no tipo da meta
                switch (goal.type) {
                    case 'focus_work_minutes_today': currentProgress = counts.focusWorkMinutesToday; break;
                    case 'pomodoro_cycles_today': currentProgress = counts.cyclesToday; break;
                    case 'focus_sessions_today': currentProgress = counts.focusSessionsToday; break;
                    case 'consecutive_days': currentProgress = counts.consecutiveDays; break;
                    case 'category_minutes_today':
                         currentProgress = getCategoryTimeToday(logEntries, goal.category, ['Foco', 'Trabalho', 'Manual']); // Inclui Manual
                         break;
                    case 'total_focus_work_minutes': currentProgress = counts.totalFocusWorkMinutes; break;
                    case 'total_pomodoro_cycles': currentProgress = counts.totalCycles; break;
                    case 'total_focus_sessions': currentProgress = counts.totalFocusSessions; break;
                    case 'total_category_minutes':
                         currentProgress = getTotalCategoryTime(logEntries, goal.category, ['Foco', 'Trabalho', 'Manual']); // Inclui Manual
                         break;
                    default: console.warn("Unknown goal type:", goal.type);
                }

                // Verifica se atingiu o alvo
                if (currentProgress >= goal.target) {
                    goal.achieved = true;
                    goal.achievedTimestamp = new Date().toISOString();
                    settingChanged = true; // Marca que houve mudança
                    // Mostra notificação de sucesso
                    showToast(`🏆 Meta Concluída: ${goal.name}!`, 'success', 5000);
                    console.log(`Goal Achieved: ${goal.name}`);
                    playNotification('success'); // Toca som de sucesso (usa som de 'work' por padrão se 'success' não for específico)
                    displayRandomQuote(); // Mostra nova citação
                }
            }
        });

        // Se alguma meta foi atingida, salva as configurações e atualiza a UI
        if (settingChanged) {
            saveSettings();
            updateCustomGoalsUI(); // Atualiza a lista para mostrar as metas concluídas
            updateDailyProgressBar(); // Atualiza marcadores da barra
        }
    } catch (error) {
        console.error("Error checking custom goals:", error);
    }
}

function updateCustomGoalsUI() {
    if (!customGoalsList) return;
    try {
        customGoalsList.innerHTML = ''; // Limpa a lista
        if (!Array.isArray(customGoals) || customGoals.length === 0) {
            customGoalsList.innerHTML = '<p class="info-text">Nenhuma meta personalizada definida ainda. Adicione uma!</p>';
            return;
        }

        // Calcula totais novamente para exibir o progresso atual
        const counts = {
            focusWorkMinutesToday: getTotalTimeToday(logEntries, ['Foco', 'Trabalho', 'Manual']), // Inclui Manual
            cyclesToday: countItemsToday(logEntries, 'Trabalho'),
            focusSessionsToday: countFocusSessionsToday(logEntries),
            consecutiveDays: countConsecutiveDays(logEntries, ['Foco', 'Trabalho', 'Manual']), // Inclui Manual
            totalFocusWorkMinutes: logEntries.filter(l => ['Foco', 'Trabalho', 'Manual'].includes(l.type)).reduce((sum, l) => sum + (l.duration || 0), 0), // Inclui Manual
            totalCycles: logEntries.filter(l => l.type === 'Trabalho').length,
            totalFocusSessions: countFocusSessionsTotal(logEntries),
        };

        customGoals.forEach(goal => {
            let currentProgress = 0;
            let targetDesc = "";
            const categorySuffix = goal.category ? ` (${goal.category})` : '';

            switch (goal.type) {
                case 'focus_work_minutes_today': currentProgress = counts.focusWorkMinutesToday; targetDesc = `${goal.target} min Foco/Trab/Man Hoje`; break; // Atualizado
                case 'pomodoro_cycles_today': currentProgress = counts.cyclesToday; targetDesc = `${goal.target} Ciclos Pomodoro Hoje`; break;
                case 'focus_sessions_today': currentProgress = counts.focusSessionsToday; targetDesc = `${goal.target} Sessões Foco Hoje`; break;
                case 'consecutive_days': currentProgress = counts.consecutiveDays; targetDesc = `${goal.target} Dias Consecutivos`; break;
                case 'category_minutes_today': currentProgress = getCategoryTimeToday(logEntries, goal.category, ['Foco', 'Trabalho', 'Manual']); targetDesc = `${goal.target} min Categoria Hoje${categorySuffix}`; break; // Atualizado
                case 'total_focus_work_minutes': currentProgress = counts.totalFocusWorkMinutes; targetDesc = `${goal.target} min Foco/Trab/Man (Total)`; break; // Atualizado
                case 'total_pomodoro_cycles': currentProgress = counts.totalCycles; targetDesc = `${goal.target} Ciclos Pomodoro (Total)`; break;
                case 'total_focus_sessions': currentProgress = counts.totalFocusSessions; targetDesc = `${goal.target} Sessões Foco (Total)`; break;
                case 'total_category_minutes': currentProgress = getTotalCategoryTime(logEntries, goal.category, ['Foco', 'Trabalho', 'Manual']); targetDesc = `${goal.target} min Categoria (Total)${categorySuffix}`; break; // Atualizado
                default: targetDesc="Tipo Desconhecido";
            }
            // Limita o progresso exibido ao alvo
            const displayProgress = Math.min(currentProgress, goal.target);

            // Cria o elemento HTML para a meta
            const item = document.createElement('div');
            item.classList.add('custom-goal-item');
            item.dataset.id = goal.id; // Guarda o ID para remoção

            const statusClass = goal.achieved ? 'achieved' : 'pending';
            const statusIcon = goal.achieved ? 'fa-check' : 'fa-hourglass-half';
            const achievedDate = goal.achieved && goal.achievedTimestamp ? new Date(goal.achievedTimestamp).toLocaleDateString('pt-BR') : '';
            const statusTitle = goal.achieved ? `Concluído em ${achievedDate}` : 'Pendente';

            item.innerHTML = `
                <span class="goal-status ${statusClass}" title="${statusTitle}"><i class="fa-solid ${statusIcon}"></i></span>
                <span class="goal-name">${goal.name}</span>
                <span class="goal-details">(Meta: ${targetDesc})</span>
                <span class="goal-progress">Progresso: ${displayProgress} / ${goal.target}</span>
                <button class="remove-goal-btn" title="Remover Meta"><i class="fa-solid fa-trash"></i></button>
            `;
            customGoalsList.appendChild(item);

            // Adiciona o listener para o botão de remover desta meta específica
            const removeBtn = item.querySelector('.remove-goal-btn');
            if(removeBtn) {
                removeBtn.addEventListener('click', () => removeCustomGoal(goal.id));
            }
        });
    } catch (error) {
        console.error("Error updating custom goals UI:", error);
    }
}


// --- Funções Auxiliares para Novos Tipos de Meta ---
function countFocusSessionsToday(logs) {
    const todayStr = getTodayDateString();
    return logs.filter(l => ['Foco', 'Manual'].includes(l.type) && l.date === todayStr).length; // Inclui Manual como sessão
}
function countFocusSessionsTotal(logs) {
    return logs.filter(l => ['Foco', 'Manual'].includes(l.type)).length; // Inclui Manual
}
function getCategoryTimeToday(logs, category, typesToInclude = ['Foco', 'Trabalho', 'Manual']) {
    if (!category) return 0;
    const todayStr = getTodayDateString();
    return logs.filter(l => l.category === category && typesToInclude.includes(l.type) && l.date === todayStr)
               .reduce((sum, l) => sum + (l.duration || 0), 0);
}
function getTotalCategoryTime(logs, category, typesToInclude = ['Foco', 'Trabalho', 'Manual']) {
    if (!category) return 0;
     return logs.filter(l => l.category === category && typesToInclude.includes(l.type))
               .reduce((sum, l) => sum + (l.duration || 0), 0);
}
function countConsecutiveDays(logs, typesToInclude = ['Foco', 'Trabalho', 'Manual']) {
    if (!Array.isArray(logs) || logs.length === 0) return 0;

    // 1. Get unique dates with relevant activity
    const activeDateStrings = [...new Set(
        logs.filter(l => typesToInclude.includes(l.type) && l.duration > 0)
            .map(l => l.date) // Use 'DD/MM/YYYY' format
    )];

    if (activeDateStrings.length === 0) return 0;

    // 2. Convert strings to Date objects for reliable sorting and comparison
    const activeDates = activeDateStrings.map(dateStr => {
        const parts = dateStr.split('/');
        // Month is 0-indexed in JS Date constructor
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }).sort((a, b) => b - a); // Sort descending (most recent first)

    // 3. Count consecutive days from today or yesterday
    let consecutiveCount = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    // Check if the most recent activity was today or yesterday
    if (activeDates[0].getTime() === today.getTime() || activeDates[0].getTime() === yesterday.getTime()) {
        consecutiveCount = 1;
        let expectedPreviousDate = new Date(activeDates[0]);
        expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1); // Start expecting the day before the most recent activity

        // Iterate through the rest of the sorted dates
        for (let i = 1; i < activeDates.length; i++) {
            // Check if the current date matches the expected previous date
            if (activeDates[i].getTime() === expectedPreviousDate.getTime()) {
                consecutiveCount++;
                expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1); // Update the next expected date
            } else if (activeDates[i].getTime() < expectedPreviousDate.getTime()) {
                // Sequence is broken because there's a gap
                break;
            }
            // If activeDates[i].getTime() > expectedPreviousDate.getTime(), it means there might be multiple entries for the same day earlier in the sorted list, which is fine, continue checking
        }
    }

    return consecutiveCount;
}


// --- Salvar/Carregar Local Storage ---
function loadLogFromLocalStorage() {
    const savedLog = localStorage.getItem('pomodoroLog_v3.3'); // Usar chave nova
    logEntries = [];
    if (savedLog) {
        try {
            const parsedLog = JSON.parse(savedLog);
            if (Array.isArray(parsedLog)) {
                // Validação mais robusta das entradas
                logEntries = parsedLog.filter(entry =>
                    entry && entry.timestamp && entry.type && typeof entry.duration === 'number' &&
                    !isNaN(new Date(entry.timestamp).getTime()) // Garante timestamp válido
                );
                // Ordena por segurança ao carregar
                logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                console.log(`Loaded ${logEntries.length} valid log entries (v3.3).`);
                if (logEntries.length !== parsedLog.length) console.warn(`Ignored ${parsedLog.length - logEntries.length} invalid log entries.`);
            } else { console.warn("Loaded log data not array. Resetting."); localStorage.removeItem('pomodoroLog_v3.3'); }
        } catch (e) { console.error("Error parsing saved log:", e); localStorage.removeItem('pomodoroLog_v3.3'); }
    } else { console.log("No saved log found (v3.3)."); }
}
function saveLogToLocalStorage() {
    try {
        if(Array.isArray(logEntries)){
            localStorage.setItem('pomodoroLog_v3.3', JSON.stringify(logEntries)); // Usa chave nova
        } else { console.error("Attempted to save non-array logEntries."); localStorage.removeItem('pomodoroLog_v3.3'); }
    } catch (e) {
        console.error("Error saving log to localStorage:", e);
        showToast("Erro ao salvar o registro. Verifique o console.", "error", 5000);
        if (e.name === 'QuotaExceededError') showToast("Erro: Armazenamento local cheio.", "error", 10000);
    }
}
function saveSettings() {
    try {
        const settings = {
            version: 3.3, // Versão atualizada
            timerMode: timerMode, customGoals: customGoals, sequence: currentSequence,
            longBreakInterval: parseInt(longBreakIntervalInput?.value || '4'),
            longBreakDuration: parseInt(longBreakDurationInput?.value || '15'),
            theme: currentTheme,
            // Sons específicos v3.3
            soundWork: selectedSoundWork, soundBreak: selectedSoundBreak,
            resetFocus: resetFocusOnLog, savedTasks: savedTasks, savedCategories: savedCategories,
            volume: currentVolume, browserNotifications: browserNotificationsEnabled,
            // Auto-start v3.3
            autoStartWork: autoStartWorkEnabled, autoStartBreak: autoStartBreakEnabled
        };
        localStorage.setItem('pomodoroSettings_v3.3', JSON.stringify(settings)); // Usa nova chave
        console.log("Settings saved (v3.3).");
    } catch (e) { console.error("Error saveSettings:", e); showToast("Erro salvar config.", "error"); }
}
function loadSettings() {
    // Padrões
    customGoals = []; currentSequence = [{ work: 25, break: 5, reps: 4 }]; timerMode = 'pomodoro';
    resetFocusOnLog = false; savedTasks = []; savedCategories = []; currentVolume = 0.7;
    browserNotificationsEnabled = false; selectedSoundWork = 'bell'; selectedSoundBreak = 'ting';
    autoStartWorkEnabled = false; autoStartBreakEnabled = false;
    if(longBreakIntervalInput) longBreakIntervalInput.value = 4; if(longBreakDurationInput) longBreakDurationInput.value = 15;

    const savedSettings = localStorage.getItem('pomodoroSettings_v3.3'); // Prioriza nova chave

    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            const loadedVersion = settings.version || 3.0; // Assume 3.0 se não houver versão
            console.log(`Loading settings from version ${loadedVersion} (Key: v3.3)`);

            timerMode = settings.timerMode || 'pomodoro';
            customGoals = Array.isArray(settings.customGoals) ? settings.customGoals : [];
            currentSequence = (Array.isArray(settings.sequence) && settings.sequence.length > 0) ? settings.sequence : [{ work: 25, break: 5, reps: 4 }];
            if (longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval ?? 4;
            if (longBreakDurationInput) longBreakDurationInput.value = settings.longBreakDuration || 15;
            // theme é carregado separadamente em loadTheme()
            resetFocusOnLog = settings.resetFocus === true;
            savedTasks = Array.isArray(settings.savedTasks) ? settings.savedTasks : [];
            savedCategories = Array.isArray(settings.savedCategories) ? settings.savedCategories : [];
            currentVolume = settings.volume ?? 0.7;
            browserNotificationsEnabled = settings.browserNotifications === true;
            // v3.3 settings
            selectedSoundWork = settings.soundWork || 'bell'; // Fallback para padrão
            selectedSoundBreak = settings.soundBreak || 'ting'; // Fallback para padrão
            autoStartWorkEnabled = settings.autoStartWork === true;
            autoStartBreakEnabled = settings.autoStartBreak === true;

            console.log("Settings loaded (v3.3).");

        } catch (e) {
            console.error("Error parsing saved settings (v3.3):", e);
            localStorage.removeItem('pomodoroSettings_v3.3'); // Remove configurações inválidas
            // Recarrega com padrões (eles já foram definidos no início da função)
        }
    } else {
        console.log("No saved settings v3.3 found. Using defaults.");
        // Padrões já foram definidos no início
    }
    // Aplica valores na UI em initializeAppUI
}
function loadSavedItems() {
    // loadSettings já carrega savedTasks e savedCategories
    // Apenas populamos os datalists aqui
    populateTaskSuggestions();
    populateCategorySuggestions();
}

// --- Define o Modo Inicial ---
function loadInitialTimerMode() {
    // A função loadSettings já define a variável timerMode.
    // Aqui, apenas garantimos que a UI inicial reflita isso.
    try {
        const radio = document.querySelector(`input[name="timer-mode"][value="${timerMode}"]`);
        if (radio) radio.checked = true;
        updateModeUI(); // Mostra/esconde seções Pomodoro/Focus
    } catch(e) {
        console.error("Error setting initial timer mode UI:", e);
    }
}

// --- Reseta Tudo ---
function resetEverything() {
    if (confirm("ATENÇÃO!\n\nResetar TUDO?\n\nApagará permanentemente:\n- Todos os registros de atividades\n- Todas as metas personalizadas\n- Todas as configurações de ciclo Pomodoro\n- Tarefas e categorias salvas\n- Tema, Sons, Volume, Notificações, Auto-Start\n\nAção IRREVERSÍVEL!\n\nDeseja continuar?")) {
        try {
            pauseTimer(); // Garante que timer esteja parado e limpa timeouts
            timerInterval = null;
            // REMOVED: PiP exit check
            // REMOVED: if (isPipActive && document.pictureInPictureElement) { document.exitPictureInPicture().catch(e => console.warn("PiP exit fail on reset:", e)); }

            localStorage.removeItem('pomodoroLog_v3.3'); // Remove só a chave nova
            localStorage.removeItem('pomodoroSettings_v3.3'); // Remove só a chave nova
            console.log("Cleared relevant localStorage keys (v3.3).");

            // Reseta variáveis de estado para os padrões
            logEntries = [];
            currentSequence = [{ work: 25, break: 5, reps: 4 }]; // Padrão
            customGoals = [];
            savedTasks = []; savedCategories = [];
            currentTheme = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'; // Padrão do sistema ou light
            selectedSoundWork = 'bell'; selectedSoundBreak = 'ting'; // Padrões v3.3
            resetFocusOnLog = false;
            timerMode = 'pomodoro'; // Volta para Pomodoro como padrão
            currentVolume = 0.7;
            browserNotificationsEnabled = false;
            autoStartWorkEnabled = false; autoStartBreakEnabled = false;
            notificationPermission = 'default'; // Reavalia permissão

            // Aplica as mudanças na UI
            applyTheme();       // Aplica o tema padrão
            loadSettingsAndData(); // Recarrega as configurações e dados (que agora serão os padrões)
            initializeAppUI();  // Reinicializa a UI com os padrões
            initializeTimer();  // Reinicializa o estado do timer
            updateAllUI();      // Garante que toda a UI reflita o estado resetado
            checkNotificationPermission(); // Atualiza status da permissão na UI

            showToast("Aplicativo resetado para os padrões.", "success", 4000);
            console.log("Application reset to defaults (v3.3 - No PiP).");
        } catch (error) {
            console.error("Error during resetEverything:", error);
            showToast("Ocorreu um erro ao tentar resetar.", "error");
        }
    }
}


// --- Exportar/Importar Dados ---
function exportData() {
    try {
        const dataToExport = {
            version: 3.3, // Versão atual
            exportedAt: new Date().toISOString(),
            settings: {
                timerMode: timerMode, customGoals: customGoals, sequence: currentSequence,
                longBreakInterval: parseInt(longBreakIntervalInput?.value || '4'),
                longBreakDuration: parseInt(longBreakDurationInput?.value || '15'),
                theme: currentTheme,
                // v3.3 settings
                soundWork: selectedSoundWork, soundBreak: selectedSoundBreak,
                resetFocus: resetFocusOnLog, savedTasks: savedTasks, savedCategories: savedCategories,
                volume: currentVolume, browserNotifications: browserNotificationsEnabled,
                autoStartWork: autoStartWorkEnabled, autoStartBreak: autoStartBreakEnabled
            },
            logs: logEntries
        };
        const dataStr = JSON.stringify(dataToExport, null, 2); // Indentação de 2 espaços
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = 'none'; link.setAttribute("href", url);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute("download", `pomoverso_backup_${timestamp}_v3.3.json`); // Nome indica versão
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Dados exportados com sucesso!", "success");
        console.log("Data exported successfully (v3.3).");
    } catch (error) {
        console.error("Erro ao exportar dados:", error);
        showToast("Erro ao exportar dados. Verifique o console.", "error");
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) { showToast("Nenhum arquivo selecionado.", "info"); return; }
    if (file.type !== "application/json") { showToast("Formato inválido. Selecione um arquivo .json.", "error"); if (importFileInput) importFileInput.value = null; return; }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData || typeof importedData !== 'object') throw new Error("Arquivo JSON vazio ou inválido.");
            if (!importedData.settings || typeof importedData.settings !== 'object') throw new Error("Estrutura de 'settings' ausente ou inválida.");
            if (!Array.isArray(importedData.logs)) throw new Error("Estrutura de 'logs' ausente ou não é um array.");
            const importedVersion = importedData.version || 3.0; // Assume versão antiga se não especificada
            console.warn(`Importando dados da versão ${importedVersion}.`);

            if (!confirm("IMPORTAR DADOS?\n\nATENÇÃO: Isto substituirá TODAS as configurações e registros atuais pelos dados do arquivo selecionado.\n\nÉ recomendado EXPORTAR seus dados atuais ANTES de importar.\n\nDeseja continuar?")) {
                if (importFileInput) importFileInput.value = null; // Limpa o input se cancelar
                showToast("Importação cancelada.", "info");
                return;
            }

             // Pausa o timer antes de modificar tudo
             pauseTimer(); timerInterval = null;
             // REMOVED: PiP exit check

            // --- Aplicação dos Dados Importados ---
            const settings = importedData.settings;
            logEntries = Array.isArray(importedData.logs) ? importedData.logs : [];
            // Valida e ordena logs importados
             logEntries = logEntries.filter(entry =>
                entry && entry.timestamp && entry.type && typeof entry.duration === 'number' &&
                !isNaN(new Date(entry.timestamp).getTime())
             ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            customGoals = Array.isArray(settings.customGoals) ? settings.customGoals : [];
            currentSequence = (Array.isArray(settings.sequence) && settings.sequence.length > 0) ? settings.sequence : [{ work: 25, break: 5, reps: 4 }];
            timerMode = settings.timerMode || 'pomodoro';
            if(longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval ?? 4;
            if(longBreakDurationInput) longBreakDurationInput.value = settings.longBreakDuration || 15;
            currentTheme = settings.theme || 'light';
            resetFocusOnLog = settings.resetFocus === true;
            // Novos settings (com fallback para versões antigas se necessário)
            savedTasks = Array.isArray(settings.savedTasks) ? settings.savedTasks : [];
            savedCategories = Array.isArray(settings.savedCategories) ? settings.savedCategories : [];
            currentVolume = settings.volume ?? 0.7;
            browserNotificationsEnabled = settings.browserNotifications === true;
            // Sons v3.3 (fallback para v3.2 'sound' se não existir)
            selectedSoundWork = settings.soundWork || settings.sound || 'bell';
            selectedSoundBreak = settings.soundBreak || settings.sound || 'ting';
            // Auto-start v3.3
            autoStartWorkEnabled = settings.autoStartWork === true;
            autoStartBreakEnabled = settings.autoStartBreak === true;

            // --- Salva e Atualiza a UI ---
            saveLogToLocalStorage(); // Salva os novos logs
            saveSettings(); // Salva as novas configurações (já na chave v3.3)
            applyTheme(); // Aplica o tema importado
            loadSettingsAndData(); // Recarrega para garantir consistência (datalists etc)
            initializeAppUI(); // Reinicializa a UI com os dados importados
            initializeTimer(); // Reinicializa o timer com base nas novas configs
            updateAllUI(); // Atualiza toda a UI
            checkNotificationPermission(); // Atualiza UI da permissão

            showToast("Dados importados com sucesso!", "success");
            console.log("Data imported successfully.");

        } catch (error) {
            console.error("Erro ao importar dados:", error);
            showToast(`Erro ao importar: ${error.message}`, "error", 6000);
        } finally {
            // Limpa o input de arquivo para permitir importar o mesmo arquivo novamente se necessário
            if (importFileInput) importFileInput.value = null;
        }
    };
    reader.onerror = function () { console.error("FileReader error occurred."); showToast("Erro ao ler o arquivo.", "error"); if (importFileInput) importFileInput.value = null; };
    reader.readAsText(file);
}


// --- Tocar Som (com tipo de fase) ---
function playNotification(phaseType = 'generic') { // phaseType: 'work', 'break', 'success', 'generic'
    let soundKey;
    if (phaseType === 'work') { soundKey = selectedSoundWork; }
    else if (phaseType === 'break') { soundKey = selectedSoundBreak; }
    else if (phaseType === 'success') { soundKey = 'success'; } // Som específico para sucesso de meta
    else { soundKey = selectedSoundWork; } // Default genérico

    if (soundKey === 'none' || !soundUrls[soundKey]) {
        console.log("Sound disabled or key invalid:", soundKey);
        return;
    }
    if (!userInteracted) { console.warn("Audio blocked: User interaction needed."); return; }
    const url = soundUrls[soundKey];
    if (!audioPlayer || !url) { console.error("Audio player or sound URL not found:", soundKey, url); return; }

    audioPlayer.src = url;
    audioPlayer.volume = currentVolume; // Usa o volume atual
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => console.log(`Sound played: ${soundKey} (Phase: ${phaseType}) Vol: ${currentVolume}`))
                   .catch(err => {
                       console.warn(`Sound play failed: ${soundKey}`, err);
                       if (err.name === 'NotAllowedError') { showToast("Navegador bloqueou som.", "warning"); userInteracted = false; }
                       else { /* Não mostra toast pra erro de som, pra não poluir */ }
                   });
    }
}

// --- Gerenciamento de Abas ---
function setupTabs() {
    if (!tabButtons || !tabContents) return;
    tabButtons.forEach(button => {
        // Define a aba 'log' como ativa inicialmente
        const isActive = button.dataset.tab === 'log';
        button.classList.toggle('active', isActive);
        // Remove listener antigo e adiciona novo para evitar duplicação
        button.removeEventListener('click', switchTab);
        button.addEventListener('click', switchTab);
    });
    tabContents.forEach(content => {
        // Mostra apenas o conteúdo da aba 'log' inicialmente
        content.classList.toggle('active', content.id === 'log-tab-content');
    });
    console.log("Tabs setup.");
}

function switchTab(event) {
    try {
        const targetTab = event.currentTarget.dataset.tab; // 'log' or 'stats'
        // Atualiza classe 'active' nos botões
        tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === targetTab));
        // Atualiza classe 'active' nos conteúdos
        tabContents.forEach(content => content.classList.toggle('active', content.id === `${targetTab}-tab-content`));

        // Se a aba de estatísticas foi aberta, atualiza os gráficos
        if (targetTab === 'stats') {
            updateCharts();
            updateTextStats(); // Atualiza também os stats textuais
        }
    } catch (error) {
        console.error("Error switching tabs:", error);
    }
}

// --- Funções Auxiliares de Stats ---
function getTodayDateString() { return new Date().toLocaleDateString('pt-BR'); }

function getWeekStartDate() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    // Queremos que a semana comece na Segunda (1). Se hoje for Domingo (0), subtrai 6 dias. Senão, subtrai (dia da semana - 1).
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0); // Zera a hora para início do dia
    return weekStart;
}

function getDateString(date) { return date.toLocaleDateString('pt-BR'); }

function countItemsToday(logs, itemType) {
    if (!Array.isArray(logs)) return 0;
    const todayStr = getTodayDateString();
    return logs.filter(l => l.type === itemType && l.date === todayStr).length;
}

function getTotalTimeToday(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const todayStr = getTodayDateString();
    return logs.filter(l => typesArray.includes(l.type) && l.date === todayStr)
               .reduce((sum, l) => sum + (l.duration || 0), 0);
}

function getTotalTimeThisWeek(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const weekStartTimestamp = getWeekStartDate().getTime();
    const nowTimestamp = new Date().getTime(); // Pega o momento atual

    return logs.filter(l => {
        try {
            // É mais seguro usar o timestamp ISO se ele for confiável
            const logTimestamp = new Date(l.timestamp).getTime();
            return typesArray.includes(l.type) && logTimestamp >= weekStartTimestamp && logTimestamp <= nowTimestamp;
        } catch(e) {
            console.warn("Invalid timestamp in log entry:", l);
            return false; // Ignora entrada com timestamp inválido
        }
    }).reduce((sum, l) => sum + (l.duration || 0), 0);
}

function countItemsThisWeek(logs, itemType) {
     if (!Array.isArray(logs)) return 0;
     const weekStartTimestamp = getWeekStartDate().getTime();
     const nowTimestamp = new Date().getTime();

     return logs.filter(l => {
         try {
             const logTimestamp = new Date(l.timestamp).getTime();
             return l.type === itemType && logTimestamp >= weekStartTimestamp && logTimestamp <= nowTimestamp;
         } catch(e) {
             console.warn("Invalid timestamp in log entry:", l);
             return false;
         }
     }).length;
}

function getAverageSessionTime(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const relevantLogs = logs.filter(l => typesArray.includes(l.type) && l.duration > 0);
    if (relevantLogs.length === 0) return 0;
    const totalDuration = relevantLogs.reduce((sum, l) => sum + l.duration, 0);
    return Math.round(totalDuration / relevantLogs.length);
}

function getTotalBreakTime(logs, period = 'all') { // period: 'today', 'week', 'all'
    if (!Array.isArray(logs)) return 0;
    const breakTypes = ['Descanso Curto', 'Descanso Longo', 'Descanso Livre'];
    let filteredLogs = logs;

    if (period === 'today') {
        const todayStr = getTodayDateString();
        filteredLogs = logs.filter(l => l.date === todayStr);
    } else if (period === 'week') {
        const weekStartTimestamp = getWeekStartDate().getTime();
        const nowTimestamp = new Date().getTime();
        filteredLogs = logs.filter(l => {
            try {
                const logTimestamp = new Date(l.timestamp).getTime();
                return logTimestamp >= weekStartTimestamp && logTimestamp <= nowTimestamp;
            } catch(e) { return false; }
        });
    }
    // 'all' usa todos os logs

    return filteredLogs.filter(l => breakTypes.includes(l.type))
                       .reduce((sum, l) => sum + (l.duration || 0), 0);
}

function calculateFocusBreakRatio(focusTime, breakTime) {
    if (breakTime <= 0) return focusTime > 0 ? "∞" : "N/A"; // Evita divisão por zero, usa infinito se houve foco
    if (focusTime <= 0) return "0.0";
    return (focusTime / breakTime).toFixed(1); // Uma casa decimal
}

// --- Gráficos ---
function checkChartData(chartKey, data) {
    const chartConfig = chartElements[chartKey];
    if (!chartConfig || !chartConfig.canvas || !chartConfig.noData) {
        // console.warn(`Chart config, canvas, or noData element missing for key: ${chartKey}`);
        return false; // Não pode verificar ou exibir
    }
    // Verifica se há labels E pelo menos um dataset com dados > 0
    const hasData = data &&
                    Array.isArray(data.labels) && data.labels.length > 0 &&
                    Array.isArray(data.datasets) &&
                    data.datasets.some(ds => Array.isArray(ds.data) && ds.data.some(d => d > 0));

    chartConfig.canvas.style.display = hasData ? 'block' : 'none';
    chartConfig.noData.style.display = hasData ? 'none' : 'flex';

    // Destroi gráfico antigo se não houver dados, antes de tentar criar/atualizar
    if (!hasData && chartConfig.chart) {
        chartConfig.chart.destroy();
        chartConfig.chart = null;
        console.log(`Chart ${chartKey} destroyed due to no data.`);
    }
    return hasData; // Retorna se há dados para prosseguir
}

function aggregateData(logs, groupBy, typesToInclude = ['Trabalho', 'Foco', 'Manual']) { // Inclui Manual
    const aggregation = {};
    if (!Array.isArray(logs)) return [];

    logs.filter(log => log.duration > 0 && typesToInclude.includes(log.type))
        .forEach(log => {
            let key;
            if (groupBy === 'hour') {
                try {
                    // Extrai a hora do timestamp (formato HH)
                    key = String(new Date(log.timestamp).getHours()).padStart(2, '0') + ':00';
                } catch(e){
                    console.warn("Could not parse hour from timestamp:", log.timestamp, e);
                    key = "Erro Hora";
                }
            } else {
                key = log[groupBy] || `Sem ${groupBy}`; // Usa a propriedade diretamente (task, category)
                // Trata "Não especificado" e "Sem categoria" como um único grupo para clareza
                if (groupBy === 'task' && key === 'Não especificado') key = 'Sem Tarefa';
                if (groupBy === 'category' && key === 'Sem categoria') key = 'Sem Categoria';
            }
            aggregation[key] = (aggregation[key] || 0) + log.duration;
        });
    // Converte para array de [key, value] e ordena por valor (duração) descendente
    return Object.entries(aggregation).sort(([, durA], [, durB]) => durB - durA);
}

function createCategoryChart() {
    const chartKey = 'category';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const categoryData = aggregateData(logEntries, 'category'); // Inclui 'Manual' por padrão
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: categoryData.map(([category]) => category),
            datasets: [{
                label: 'Minutos',
                data: categoryData.map(([, duration]) => duration),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#8BC34A', '#E91E63', '#00BCD4'],
                borderColor: body.classList.contains('theme-dark') ? '#2c2c2c' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
        if (!checkChartData(chartKey, chartData)) return; // Verifica se há dados
        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';
        if (chartConfig.chart) { // Atualiza gráfico existente
            chartConfig.chart.data = chartData;
            if (chartConfig.chart.options?.plugins?.legend) chartConfig.chart.options.plugins.legend.labels.color = textColor;
            chartConfig.chart.update();
        } else { // Cria novo gráfico
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'doughnut', data: chartData,
                options: { responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { color: textColor, padding: 15 } }, tooltip: { bodyFont: { size: 12 }, titleFont: { size: 14 } } }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

function createTaskChart() {
    const chartKey = 'task';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const taskDataFull = aggregateData(logEntries, 'task'); // Inclui 'Manual' por padrão
        const topTasks = taskDataFull.slice(0, 5);
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: topTasks.map(([task]) => task.length > 25 ? task.substring(0, 22) + '...' : task),
            datasets: [{
                label: 'Minutos', data: topTasks.map(([, duration]) => duration),
                backgroundColor: 'rgba(75, 192, 192, 0.7)', borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1, borderRadius: 4
            }]
        };
        if (!checkChartData(chartKey, chartData)) return;
        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';
        const gridColor = body.classList.contains('theme-dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData;
            const scales = chartConfig.chart.options?.scales;
            if (scales?.x) { scales.x.ticks.color = textColor; if(scales.x.title) scales.x.title.color = textColor; scales.x.grid.color = gridColor; }
            if (scales?.y) { scales.y.ticks.color = textColor; if(scales.y.title) scales.y.title.color = textColor; scales.y.grid.color = gridColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'bar', data: chartData,
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { beginAtZero: true, title: { display: true, text: 'Minutos', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label || ''}: ${ctx.parsed.x} min`, afterLabel: (ctx) => `Tarefa: ${taskDataFull[ctx.dataIndex]?.[0] || ctx.label}` } } }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

function createDailyActivityChart() {
    const chartKey = 'dailyActivity';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const days = 7; const dailyData = {}; const labels = [];
        for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const dateString = d.toISOString().slice(0, 10); const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); labels.push(label); dailyData[dateString] = { cycles: 0, focusWorkManual: 0 }; } // Renomeado
        if (Array.isArray(logEntries)) { logEntries.forEach(log => { try { const dateString = new Date(log.timestamp).toISOString().slice(0, 10); if (dailyData[dateString]) { if (log.type === 'Trabalho') dailyData[dateString].cycles++; if (['Foco', 'Manual', 'Trabalho'].includes(log.type)) dailyData[dateString].focusWorkManual += log.duration; } } catch (e) { console.warn("Err daily chart:", log, e);} }); } // Atualizado
        const sortedDates = Object.keys(dailyData).sort(); const chartConfig = chartElements[chartKey];
        const chartData = { labels: labels, datasets: [ { label: 'Ciclos Pomodoro', data: sortedDates.map(d => dailyData[d].cycles), borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)', tension: 0.1, yAxisID: 'yCycles', fill: true }, { label: 'Minutos Foco/Trab/Manual', data: sortedDates.map(d => dailyData[d].focusWorkManual), borderColor: '#F1C40F', backgroundColor: 'rgba(241, 196, 15, 0.1)', tension: 0.1, yAxisID: 'yFocus', fill: true } ] }; // Atualizado
        if (!checkChartData(chartKey, chartData)) return;
        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';
        const gridColor = body.classList.contains('theme-dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData; const opts = chartConfig.chart.options;
             if(opts?.plugins?.legend) opts.plugins.legend.labels.color = textColor;
             if(opts?.scales?.x) { opts.scales.x.ticks.color = textColor; opts.scales.x.grid.color = gridColor; }
             if(opts?.scales?.yCycles) { opts.scales.yCycles.ticks.color = textColor; if(opts.scales.yCycles.title) opts.scales.yCycles.title.color = textColor; opts.scales.yCycles.grid.color = gridColor; }
             if(opts?.scales?.yFocus) { opts.scales.yFocus.ticks.color = textColor; if(opts.scales.yFocus.title) opts.scales.yFocus.title.color = textColor; } // Grid only for left axis
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, { type: 'line', data: chartData, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } }, yCycles: { type: 'linear', display: true, position: 'left', beginAtZero: true, title: { display: true, text: 'Ciclos', color: textColor }, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }, yFocus: { type: 'linear', display: true, position: 'right', beginAtZero: true, title: { display: true, text: 'Minutos Foco/Trab/Manual', color: textColor }, ticks: { color: textColor }, grid: { drawOnChartArea: false } } }, plugins: { legend: { labels: { color: textColor } } } } }); // Atualizado
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

function createFocusBreakChart() {
    const chartKey = 'focusBreak'; if (!chartElements[chartKey]?.ctx) return;
    try {
        const days = 7; const dailyData = {}; const labels = [];
        for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const dateString = d.toISOString().slice(0, 10); const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); labels.push(label); dailyData[dateString] = { workFocusManual: 0, breaks: 0 }; } // Renomeado
        if (Array.isArray(logEntries)) { logEntries.forEach(log => { try{ const dateString = new Date(log.timestamp).toISOString().slice(0, 10); if (dailyData[dateString]) { if (['Trabalho', 'Foco', 'Manual'].includes(log.type)) dailyData[dateString].workFocusManual += log.duration; else if (log.type.includes('Descanso')) dailyData[dateString].breaks += log.duration; } } catch(e) { console.warn("Err focus/break chart:", log, e);} }); } // Atualizado
        const sortedDates = Object.keys(dailyData).sort(); const chartConfig = chartElements[chartKey];
        const chartData = { labels: labels, datasets: [ { label: 'Foco/Trabalho/Manual (min)', data: sortedDates.map(d => dailyData[d].workFocusManual), backgroundColor: '#4BC0C0', borderRadius: 4 }, { label: 'Descanso (min)', data: sortedDates.map(d => dailyData[d].breaks), backgroundColor: '#FFB74D', borderRadius: 4 } ] }; // Atualizado
        if (!checkChartData(chartKey, chartData)) return;
        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';
        const gridColor = body.classList.contains('theme-dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData; const opts = chartConfig.chart.options;
            if(opts?.plugins?.legend) opts.plugins.legend.labels.color = textColor;
            if(opts?.scales?.x) { opts.scales.x.ticks.color = textColor; opts.scales.x.grid.color = gridColor; }
            if(opts?.scales?.y) { opts.scales.y.ticks.color = textColor; if(opts.scales.y.title) opts.scales.y.title.color = textColor; opts.scales.y.grid.color = gridColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, { type: 'bar', data: chartData, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } }, y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Minutos Totais', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } } }, plugins: { legend: { position: 'top', labels: { color: textColor } } } } });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

function createTimeOfDayChart() {
    const chartKey = 'timeOfDay'; if (!chartElements[chartKey]?.ctx) return;
    try {
        const hourlyDataEntries = aggregateData(logEntries, 'hour'); // Inclui Manual
        const chartConfig = chartElements[chartKey];
        const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00'); const data = Array(24).fill(0);
        hourlyDataEntries.forEach(([h, d]) => { const i = parseInt(h.split(':')[0]); if (!isNaN(i) && i >= 0 && i < 24) data[i] = d; });
        const chartData = { labels: labels, datasets: [{ label: 'Minutos Foco/Trabalho/Manual', data: data, backgroundColor: 'rgba(153, 102, 255, 0.7)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1, borderRadius: 4 }] };
        if (!checkChartData(chartKey, chartData)) return;
        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';
        const gridColor = body.classList.contains('theme-dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData; const opts = chartConfig.chart.options;
            if(opts?.scales?.x) { opts.scales.x.ticks.color = textColor; if(opts.scales.x.title) opts.scales.x.title.color = textColor; opts.scales.x.grid.color = gridColor; }
            if(opts?.scales?.y) { opts.scales.y.ticks.color = textColor; if(opts.scales.y.title) opts.scales.y.title.color = textColor; opts.scales.y.grid.color = gridColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, { type: 'bar', data: chartData, options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Hora do Dia', color: textColor }, ticks: { color: textColor, maxRotation: 90, minRotation: 45 }, grid: { color: gridColor } }, y: { beginAtZero: true, title: { display: true, text: 'Minutos Acumulados', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } } }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } } } });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

function updateCharts() {
    console.log("Updating charts...");
    try { createCategoryChart(); createTaskChart(); createDailyActivityChart(); createFocusBreakChart(); createTimeOfDayChart(); }
    catch (e) { console.error("Error during updateCharts:", e); }
}

// --- Atualiza Estatísticas Textuais ---
function updateTextStats() {
    console.log("Updating text stats...");
    try {
        const focusWorkTypes = ['Foco', 'Trabalho', 'Manual']; // Inclui Manual aqui
        const focusWorkToday = getTotalTimeToday(logEntries, focusWorkTypes);
        const focusWorkWeek = getTotalTimeThisWeek(logEntries, focusWorkTypes);
        const cyclesToday = countItemsToday(logEntries, 'Trabalho');
        const cyclesWeek = countItemsThisWeek(logEntries, 'Trabalho');
        const avgSession = getAverageSessionTime(logEntries, focusWorkTypes);
        const totalFocusWorkAll = logEntries.filter(l => focusWorkTypes.includes(l.type)).reduce((sum, l) => sum + (l.duration || 0), 0);
        const totalCyclesAll = logEntries.filter(l => l.type === 'Trabalho').length;
        const breakToday = getTotalBreakTime(logEntries, 'today');
        const breakWeek = getTotalBreakTime(logEntries, 'week');
        const totalBreakAll = getTotalBreakTime(logEntries, 'all');
        const ratioToday = calculateFocusBreakRatio(focusWorkToday, breakToday);
        const ratioWeek = calculateFocusBreakRatio(focusWorkWeek, breakWeek);

        // Atualiza elementos
        if(textStatFocusWorkToday) textStatFocusWorkToday.textContent = focusWorkToday;
        if(textStatFocusWorkWeek) textStatFocusWorkWeek.textContent = focusWorkWeek;
        if(textStatCyclesToday) textStatCyclesToday.textContent = cyclesToday;
        if(textStatCyclesWeek) textStatCyclesWeek.textContent = cyclesWeek;
        if(textStatAvgSession) textStatAvgSession.textContent = avgSession;
        if(textStatTotalFocusWorkAll) textStatTotalFocusWorkAll.textContent = totalFocusWorkAll;
        if(textStatTotalCyclesAll) textStatTotalCyclesAll.textContent = totalCyclesAll;
        if(textStatBreakToday) textStatBreakToday.textContent = breakToday;
        if(textStatBreakWeek) textStatBreakWeek.textContent = breakWeek;
        if(textStatTotalBreakAll) textStatTotalBreakAll.textContent = totalBreakAll;
        if(textStatRatioToday) textStatRatioToday.textContent = ratioToday;
        if(textStatRatioWeek) textStatRatioWeek.textContent = ratioWeek;

    } catch (error) { console.error("Error updating text stats:", error); }
}


// --- Mini Dashboard ---
function updateMiniDashboard() {
    try {
        if (statCyclesToday) statCyclesToday.textContent = countItemsToday(logEntries, 'Trabalho');
        if (statFocusToday) statFocusToday.textContent = getTotalTimeToday(logEntries, ['Foco', 'Trabalho', 'Manual']); // Inclui Manual
        if (statBreakToday) statBreakToday.textContent = getTotalBreakTime(logEntries, 'today');
    } catch (error) { console.error("Error updating mini dashboard:", error); }
}

// --- Tema ---
function toggleTheme() {
     try { currentTheme = currentTheme === 'light' ? 'dark' : 'light'; applyTheme(); saveSettings(); updateCharts(); } // Charts precisam recarregar cores
     catch (e) { console.error("Error toggling theme:", e); }
}
function applyTheme() {
    if (!body || !themeToggleButton) return;
    try {
        // Remove temas antigos, adiciona o novo
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${currentTheme}`);
        themeToggleButton.innerHTML = currentTheme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        themeToggleButton.title = `Mudar para Tema ${currentTheme === 'light' ? 'Escuro' : 'Claro'}`;
        console.log("Theme applied:", currentTheme);
    } catch (e) { console.error("Error applying theme:", e); }
}
function loadTheme() {
    const savedSettings = localStorage.getItem('pomodoroSettings_v3.3');
    let loadedTheme = null;
    if (savedSettings) { try { const s = JSON.parse(savedSettings); loadedTheme = s.theme; } catch (e) { console.error("Err theme parse:", e); } }
    currentTheme = loadedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light');
    applyTheme();
}

// --- Baixar CSV ---
function downloadLog() {
    if (!Array.isArray(logEntries) || logEntries.length === 0) { showToast("Não há registros.", "info"); return; }
    try {
        const headers = ["Tarefa", "Categoria", "Notas", "Tipo/Modo", "Duracao (min)", "Data", "Hora", "Timestamp"];
        const escapeCSV = (f) => { const s = String(f ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s; };
        // Cria CSV a partir dos logs (que já estão ordenados do mais recente pro mais antigo)
        const csvRows = logEntries.map(e => [ escapeCSV(e.task), escapeCSV(e.category), escapeCSV(e.notes), escapeCSV(e.type), escapeCSV(e.duration), escapeCSV(e.date), escapeCSV(e.time), escapeCSV(e.timestamp) ].join(','));
        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.style.display = 'none';
        link.setAttribute("href", url); const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute("download", `pomodoro_log_${ts}.csv`); document.body.appendChild(link); link.click();
        document.body.removeChild(link); URL.revokeObjectURL(url);
        showToast("Registro baixado (CSV)!", "success"); console.log("Log downloaded CSV.");
    } catch (error) { console.error("Erro ao baixar CSV:", error); showToast("Erro ao baixar CSV.", "error"); }
}


// --- Picture-in-Picture (PiP) --- REMOVIDO ---
// REMOVED: function drawPipCanvas() { ... }
// REMOVED: async function togglePip() { ... }

// --- Progresso Diário ---
function updateDailyProgressBar() {
     if (!dailyProgressBarFill || !dailyProgressLabel || !dailyGoalMarkers) return;
     try {
        const todayFocusWorkMinutes = getTotalTimeToday(logEntries, ['Foco', 'Trabalho', 'Manual']); // Inclui Manual
        const progressPercent = Math.min(100, (todayFocusWorkMinutes / DAILY_FOCUS_TARGET) * 100);
        dailyProgressBarFill.style.width = `${progressPercent}%`;
        dailyProgressLabel.textContent = `${todayFocusWorkMinutes} min / ${DAILY_FOCUS_TARGET} min`;
        dailyGoalMarkers.innerHTML = ''; // Limpa marcadores
        const todayStr = getTodayDateString();

        customGoals.forEach(goal => {
            const isDailyType = goal.type.endsWith('_today') || goal.type === 'consecutive_days';
            if (goal.achieved && isDailyType) {
                let achievedToday = false;
                 if (goal.achievedTimestamp) { try { achievedToday = new Date(goal.achievedTimestamp).toLocaleDateString('pt-BR') === todayStr; } catch(e){} }
                 else { achievedToday = true; } // Assume hoje se não tem timestamp

                if (achievedToday) {
                    let markerPositionPercent = null;
                    // Calcula posição apenas para metas baseadas em minutos hoje
                    if (goal.type === 'focus_work_minutes_today' || goal.type === 'category_minutes_today') {
                        markerPositionPercent = Math.min(100, (goal.target / DAILY_FOCUS_TARGET) * 100);
                    }
                    // Outros tipos (ciclos, sessões, dias) não têm posição percentual clara na barra de *minutos*

                    if (markerPositionPercent !== null && markerPositionPercent > 0) {
                        const marker = document.createElement('div');
                        marker.classList.add('daily-goal-marker');
                        marker.style.left = `${markerPositionPercent}%`;
                        marker.title = `Meta Concluída: ${goal.name} (${goal.target} min)`; // Melhor tooltip
                        dailyGoalMarkers.appendChild(marker);
                    }
                }
            }
        });
     } catch(error) { console.error("Err daily progress:", error); }
}

// --- Citações ---
async function loadMotivationalQuotes() {
     try { // Fallback para lista local
        motivationalQuotes = [ "O sucesso é a soma de pequenos esforços repetidos.", "Acredite em você.", "A jornada começa com um passo.", "Faça o seu melhor.", "A persistência é o caminho.", "Progresso, não perfeição.", "Sucesso vem antes do trabalho só no dicionário.", "Crie suas oportunidades.", "Você é mais forte do que pensa.", "Plano é essencial.", "Disciplina é a ponte.", "Pequenos passos levam longe.", "Crie o futuro.", "Persiga o ótimo.", "Use o tempo com sabedoria." ];
        console.log("Loaded local motivational quotes.");
     } catch (error) { console.error("Err loading quotes:", error); motivationalQuotes = ["Foco!"]; }
}

function displayRandomQuote() {
    if (quoteDisplay && motivationalQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        quoteDisplay.textContent = `"${motivationalQuotes[randomIndex]}"`;
    }
}

// --- Notificações Browser ---
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn("Notifications not supported.");
        if(notificationPermissionStatus) notificationPermissionStatus.textContent = "(Não suportado)";
        if(browserNotificationsCheckbox) browserNotificationsCheckbox.disabled = true;
        if(requestNotificationPermissionButton) requestNotificationPermissionButton.style.display = 'none';
        browserNotificationsEnabled = false; return;
    }
    notificationPermission = Notification.permission;
    if (notificationPermissionStatus) {
        if (notificationPermission === 'granted') { notificationPermissionStatus.textContent = "(Permitido)"; if(requestNotificationPermissionButton) requestNotificationPermissionButton.style.display = 'none'; if(browserNotificationsCheckbox) browserNotificationsCheckbox.disabled = false; }
        else if (notificationPermission === 'denied') { notificationPermissionStatus.textContent = "(Bloqueado)"; if(requestNotificationPermissionButton) requestNotificationPermissionButton.style.display = 'none'; if(browserNotificationsCheckbox) { browserNotificationsCheckbox.disabled = true; browserNotificationsEnabled = false; browserNotificationsCheckbox.checked = false; } } // Desmarca e desabilita
        else { notificationPermissionStatus.textContent = "(Permissão necessária)"; if(requestNotificationPermissionButton) requestNotificationPermissionButton.style.display = 'inline-block'; if(browserNotificationsCheckbox) browserNotificationsCheckbox.disabled = false; }
    }
    if(browserNotificationsCheckbox) browserNotificationsCheckbox.checked = browserNotificationsEnabled && notificationPermission === 'granted'; // Seta estado inicial correto
}

async function requestNotification() {
     if (!('Notification' in window)) return;
     try {
         const permission = await Notification.requestPermission();
         notificationPermission = permission; // Atualiza estado global
         checkNotificationPermission(); // Atualiza a UI com o novo estado
         if (permission === 'granted') {
             showToast("Notificações permitidas!", "success");
             browserNotificationsEnabled = true; // Ativa automaticamente ao permitir
         } else {
             showToast("Notificações não permitidas.", "info");
             browserNotificationsEnabled = false; // Garante que está desativado
         }
         if(browserNotificationsCheckbox) browserNotificationsCheckbox.checked = browserNotificationsEnabled; // Atualiza checkbox
         saveSettings(); // Salva o estado do 'browserNotificationsEnabled'
     } catch (error) {
         console.error("Error requesting notification permission:", error);
         showToast("Erro ao pedir permissão de notificação.", "error");
     }
}

function checkAndShowBrowserNotification(phaseEnded) {
    if (browserNotificationsEnabled && notificationPermission === 'granted') {
        const nextPhase = getPhaseName();
        const title = `${phaseEnded} Concluído!`;
        const body = `Pronto para iniciar: ${nextPhase}.`;
        const icon = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏆</text></svg>'; // Ícone
        const options = {
            body: body,
            icon: icon,
            tag: 'pomoverso-phase-end', // Evita múltiplas notifs iguais
            renotify: true // Permite substituir com a mesma tag
        };
        try {
             const notification = new Notification(title, options);
             // Opcional: Adicionar evento de clique
             notification.onclick = () => {
                 window.focus(); // Traz a janela do app para frente
                 notification.close();
             };
             setTimeout(() => notification.close(), 8000); // Fecha após 8s
        } catch(e) {
             console.error("Error showing browser notification:", e);
             // Considerar desativar a opção se erros persistirem
             // browserNotificationsEnabled = false; saveSettings(); checkNotificationPermission();
             // showToast("Erro ao mostrar notificação. Desativado.", "warning");
        }
    }
}


// --- Manual Log Entry ---
function showManualLogModal() {
    if (!manualLogModal) return;
    // Limpa form antes de preencher data/hora
    if(manualLogForm) manualLogForm.reset();
    // Pré-preencher data/hora atuais
    const now = new Date();
    // Deslocamento de fuso horário em minutos
    const tzOffset = now.getTimezoneOffset();
    // Cria data ajustada para o fuso local para preencher inputs date/time
    const localNow = new Date(now.getTime() - (tzOffset*60*1000));
    if(manualDateInput) manualDateInput.value = localNow.toISOString().split('T')[0]; // YYYY-MM-DD
    if(manualTimeInput) manualTimeInput.value = localNow.toTimeString().slice(0, 5); // HH:MM

    manualLogModal.showModal();
}

function handleManualLogSubmit(event) {
    event.preventDefault();
    if (!manualTaskInput || !manualDurationInput || !manualDateInput || !manualTimeInput || !manualCategoryInput || !manualNotesInput) {
        showToast("Erro: Campos do formulário não encontrados.", "error"); return;
    }
    try {
        const task = manualTaskInput.value.trim();
        const category = manualCategoryInput.value.trim() || "Sem categoria";
        const duration = parseInt(manualDurationInput.value);
        const dateStr = manualDateInput.value; // "YYYY-MM-DD"
        const timeStr = manualTimeInput.value; // "HH:MM"
        const notes = manualNotesInput.value.trim();

        if (!task) { showToast("Tarefa é obrigatória.", "warning"); manualTaskInput.focus(); return; }
        if (isNaN(duration) || duration <= 0) { showToast("Duração inválida.", "warning"); manualDurationInput.focus(); return; }
        if (!dateStr || !timeStr) { showToast("Data e Hora são obrigatórias.", "warning"); return; }

        // Combina data e hora local e converte para ISOString (UTC) para consistência
        const [year, month, day] = dateStr.split('-');
        const [hour, minute] = timeStr.split(':');
        // Cria data assumindo que os inputs são LOCAIS. O toISOString converterá para UTC.
        const localDate = new Date(year, month - 1, day, hour, minute);
        if (isNaN(localDate.getTime())) { // Verifica se a data é válida
             showToast("Data ou Hora inválida.", "warning"); return;
        }
        const timestamp = localDate.toISOString();

        // Formata data/hora para exibição no log (baseado na data local construída)
        const logDate = localDate.toLocaleDateString('pt-BR');
        const logTime = localDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const logEntry = {
            task: task, category: category, notes: notes,
            type: "Manual", // Tipo específico
            duration: duration, date: logDate, time: logTime, timestamp: timestamp
        };

        logEntries.push(logEntry);
        // Ordena logEntries por timestamp (mais recente primeiro na memória, invertido na tabela)
        logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        saveLogToLocalStorage();
        updateAllUI(); // Atualiza tudo
        if(manualLogModal) manualLogModal.close(); // Fecha modal
        showToast("Registro manual adicionado!", "success");

    } catch (error) {
        console.error("Error submitting manual log:", error);
        showToast("Erro ao salvar registro manual.", "error");
    }
}

// --- Gerenciar Itens Salvos (NOVO) ---
function showManageSavedItemsModal() {
    if (!manageSavedItemsModal) return;
    populateSavedItemsModal(); // Popula as listas antes de mostrar
    manageSavedItemsModal.showModal();
}

function closeManageSavedItemsModal() {
    if (manageSavedItemsModal) manageSavedItemsModal.close();
}

function populateSavedItemsModal() {
    if (!savedTasksListUl || !savedCategoriesListUl) return;

    // Popula Tarefas
    savedTasksListUl.innerHTML = ''; // Limpa
    const taskNoItemsMsg = savedTasksListUl.querySelector('.no-items-message');
    if (savedTasks.length === 0) {
        savedTasksListUl.innerHTML = '<li class="no-items-message">Nenhuma tarefa salva.</li>';
    } else {
        savedTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('saved-item');
            li.innerHTML = `
                <span>${task}</span>
                <button class="delete-item-btn" data-type="task" data-value="${task}" title="Apagar Tarefa"><i class="fa-solid fa-trash"></i></button>
            `;
            savedTasksListUl.appendChild(li);
        });
    }

    // Popula Categorias
    savedCategoriesListUl.innerHTML = ''; // Limpa
    const catNoItemsMsg = savedCategoriesListUl.querySelector('.no-items-message');
    if (savedCategories.length === 0) {
         savedCategoriesListUl.innerHTML = '<li class="no-items-message">Nenhuma categoria salva.</li>';
    } else {
        savedCategories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('saved-item');
            li.innerHTML = `
                <span>${category}</span>
                <button class="delete-item-btn" data-type="category" data-value="${category}" title="Apagar Categoria"><i class="fa-solid fa-trash"></i></button>
            `;
            savedCategoriesListUl.appendChild(li);
        });
    }
}

function handleDeleteSavedItem(event) {
    const button = event.target.closest('.delete-item-btn');
    if (!button) return;

    const type = button.dataset.type; // 'task' or 'category'
    const value = button.dataset.value;
    const list = type === 'task' ? savedTasks : savedCategories;
    const listName = type === 'task' ? 'tarefa' : 'categoria';

    if (confirm(`Tem certeza que deseja apagar a ${listName} salva: "${value}"?`)) {
        const index = list.indexOf(value);
        if (index > -1) {
            list.splice(index, 1); // Remove do array
            saveSettings(); // Salva a lista modificada

            // Atualiza a UI do modal e os datalists
            populateSavedItemsModal();
            if (type === 'task') {
                populateTaskSuggestions();
            } else {
                populateCategorySuggestions();
            }

            showToast(`${listName.charAt(0).toUpperCase() + listName.slice(1)} "${value}" apagada.`, 'info');
        } else {
            console.warn(`Item "${value}" not found in ${type} list for deletion.`);
            showToast(`Erro: ${listName} não encontrada.`, 'error');
        }
    }
}


// --- Event Listeners ---
function setupEventListeners() {
    console.log("--- Setting up event listeners (v3.3 - No PiP) ---"); // Mensagem atualizada
    try {
        // Interação inicial
        document.body.addEventListener('click', () => { if (!userInteracted) userInteracted = true; }, { once: true });

        // Modo Timer
        if(modeRadios) modeRadios.forEach(radio => radio.addEventListener('change', (e) => { const newMode = e.target.value; if(newMode !== timerMode) { timerMode = newMode; resetTimer(); updateModeUI(); saveSettings(); showToast(`Modo: ${timerMode === 'pomodoro' ? 'Pomodoro' : 'Foco/Descanso'}`, "info"); } }));

        // Controles Timer
        if(startPauseButton) startPauseButton.addEventListener('click', toggleStartPause);
        if(resetButton) resetButton.addEventListener('click', resetTimer);

        // Controles Focus
        if(focusLogButton) focusLogButton.addEventListener('click', () => { logCycle(null, Math.max(0, Math.floor(timeLeft / 60))); });
        if(focusSwitchButton) focusSwitchButton.addEventListener('click', switchFocusBreak);
        if(focusResetOnLogCheckbox) focusResetOnLogCheckbox.addEventListener('change', (e) => { resetFocusOnLog = e.target.checked; saveSettings(); });

        // Log
        if(downloadLogButton) downloadLogButton.addEventListener('click', downloadLog);
        if(clearLogButton) clearLogButton.addEventListener('click', clearLog);
        if(logTableBody) logTableBody.addEventListener('click', (event) => { try { const btn = event.target.closest('.delete-log-btn'); if (btn) { deleteLogEntry(btn.dataset.timestamp); } } catch(e) { console.error("Err log delete listener:", e);} });
        if(addManualLogButton) addManualLogButton.addEventListener('click', showManualLogModal);
        if(manualLogForm) manualLogForm.addEventListener('submit', handleManualLogSubmit);
        if(cancelManualLogButton) cancelManualLogButton.addEventListener('click', () => manualLogModal?.close());
        if(manualLogModal) manualLogModal.addEventListener('close', () => manualLogForm?.reset());

        // Gerenciar Itens Salvos (NOVO)
        if(manageSavedItemsBtn) manageSavedItemsBtn.addEventListener('click', showManageSavedItemsModal);
        if(closeManageModalBtn) closeManageModalBtn.addEventListener('click', closeManageSavedItemsModal);
        if(manageSavedItemsModal) { // Adiciona listener de deleção ao container do modal
             manageSavedItemsModal.addEventListener('click', handleDeleteSavedItem);
             manageSavedItemsModal.addEventListener('close', () => { // Limpa listas ao fechar para evitar duplicação de listeners internos
                if(savedTasksListUl) savedTasksListUl.innerHTML = '';
                if(savedCategoriesListUl) savedCategoriesListUl.innerHTML = '';
            });
        }

        // Configurações Gerais
        if(resetAllButton) resetAllButton.addEventListener('click', resetEverything);
        if(themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
        if(soundSelectWork) soundSelectWork.addEventListener('change', (e) => { selectedSoundWork = e.target.value; saveSettings(); });
        if(soundSelectBreak) soundSelectBreak.addEventListener('change', (e) => { selectedSoundBreak = e.target.value; saveSettings(); });
        if(playSoundTestWork) playSoundTestWork.addEventListener('click', () => playNotification('work'));
        if(playSoundTestBreak) playSoundTestBreak.addEventListener('click', () => playNotification('break'));
        if(volumeControl) volumeControl.addEventListener('input', (e) => { currentVolume = parseFloat(e.target.value); if(audioPlayer) audioPlayer.volume = currentVolume; if(volumeValueSpan) volumeValueSpan.textContent = `${Math.round(currentVolume * 100)}%`; });
        if(volumeControl) volumeControl.addEventListener('change', () => { saveSettings(); playNotification('generic'); }); // Salva e toca som ao soltar
        if(browserNotificationsCheckbox) browserNotificationsCheckbox.addEventListener('change', (e) => { if (notificationPermission !== 'granted') { e.target.checked = false; showToast("Permissão necessária.", "warning"); requestNotification(); browserNotificationsEnabled = false; } else { browserNotificationsEnabled = e.target.checked; saveSettings(); showToast(`Notificações ${browserNotificationsEnabled ? 'ativadas' : 'desativadas'}.`, "info"); } });
        if(requestNotificationPermissionButton) requestNotificationPermissionButton.addEventListener('click', requestNotification);
        if(exportDataButton) exportDataButton.addEventListener('click', exportData);
        if(importFileInput) importFileInput.addEventListener('change', importData);

        // Configs Pomodoro
        if(addSequenceBtn) addSequenceBtn.addEventListener('click', handleAddSequence);
        if(pomodoroPresetsDiv) pomodoroPresetsDiv.addEventListener('click', applyPomodoroPreset);
        if(longBreakIntervalInput) longBreakIntervalInput.addEventListener('change', saveSettings);
        if(longBreakDurationInput) longBreakDurationInput.addEventListener('change', saveSettings);
        if(autoStartWorkCheckbox) autoStartWorkCheckbox.addEventListener('change', (e) => { autoStartWorkEnabled = e.target.checked; saveSettings(); });
        if(autoStartBreakCheckbox) autoStartBreakCheckbox.addEventListener('change', (e) => { autoStartBreakEnabled = e.target.checked; saveSettings(); });

        // Metas
        if(addGoalButton) addGoalButton.addEventListener('click', addCustomGoal);
        if(newGoalTypeSelect) newGoalTypeSelect.addEventListener('change', toggleGoalCategoryInput);
        // Remover meta listener é adicionado dinamicamente em updateCustomGoalsUI

        // Salvar Tarefa/Categoria
        if(saveTaskBtn) saveTaskBtn.addEventListener('click', () => saveTaskOrCategory('task'));
        if(saveCategoryBtn) saveCategoryBtn.addEventListener('click', () => saveTaskOrCategory('category'));

        // Abas
        if(tabButtons) setupTabs();

        // PiP --- REMOVIDO ---
        // REMOVED: if(pipButton) pipButton.addEventListener('click', togglePip);
        // REMOVED: if(pipVideo) { ... listeners ... }

        // Atalhos Teclado
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            // Ignora atalhos se algum modal estiver aberto ou foco em input/textarea/select
            const isModalOpen = manualLogModal?.open || manageSavedItemsModal?.open;
            if (isModalOpen || (activeEl && ['INPUT', 'TEXTAREA', 'SELECT', 'DIALOG'].includes(activeEl.tagName))) return;

            switch (e.code) {
                case 'Space': e.preventDefault(); toggleStartPause(); break;
                case 'KeyR': if (!resetButton.disabled) resetTimer(); break;
                case 'KeyS': if (timerMode === 'focus' && focusSwitchButton.style.display !== 'none') switchFocusBreak(); break;
                case 'KeyL': if (timerMode === 'focus' && focusLogButton.style.display !== 'none') logCycle(null, Math.max(0, Math.floor(timeLeft / 60))); break;
            }
        });

        console.log("--- Event listeners setup finished (v3.3 - No PiP) ---");
    } catch (error) {
        console.error("FATAL ERROR during setupEventListeners:", error);
        showToast("Erro ao configurar interações. Verifique o console.", "error", 10000);
    }
}

// --- Inicializa ---
document.addEventListener('DOMContentLoaded', initializeApp);
