// EduGenie V2 - AI Learning Assistant

const API_URL =
    "https://edugenie-1-g40s.onrender.com/ask";


// =====================================================
// ROBOT
// =====================================================

let robotMessageIndex = 0;

const robotMessages = [
    "💡 Need help?",
    "📚 Let's learn!",
    "✨ You've got this!",
    "🚀 Keep going!",
    "🧠 Let's understand it!",
    "🎯 One step at a time!"
];

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


// =====================================================
// QUESTION INPUT
// =====================================================

function setQuestion(text) {

    const input =
        document.getElementById("question");

    if (!input) return;

    input.value = text;
    input.focus();

}


// =====================================================
// CHAT STORAGE
// =====================================================

let eduGenieChats = [];

try {

    eduGenieChats =
        JSON.parse(
            localStorage.getItem(
                "eduGenieChats"
            )
        ) || [];

} catch (error) {

    console.error(
        "Chat storage error:",
        error
    );

    eduGenieChats = [];

}

let activeChatId = null;


function saveChats() {

    try {

        localStorage.setItem(
            "eduGenieChats",
            JSON.stringify(
                eduGenieChats
            )
        );

    } catch (error) {

        console.error(
            "Unable to save chats:",
            error
        );

    }

}


// =====================================================
// CREATE NEW CHAT
// =====================================================

function createNewChat(
    showMessage = true
) {

    const chat = {

        id: Date.now(),

        title: "New Chat",

        messages: [],

        createdAt:
            new Date().toLocaleString()

    };

    eduGenieChats.unshift(chat);

    activeChatId = chat.id;

    saveChats();

    renderChatHistory();


    if (showMessage) {

        const responseBox =
            document.getElementById(
                "response"
            );

        if (responseBox) {

            responseBox.innerHTML = `
                <div class="thinking">
                    💬 New chat started.
                </div>
            `;

        }

        const input =
            document.getElementById(
                "question"
            );

        if (input) {

            input.value = "";
            input.focus();

        }

        setRobotMessage(
            "💬 New chat!"
        );

    }

}


// =====================================================
// ASK GEMINI
// =====================================================

async function askQuestion() {

    const input =
        document.getElementById(
            "question"
        );

    const responseBox =
        document.getElementById(
            "response"
        );


    if (!input || !responseBox) {

        console.error(
            "Question or response element missing."
        );

        return;

    }


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


    if (!activeChatId) {

        createNewChat(false);

    }


    const currentChat =
        eduGenieChats.find(
            chat =>
                chat.id === activeChatId
        );


    if (!currentChat) {

        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️ Unable to create chat.
            </div>
        `;

        return;

    }


    setRobotMessage(
        "🤔 Thinking..."
    );


    responseBox.innerHTML = `
        <div class="thinking">
            ✨ EduGenie is thinking
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
        </div>
    `;


    try {

        const history =
            currentChat.messages.map(
                message => ({

                    question:
                        message.question,

                    answer:
                        message.answer

                })
            );


        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            question:
                                question,

                            history:
                                history

                        })

                }
            );


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


        currentChat.messages.push({

            question:
                question,

            answer:
                answer,

            time:
                new Date().toLocaleString()

        });


        if (
            currentChat.title ===
            "New Chat"
        ) {

            currentChat.title =
                question.length > 35
                    ? question.substring(
                        0,
                        35
                    ) + "..."
                    : question;

        }


        saveChats();

        renderChatHistory();

        updateProfileStats();


        setRobotMessage(
            "🎉 Here you go!"
        );


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

                ⚠️ <strong>
                    Connection Error
                </strong>

                <br><br>

                ${escapeHtml(
                    error.message
                )}

                <br><br>

                Please try again.

            </div>

        `;

    }

}


// =====================================================
// FORMAT ANSWER
// =====================================================

function formatAnswer(text) {

    if (!text) {

        return "No answer received.";

    }


    return escapeHtml(text)

        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )

        .replace(
            /\n/g,
            "<br>"
        );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// COPY ANSWER
// =====================================================

async function copyAnswer() {

    const answer =
        document.querySelector(
            ".answer-content"
        );


    if (!answer) return;


    try {

        await navigator.clipboard.writeText(
            answer.innerText
        );


        const button =
            document.querySelector(
                ".copy-btn"
            );


        if (button) {

            button.innerText =
                "✅ Copied!";


            setTimeout(
                () => {

                    button.innerText =
                        "📋 Copy Answer";

                },
                2000
            );

        }


    } catch (error) {

        alert(
            "Unable to copy the answer."
        );

    }

}


// =====================================================
// RENDER CHAT HISTORY
// =====================================================

function renderChatHistory() {

    const list =
        document.getElementById(
            "chatHistoryList"
        );


    if (!list) return;


    if (
        !eduGenieChats ||
        eduGenieChats.length === 0
    ) {

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

                        <span>
                            💬
                        </span>

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

                        <b>
                            ›
                        </b>

                    </div>

                `;

            })
            .join("");

}


// =====================================================
// CONTINUE CHAT
// =====================================================

function continueChat(chatId) {

    const chat =
        eduGenieChats.find(
            item =>
                item.id === chatId
        );


    if (!chat) return;


    activeChatId =
        chat.id;


    const responseBox =
        document.getElementById(
            "response"
        );


    if (!responseBox) return;


    if (
        !chat.messages ||
        chat.messages.length === 0
    ) {

        responseBox.innerHTML = `

            <div class="thinking">

                💬 Continue your conversation...

            </div>

        `;

        setRobotMessage(
            "🔄 Chat continued!"
        );

        return;

    }


    responseBox.innerHTML =
        chat.messages
            .map(
                message => `

                <div class="ai-answer">

                    <div class="answer-title">
                        👤 You
                    </div>

                    <div class="answer-content">
                        ${formatAnswer(
                            message.question
                        )}
                    </div>

                    <div class="answer-title">
                        🤖 EduGenie
                    </div>

                    <div class="answer-content">
                        ${formatAnswer(
                            message.answer
                        )}
                    </div>

                </div>

            `
            )
            .join("");


    setRobotMessage(
        "🔄 Chat continued!"
    );


    const input =
        document.getElementById(
            "question"
        );


    if (input) {

        input.focus();

    }

}


// =====================================================
// SHOW ALL CHATS
// =====================================================

function showAllChats() {

    const list =
        document.getElementById(
            "chatHistoryList"
        );

    if (!list) return;


    if (
        eduGenieChats.length === 0
    ) {

        renderChatHistory();

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


// =====================================================
// VOICE INPUT
// =====================================================

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported in this browser."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;


    setRobotMessage(
        "🎤 Listening..."
    );


    recognition.start();


    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0].transcript;


            const input =
                document.getElementById(
                    "question"
                );


            if (input) {

                input.value = text;
                input.focus();

            }


            setRobotMessage(
                "🎤 Got it!"
            );

        };


    recognition.onerror =
        function () {

            setRobotMessage(
                "🎤 Voice input stopped."
            );

        };

}
// =====================================================
// PROFILE STORAGE
// =====================================================

const PROFILE_STORAGE_KEY =
    "eduGenieStudentProfile";


const defaultProfile = {

    name: "Student Name",

    studentId: "Not added",

    college: "Not added",

    department:
        "Computer Science & Engineering",

    year: "3rd Year",

    semester: "5th Semester",

    email: "Not added",

    phone: "Not added"

};


let studentProfile = {
    ...defaultProfile
};


try {

    const savedProfile =
        localStorage.getItem(
            PROFILE_STORAGE_KEY
        );


    if (savedProfile) {

        studentProfile = {

            ...defaultProfile,

            ...JSON.parse(
                savedProfile
            )

        };

    }

} catch (error) {

    console.error(
        "Profile storage error:",
        error
    );

}


// =====================================================
// LOAD PROFILE
// =====================================================

function loadProfile() {

    const fields = {

        name:
            "profileName",

        studentId:
            "profileStudentId",

        college:
            "profileCollege",

        department:
            "profileDepartment",

        year:
            "profileYear",

        semester:
            "profileSemester",

        email:
            "profileEmail",

        phone:
            "profilePhone"

    };


    Object.keys(fields).forEach(
        key => {

            const element =
                document.getElementById(
                    fields[key]
                );


            if (element) {

                element.innerText =
                    studentProfile[key] ||
                    defaultProfile[key];

            }


            const input =
                document.getElementById(
                    fields[key] +
                    "Input"
                );


            if (input) {

                input.value =
                    studentProfile[key] ||
                    defaultProfile[key];

            }

        }
    );


    updateProfileStats();

}


// =====================================================
// EDIT PROFILE
// =====================================================

function editProfile() {

    const fields = [

        "Name",

        "StudentId",

        "College",

        "Department",

        "Year",

        "Semester",

        "Email",

        "Phone"

    ];


    fields.forEach(
        field => {

            const value =
                document.getElementById(
                    "profile" +
                    field
                );


            const input =
                document.getElementById(
                    "profile" +
                    field +
                    "Input"
                );


            if (value) {

                value.hidden = true;

                value.style.display =
                    "none";

            }


            if (input) {

                input.hidden = false;

                input.style.display =
                    "block";

            }

        }
    );


    const actions =
        document.getElementById(
            "profileActions"
        );


    if (actions) {

        actions.hidden = false;

        actions.style.display =
            "flex";

    }


    setRobotMessage(
        "✏️ Edit your profile!"
    );

}


// =====================================================
// SAVE PROFILE
// =====================================================

function saveProfile() {

    console.log(
        "EduGenie: saveProfile started"
    );


    const fields = {

        name:
            "profileNameInput",

        studentId:
            "profileStudentIdInput",

        college:
            "profileCollegeInput",

        department:
            "profileDepartmentInput",

        year:
            "profileYearInput",

        semester:
            "profileSemesterInput",

        email:
            "profileEmailInput",

        phone:
            "profilePhoneInput"

    };


    Object.keys(fields).forEach(
        key => {

            const input =
                document.getElementById(
                    fields[key]
                );


            if (input) {

                const value =
                    input.value.trim();


                studentProfile[key] =
                    value ||
                    defaultProfile[key];

            }

        }
    );


    try {

        localStorage.setItem(

            PROFILE_STORAGE_KEY,

            JSON.stringify(
                studentProfile
            )

        );

    } catch (error) {

        console.error(
            "Profile save failed:",
            error
        );

        alert(
            "Profile could not be saved."
        );

        return;

    }


    loadProfile();


    cancelProfileEdit(
        false
    );


    setRobotMessage(
        "✅ Profile saved!"
    );


    showProfileMessage(
        "✅ Profile saved successfully!"
    );


    console.log(
        "EduGenie: profile saved"
    );

}


// =====================================================
// CANCEL PROFILE EDIT
// =====================================================

function cancelProfileEdit(
    showRobot = true
) {

    const fields = [

        "Name",

        "StudentId",

        "College",

        "Department",

        "Year",

        "Semester",

        "Email",

        "Phone"

    ];


    fields.forEach(
        field => {

            const value =
                document.getElementById(
                    "profile" +
                    field
                );


            const input =
                document.getElementById(
                    "profile" +
                    field +
                    "Input"
                );


            if (value) {

                value.hidden = false;

                value.style.display =
                    "";

            }


            if (input) {

                input.hidden = true;

                input.style.display =
                    "none";

            }

        }
    );


    const actions =
        document.getElementById(
            "profileActions"
        );


    if (actions) {

        actions.hidden = true;

        actions.style.display =
            "none";

    }


    loadProfile();


    if (showRobot) {

        setRobotMessage(
            "↩️ Profile edit cancelled."
        );

    }

}


// =====================================================
// PROFILE SUCCESS MESSAGE
// =====================================================

function showProfileMessage(
    message
) {

    const profileCard =
        document.querySelector(
            ".profile-card"
        );


    if (!profileCard) {

        alert(message);

        return;

    }


    const oldMessage =
        document.getElementById(
            "profileSaveMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.id =
        "profileSaveMessage";


    messageBox.innerText =
        message;


    messageBox.style.marginTop =
        "12px";


    messageBox.style.padding =
        "10px 12px";


    messageBox.style.borderRadius =
        "10px";


    messageBox.style.background =
        "rgba(30, 120, 180, .18)";


    messageBox.style.border =
        "1px solid rgba(70, 190, 255, .3)";


    messageBox.style.color =
        "#70d5ff";


    messageBox.style.fontSize =
        "12px";


    profileCard.appendChild(
        messageBox
    );


    setTimeout(
        () => {

            if (messageBox) {

                messageBox.remove();

            }

        },
        2500
    );

}


// =====================================================
// PROFILE STATISTICS
// =====================================================

function updateProfileStats() {

    const questionsCount =
        document.getElementById(
            "profileQuestionsCount"
        );


    if (!questionsCount) return;


    let totalQuestions = 0;


    eduGenieChats.forEach(
        chat => {

            if (
                chat.messages &&
                Array.isArray(
                    chat.messages
                )
            ) {

                totalQuestions +=
                    chat.messages.length;

            }

        }
    );


    questionsCount.innerText =
        totalQuestions;


    updateLearningLevel(
        totalQuestions
    );

}


// =====================================================
// LEARNING LEVEL
// =====================================================

function updateLearningLevel(
    totalQuestions
) {

    const levelElement =
        document.querySelector(
            ".profile-stat-card:nth-child(3) strong"
        );


    if (!levelElement) return;


    let level =
        "Beginner";


    if (
        totalQuestions >= 100
    ) {

        level =
            "Expert";

    } else if (
        totalQuestions >= 50
    ) {

        level =
            "Advanced";

    } else if (
        totalQuestions >= 25
    ) {

        level =
            "Intermediate";

    }


    levelElement.innerText =
        level;

}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.askQuestion =
    askQuestion;

window.setQuestion =
    setQuestion;

window.startVoiceInput =
    startVoiceInput;

window.copyAnswer =
    copyAnswer;

window.showAllChats =
    showAllChats;

window.continueChat =
    continueChat;

window.createNewChat =
    createNewChat;

window.editProfile =
    editProfile;

window.saveProfile =
    saveProfile;

window.cancelProfileEdit =
    cancelProfileEdit;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "question"
            );


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


        renderChatHistory();


        loadProfile();


        const editProfileButton =
            document.getElementById(
                "editProfileBtn"
            );


        if (editProfileButton) {

            editProfileButton.addEventListener(
                "click",
                editProfile
            );

        }


        const saveProfileButton =
            document.getElementById(
                "saveProfileBtn"
            );


        if (saveProfileButton) {

            saveProfileButton.addEventListener(
                "click",
                saveProfile
            );

        }


        console.log(
            "EduGenie app loaded successfully."
        );

    }
);

// =========================================================
// EDU GENIE — CONVERSATION DISPLAY
// ADD THIS AT THE VERY BOTTOM
// =========================================================

const originalEduGenieAsk =
    window.askQuestion;

window.askQuestion = async function () {

    await originalEduGenieAsk();

    const responseBox =
        document.getElementById("response");

    if (!responseBox) return;

    const currentChat =
        eduGenieChats.find(
            chat =>
                chat.id === activeChatId
        );

    if (
        !currentChat ||
        !currentChat.messages ||
        currentChat.messages.length === 0
    ) {
        return;
    }

    responseBox.innerHTML =
        currentChat.messages
            .map(message => {

                return `
                    <div class="chat-message-user">

                        <div class="chat-bubble">

                            <span
                                class="chat-label chat-user-label"
                            >
                                👤 You
                            </span>

                            ${formatAnswer(
                                message.question
                            )}

                        </div>

                    </div>


                    <div class="chat-message-ai">

                        <div class="chat-bubble">

                            <span class="chat-label">
                                🤖 EduGenie
                            </span>

                            ${formatAnswer(
                                message.answer
                            )}

                            <br>

                            <button
                                class="copy-btn"
                                onclick="copyAnswer()"
                            >
                                📋 Copy Answer
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

};
// =========================================================
// EDU GENIE — SEPARATE PROFILE PAGE
// =========================================================

function openProfilePage() {

    const profilePage =
        document.getElementById("profilePage");

    const profileSection =
        document.querySelector(".profile-section");

    const profileContent =
        document.getElementById("profilePageContent");

    if (!profilePage || !profileSection) return;

    profilePage.hidden = false;

    profileContent.appendChild(profileSection);

    document.body.classList.add("profile-open");
}


function closeProfilePage() {

    const profilePage =
        document.getElementById("profilePage");

    const profileSection =
        document.querySelector(".profile-section");

    if (!profilePage || !profileSection) return;

    profilePage.hidden = true;

    document.body.classList.remove("profile-open");
}