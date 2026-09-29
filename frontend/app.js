// EduGenie - Frontend JavaScript

function setQuestion(text) {
    const input = document.getElementById("question");
    input.value = text;
    input.focus();
}

async function askQuestion() {
    const input = document.getElementById("question");
    const responseBox = document.getElementById("response");

    const question = input.value.trim();

    if (!question) {
        responseBox.style.display = "block";
        responseBox.innerHTML = "⚠️ Please enter a question first.";
        return;
    }

    responseBox.style.display = "block";
    responseBox.innerHTML = "✨ EduGenie is thinking...";

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

        responseBox.innerHTML =
            "🤖 <strong>EduGenie:</strong><br><br>" +
            (data.answer || data.message);

    } catch (error) {
        responseBox.innerHTML =
            "🚀 <strong>EduGenie is ready!</strong><br><br>" +
            "The Gemini backend will respond when the FastAPI server is running.";
    }
}

// Enter key support
document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("question");

    if (input) {
        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                askQuestion();
            }

        });
    }

});