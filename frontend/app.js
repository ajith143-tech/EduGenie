// EduGenie V2 - AI Learning Assistant

const API_URL = "https://edugenie-1-g40s.onrender.com/ask";

function setQuestion(text) {
    const input = document.getElementById("question");

    if (!input) return;

    input.value = text;
    input.focus();
}

async function askQuestion() {

    const input = document.getElementById("question");
    const responseBox = document.getElementById("response");

    if (!input || !responseBox) return;

    const question = input.value.trim();

    if (!question) {
        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️ <strong>Please enter a question first.</strong>
            </div>
        `;
        return;
    }

    responseBox.innerHTML = `
        <div class="thinking">
            ✨ EduGenie is thinking
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
        </div>
    `;
const robotMessage = document.getElementById("robotMessage");

if (robotMessage) {
    robotMessage.innerText = "🤔 Thinking...";
}


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
            throw new Error("Server returned error: " + response.status);
        }

        const data = await response.json();

        const answer =
            data.answer ||
            "Sorry, I couldn't generate an answer.";
if (robotMessage) {
    robotMessage.innerText = "🎉 Here you go!";
}

        responseBox.innerHTML = `
            <div class="ai-answer">

                <div class="answer-title">
                    🤖 EduGenie
                </div>

               <div class="answer-content" id="aiTyping"></div>

                <button class="copy-btn" onclick="copyAnswer()">
                    📋 Copy Answer
                </button>

            </div>
        `;

    } catch (error) {

        console.error("EduGenie Error:", error);

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

    const answer = document.querySelector(".answer-content");

    if (!answer) return;

    try {

        await navigator.clipboard.writeText(answer.innerText);

        const button = document.querySelector(".copy-btn");

        if (button) {

            button.innerText = "✅ Copied!";

            setTimeout(() => {
                button.innerText = "📋 Copy Answer";
            }, 2000);
        }

    } catch (error) {

        alert("Unable to copy the answer.");

    }
}


// Enter key support
document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("question");

    if (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter" && !event.shiftKey) {

                event.preventDefault();

                askQuestion();
            }
        });
    }
});
// Floating robot messages
const robotMessages = [
    "💡 Need help?",
    "📚 Let's learn!",
    "✨ You've got this!",
    "🚀 Keep going!",
    "🧠 Let's understand it!",
    "🎯 One step at a time!"
];

let robotMessageIndex = 0;

function changeRobotMessage() {

    const robotMessage = document.getElementById("robotMessage");

    if (!robotMessage) return;

    robotMessage.style.opacity = "0";

    setTimeout(() => {

        robotMessageIndex =
            (robotMessageIndex + 1) % robotMessages.length;

        robotMessage.innerText =
            robotMessages[robotMessageIndex];

        robotMessage.style.opacity = "1";

    }, 400);
}

setInterval(changeRobotMessage, 3500);