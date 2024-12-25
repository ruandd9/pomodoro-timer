const { ipcRenderer } = require('electron');

let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isRunning = false;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const minimizeButton = document.getElementById('minimize-button');
const closeButton = document.getElementById('close-button');
const modeButtons = document.querySelectorAll('.mode-button');
const progressRing = document.querySelector('.progress-ring-circle');
const testNotificationButton = document.getElementById('test-notification');

// Set up progress ring
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100 * circumference);
    progressRing.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    const totalTime = parseInt(document.querySelector('.mode-button.active').dataset.time) * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    setProgress(progress);
}

function showNotification(title, body) {
    new Notification(title, {
        body: body,
        icon: 'icon.png'
    });
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startButton.textContent = 'Pausar';
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startButton.textContent = 'Iniciar';
                showNotification('Pomodoro Timer', 'Tempo finalizado! Hora de uma pausa.');
            }
        }, 1000);
    } else {
        clearInterval(timerId);
        isRunning = false;
        startButton.textContent = 'Iniciar';
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    startButton.textContent = 'Iniciar';
    timeLeft = parseInt(document.querySelector('.mode-button.active').dataset.time) * 60;
    updateDisplay();
}

// Event Listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);

minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        timeLeft = parseInt(button.dataset.time) * 60;
        resetTimer();
    });
});

// Teste de notificação
testNotificationButton.addEventListener('click', () => {
    showNotification('Teste de Notificação', 'Esta é uma notificação de teste do Pomodoro Timer! 🎉');
});

// Handle IPC messages
ipcRenderer.on('pause-timer', () => {
    if (isRunning) {
        startTimer();
    }
});

ipcRenderer.on('reset-timer', resetTimer);

ipcRenderer.on('show-test-notification', () => {
    showNotification('Teste de Notificação', 'Esta é uma notificação de teste do Pomodoro Timer! 🎉');
});

// Initial display update
updateDisplay();
