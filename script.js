let chatContent = "";
let senders = new Set();
let loopMessages = [];
let loopSpeed = 2000; // Default speed in milliseconds
let loopTimeout;

document
  .getElementById("chatFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        chatContent = e.target.result;
        extractSenders(chatContent);
      };
      reader.readAsText(file);
    }
  });

function extractSenders(chatText) {
  const chatLines = chatText.split("\n");
  senders.clear();

  chatLines.forEach((line) => {
    const senderMatch = line.match(/\] (.*?):/);
    if (senderMatch) {
      senders.add(senderMatch[1].trim());
    }
  });

  const senderSelect = document.getElementById("senderFilter");
  senderSelect.innerHTML = '<option value="">Tutti i mittenti</option>';
  senders.forEach((sender) => {
    const option = document.createElement("option");
    option.value = sender;
    option.textContent = sender;
    senderSelect.appendChild(option);
  });
}

function filterMessages() {
  const searchKeywords = document
    .getElementById("searchKeyword")
    .value.toLowerCase()
    .split(",")
    .map((keyword) => keyword.trim());
  const senderFilter = document.getElementById("senderFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;
  const timeFilter = document.getElementById("timeFilter").value;

  const chatLines = chatContent.split("\n");
  loopMessages = [];

  chatLines.forEach((line) => {
    const dateMatch = line.match(/\[(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const timeMatch = line.match(/, (\d{1,2}:\d{2}:\d{2})\]/);
    const senderMatch = line.match(/\] (.*?):/);
/*     const messageContent = line
      .split(":")
      .slice(2)
      .join(":")
      .trim()
      .toLowerCase(); */

    const messageArray = line.split(":");

    const messageContent = messageArray.slice(3).join(":").trim();

    console.log(messageContent);

    const containsKeyword = searchKeywords.some((keyword) =>
      messageContent.includes(keyword)
    );

    if (containsKeyword) {
      let matchesFilters = true;

      if (senderFilter && senderMatch && senderMatch[1] !== senderFilter) {
        matchesFilters = false;
      }

      if (
        dateFilter &&
        dateMatch &&
        dateMatch[1] !== dateFilter.split("-").reverse().join("/")
      ) {
        matchesFilters = false;
      }

      if (
        timeFilter &&
        timeMatch &&
        timeMatch[1].substring(0, 5) !== timeFilter
      ) {
        matchesFilters = false;
      }

      if (matchesFilters) {
        loopMessages.push({
          date: dateMatch ? dateMatch[1] : "",
          time: timeMatch ? timeMatch[1] : "",
          sender: senderMatch ? senderMatch[1].trim() : "",
          message: messageContent,
        });
      }
    }
  });

  if (loopMessages.length === 0) {
    loopMessages.push({
      date: "",
      time: "",
      sender: "",
      message: "Nessun messaggio da mostrare in loop.",
    });
  }

  // Avvia il loop dei messaggi filtrati
  startMessageLoop();
}

function startMessageLoop() {
  const messageLoop = document.getElementById("messageLoop");
  let index = 0;

  if (loopMessages.length === 0) {
    messageLoop.innerHTML =
      '<div class="message received">Nessun messaggio da mostrare in loop.</div>';
    return;
  }

  function showNextMessage() {
    messageLoop.innerHTML = ""; // Clear previous messages

    const { date, time, sender, message } = loopMessages[index];

    // Create and format the message bubble
    const messageBubble = document.createElement("div");
    messageBubble.className = "message received";
    messageBubble.innerHTML = `
            <div class="bubble">
                <p class="chat-message-sender">${sender}</p>
                <br>
                <p>${message}</p>
                <span class="metadata">${date} ${time}</span>
            </div>
        `;
    messageLoop.appendChild(messageBubble);

    index = (index + 1) % loopMessages.length;
    loopTimeout = setTimeout(showNextMessage, loopSpeed);
  }

  showNextMessage();
}

function updateSpeedDisplay() {
  const speedSlider = document.getElementById("speedSlider");
  const speedDisplay = document.getElementById("speedDisplay");
  loopSpeed = speedSlider.value * 1000; // Convert seconds to milliseconds
  speedDisplay.textContent = speedSlider.value;

  // Riavvia il loop con la nuova velocità
  clearTimeout(loopTimeout);
  startMessageLoop();
}
