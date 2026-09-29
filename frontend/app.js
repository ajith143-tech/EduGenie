// EduGenie V2 - AI Learning Assistant

const API_URL = "https://edugenie-1-g40s.onrender.com/ask";

let robotMessageIndex = 0;

const robotMessages = [
    "💡 Need help?",
    "📚 Let's learn!",
    "✨ You've got this!",
    "🚀 Keep going!",
    "🧠 Let's understand it!",
    "🎯 One step at a time!"
];


function setQuestion(text) {

    const input = document.getElementById("question");

    if (!input) return;

    input.value = text;
    input.focus();
}


function setRobotMessage(message) {

    const robotMessage =
        document.getElementById("robotMessage");

    const robot =
        document.getElementById("robotRoamer");

    if (robotMessage) {
        robotMessage.innerText = message;
    }

    if (robot) {

        if (message.includes("Thinking")) {
            robot.classList.add("thinking-mode");
        } else {
            robot.classList.remove("thinking-mode");
        }

    }
}

async function askQuestion() {

    const input =
        document.getElementById("question");

    const responseBox =
        document.getElementById("response");

    if (!input || !responseBox) return;

    const question =
        input.value.trim();

    if (!question) {
        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️ <strong>Please enter a question first.</strong>
            </div>
        `;
        return;
    }

    setRobotMessage("🤔 Thinking...");

    responseBox.innerHTML = `
        <div class="thinking">
            ✨ EduGenie is thinking
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
        </div>
    `;

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        });

        if (!response.ok) {
            throw new Error(
                "Server returned error: " +
                response.status
            );
        }

        const data =
            await response.json();

        const answer =
            data.answer ||
            "Sorry, I couldn't generate an answer.";

        // Create chat only after Gemini succeeds
        if (!activeChatId) {
            createNewChat();
        }

        const chat =
            eduGenieChats.find(
                item => item.id === activeChatId
            );

        if (chat) {

            chat.messages.push({
                question: question,
                answer: answer,
                time: new Date().toLocaleString()
            });

            if (chat.title === "New Chat") {
                chat.title =
                    question.length > 35
                        ? question.substring(0, 35) + "..."
                        : question;
            }

            saveChats();
            renderChatHistory();
        }

        setRobotMessage("🎉 Here you go!");

        responseBox.innerHTML = `
            <div class="ai-answer">

                <div class="answer-title">
                    🤖 EduGenie
                </div>

                <div class="answer-content">
                    ${formatAnswer(answer)}
                </div>

                <button
                    class="copy-btn"
                    onclick="copyAnswer()"
                >
                    📋 Copy Answer
                </button>

            </div>
        `;

        input.value = "";
        input.focus();

    } catch (error) {

        console.error(
            "EduGenie Error:",
            error
        );

        setRobotMessage(
            "💙 Let's try again!"
        );

        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️ <strong>Connection Error</strong>
                <br><br>
                ${escapeHtml(error.message)}
                <br><br>
                Please try again.
            </div>
        `;
    }
}


function formatAnswer(text) {

    if (!text) {
        return "No answer received.";
    }

    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

}


function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


async function copyAnswer() {

    const answer =
        document.querySelector(".answer-content");


    if (!answer) return;


    try {

        await navigator.clipboard.writeText(
            answer.innerText
        );


        const button =
            document.querySelector(".copy-btn");


        if (button) {

            button.innerText = "✅ Copied!";


            setTimeout(() => {

                button.innerText =
                    "📋 Copy Answer";

            }, 2000);

        }


    } catch (error) {

        alert("Unable to copy the answer.");

    }

}


// Enter key support
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById("question");


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        askQuestion();

                    }

                }
            );

        }

    }
);


// Floating robot messages
function changeRobotMessage() {

    const robotMessage =
        document.getElementById("robotMessage");


    if (!robotMessage) return;


    robotMessage.style.opacity = "0";


    setTimeout(() => {

        robotMessageIndex =
            (robotMessageIndex + 1) %
            robotMessages.length;


        robotMessage.innerText =
            robotMessages[robotMessageIndex];


        robotMessage.style.opacity = "1";

    }, 400);

}


setInterval(
    changeRobotMessage,
    3500
);
// ---------- VOICE INPUT ----------

let recognition;
let isListening = false;

function startVoiceInput() {

    const input = document.getElementById("question");
    const voiceBtn = document.getElementById("voiceBtn");

    if (!input || !voiceBtn) return;


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported in this browser."
        );

        return;
    }


    if (isListening) {

        if (recognition) {
            recognition.stop();
        }

        return;
    }


    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = function () {

        isListening = true;

        voiceBtn.innerText = "🔴";

        voiceBtn.classList.add("voice-listening");

        setRobotMessage("🎧 Listening...");

    };


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        input.value = transcript;

        input.focus();

    };


    recognition.onerror = function (event) {

        console.error(
            "Voice recognition error:",
            event.error
        );

        setRobotMessage("💙 Try speaking again!");

    };


    recognition.onend = function () {

        isListening = false;

        voiceBtn.innerText = "🎤";

        voiceBtn.classList.remove(
            "voice-listening"
        );

        setRobotMessage("💡 Need help?");

    };


    recognition.start();

}
// ---------- CHAT HISTORY SYSTEM ----------

let eduGenieChats =
    JSON.parse(
        localStorage.getItem("eduGenieChats")
    ) || [];

let activeChatId = null;


// Create a new chat
function createNewChat() {

    const chat = {
        id: Date.now(),
        title: "New Chat",
        messages: [],
        createdAt: new Date().toLocaleString()
    };

    eduGenieChats.unshift(chat);

    activeChatId = chat.id;

    saveChats();

    renderChatHistory();

    const responseBox =
        document.getElementById("response");

    if (responseBox) {
        responseBox.innerHTML = `
            <div class="thinking">
                💬 New chat started.
            </div>
        `;
    }

    const input =
        document.getElementById("question");

    if (input) {
        input.value = "";
        input.focus();
    }

    setRobotMessage("💬 New chat!");
}


// Save chats
function saveChats() {

    localStorage.setItem(
        "eduGenieChats",
        JSON.stringify(eduGenieChats)
    );
}


// Render recent chats
function renderChatHistory() {

    const list =
        document.getElementById(
            "chatHistoryList"
        );

    if (!list) return;

    if (eduGenieChats.length === 0) {

        list.innerHTML = `
            <div class="empty-history">
                💬 No chats yet.
                <br>
                Ask EduGenie something to start!
            </div>
        `;

        return;
    }

    list.innerHTML =
        eduGenieChats
            .slice(0, 6)
            .map(chat => {

                const lastMessage =
                    chat.messages[
                        chat.messages.length - 1
                    ];

                const preview =
                    lastMessage
                        ? lastMessage.question
                        : chat.title;

                return `
                    <div
                        class="history-item"
                        onclick="continueChat(${chat.id})"
                    >

                        <span>💬</span>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    chat.title
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    preview
                                )}
                            </small>

                        </div>

                        <b>›</b>

                    </div>
                `;

            })
            .join("");
}


// Continue an existing chat
function continueChat(chatId) {

    const chat =
        eduGenieChats.find(
            item => item.id === chatId
        );

    if (!chat) return;

    activeChatId = chat.id;

    const responseBox =
        document.getElementById("response");

    if (!responseBox) return;

    if (chat.messages.length === 0) {

        responseBox.innerHTML = `
            <div class="thinking">
                💬 Continue your conversation...
            </div>
        `;

        return;
    }

    const last =
        chat.messages[
            chat.messages.length - 1
        ];

    responseBox.innerHTML = `
        <div class="ai-answer">

            <div class="answer-title">
                🤖 EduGenie
            </div>

            <div class="answer-content">
                ${formatAnswer(last.answer)}
            </div>

            <button
                class="copy-btn"
                onclick="copyAnswer()"
            >
                📋 Copy Answer
            </button>

        </div>
    `;

    setRobotMessage("🔄 Chat continued!");

    const input =
        document.getElementById("question");

    if (input) {
        input.focus();
    }
}


// Show all chats
function showAllChats() {

    const list =
        document.getElementById(
            "chatHistoryList"
        );

    if (!list) return;

    if (eduGenieChats.length === 0) {

        list.innerHTML = `
            <div class="empty-history">
                💬 No saved chats yet.
            </div>
        `;

        return;
    }

    list.innerHTML =
        eduGenieChats
            .map(chat => {

                const lastMessage =
                    chat.messages[
                        chat.messages.length - 1
                    ];

                const preview =
                    lastMessage
                        ? lastMessage.question
                        : "Empty chat";

                return `
                    <div
                        class="history-item"
                        onclick="continueChat(${chat.id})"
                    >

                        <span>💬</span>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    chat.title
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    preview
                                )}
                            </small>

                        </div>

                        <b>›</b>

                    </div>
                `;

            })
            .join("");
}


// Load history when website opens
document.addEventListener(
    "DOMContentLoaded",
    function () {
        renderChatHistory();
    }
);
