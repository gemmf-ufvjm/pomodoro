// --- Elementos Globais (Garantir que estão definidos) ---
let body, modeRadios, timerStatus, timeDisplay, startPauseButton, resetButton, focusLogButton, focusSwitchButton,
    focusResetOnLogCheckbox, focusOptionsDiv, taskInput, categoryInput, categorySuggestions, sessionNotesInput,
    settingsSection, pomodoroSettingsDiv, cycleSequenceList, addSequenceBtn, longBreakIntervalInput,
    longBreakDurationInput, pomodoroPresetsDiv, customGoalsSection, customGoalsList, addGoalForm,
    newGoalNameInput, newGoalTypeSelect, newGoalTargetInput, addGoalButton, logTableBody, logEmptyMessage,
    downloadLogButton, clearLogButton, tabButtons, tabContents, resetAllButton, themeToggleButton,
    soundSelect, playSoundTestButton, audioPlayer, statCyclesToday, statFocusToday, statBreakToday,
    exportDataButton, importFileInput, importDataButton, toastNotification, currentYearSpan,
    textStatFocusToday, textStatFocusWeek, textStatCyclesToday, textStatCyclesWeek, textStatAvgSession,
    textStatTotalFocusAll, textStatTotalCyclesAll;

// --- Variáveis de Estado ---
let timerMode = 'pomodoro'; // 'pomodoro' or 'focus'
let timerInterval = null;
let timeLeft = 0; // Em segundos
let currentSequence = []; // [{ work: 25, break: 5, reps: 4 }, ...]
let currentStepIndex = 0;
let currentRepetition = 1;
let cyclesSinceLongBreak = 0;
let isWorking = true; // No modo Pomodoro: true = trabalho, false = descanso
let isFocusing = true; // No modo Focus: true = foco, false = descanso livre
let isPaused = true;
let logEntries = []; // Array de objetos de log
let customGoals = []; // Array de objetos de meta
let currentTheme = 'light'; // 'light' or 'dark'
let selectedSound = 'bell';
let resetFocusOnLog = false;
let toastTimeout = null;
let soundUrls = {}; // Preenchido em assignDOMElements
let userInteracted = false; // Flag para restrição de áudio

// --- Configuração dos Gráficos ---
const chartElements = {
    category: { ctx: null, chart: null, noData: null, canvas: null },
    task: { ctx: null, chart: null, noData: null, canvas: null },
    dailyActivity: { ctx: null, chart: null, noData: null, canvas: null },
    focusBreak: { ctx: null, chart: null, noData: null, canvas: null },
    timeOfDay: { ctx: null, chart: null, noData: null, canvas: null }, // Novo gráfico
};

// --- Função Principal de Inicialização ---
function initializeApp() {
    console.log("--- Initializing App v3.1 ---");
    try {
        assignDOMElements();
        initializeChartElements();
        loadTheme();
        loadSettings(); // Carrega configurações e metas
        loadLogFromLocalStorage(); // Carrega logs
        loadInitialTimerMode(); // Define o modo inicial baseado nas configurações ou padrão
        initializeAppUI(); // Atualiza a UI com base nos dados carregados
        initializeTimer(); // Configura o timer para o estado inicial (sem iniciar)
        updateAllUI(); // Chama todas as funções de atualização da UI
        setupEventListeners();
        if(currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
        console.log("--- App Initialized Successfully ---");
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
    soundSelect = document.getElementById('sound-select');
    playSoundTestButton = document.getElementById('play-sound-test');
    audioPlayer = document.getElementById('audio-player');
    statCyclesToday = document.getElementById('stat-cycles-today');
    statFocusToday = document.getElementById('stat-focus-today');
    statBreakToday = document.getElementById('stat-break-today');
    exportDataButton = document.getElementById('export-data-button');
    importFileInput = document.getElementById('import-file-input');
    importDataButton = document.getElementById('import-data-button'); // A label, não o input
    toastNotification = document.getElementById('toast-notification');
    currentYearSpan = document.getElementById('current-year');

    // Text Stats Elements
    textStatFocusToday = document.getElementById('text-stat-focus-today');
    textStatFocusWeek = document.getElementById('text-stat-focus-week');
    textStatCyclesToday = document.getElementById('text-stat-cycles-today');
    textStatCyclesWeek = document.getElementById('text-stat-cycles-week');
    textStatAvgSession = document.getElementById('text-stat-avg-session');
    textStatTotalFocusAll = document.getElementById('text-stat-total-focus-all');
    textStatTotalCyclesAll = document.getElementById('text-stat-total-cycles-all');


    // Preencher URLs de som após DOM estar pronto
    soundUrls = {
        alarm_clock: document.getElementById('sound-url-alarm_clock')?.dataset.url || null,
        bell: document.getElementById('sound-url-bell')?.dataset.url || null,
        digital: document.getElementById('sound-url-digital')?.dataset.url || null,
        none: null
    };
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
            } else {
                 console.warn(`Canvas element not found for chart: ${key}Chart`);
            }
        } catch (e) {
            console.error(`Error initializing chart element ${key}:`, e);
        }
    });
}

// --- Inicialização da UI Baseada nos Dados Carregados ---
function initializeAppUI() {
    console.log("Initializing App UI...");
    try {
        updateModeUI(); // Define a visibilidade das seções baseadas no timerMode
        updateSequenceUI(); // Popula a lista de sequência Pomodoro
        updateCustomGoalsUI(); // Popula a lista de metas
        updateLogTable(); // Popula a tabela de logs
        updateCharts(); // Renderiza os gráficos
        populateCategorySuggestions(); // Popula o datalist de categorias
        updateMiniDashboard(); // Atualiza os stats do header
        updateTextStats(); // Atualiza as estatísticas textuais
        if (soundSelect) soundSelect.value = selectedSound;
        if (focusResetOnLogCheckbox) focusResetOnLogCheckbox.checked = resetFocusOnLog;
        setupTabs(); // Configura as abas de Log/Stats
    } catch (error) {
        console.error("Error during initializeAppUI:", error);
    }
}

// --- Configuração Inicial do Timer ---
function initializeTimer() {
    console.log("Initializing Timer State...");
    try {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;

        if (timerMode === 'pomodoro') {
            if (!Array.isArray(currentSequence) || currentSequence.length === 0) {
                console.warn("Pomodoro sequence is empty or invalid, resetting to default.");
                currentSequence = [{ work: 25, break: 5, reps: 4 }];
                // Não salva aqui, pode ser carregado depois
                updateSequenceUI(); // Atualiza a UI para refletir o padrão
            }
            currentStepIndex = 0;
            currentRepetition = 1;
            cyclesSinceLongBreak = 0;
            isWorking = true;
            timeLeft = (currentSequence[0]?.work || 25) * 60; // Usa o primeiro passo ou padrão
        } else { // Modo Focus
            isFocusing = true;
            timeLeft = 0;
        }

        if(sessionNotesInput) sessionNotesInput.value = ''; // Limpa notas ao resetar/iniciar

        // Atualiza apenas o display e botões, sem iniciar o timer
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
        checkCustomGoals(); // Verifica se metas foram atingidas
        updateCustomGoalsUI();
        updateLogTable();
        updateCharts(); // Atualiza todos os gráficos
        populateCategorySuggestions();
        updateMiniDashboard();
        updateTextStats(); // Atualiza stats textuais
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
        // Atualiza título da página apenas se não estiver pausado e com tempo > 0 (ou modo foco)
        if (!isPaused && (timeLeft > 0 || timerMode === 'focus')) {
             document.title = `${formattedTime} - ${getPhaseName()} | Pomodoro Mourão`;
        } else {
             document.title = `Pomodoro Mourão v1.2`;
        }
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

        startPauseButton.disabled = false; // Habilita por padrão
        resetButton.disabled = isPaused && timerInterval === null && timeLeft === 0; // Desabilita reset se já zerado

        if (isPaused) {
            startPauseButton.innerHTML = `${startIcon} Iniciar`;
            startPauseButton.classList.add('paused');
            timerStatus.textContent = `Pausado - ${getPhaseName()}`;
            // Se o timer nunca foi iniciado nesta fase (intervalo nulo)
            if (timerInterval === null) {
                timerStatus.textContent = `Pronto para ${getPhaseName(true)}`; // Texto inicial
                 // No modo Pomodoro, se for uma pausa e o tempo acabou, prepara para iniciar
                if (timerMode === 'pomodoro' && !isWorking && timeLeft <= 0) {
                     startPauseButton.classList.add('break-ready');
                     timerStatus.textContent = `Pronto para ${getPhaseName()}`;
                }
                // No modo Focus, se tempo é 0, ajusta texto do botão
                if(timerMode === 'focus' && timeLeft === 0) {
                     startPauseButton.innerHTML = `${startIcon} ${isFocusing ? 'Iniciar Foco' : 'Iniciar Descanso'}`;
                }
            }
        } else { // Timer rodando
            startPauseButton.innerHTML = `${pauseIcon} Pausar`;
            startPauseButton.classList.remove('paused');
            timerStatus.textContent = `Em andamento - ${getPhaseName()}`;
        }
        startPauseButton.classList.remove('break-ready'); // Remove classe extra se não for o caso

        // Controle dos botões específicos do modo Focus
        const isPomodoro = timerMode === 'pomodoro';
        focusOptionsDiv.style.display = isPomodoro ? 'none' : 'block';
        focusLogButton.style.display = isPomodoro ? 'none' : (timeLeft > 0 ? 'inline-flex' : 'none');
        focusSwitchButton.style.display = isPomodoro ? 'none' : 'inline-flex';

        if (!isPomodoro) {
            focusSwitchButton.innerHTML = `${switchIcon} Alternar para ${isFocusing ? 'Descanso' : 'Foco'}`;
            focusLogButton.innerHTML = `${logIcon} Registrar ${isFocusing ? 'Foco' : 'Descanso'}`;
        }

        // Desabilitar botão de iniciar se for Pomodoro, pausa, e tempo 0 (esperando iniciar próxima fase)
        if(timerMode === 'pomodoro' && isPaused && !isWorking && timeLeft <= 0 && timerInterval !== null) {
            // startPauseButton.disabled = true; // Opcional: forçar o usuário a resetar ou deixar o sistema avançar
        }

    } catch (error) {
        console.error("Error updating button status:", error);
    }
}

// --- Atualiza Classe do Body para Estilo ---
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

// --- Atualiza UI Baseado no Modo (Pomodoro/Focus) ---
function updateModeUI() {
    const isPomodoro = timerMode === 'pomodoro';
    if (pomodoroSettingsDiv) pomodoroSettingsDiv.style.display = isPomodoro ? 'block' : 'none';
    // Garante que os controles de Foco só apareçam no modo Foco
    if (focusLogButton) focusLogButton.style.display = 'none'; // Esconde inicialmente
    if (focusSwitchButton) focusSwitchButton.style.display = 'none'; // Esconde inicialmente
    if (focusOptionsDiv) focusOptionsDiv.style.display = 'none'; // Esconde inicialmente
    try {
        // Marca o radio button correto
        const radio = document.querySelector(`input[name="timer-mode"][value="${timerMode}"]`);
        if (radio) radio.checked = true;
    } catch (e) { console.error("Error setting mode radio:", e); }
    // initializeTimer será chamado após a mudança de modo para reconfigurar
}

// --- Obtém Nome da Fase Atual ---
function getPhaseName(initial = false) {
    try {
        if (timerMode === 'pomodoro') {
            if (initial && isWorking) return 'Ciclo de Trabalho';
            if (initial && !isWorking) return (isLongBreak() ? 'Descanso Longo' : 'Descanso Curto'); // Correção aqui
            if (isWorking) return 'Trabalho';
            return isLongBreak() ? 'Descanso Longo' : 'Descanso Curto';
        } else { // Modo Focus
            if (initial) return isFocusing ? 'Foco' : 'Descanso Livre'; // Se inicial, usa isFocusing atual
            return isFocusing ? 'Foco' : 'Descanso Livre';
        }
    } catch (e) {
        console.error("Error in getPhaseName:", e);
        return "Erro";
    }
}

// --- Verifica se é um Descanso Longo ---
function isLongBreak() {
    if(timerMode !== 'pomodoro' || isWorking) return false; // Só se aplica a pomodoro em descanso
    try {
        const intervalSetting = parseInt(longBreakIntervalInput?.value || '0');
        // É descanso longo se o intervalo está configurado (>0) e o número de ciclos desde o último longo atingiu o intervalo
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
        // Adiciona ícone baseado no tipo
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
        else if (type === 'error') iconClass = 'fa-times-circle';

        toastNotification.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${message}`; // Adiciona ícone
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

// --- Tick do Timer (Chamado a cada segundo) ---
function timerTick() {
    if (isPaused) return;
    try {
        if (timerMode === 'pomodoro') {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else { // Tempo acabou
                clearInterval(timerInterval);
                timerInterval = null; // Indica que o timer parou
                const wasWorking = isWorking; // Guarda o estado antes de mudar
                const phaseJustEnded = getPhaseName(); // Nome da fase que acabou
                const step = currentSequence[currentStepIndex];
                let durationToLog = 0;

                // Calcula duração baseada na fase que terminou
                if (wasWorking && step) {
                    durationToLog = step.work;
                } else if (!wasWorking && step) {
                    durationToLog = isLongBreak() ? parseInt(longBreakDurationInput?.value || '15') : step.break;
                }

                logCycle(phaseJustEnded, durationToLog); // Loga a fase concluída
                playNotification(); // Toca o som

                switchPhaseSetup(); // Prepara a próxima fase (muda isWorking, timeLeft, etc.)
                isPaused = true; // Pausa automaticamente para o usuário iniciar a próxima fase

                updateDisplay(); // Atualiza o tempo para a nova fase
                updateButtonAndStatus(); // Atualiza botões e status
                updateBodyClass(); // Atualiza fundo
                const nextPhaseName = getPhaseName(); // Pega o nome da *nova* fase
                showToast(`${phaseJustEnded} concluído! Pronto para ${nextPhaseName}.`, 'success');
            }
        } else { // Modo Focus (contador crescente)
            timeLeft++;
            updateDisplay();
            // Atualiza botão de log caso tenha acabado de passar de 0
            if(timeLeft === 1 && focusLogButton) focusLogButton.style.display = 'inline-flex';
            if(resetButton && resetButton.disabled) resetButton.disabled = false; // Habilita reset
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
            // Limpa qualquer intervalo antigo só por garantia
            clearInterval(timerInterval);

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
        clearInterval(timerInterval);
        // Não reseta timerInterval para null aqui, para sabermos que foi pausado e não parado
        updateButtonAndStatus();
        updateBodyClass();
        document.title = `(Pausado) Pomodoro Mourão v1.2`; // Título pausado
    }
}

// --- Reseta o Timer para o Estado Inicial da Fase Atual ---
function resetTimer() {
    try {
        pauseTimer(); // Garante que está pausado e limpa o intervalo
        timerInterval = null; // Indica que o timer foi parado/resetado
        initializeTimer(); // Reconfigura o tempo e estado para o início da fase atual
        updateAllUI(); // <<< CONFIRMAÇÃO: resetTimer CHAMA updateAllUI
        showToast("Timer resetado.", "info");
    } catch (error) {
        console.error("Error resetting timer:", error);
        showToast("Erro ao resetar o timer.", "error");
    }
}

// --- Alterna entre Iniciar e Pausar ---
function toggleStartPause() {
    // Registra interação do usuário para permitir áudio
    if (!userInteracted) {
        userInteracted = true;
        // Tenta tocar um som silencioso para "desbloquear" o áudio (opcional)
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

// --- Configura a Próxima Fase no Modo Pomodoro ---
function switchPhaseSetup() {
    if (timerMode !== 'pomodoro') return;
    try {
        const wasWorking = isWorking;
        let nextTime = 0;

        // Se a fase que terminou foi trabalho, incrementa contador para descanso longo
        if (wasWorking) {
            cyclesSinceLongBreak++;
        }

        const intervalSetting = parseInt(longBreakIntervalInput?.value || '0');
        const willBeLongBreak = !wasWorking && intervalSetting > 0 && cyclesSinceLongBreak >= intervalSetting; // Erro aqui: deveria ser wasWorking

        // CORREÇÃO: a verificação do descanso longo ocorre APÓS um ciclo de TRABALHO
        const shouldBeLongBreak = wasWorking && intervalSetting > 0 && cyclesSinceLongBreak >= intervalSetting;

        if (shouldBeLongBreak) {
            isWorking = false; // Próxima fase é descanso longo
            nextTime = parseInt(longBreakDurationInput?.value || '15') * 60;
            cyclesSinceLongBreak = 0; // Reseta contador após iniciar o descanso longo
            console.log("Setting up: Long Break");
        } else {
            const currentStep = currentSequence[currentStepIndex];
            if (!currentStep) {
                console.error("Invalid sequence step index:", currentStepIndex, "Sequence:", currentSequence);
                showToast("Erro na sequência Pomodoro. Resetando.", "error");
                initializeTimer(); // Reseta para o início se a sequência estiver inválida
                return;
            }

            if (wasWorking) { // Terminou trabalho, vai para descanso (curto ou nenhum)
                if (currentStep.break > 0) {
                    isWorking = false;
                    nextTime = currentStep.break * 60;
                    console.log(`Setting up: Short Break (Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
                } else {
                    // Sem descanso, avança direto para o próximo trabalho
                    isWorking = true;
                    moveToNextRepOrStep(); // Avança repetição/passo
                    nextTime = (currentSequence[currentStepIndex]?.work || 0) * 60; // Pega tempo do *novo* passo/rep
                    console.log(`Setting up: Next Work (No break - Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
                }
            } else { // Terminou descanso (curto ou longo), vai para trabalho
                isWorking = true;
                moveToNextRepOrStep(); // Avança repetição/passo
                nextTime = (currentSequence[currentStepIndex]?.work || 0) * 60; // Pega tempo do *novo* passo/rep
                console.log(`Setting up: Next Work (After break - Step ${currentStepIndex + 1}, Rep ${currentRepetition})`);
            }
        }

        timeLeft = nextTime;
        if (sessionNotesInput) sessionNotesInput.value = ''; // Limpa notas para a nova fase
    } catch (error) {
        console.error("Error during switchPhaseSetup:", error);
        showToast("Erro ao mudar de fase. Resetando timer.", "error");
        initializeTimer(); // Reseta em caso de erro grave
    }
}

// --- Avança para Próxima Repetição ou Passo na Sequência Pomodoro ---
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

// --- Alterna entre Foco e Descanso Livre no Modo Focus ---
function switchFocusBreak() {
    if (timerMode !== 'focus') return;
    try {
        let shouldLog = false;
        const currentTime = timeLeft; // Tempo acumulado atual
        const currentPhaseType = isFocusing ? 'Foco' : 'Descanso Livre';
        const durationToLog = Math.max(0, Math.floor(currentTime / 60)); // Em minutos

        // Pergunta se quer logar apenas se houver tempo acumulado
        if (currentTime > 0) {
            if (confirm(`Registrar os ${durationToLog} minutos de ${currentPhaseType} atuais antes de alternar?`)) {
                shouldLog = true;
            }
        }

        // Loga se confirmado
        if (shouldLog) {
            logCycle(currentPhaseType, durationToLog); // Usa a função de log padrão
        }

        // Alterna o estado
        isFocusing = !isFocusing;
        timeLeft = 0; // Reseta o tempo para o novo estado
        isPaused = true; // Pausa para o usuário iniciar
        clearInterval(timerInterval);
        timerInterval = null; // Indica que parou
        if (sessionNotesInput) sessionNotesInput.value = ''; // Limpa notas

        updateDisplay();
        updateButtonAndStatus();
        updateBodyClass();
        showToast(`Modo alterado para ${getPhaseName()}. Pronto para iniciar.`, "info");
    } catch (error) {
        console.error("Error switching focus/break:", error);
        showToast("Erro ao alternar foco/descanso.", "error");
    }
}

// --- Atualiza UI da Sequência Pomodoro ---
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

// --- Adiciona um Novo Bloco na Sequência Pomodoro ---
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

// --- Remove um Bloco da Sequência Pomodoro ---
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

// --- Lida com Mudanças nos Inputs da Sequência ---
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

        // Se a mudança foi no tempo de trabalho do *primeiro* passo,
        // e o timer está parado/zerado no modo Pomodoro, atualiza o tempo inicial.
        if (isPaused && timerInterval === null && timerMode === 'pomodoro' && index === 0 && prop === 'work') {
            initializeTimer(); // Reinicializa para pegar o novo tempo de trabalho
            updateAllUI();
        }
         // Se a mudança foi no intervalo/duração do descanso longo, apenas salva (já feito)
         // O cálculo de isLongBreak() usará os novos valores na próxima verificação.

    } catch (error) {
        console.error("Error handling sequence input change:", error);
        showToast("Erro ao atualizar sequência.", "error");
    }
}

// --- Aplica um Preset Pomodoro ---
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

// --- Registra um Ciclo ou Sessão de Foco/Descanso ---
function logCycle(explicitType = null, explicitDuration = null) {
    try {
        const now = new Date();
        let durationMinutes;
        let type;
        let logTimeSource = timeLeft; // Tempo atual do contador

        // Determina o tipo e duração baseado no modo
        if (timerMode === 'pomodoro') {
            type = explicitType ?? (isWorking ? "Trabalho" : (isLongBreak() ? "Descanso Longo" : "Descanso Curto"));
            durationMinutes = explicitDuration ?? 0; // Usa duração explícita do ciclo Pomodoro
        } else { // Modo Focus
            type = explicitType ?? (isFocusing ? 'Foco' : 'Descanso Livre');
            durationMinutes = explicitDuration ?? Math.max(0, Math.floor(logTimeSource / 60)); // Usa tempo acumulado
        }

        // Adiciona log de depuração para verificar o estado
        console.log(`[LogCycle] Attempting log. Mode: ${timerMode}, Type: ${type}, Duration: ${durationMinutes}, Checkbox State (resetFocusOnLog): ${resetFocusOnLog}`);

        // Não registra se a duração for zero ou menos
        if (durationMinutes <= 0) {
            console.log("[LogCycle] Skipping log: Duration is 0.");
            // Mostra toast apenas se foi uma tentativa manual (explicitType === null no modo focus)
            if (timerMode === 'focus' && explicitType === null) {
                showToast("Nada para registrar (duração 0).", "info");
                // Limpa notas se não for resetar
                if (!resetFocusOnLog && sessionNotesInput) sessionNotesInput.value = '';
            }
            return; // Sai da função
        }

        // Cria a entrada de log
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

        // Adiciona ao array e salva no localStorage
        logEntries.push(logEntry);
        saveLogToLocalStorage();

        let resetHappened = false; // Flag para controlar se o reset foi chamado

        // Verifica se deve resetar (APENAS para logs MANUAIS no modo FOCUS)
        if (timerMode === 'focus' && explicitType === null) {
            console.log("[LogCycle] Checking reset condition for Focus mode manual log...");
            if (resetFocusOnLog) {
                console.log("[LogCycle] Checkbox is checked. Calling resetTimer()...");
                resetTimer(); // Chama a função que reseta e atualiza a UI
                resetHappened = true; // Marca que o reset (e a atualização da UI) ocorreu
                showToast(`${type} (${durationMinutes} min) registrado! Timer zerado.`, 'success');
            } else {
                console.log("[LogCycle] Checkbox is unchecked. Clearing notes only.");
                // Se não resetou, apenas limpa as notas (resetTimer já faz isso)
                if (sessionNotesInput) sessionNotesInput.value = '';
                showToast(`${type} (${durationMinutes} min) registrado!`, 'success');
            }
        }

        // Atualiza a UI APENAS se o reset NÃO aconteceu
        // Se o reset aconteceu, resetTimer() já chamou updateAllUI()
        if (!resetHappened) {
            console.log("[LogCycle] Reset did not happen, calling updateAllUI() manually.");
            updateAllUI();
        } else {
            console.log("[LogCycle] Reset happened, updateAllUI() was called by resetTimer(). Skipping manual call.");
        }

    } catch (error) {
        console.error("Error logging cycle:", error);
        showToast("Erro ao registrar o ciclo.", "error");
    }
}

// --- Atualiza a Tabela de Logs na UI ---
function updateLogTable() {
    if (!logTableBody || !logEmptyMessage) return;
    try {
        logTableBody.innerHTML = ''; // Limpa a tabela
        if (logEntries.length === 0) {
            logEmptyMessage.style.display = 'block'; // Mostra mensagem de vazio
            return; // Sai se não há logs
        }

        logEmptyMessage.style.display = 'none'; // Esconde mensagem de vazio

        // Cria as linhas da tabela na ordem inversa (mais recente primeiro)
        [...logEntries].reverse().forEach((entry) => {
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

// --- Deleta uma Entrada do Log ---
function deleteLogEntry(timestamp) {
    try {
        if (!timestamp) {
            console.error("Delete failed: Invalid timestamp provided.");
            showToast("Erro ao apagar: ID inválido.", "error");
            return;
        }
        const initialLength = logEntries.length;
        // Filtra o array, mantendo apenas as entradas cujo timestamp NÃO é o que queremos deletar
        logEntries = logEntries.filter(entry => entry.timestamp !== timestamp);

        if (logEntries.length < initialLength) {
            saveLogToLocalStorage(); // Salva o array modificado
            updateAllUI(); // Atualiza a UI
            showToast(`Registro apagado.`, 'info');
            console.log("Log entry deleted:", timestamp);
        } else {
            console.error("Could not find log entry to delete with timestamp:", timestamp);
            showToast("Erro: Registro não encontrado para apagar.", 'error');
        }
    } catch (error) {
        console.error("Error deleting log entry:", error);
        showToast("Erro ao apagar registro.", "error");
    }
}

// --- Limpa Todo o Log ---
function clearLog() {
    try {
        if (logEntries.length === 0) {
             showToast("O registro já está vazio.", "info");
             return;
        }
        if (confirm("Tem certeza que deseja apagar TODOS os registros da tabela? Esta ação é irreversível!")) {
            logEntries = []; // Esvazia o array
            saveLogToLocalStorage(); // Salva o array vazio
            updateAllUI(); // Atualiza a UI
            showToast("Tabela de logs limpa.", "success");
            console.log("Log table cleared.");
        }
    } catch (error) {
        console.error("Error clearing log:", error);
        showToast("Erro ao limpar o log.", "error");
    }
}

// --- Adiciona uma Nova Meta Personalizada ---
function addCustomGoal() {
    if (!newGoalNameInput || !newGoalTypeSelect || !newGoalTargetInput) return;
    try {
        const name = newGoalNameInput.value.trim();
        const type = newGoalTypeSelect.value; // Ex: 'focus_minutes_today'
        const target = parseInt(newGoalTargetInput.value);

        // Validação
        if (!name) {
            showToast("Por favor, dê um nome para a meta.", "warning");
            newGoalNameInput.focus();
            return;
        }
        if (!type) { // Deve sempre ter um valor selecionado
            showToast("Erro interno: tipo de meta inválido.", "error");
            return;
        }
        if (isNaN(target) || target <= 0) {
            showToast("O valor da meta deve ser um número positivo.", "warning");
            newGoalTargetInput.focus();
            return;
        }

        const newGoal = {
            id: `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`, // ID único
            name: name,
            type: type,
            target: target,
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
        newGoalTypeSelect.selectedIndex = 0; // Volta para a primeira opção

        showToast(`Meta "${name}" adicionada!`, "success");
    } catch (error) {
        console.error("Error adding custom goal:", error);
        showToast("Erro ao adicionar meta.", "error");
    }
}

// --- Remove uma Meta Personalizada ---
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

// --- Verifica o Progresso das Metas ---
function checkCustomGoals() {
    try {
        if (!Array.isArray(customGoals) || customGoals.length === 0) return; // Sai se não há metas

        let settingChanged = false; // Flag para saber se alguma meta foi atingida agora

        // Calcula os totais necessários uma vez
        const counts = {
            cyclesToday: countItemsToday(logEntries, 'Trabalho'),
            focusMinutesToday: getTotalTimeToday(logEntries, ['Foco']), // Apenas Foco conta aqui
            totalCycles: logEntries.filter(l => l.type === 'Trabalho').length,
            totalFocusMinutes: logEntries.filter(l => l.type === 'Foco').reduce((sum, l) => sum + l.duration, 0)
        };

        customGoals.forEach(goal => {
            // Só verifica metas que ainda não foram atingidas
            if (!goal.achieved) {
                let currentProgress = 0;
                // Determina o progresso baseado no tipo da meta
                switch (goal.type) {
                    case 'pomodoro_cycles_today': currentProgress = counts.cyclesToday; break;
                    case 'focus_minutes_today': currentProgress = counts.focusMinutesToday; break;
                    case 'total_pomodoro_cycles': currentProgress = counts.totalCycles; break;
                    case 'total_focus_minutes': currentProgress = counts.totalFocusMinutes; break;
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
                    playNotification('bell'); // Toca um som de conquista (opcional)
                }
            }
        });

        // Se alguma meta foi atingida, salva as configurações e atualiza a UI
        if (settingChanged) {
            saveSettings();
            updateCustomGoalsUI(); // Atualiza a lista para mostrar as metas concluídas
        }
    } catch (error) {
        console.error("Error checking custom goals:", error);
    }
}

// --- Atualiza a UI da Lista de Metas ---
function updateCustomGoalsUI() {
    if (!customGoalsList) return;
    try {
        customGoalsList.innerHTML = ''; // Limpa a lista
        if (!Array.isArray(customGoals) || customGoals.length === 0) {
            customGoalsList.innerHTML = '<p class="info-text">Nenhuma meta personalizada definida ainda. Adicione uma abaixo!</p>';
            return;
        }

        // Calcula os totais novamente para exibir o progresso atual
        const counts = {
            cyclesToday: countItemsToday(logEntries, 'Trabalho'),
            focusMinutesToday: getTotalTimeToday(logEntries, ['Foco']),
            totalCycles: logEntries.filter(l => l.type === 'Trabalho').length,
            totalFocusMinutes: logEntries.filter(l => l.type === 'Foco').reduce((sum, l) => sum + l.duration, 0)
        };

        customGoals.forEach(goal => {
            let currentProgress = 0;
            let targetDesc = "";
            // Calcula progresso e descrição da meta
            switch (goal.type) {
                case 'pomodoro_cycles_today': currentProgress = counts.cyclesToday; targetDesc = `${goal.target} Ciclos Pomodoro Hoje`; break;
                case 'focus_minutes_today': currentProgress = counts.focusMinutesToday; targetDesc = `${goal.target} min Foco Hoje`; break;
                case 'total_pomodoro_cycles': currentProgress = counts.totalCycles; targetDesc = `${goal.target} Ciclos Pomodoro (Total)`; break;
                case 'total_focus_minutes': currentProgress = counts.totalFocusMinutes; targetDesc = `${goal.target} min Foco (Total)`; break;
                default: targetDesc="Tipo Desconhecido";
            }
            // Limita o progresso exibido ao alvo (não mostra 130/120, mas sim 120/120)
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

// --- Carrega Log do Local Storage ---
function loadLogFromLocalStorage() {
    const savedLog = localStorage.getItem('pomodoroLog_v3'); // Usa chave com versão
    logEntries = []; // Começa com array vazio
    if (savedLog) {
        try {
            const parsedLog = JSON.parse(savedLog);
            // Validação básica: é um array?
            if (Array.isArray(parsedLog)) {
                // Validação mais profunda (opcional): verificar se os itens têm as propriedades esperadas
                logEntries = parsedLog.filter(entry => entry && entry.timestamp && entry.type && typeof entry.duration === 'number');
                console.log(`Loaded ${logEntries.length} valid log entries.`);
                if (logEntries.length !== parsedLog.length) {
                     console.warn(`Ignored ${parsedLog.length - logEntries.length} invalid log entries during load.`);
                }
            } else {
                console.warn("Loaded log data is not an array. Resetting log.");
                localStorage.removeItem('pomodoroLog_v3');
            }
        } catch (e) {
            console.error("Error parsing saved log:", e);
            localStorage.removeItem('pomodoroLog_v3'); // Remove dado corrompido
        }
    } else {
        console.log("No saved log found (v3).");
    }
}

// --- Salva Log no Local Storage ---
function saveLogToLocalStorage() {
    try {
        // Garante que só salva se logEntries for um array
        if(Array.isArray(logEntries)){
            localStorage.setItem('pomodoroLog_v3', JSON.stringify(logEntries));
        } else {
             console.error("Attempted to save non-array logEntries. Saving aborted.");
             localStorage.removeItem('pomodoroLog_v3'); // Remove chave se o dado estiver corrompido
        }
    } catch (e) {
        console.error("Error saving log to localStorage:", e);
        // Tenta notificar o usuário sobre o problema
        showToast("Erro ao salvar o registro de atividades. Verifique o console.", "error", 5000);
         // Pode acontecer se o localStorage estiver cheio
        if (e.name === 'QuotaExceededError') {
            showToast("Erro: Armazenamento local cheio. Não foi possível salvar o registro.", "error", 10000);
            // Considerar oferecer ao usuário a opção de limpar logs antigos ou exportar
        }
    }
}

// --- Salva Configurações (inclui metas) no Local Storage ---
function saveSettings() {
    try {
        // Garante que temos valores válidos ou padrões
        const settings = {
            version: 3.1, // Versão da estrutura de settings
            timerMode: timerMode || 'pomodoro',
            customGoals: Array.isArray(customGoals) ? customGoals : [],
            sequence: Array.isArray(currentSequence) ? currentSequence : [{ work: 25, break: 5, reps: 4 }],
            longBreakInterval: parseInt(longBreakIntervalInput?.value || '4'),
            longBreakDuration: parseInt(longBreakDurationInput?.value || '15'),
            theme: currentTheme || 'light',
            sound: selectedSound || 'bell',
            resetFocus: resetFocusOnLog === true, // Garante booleano
        };
        localStorage.setItem('pomodoroSettings_v3', JSON.stringify(settings));
        console.log("Settings saved (v3.1).");
    } catch (e) {
        console.error("Error saving settings:", e);
        showToast("Erro ao salvar configurações.", "error");
    }
}

// --- Carrega Configurações do Local Storage ---
function loadSettings() {
    // Define padrões primeiro
    customGoals = [];
    currentSequence = [{ work: 25, break: 5, reps: 4 }]; // Padrão inicial
    timerMode = 'pomodoro';
    selectedSound = 'bell';
    resetFocusOnLog = false;
    // Valores padrão para os inputs (serão sobrescritos se houver settings salvos)
    if(longBreakIntervalInput) longBreakIntervalInput.value = 4;
    if(longBreakDurationInput) longBreakDurationInput.value = 15;

    const savedSettings = localStorage.getItem('pomodoroSettings_v3');

    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);

            // Verifica a versão (opcional, mas útil para migrações futuras)
            if(settings.version !== 3.1) {
                console.warn(`Loading settings from older version (${settings.version}). Applying defaults where needed.`);
            }

            // Carrega os valores, usando o operador OR (||) para fallback para padrões se algo for null/undefined
            timerMode = settings.timerMode || 'pomodoro';
            customGoals = Array.isArray(settings.customGoals) ? settings.customGoals : [];
            currentSequence = (Array.isArray(settings.sequence) && settings.sequence.length > 0) ? settings.sequence : [{ work: 25, break: 5, reps: 4 }];
            if (longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval ?? 4; // Usa ?? para aceitar 0
            if (longBreakDurationInput) longBreakDurationInput.value = settings.longBreakDuration || 15;
            // theme é carregado separadamente em loadTheme()
            selectedSound = settings.sound || 'bell';
            resetFocusOnLog = settings.resetFocus === true; // Garante booleano

            console.log("Settings loaded (v3.1). Mode:", timerMode);
        } catch (e) {
            console.error("Error parsing saved settings (v3.1):", e);
            localStorage.removeItem('pomodoroSettings_v3'); // Remove configurações inválidas
            // Recarrega os padrões definidos no início da função
            loadSettings(); // Chama a si mesma para garantir os padrões
        }
    } else {
        console.log("No saved settings found (v3). Using defaults.");
        // Os padrões já foram definidos no início da função
    }

    // Garante que a UI reflita as configurações carregadas (redundante se initializeAppUI for chamado depois, mas seguro)
    if(soundSelect) soundSelect.value = selectedSound;
    if(focusResetOnLogCheckbox) focusResetOnLogCheckbox.checked = resetFocusOnLog;
    updateSequenceUI(); // Atualiza a lista de sequência
}

// --- Define o Modo de Timer Inicial ---
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


// --- Reseta Todas as Configurações e Logs ---
function resetEverything() {
    if (confirm("ATENÇÃO!\n\nResetar TUDO?\n\nIsso apagará permanentemente:\n- Todos os registros de atividades\n- Todas as metas personalizadas\n- Todas as configurações de ciclo Pomodoro\n- Tema e som salvos\n\nEsta ação é IRREVERSÍVEL!\n\nDeseja continuar?")) {
        try {
            // Pausa o timer se estiver rodando
            pauseTimer();
            timerInterval = null;

            // Remove os dados do localStorage
            localStorage.removeItem('pomodoroLog_v3');
            localStorage.removeItem('pomodoroSettings_v3');
            console.log("Cleared localStorage keys: pomodoroLog_v3, pomodoroSettings_v3");

            // Reseta as variáveis de estado para os padrões
            logEntries = [];
            currentSequence = [{ work: 25, break: 5, reps: 4 }]; // Padrão
            customGoals = [];
            currentTheme = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'; // Padrão do sistema ou light
            selectedSound = 'bell';
            resetFocusOnLog = false;
            timerMode = 'pomodoro'; // Volta para Pomodoro como padrão

            // Aplica as mudanças na UI
            applyTheme();       // Aplica o tema padrão
            loadSettings();     // Recarrega as configurações (que agora serão as padrões)
            initializeAppUI();  // Reinicializa a UI com os padrões
            initializeTimer();  // Reinicializa o estado do timer
            updateAllUI();      // Garante que toda a UI reflita o estado resetado

            showToast("Aplicativo resetado para os padrões.", "success", 4000);
            console.log("Application reset to defaults (v3.1).");
        } catch (error) {
            console.error("Error during resetEverything:", error);
            showToast("Ocorreu um erro ao tentar resetar.", "error");
        }
    }
}

// --- Exporta Configurações e Logs para JSON ---
function exportData() {
    try {
        // Coleta os dados atuais
        const dataToExport = {
            version: 3.1, // Versão da estrutura de dados exportada
            exportedAt: new Date().toISOString(),
            settings: {
                timerMode: timerMode,
                customGoals: Array.isArray(customGoals) ? customGoals : [],
                sequence: Array.isArray(currentSequence) ? currentSequence : [],
                longBreakInterval: parseInt(longBreakIntervalInput?.value || '4'),
                longBreakDuration: parseInt(longBreakDurationInput?.value || '15'),
                theme: currentTheme,
                sound: selectedSound,
                resetFocus: resetFocusOnLog,
            },
            logs: Array.isArray(logEntries) ? logEntries : []
        };

        // Converte para string JSON formatada
        const dataStr = JSON.stringify(dataToExport, null, 2); // Indentação de 2 espaços

        // Cria um Blob (Binary Large Object)
        const blob = new Blob([dataStr], { type: "application/json" });

        // Cria uma URL temporária para o Blob
        const url = URL.createObjectURL(blob);

        // Cria um link de download invisível
        const link = document.createElement("a");
        link.style.display = 'none'; // Garante que não seja visível
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        link.setAttribute("download", `pomodoro_mourao_backup_${timestamp}.json`); // Nome do arquivo

        // Adiciona o link ao corpo, clica nele e remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libera a URL do Blob da memória
        URL.revokeObjectURL(url);

        showToast("Dados exportados com sucesso!", "success");
        console.log("Data exported successfully.");

    } catch (error) {
        console.error("Erro ao exportar dados:", error);
        showToast("Erro ao exportar dados. Verifique o console.", "error");
    }
}

// --- Importa Configurações e Logs de um Arquivo JSON ---
function importData(event) {
    const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

    // Verifica se um arquivo foi selecionado
    if (!file) {
        showToast("Nenhum arquivo selecionado.", "info");
        return;
    }

    // Verifica se o tipo do arquivo é JSON
    if (file.type !== "application/json") {
        showToast("Formato inválido. Selecione um arquivo .json.", "error");
        if (importFileInput) importFileInput.value = null; // Limpa o input
        return;
    }

    const reader = new FileReader(); // Cria um leitor de arquivo

    // Define o que fazer quando o arquivo for lido com sucesso
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result); // Tenta parsear o JSON

            // --- Validação da Estrutura Básica ---
            if (!importedData || typeof importedData !== 'object') throw new Error("Arquivo JSON vazio ou inválido.");
            if (!importedData.settings || typeof importedData.settings !== 'object') throw new Error("Estrutura de 'settings' ausente ou inválida.");
            if (!Array.isArray(importedData.logs)) throw new Error("Estrutura de 'logs' ausente ou não é um array.");
            if (!importedData.version) console.warn("Versão não especificada no arquivo importado.");
            else if (importedData.version !== 3.1) {
                 console.warn(`Importando dados da versão ${importedData.version}. Podem ocorrer incompatibilidades.`);
                 // Aqui você poderia adicionar lógica de migração se necessário
            }

            // --- Confirmação do Usuário ---
            if (!confirm("IMPORTAR DADOS?\n\nATENÇÃO: Isto substituirá TODAS as configurações e registros atuais pelos dados do arquivo selecionado.\n\nÉ recomendado EXPORTAR seus dados atuais ANTES de importar.\n\nDeseja continuar?")) {
                if (importFileInput) importFileInput.value = null; // Limpa o input se cancelar
                showToast("Importação cancelada.", "info");
                return;
            }

             // Pausa o timer antes de modificar tudo
             pauseTimer();
             timerInterval = null;

            // --- Aplicação dos Dados Importados ---
            const settings = importedData.settings;
            logEntries = Array.isArray(importedData.logs) ? importedData.logs : []; // Assume que logs são válidos se for array
            customGoals = Array.isArray(settings.customGoals) ? settings.customGoals : [];
            currentSequence = (Array.isArray(settings.sequence) && settings.sequence.length > 0) ? settings.sequence : [{ work: 25, break: 5, reps: 4 }];
            timerMode = settings.timerMode || 'pomodoro';
            if(longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval ?? 4;
            if(longBreakDurationInput) longBreakDurationInput.value = settings.longBreakDuration || 15;
            currentTheme = settings.theme || 'light';
            selectedSound = settings.sound || 'bell';
            resetFocusOnLog = settings.resetFocus === true;

            // --- Salva e Atualiza a UI ---
            saveLogToLocalStorage(); // Salva os novos logs
            saveSettings(); // Salva as novas configurações
            applyTheme(); // Aplica o tema importado
            loadSettings(); // Recarrega para garantir consistência (opcional, mas seguro)
            initializeAppUI(); // Reinicializa a UI com os dados importados
            initializeTimer(); // Reinicializa o timer com base nas novas configs
            updateAllUI(); // Atualiza toda a UI

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

    // Define o que fazer em caso de erro na leitura do arquivo
    reader.onerror = function () {
        console.error("FileReader error occurred.");
        showToast("Erro ao ler o arquivo.", "error");
        if (importFileInput) importFileInput.value = null; // Limpa o input
    };

    // Inicia a leitura do arquivo como texto
    reader.readAsText(file);
}

// --- Toca o Som de Notificação ---
function playNotification(soundKey = selectedSound) {
    // Não toca se a opção for 'none'
    if (soundKey === 'none' || !soundUrls[soundKey]) {
        console.log("Sound disabled ('none') or key invalid:", soundKey);
        return;
    }
    // Não toca se o usuário ainda não interagiu com a página
    if (!userInteracted) {
        console.warn("Audio play blocked: User has not interacted with the page yet.");
        // Pode mostrar um toast sutil aqui se quiser
        // showToast("Clique na página para habilitar sons.", "info", 2000);
        return;
    }

    const url = soundUrls[soundKey];
    if (!audioPlayer || !url) {
         console.error("Audio player element or sound URL not found for key:", soundKey);
         return;
    }

    // Define a URL e tenta tocar
    audioPlayer.src = url;
    audioPlayer.volume = 0.7; // Volume padrão (ajuste conforme necessário)
    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log("Sound played:", soundKey);
        }).catch(error => {
            console.warn("Sound play failed for key", soundKey, ":", error);
            // Erros comuns: NotAllowedError (interação necessária), NotSupportedError (formato inválido)
            if (error.name === 'NotAllowedError') {
                showToast("Navegador bloqueou o som. Interaja com a página.", "warning");
                userInteracted = false; // Força a necessidade de nova interação
            } else {
                showToast("Não foi possível tocar o som.", "warning");
            }
        });
    }
}


// --- Configura as Abas (Log/Stats) ---
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

// --- Handler para Trocar de Aba ---
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

// --- Funções Auxiliares para Cálculos de Estatísticas ---
function getTodayDateString() { return new Date().toLocaleDateString('pt-BR'); }
function getWeekStartDate() { const today = new Date(); const dayOfWeek = today.getDay(); const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); return new Date(today.setDate(diff)); }
function getDateString(date) { return date.toLocaleDateString('pt-BR'); }

// Conta itens de um tipo específico que ocorreram hoje
function countItemsToday(logs, itemType) {
    if (!Array.isArray(logs)) return 0;
    const todayStr = getTodayDateString();
    return logs.filter(l => l.type === itemType && l.date === todayStr).length;
}

// Soma o tempo total de tipos específicos que ocorreram hoje
function getTotalTimeToday(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const todayStr = getTodayDateString();
    return logs.filter(l => typesArray.includes(l.type) && l.date === todayStr)
               .reduce((sum, l) => sum + (l.duration || 0), 0);
}
// Soma o tempo total de tipos específicos que ocorreram na semana atual (Seg-Dom)
function getTotalTimeThisWeek(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const weekStart = getWeekStartDate();
    const weekStartTimestamp = weekStart.setHours(0, 0, 0, 0); // Zera hora para comparar só data
    const nowTimestamp = new Date().getTime();

    return logs.filter(l => {
        const logDate = new Date(l.timestamp); // Usa timestamp ISO para data precisa
        const logTimestamp = logDate.getTime();
        return typesArray.includes(l.type) && logTimestamp >= weekStartTimestamp && logTimestamp <= nowTimestamp;
    }).reduce((sum, l) => sum + (l.duration || 0), 0);
}
// Conta itens de um tipo específico que ocorreram na semana atual
function countItemsThisWeek(logs, itemType) {
    if (!Array.isArray(logs)) return 0;
    const weekStart = getWeekStartDate();
    const weekStartTimestamp = weekStart.setHours(0, 0, 0, 0);
    const nowTimestamp = new Date().getTime();

    return logs.filter(l => {
         const logDate = new Date(l.timestamp);
         const logTimestamp = logDate.getTime();
         return l.type === itemType && logTimestamp >= weekStartTimestamp && logTimestamp <= nowTimestamp;
     }).length;
}

// Calcula a duração média das sessões de Foco/Trabalho
function getAverageSessionTime(logs, typesArray) {
    if (!Array.isArray(logs)) return 0;
    const relevantLogs = logs.filter(l => typesArray.includes(l.type) && l.duration > 0);
    if (relevantLogs.length === 0) return 0;
    const totalDuration = relevantLogs.reduce((sum, l) => sum + l.duration, 0);
    return Math.round(totalDuration / relevantLogs.length);
}
// --- Funções de Atualização dos Gráficos ---

// Verifica se há dados válidos para um gráfico e mostra/esconde a mensagem "sem dados"
function checkChartData(chartKey, data) {
    const chartConfig = chartElements[chartKey];
    if (!chartConfig || !chartConfig.canvas || !chartConfig.noData) {
        // console.warn(`Chart config, canvas, or noData element missing for key: ${chartKey}`);
        return false; // Não pode verificar ou exibir
    }

    // Verifica se há labels e pelo menos um dataset com dados maiores que 0
    const hasData = data &&
                    Array.isArray(data.labels) && data.labels.length > 0 &&
                    Array.isArray(data.datasets) &&
                    data.datasets.some(ds => Array.isArray(ds.data) && ds.data.length > 0 && ds.data.some(d => d > 0));

    // Mostra/esconde canvas e mensagem
    chartConfig.canvas.style.display = hasData ? 'block' : 'none';
    chartConfig.noData.style.display = hasData ? 'none' : 'flex'; // Usa flex para centralizar

    // Destroi gráfico antigo se não houver dados para evitar exibir gráfico vazio
    if (!hasData && chartConfig.chart) {
        chartConfig.chart.destroy();
        chartConfig.chart = null;
        console.log(`Chart ${chartKey} destroyed due to no data.`);
    }

    return hasData;
}

// Agrega dados de log por uma chave (category, task, hour)
function aggregateData(logs, groupBy, typesToInclude = ['Trabalho', 'Foco']) {
    const aggregation = {};
    if (!Array.isArray(logs)) return [];

    logs.filter(log => log.duration > 0 && typesToInclude.includes(log.type))
        .forEach(log => {
            let key;
            if (groupBy === 'hour') {
                try {
                    // Extrai a hora do timestamp (formato HH)
                    key = new Date(log.timestamp).getHours();
                    key = String(key).padStart(2, '0') + ':00'; // Formata como HH:00
                } catch(e){
                    console.warn("Could not parse hour from timestamp:", log.timestamp, e);
                    key = "Erro Hora";
                }
            } else {
                key = log[groupBy] || `Sem ${groupBy}`; // Usa a propriedade diretamente (task, category)
            }
            aggregation[key] = (aggregation[key] || 0) + log.duration;
        });

    // Converte para array de [key, value] e ordena por valor (duração) descendente
    return Object.entries(aggregation).sort(([, durA], [, durB]) => durB - durA);
}

// Cria/Atualiza Gráfico de Categorias (Doughnut)
function createCategoryChart() {
    const chartKey = 'category';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const categoryData = aggregateData(logEntries, 'category'); // Foco/Trabalho por padrão
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: categoryData.map(([category]) => category),
            datasets: [{
                label: 'Minutos',
                data: categoryData.map(([, duration]) => duration),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#8BC34A', '#E91E63', '#00BCD4'],
                borderColor: body.classList.contains('theme-dark') ? '#2c2c2c' : '#ffffff',
                borderWidth: 2
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
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { color: textColor } },
                        tooltip: { bodyFont: { size: 12 }, titleFont: { size: 14 } }
                    }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

// Cria/Atualiza Gráfico de Tarefas (Barra Horizontal)
function createTaskChart() {
    const chartKey = 'task';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const taskDataFull = aggregateData(logEntries, 'task'); // Foco/Trabalho por padrão
        const topTasks = taskDataFull.slice(0, 5); // Pega as Top 5 tarefas
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: topTasks.map(([task]) => task.length > 25 ? task.substring(0, 22) + '...' : task), // Limita tamanho do label
            datasets: [{
                label: 'Minutos',
                data: topTasks.map(([, duration]) => duration),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        if (!checkChartData(chartKey, chartData)) return;

        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';

        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData;
            const scales = chartConfig.chart.options?.scales;
            if (scales?.x) scales.x.ticks.color = textColor; if(scales?.x?.title) scales.x.title.color = textColor;
            if (scales?.y) scales.y.ticks.color = textColor; if(scales?.y?.title) scales.y.title.color = textColor;
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    indexAxis: 'y', // Barras horizontais
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { beginAtZero: true, title: { display: true, text: 'Minutos', color: textColor }, ticks: { color: textColor } },
                        y: { ticks: { color: textColor } }
                    },
                    plugins: {
                        legend: { display: false }, // Sem legenda, o label do dataset é suficiente
                        tooltip: {
                            callbacks: {
                                // Mostra o nome completo da tarefa no tooltip
                                label: function (context) {
                                    const fullTaskName = taskDataFull[context.dataIndex]?.[0] || context.label;
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    label += context.parsed.x + ' min';
                                    return label;
                                },
                                afterLabel: function(context) {
                                     const fullTaskName = taskDataFull[context.dataIndex]?.[0] || context.label;
                                     return `Tarefa: ${fullTaskName}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

// Cria/Atualiza Gráfico de Atividade Diária (Linha - Ciclos e Foco)
function createDailyActivityChart() {
    const chartKey = 'dailyActivity';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const days = 7;
        const dailyData = {};
        const labels = [];
        // Prepara os últimos 7 dias no objeto dailyData
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().slice(0, 10); // YYYY-MM-DD
            const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); // DD/MM
            labels.push(label);
            dailyData[dateString] = { cycles: 0, focus: 0 };
        }

        // Agrega dados dos logs
        if (Array.isArray(logEntries)) {
            logEntries.forEach(log => {
                try {
                    const dateString = new Date(log.timestamp).toISOString().slice(0, 10);
                    if (dailyData[dateString]) {
                        if (log.type === 'Trabalho') {
                            dailyData[dateString].cycles++;
                        }
                        if (log.type === 'Foco') {
                            dailyData[dateString].focus += log.duration;
                        }
                    }
                } catch (e) { console.warn("Error processing log entry for daily chart:", log, e);}
            });
        }

        const sortedDates = Object.keys(dailyData).sort(); // Garante ordem cronológica
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: labels, // Usa os labels DD/MM gerados
            datasets: [
                {
                    label: 'Ciclos Pomodoro', data: sortedDates.map(date => dailyData[date].cycles),
                    borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1, yAxisID: 'yCycles'
                },
                {
                    label: 'Minutos Foco', data: sortedDates.map(date => dailyData[date].focus),
                    borderColor: '#F1C40F', backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    tension: 0.1, yAxisID: 'yFocus'
                }
            ]
        };

        if (!checkChartData(chartKey, chartData)) return;

        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';

        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData;
             const opts = chartConfig.chart.options;
             if(opts?.plugins?.legend) opts.plugins.legend.labels.color = textColor;
             if(opts?.scales?.x) opts.scales.x.ticks.color = textColor;
             if(opts?.scales?.yCycles) { opts.scales.yCycles.ticks.color = textColor; if(opts.scales.yCycles.title) opts.scales.yCycles.title.color = textColor; }
             if(opts?.scales?.yFocus) { opts.scales.yFocus.ticks.color = textColor; if(opts.scales.yFocus.title) opts.scales.yFocus.title.color = textColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { ticks: { color: textColor } },
                        yCycles: { type: 'linear', display: true, position: 'left', beginAtZero: true, title: { display: true, text: 'Ciclos', color: textColor }, ticks: { color: textColor, stepSize: 1 } }, // Eixo esquerdo para Ciclos
                        yFocus: { type: 'linear', display: true, position: 'right', beginAtZero: true, title: { display: true, text: 'Minutos Foco', color: textColor }, ticks: { color: textColor }, grid: { drawOnChartArea: false } } // Eixo direito para Foco
                    },
                    plugins: { legend: { labels: { color: textColor } } }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

// Cria/Atualiza Gráfico Foco/Trabalho vs Descanso (Barra Empilhada)
function createFocusBreakChart() {
    const chartKey = 'focusBreak';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        const days = 7;
        const dailyData = {};
        const labels = [];
         // Prepara os últimos 7 dias
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            labels.push(label);
            dailyData[dateString] = { workFocus: 0, breaks: 0 };
        }

        // Agrega dados
        if (Array.isArray(logEntries)) {
             logEntries.forEach(log => {
                 try{
                    const dateString = new Date(log.timestamp).toISOString().slice(0, 10);
                    if (dailyData[dateString]) {
                        if (['Trabalho', 'Foco'].includes(log.type)) {
                            dailyData[dateString].workFocus += log.duration;
                        } else if (log.type.includes('Descanso') || log.type.includes('Break')) { // Pega 'Descanso Curto', 'Longo', 'Livre'
                            dailyData[dateString].breaks += log.duration;
                        }
                    }
                 } catch(e) { console.warn("Error processing log entry for focus/break chart:", log, e);}
            });
        }

        const sortedDates = Object.keys(dailyData).sort();
        const chartConfig = chartElements[chartKey];
        const chartData = {
            labels: labels,
            datasets: [
                { label: 'Foco/Trabalho (min)', data: sortedDates.map(date => dailyData[date].workFocus), backgroundColor: '#4BC0C0' }, // Verde-água
                { label: 'Descanso (min)', data: sortedDates.map(date => dailyData[date].breaks), backgroundColor: '#FFB74D' } // Laranja claro
            ]
        };

        if (!checkChartData(chartKey, chartData)) return;

        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';

        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData;
            const opts = chartConfig.chart.options;
            if(opts?.plugins?.legend) opts.plugins.legend.labels.color = textColor;
            if(opts?.scales?.x) opts.scales.x.ticks.color = textColor;
            if(opts?.scales?.y) { opts.scales.y.ticks.color = textColor; if(opts.scales.y.title) opts.scales.y.title.color = textColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, ticks: { color: textColor } }, // Empilha no eixo X
                        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Minutos Totais', color: textColor }, ticks: { color: textColor } } // Empilha no eixo Y
                    },
                    plugins: { legend: { position: 'top', labels: { color: textColor } } }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}

// **NOVO GRÁFICO**: Atividade por Hora do Dia (Barra)
function createTimeOfDayChart() {
    const chartKey = 'timeOfDay';
    if (!chartElements[chartKey]?.ctx) return;
    try {
        // Agrega dados por hora (00:00 a 23:00)
        const hourlyDataEntries = aggregateData(logEntries, 'hour'); // Usa a função auxiliar
        const chartConfig = chartElements[chartKey];

        // Prepara labels (00:00 a 23:00) e dados correspondentes
        const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
        const data = Array(24).fill(0);
        hourlyDataEntries.forEach(([hourLabel, duration]) => {
            const hourIndex = parseInt(hourLabel.split(':')[0]); // Pega o índice da hora (0-23)
            if (!isNaN(hourIndex) && hourIndex >= 0 && hourIndex < 24) {
                data[hourIndex] = duration;
            }
        });

        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Minutos Foco/Trabalho',
                data: data,
                backgroundColor: 'rgba(153, 102, 255, 0.7)', // Roxo
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        };

        if (!checkChartData(chartKey, chartData)) return; // Verifica se há dados

        const textColor = body.classList.contains('theme-dark') ? '#f0f0f0' : '#333';

        if (chartConfig.chart) { // Atualiza
            chartConfig.chart.data = chartData;
            const opts = chartConfig.chart.options;
            if(opts?.scales?.x) opts.scales.x.ticks.color = textColor;
            if(opts?.scales?.y) { opts.scales.y.ticks.color = textColor; if(opts.scales.y.title) opts.scales.y.title.color = textColor; }
            chartConfig.chart.update();
        } else { // Cria
            chartConfig.chart = new Chart(chartConfig.ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'Hora do Dia', color: textColor }, ticks: { color: textColor, maxRotation: 90, minRotation: 45 } }, // Rotaciona labels se necessário
                        y: { beginAtZero: true, title: { display: true, text: 'Minutos Acumulados', color: textColor }, ticks: { color: textColor } }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            });
        }
    } catch (error) { console.error(`Error creating ${chartKey} chart:`, error); }
}


// --- Atualiza Todos os Gráficos ---
function updateCharts() {
    console.log("Updating charts...");
    try {
        createCategoryChart();
        createTaskChart();
        createDailyActivityChart();
        createFocusBreakChart();
        createTimeOfDayChart(); // Chama a nova função
    } catch (e) {
        console.error("Error during updateCharts:", e);
    }
}

// --- Atualiza Estatísticas Textuais ---
function updateTextStats() {
    console.log("Updating text stats...");
    try {
        const focusTypes = ['Foco']; // Apenas modo Foco conta aqui
        const workTypes = ['Trabalho']; // Apenas Pomodoro conta aqui
        const focusWorkTypes = ['Foco', 'Trabalho']; // Ambos

        const focusToday = getTotalTimeToday(logEntries, focusTypes);
        const workToday = getTotalTimeToday(logEntries, workTypes);
        const focusWorkToday = focusToday + workToday;

        const focusWeek = getTotalTimeThisWeek(logEntries, focusTypes);
        const workWeek = getTotalTimeThisWeek(logEntries, workTypes);
        const focusWorkWeek = focusWeek + workWeek;

        const cyclesToday = countItemsToday(logEntries, 'Trabalho');
        const cyclesWeek = countItemsThisWeek(logEntries, 'Trabalho');

        const avgSession = getAverageSessionTime(logEntries, focusWorkTypes);

        const totalFocusAll = logEntries.filter(l => focusTypes.includes(l.type)).reduce((sum, l) => sum + l.duration, 0);
        const totalWorkAll = logEntries.filter(l => workTypes.includes(l.type)).reduce((sum, l) => sum + l.duration, 0);
        const totalFocusWorkAll = totalFocusAll + totalWorkAll;
        const totalCyclesAll = logEntries.filter(l => l.type === 'Trabalho').length;

        // Atualiza os elementos HTML
        if(textStatFocusToday) textStatFocusToday.textContent = focusWorkToday;
        if(textStatFocusWeek) textStatFocusWeek.textContent = focusWorkWeek;
        if(textStatCyclesToday) textStatCyclesToday.textContent = cyclesToday;
        if(textStatCyclesWeek) textStatCyclesWeek.textContent = cyclesWeek;
        if(textStatAvgSession) textStatAvgSession.textContent = avgSession;
        if(textStatTotalFocusAll) textStatTotalFocusAll.textContent = totalFocusWorkAll;
        if(textStatTotalCyclesAll) textStatTotalCyclesAll.textContent = totalCyclesAll;

    } catch (error) {
        console.error("Error updating text stats:", error);
    }
}


// --- Atualiza Mini Dashboard no Header ---
function updateMiniDashboard() {
    try {
        if (statCyclesToday) statCyclesToday.textContent = countItemsToday(logEntries, 'Trabalho');
        if (statFocusToday) statFocusToday.textContent = getTotalTimeToday(logEntries, ['Foco', 'Trabalho']); // Soma Foco e Trabalho para 'Foco' no dashboard
        if (statBreakToday) statBreakToday.textContent = getTotalTimeToday(logEntries, ['Descanso Curto', 'Descanso Longo', 'Descanso Livre']);
    } catch (error) { console.error("Error updating mini dashboard:", error); }
}

// --- Popula Sugestões de Categoria ---
function populateCategorySuggestions() {
    try {
        if (!categorySuggestions || !Array.isArray(logEntries)) return;
        // Pega categorias únicas dos logs, filtra vazias e "Sem categoria"
        const uniqueCategories = [...new Set(logEntries.map(entry => entry.category?.trim()).filter(cat => cat && cat !== "Sem categoria"))];
        // Define algumas opções padrão
        const defaultOptions = ["Trabalho", "Estudo", "Projeto Pessoal", "Leitura", "Exercício"];
        // Combina padrões e únicas, remove duplicatas e ordena
        const allSuggestions = [...new Set([...defaultOptions, ...uniqueCategories])].sort();

        // Limpa e popula o datalist
        categorySuggestions.innerHTML = '';
        allSuggestions.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            categorySuggestions.appendChild(option);
        });
    } catch (e) { console.error("Error populating category suggestions:", e); }
}

// --- Funções de Tema ---
function toggleTheme() {
     try {
         currentTheme = currentTheme === 'light' ? 'dark' : 'light';
         applyTheme();
         saveSettings(); // Salva o novo tema
         updateCharts(); // Recria/atualiza gráficos com as cores do novo tema
     } catch (e) { console.error("Error toggling theme:", e); }
}

function applyTheme() {
    if (!body || !themeToggleButton) return;
    try {
        body.className = `theme-${currentTheme}`; // Aplica a classe principal
        // Atualiza ícone e título do botão
        themeToggleButton.innerHTML = currentTheme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        themeToggleButton.title = `Mudar para Tema ${currentTheme === 'light' ? 'Escuro' : 'Claro'}`;
        console.log("Theme applied:", currentTheme);
    } catch (e) { console.error("Error applying theme:", e); }
}

function loadTheme() {
    const savedSettings = localStorage.getItem('pomodoroSettings_v3');
    let loadedTheme = null;
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            loadedTheme = settings.theme;
        } catch (e) { console.error("Error parsing theme from settings:", e); }
    }
    // Define o tema: o salvo, ou o preferido do sistema, ou 'light' como fallback
    currentTheme = loadedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light');
    applyTheme(); // Aplica o tema carregado/definido
}


// --- Função para Baixar Log como CSV --- CORRIGIDO ---
function downloadLog() {
    if (!Array.isArray(logEntries) || logEntries.length === 0) {
        showToast("Não há registros para baixar.", "info");
        return;
    }

    try {
        // Cabeçalhos do CSV
        const headers = ["Tarefa", "Categoria", "Notas", "Tipo/Modo", "Duracao (min)", "Data", "Hora", "Timestamp"];
        // Função para escapar vírgulas e aspas dentro dos campos
        const escapeCSV = (field) => {
            const str = String(field ?? ''); // Converte para string, tratando null/undefined
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                // Envolve com aspas duplas e escapa aspas duplas internas com outra aspa dupla
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Mapeia cada entrada do log para uma linha CSV
        const csvRows = logEntries.map(entry => [
            escapeCSV(entry.task),
            escapeCSV(entry.category),
            escapeCSV(entry.notes),
            escapeCSV(entry.type),
            escapeCSV(entry.duration),
            escapeCSV(entry.date),
            escapeCSV(entry.time),
            escapeCSV(entry.timestamp) // Inclui timestamp ISO
        ].join(',')); // Junta as colunas com vírgula

        // Junta cabeçalhos e linhas, separando por nova linha
        const csvString = [headers.join(','), ...csvRows].join('\n');

        // Cria o Blob com o tipo CSV e codificação UTF-8 com BOM (Byte Order Mark) para compatibilidade Excel
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });

        // Cria a URL e o link para download (mesmo método do exportData)
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = 'none';
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute("download", `pomodoro_log_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Registro baixado como CSV!", "success");
        console.log("Log downloaded as CSV.");

    } catch (error) {
        console.error("Erro ao gerar ou baixar CSV:", error);
        showToast("Erro ao baixar CSV. Verifique o console.", "error");
    }
}


// --- Configuração dos Event Listeners ---
function setupEventListeners() {
    console.log("--- Setting up event listeners ---");
    try {
        // Listener para interação inicial (necessário para áudio)
        document.body.addEventListener('click', () => { if (!userInteracted) userInteracted = true; }, { once: true }); // Roda apenas uma vez

        // Modo Timer
        if(modeRadios) modeRadios.forEach(radio => radio.addEventListener('change', (e) => {
            const newMode = e.target.value;
            if(newMode !== timerMode) {
                timerMode = newMode;
                resetTimer(); // Reseta ao mudar de modo
                updateModeUI();
                saveSettings(); // Salva a preferência de modo
                 showToast(`Modo alterado para ${timerMode === 'pomodoro' ? 'Pomodoro' : 'Foco/Descanso Livre'}.`, "info");
            }
        })); else console.warn("Listener Skipped: Mode radios");

        // Controles do Timer
        if(startPauseButton) startPauseButton.addEventListener('click', toggleStartPause); else console.warn("Listener Skipped: Start/Pause button");
        if(resetButton) resetButton.addEventListener('click', resetTimer); else console.warn("Listener Skipped: Reset button");

        // Controles Modo Focus
        if(focusLogButton) focusLogButton.addEventListener('click', () => {
             logCycle(null, Math.max(0, Math.floor(timeLeft / 60))); // Loga o tempo atual
        }); else console.warn("Listener Skipped: Focus Log button");
        if(focusSwitchButton) focusSwitchButton.addEventListener('click', switchFocusBreak); else console.warn("Listener Skipped: Focus Switch button");
        if(focusResetOnLogCheckbox) focusResetOnLogCheckbox.addEventListener('change', (e) => { resetFocusOnLog = e.target.checked; saveSettings(); }); else console.warn("Listener Skipped: Focus Reset checkbox");

        // Controles de Log
        if(downloadLogButton) downloadLogButton.addEventListener('click', downloadLog); else console.warn("Listener Skipped: Download Log button"); // CORRIGIDO
        if(clearLogButton) clearLogButton.addEventListener('click', clearLog); else console.warn("Listener Skipped: Clear Log button");
        if(logTableBody) logTableBody.addEventListener('click', (event) => { // Event delegation para botões de deletar
            try {
                const deleteButton = event.target.closest('.delete-log-btn');
                if (deleteButton) {
                    const timestamp = deleteButton.dataset.timestamp;
                    if (timestamp) { // Não precisa confirmar aqui, a função deleteLogEntry pode fazer isso
                        deleteLogEntry(timestamp);
                    }
                }
            } catch(e) { console.error("Error in log delete listener:", e); }
        }); else console.warn("Listener Skipped: Log table body");

        // Controles Gerais / Configurações
        if(resetAllButton) resetAllButton.addEventListener('click', resetEverything); else console.warn("Listener Skipped: Reset All button");
        if(themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme); else console.warn("Listener Skipped: Theme Toggle button");
        if(soundSelect) soundSelect.addEventListener('change', (e) => { selectedSound = e.target.value; saveSettings(); }); else console.warn("Listener Skipped: Sound select");
        if(playSoundTestButton) playSoundTestButton.addEventListener('click', () => playNotification(soundSelect?.value)); else console.warn("Listener Skipped: Play Sound button");
        if(exportDataButton) exportDataButton.addEventListener('click', exportData); else console.warn("Listener Skipped: Export button");
        if(importFileInput) importFileInput.addEventListener('change', importData); else console.warn("Listener Skipped: Import file input");
        // O importDataButton é a label, o listener está no input acima

        // Configurações Pomodoro
        if(addSequenceBtn) addSequenceBtn.addEventListener('click', handleAddSequence); else console.warn("Listener Skipped: Add Sequence button");
        if(pomodoroPresetsDiv) pomodoroPresetsDiv.addEventListener('click', applyPomodoroPreset); else console.warn("Listener Skipped: Pomodoro Presets div");
        // Listeners para inputs da sequência são adicionados dinamicamente em updateSequenceUI
        if(longBreakIntervalInput) longBreakIntervalInput.addEventListener('change', saveSettings); else console.warn("Listener Skipped: Long Break Interval input");
        if(longBreakDurationInput) longBreakDurationInput.addEventListener('change', saveSettings); else console.warn("Listener Skipped: Long Break Duration input");

        // Metas Personalizadas
        if(addGoalButton) addGoalButton.addEventListener('click', addCustomGoal); else console.warn("Listener Skipped: Add Goal button");
        // Listener para remover metas é adicionado dinamicamente em updateCustomGoalsUI

        // Abas
        if(tabButtons) setupTabs(); else console.warn("Setup Skipped: Tab buttons");

        console.log("--- Event listeners setup finished ---");
    } catch (error) {
        console.error("FATAL ERROR during setupEventListeners:", error);
        showToast("Erro ao configurar interações. Verifique o console.", "error", 10000);
    }
}

// --- Inicializa a Aplicação quando o DOM estiver Pronto ---
document.addEventListener('DOMContentLoaded', initializeApp);