// EduGenie V2 - AI Learning Assistant

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

    try {
        const response = await fetch(
            "https://edugenie-1-g40s.onrender.com/ask?question=" +
            encodeURIComponent(question),
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();
        const answer = data.answer || data.message || "No answer received.";

        responseBox.innerHTML = `
            <div class="ai-answer">
                <div class="answer-title">
                    🤖 EduGenie
                </div>

                <div class="answer-content">
                    ${formatAnswer(answer)}
                </div>

                <button class="copy-btn" onclick="copyAnswer()">
                    📋 Copy Answer
                </button>
            </div>
        `;

    } catch (error) {

        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️ <strong>Something went wrong.</strong>
                <br><br>
                Please try asking again.
            </div>
        `;
    }
}


function formatAnswer(text) {

    if (!text) {
        return "No answer received.";
    }

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
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