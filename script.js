let chatContent = '';
let senders = new Set();
let loopMessages = [];
let loopSpeed = 2000;  // Impostazione predefinita a 2 secondi
let loopTimeout;

document.getElementById('chatFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            chatContent = e.target.result;
            extractSenders(chatContent);
        };
        reader.readAsText(file);
    }
});

function extractSenders(chatText) {
    const chatLines = chatText.split('\n');
    senders.clear();

    chatLines.forEach(line => {
        const senderMatch = line.match(/\] (.*?):/);
        if (senderMatch) {
            senders.add(senderMatch[1].trim());
        }
    });

    const senderSelect = document.getElementById('senderFilter');
    senderSelect.innerHTML = '<option value="">Tutti i mittenti</option>';
    senders.forEach(sender => {
        const option = document.createElement('option');
        option.value = sender;
        option.textContent = sender;
        senderSelect.appendChild(option);
    });
}

function filterMessages() {
    const searchKeywords = document.getElementById('searchKeyword').value.toLowerCase().split(',').map(keyword => keyword.trim());
    const senderFilter = document.getElementById('senderFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;

    const chatLines = chatContent.split('\n');
    loopMessages = [];

    chatLines.forEach(line => {
        const dateMatch = line.match(/\[(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        const timeMatch = line.match(/, (\d{1,2}:\d{2}:\d{2})\]/);
        const senderMatch = line.match(/\] (.*?):/);
        const messageContent = line.split(':').slice(2).join(':').trim().toLowerCase();

        const containsKeyword = searchKeywords.some(keyword => messageContent.includes(keyword));

        if (containsKeyword) {
            let matchesFilters = true;

            if (senderFilter && senderMatch && senderMatch[1] !== senderFilter) {
                matchesFilters = false;
            }

            if (dateFilter && dateMatch && dateMatch[1] !== dateFilter.split('-').reverse().join('/')) {
                matchesFilters = false;
            }

            if (timeFilter && timeMatch && timeMatch[1].substring(0, 5) !== timeFilter) {
                matchesFilters = false;
            }

            if (matchesFilters) {
                loopMessages.push({
                    date: dateMatch ? dateMatch[1] : '',
                    time: timeMatch ? timeMatch[1] : '',
                    sender: senderMatch ? senderMatch[1].trim() : '',
                    message: messageContent
                });
            }
        }
    });

    if (loopMessages.length === 0) {
        loopMessages.push({
            date: '',
            time: '',
            sender: '',
            message: 'Nessun messaggio da mostrare in loop.'
        });
    }

    // Avvia il loop dei messaggi filtrati
    startMessageLoop();
}

function startMessageLoop() {
    const messageElement = document.getElementById('message');
    const timeElement = document.querySelector('.time');
    let index = 0;

    if (loopMessages.length === 0) {
        messageElement.textContent = 'Nessun messaggio da mostrare in loop.';
        return;
    }

    function showNextMessage() {
        const { date, time, sender, message } = loopMessages[index];

        // Format the message display
        const formattedMessage = `${sender}: ${message}`;
        const formattedTime = `${date} ${time}`;

        // Set message and time
        messageElement.textContent = formattedMessage;
        timeElement.textContent = formattedTime;

        index = (index + 1) % loopMessages.length;
        loopTimeout = setTimeout(showNextMessage, loopSpeed);
    }

    showNextMessage();
}

function updateSpeedDisplay() {
    const speedSlider = document.getElementById('speedSlider');
    const speedDisplay = document.getElementById('speedDisplay');
    loopSpeed = speedSlider.value * 1000;  // Converti secondi in millisecondi
    speedDisplay.textContent = speedSlider.value;

    // Riavvia il loop con la nuova velocità
    clearTimeout(loopTimeout);
    startMessageLoop();
}
