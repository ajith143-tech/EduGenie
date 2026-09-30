console.log("🔥 EduGenie app.js STARTED");
// =====================================================
// EduGenie V2 - AI Learning Assistant
// =====================================================

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
            localStorage.getItem("eduGenieChats")
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
            JSON.stringify(eduGenieChats)
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

function createNewChat(showMessage = true) {

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
        document.getElementById("question");

    const responseBox =
        document.getElementById("response");


    if (!input || !responseBox) return;


    const question =
        input.value.trim();


    if (!question) {

        responseBox.innerHTML = `
            <div class="error-message">
                ⚠️
                <strong>
                    Please enter a question first.
                </strong>
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


    if (!currentChat) return;


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

                    body: JSON.stringify({

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
                    ? question.substring(0, 35) + "..."
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

                ⚠️
                <strong>
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
            .map(message => `

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

            `)
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

    const historySection =
        document.getElementById(
            "history"
        );


    if (historySection) {

        historySection.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    renderChatHistory();

}


// =====================================================
// VOICE INPUT
// =====================================================

let recognition;

let isListening = false;


function startVoiceInput() {

    const input =
        document.getElementById(
            "question"
        );

    const voiceBtn =
        document.getElementById(
            "voiceBtn"
        );


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


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            isListening = true;

            voiceBtn.innerText =
                "🔴";

            voiceBtn.classList.add(
                "voice-listening"
            );

            setRobotMessage(
                "🎧 Listening..."
            );

        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript;


            input.value =
                transcript;

            input.focus();

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );

            setRobotMessage(
                "💙 Try speaking again!"
            );

        };


    recognition.onend =
        function () {

            isListening = false;

            voiceBtn.innerText =
                "🎤";

            voiceBtn.classList.remove(
                "voice-listening"
            );

            setRobotMessage(
                "💡 Need help?"
            );

        };


    recognition.start();

}


// =====================================================
// ROBOT MESSAGE ROTATION
// =====================================================

function changeRobotMessage() {

    const robotMessage =
        document.getElementById(
            "robotMessage"
        );


    if (!robotMessage) return;


    robotMessage.style.opacity =
        "0";


    setTimeout(() => {

        robotMessageIndex =
            (
                robotMessageIndex + 1
            ) %
            robotMessages.length;


        robotMessage.innerText =
            robotMessages[
                robotMessageIndex
            ];


        robotMessage.style.opacity =
            "1";

    }, 400);

}


setInterval(
    changeRobotMessage,
    3500
);


// =====================================================
// STUDENT PROFILE
// =====================================================

const PROFILE_STORAGE_KEY =
    "eduGenieStudentProfile";


const defaultProfile = {

    name:
        "Student Name",

    studentId:
        "Not added",

    college:
        "Not added",

    department:
        "Computer Science & Engineering",

    year:
        "3rd Year",

    semester:
        "5th Semester",

    email:
        "Not added",

    phone:
        "Not added"

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
// PROFILE FIELDS
// =====================================================

const profileFields = {

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


const profileFieldNames = [

    "Name",

    "StudentId",

    "College",

    "Department",

    "Year",

    "Semester",

    "Email",

    "Phone"

];


// =====================================================
// LOAD PROFILE
// =====================================================

function loadProfile() {

    Object.keys(profileFields).forEach(
        key => {

            const display =
                document.getElementById(
                    profileFields[key]
                );


            const input =
                document.getElementById(
                    profileFields[key] +
                    "Input"
                );


            const value =
                studentProfile[key] ||
                defaultProfile[key];


            if (display) {

                display.innerText =
                    value;

            }


            if (input) {

                input.value =
                    value;

            }

        }
    );


    updateProfileStats();

}


// =====================================================
// EDIT PROFILE — FIXED
// =====================================================

function editProfile() {

    console.log(
        "EduGenie: Edit Profile clicked"
    );


    profileFieldNames.forEach(
        field => {

            const display =
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


            if (display) {

                display.hidden =
                    true;

                display.setAttribute(
                    "hidden",
                    ""
                );

                display.style.display =
                    "none";

            }


            if (input) {

                input.hidden =
                    false;

                input.removeAttribute(
                    "hidden"
                );

                input.style.display =
                    "block";

                input.style.visibility =
                    "visible";

                input.style.opacity =
                    "1";

                input.style.pointerEvents =
                    "auto";

                input.disabled =
                    false;

                input.readOnly =
                    false;

            }

        }
    );


    const actions =
        document.getElementById(
            "profileActions"
        );


    if (actions) {

        actions.hidden =
            false;

        actions.removeAttribute(
            "hidden"
        );

        actions.style.display =
            "flex";

        actions.style.visibility =
            "visible";

        actions.style.opacity =
            "1";

    }


    const firstInput =
        document.getElementById(
            "profileNameInput"
        );


    if (firstInput) {

        firstInput.focus();

    }


    setRobotMessage(
        "✏️ Edit your profile!"
    );

}


// =====================================================
// SAVE PROFILE
// =====================================================

function saveProfile() {

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

    cancelProfileEdit(false);


    setRobotMessage(
        "✅ Profile saved!"
    );


    showProfileMessage(
        "✅ Profile saved successfully!"
    );

}


// =====================================================
// CANCEL PROFILE EDIT
// =====================================================

function cancelProfileEdit(
    showRobot = true
) {

    profileFieldNames.forEach(
        field => {

            const display =
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


            if (display) {

                display.hidden =
                    false;

                display.removeAttribute(
                    "hidden"
                );

                display.style.display =
                    "block";

                display.style.visibility =
                    "visible";

            }


            if (input) {

                input.hidden =
                    true;

                input.setAttribute(
                    "hidden",
                    ""
                );

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

        actions.hidden =
            true;

        actions.setAttribute(
            "hidden",
            ""
        );

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

function showProfileMessage(message) {

    const profileCard =
        document.querySelector(
            ".profile-card"
        );


    if (!profileCard) return;


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

            if (messageBox.parentNode) {

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


    let totalQuestions =
        0;


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
// CONVERSATION DISPLAY
// =====================================================

const originalEduGenieAsk =
    askQuestion;


async function displayConversationAfterAsk() {

    await originalEduGenieAsk();


    const responseBox =
        document.getElementById(
            "response"
        );


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
            .map(
                message => `

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

                `
            )
            .join("");

}


window.askQuestion =
    displayConversationAfterAsk;


// =====================================================
// SEPARATE PROFILE PAGE
// =====================================================

function openProfilePage() {

    const page =
        document.getElementById("profilePage");

    const profile =
        document.getElementById("studentProfile");

    const container =
        document.getElementById("profilePageContent");

    if (
        !page ||
        !profile ||
        !container
    ) {

        console.error(
            "EduGenie: Profile page elements missing."
        );

        return;

    }


    // Move profile into the separate profile page
    if (
        profile.parentNode !== container
    ) {

        container.appendChild(
            profile
        );

    }


    page.hidden =
        false;

    page.removeAttribute(
        "hidden"
    );

    page.style.display =
        "block";


    // Start in view mode
    cancelProfileEdit(false);

    loadProfile();


    document.body.style.overflow =
        "hidden";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setRobotMessage(
        "👤 Welcome to your profile!"
    );

}


// =====================================================
// CLOSE PROFILE PAGE
// =====================================================

function closeProfilePage() {

    const page =
        document.getElementById(
            "profilePage"
        );


    if (!page) {

        return;

    }


    // Hide profile page.
    // Do NOT move the profile back to the AI page.
    page.hidden =
        true;

    page.setAttribute(
        "hidden",
        ""
    );

    page.style.display =
        "none";


    document.body.style.overflow =
        "";


    setRobotMessage(
        "💡 Need help?"
    );

}

// =====================================================
// ROBOT ROAMING
// =====================================================

function randomRobotMove() {

    const robot =
        document.getElementById(
            "robotRoamer"
        );


    if (!robot) return;


    const maxX =
        Math.max(
            10,
            window.innerWidth -
            robot.offsetWidth -
            20
        );


    const maxY =
        Math.max(
            10,
            window.innerHeight -
            robot.offsetHeight -
            20
        );


    robot.style.left =
        Math.random() * maxX + "px";


    robot.style.top =
        Math.random() * maxY + "px";


    robot.style.right =
        "auto";


    robot.style.bottom =
        "auto";

}


setTimeout(
    randomRobotMove,
    500
);


setInterval(
    randomRobotMove,
    8000
);


// =====================================================
// INTERACTIVE ROBOT
// =====================================================

const interactiveRobotMessages = [

    "💡 Need help with your studies?",

    "📚 Ask me anything!",

    "🧠 Let's learn something new!",

    "✨ I'm ready to help!",

    "🚀 Keep learning!",

    "🎯 What's your next question?",

    "😎 Don't worry, I've got you!",

    "💙 Let's solve it together!"

];


function setupInteractiveRobot() {

    const robot =
        document.getElementById(
            "robotRoamer"
        );


    if (!robot) return;


    robot.style.pointerEvents =
        "auto";


    robot.style.cursor =
        "pointer";


    robot.addEventListener(
        "click",
        function () {

            const message =
                document.getElementById(
                    "robotMessage"
                );


            if (!message) return;


            const randomIndex =
                Math.floor(
                    Math.random() *
                    interactiveRobotMessages.length
                );


            message.innerText =
                interactiveRobotMessages[
                    randomIndex
                ];

        }
    );

}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.askQuestion =
    displayConversationAfterAsk;

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

window.openProfilePage =
    openProfilePage;

window.closeProfilePage =
    closeProfilePage;


// =====================================================
// ENTER KEY + PAGE LOAD
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

                        window.askQuestion();

                    }

                }
            );

        }


        renderChatHistory();

        loadProfile();

        setupInteractiveRobot();

    }
);
// =====================================================
// EDU GENIE UPGRADE CENTER
// ADD-ONLY — DO NOT REMOVE EXISTING CODE
// =====================================================

const EG_UPGRADE_STORAGE =
    "eduGenieUpgradeData";

let egUpgradeData = {
    xp: 0,
    streak: 0,
    lastStudyDate: "",
    quizzes: 0,
    correctAnswers: 0,
    studyMinutes: 0,
    notes: []
};


// =====================================================
// LOAD UPGRADE DATA
// =====================================================

function egLoadUpgradeData() {

    try {

        const saved =
            localStorage.getItem(
                EG_UPGRADE_STORAGE
            );

        if (saved) {

            egUpgradeData = {
                ...egUpgradeData,
                ...JSON.parse(saved)
            };

        }

    } catch (error) {

        console.error(
            "EduGenie upgrade data error:",
            error
        );

    }

}


// =====================================================
// SAVE UPGRADE DATA
// =====================================================

function egSaveUpgradeData() {

    try {

        localStorage.setItem(
            EG_UPGRADE_STORAGE,
            JSON.stringify(
                egUpgradeData
            )
        );

    } catch (error) {

        console.error(
            "EduGenie upgrade save error:",
            error
        );

    }

}


// =====================================================
// XP SYSTEM
// =====================================================

function egAddXP(amount) {

    egUpgradeData.xp += amount;

    egSaveUpgradeData();

    egUpdateUpgradeUI();

    egRobotReact(
        "⚡ +" + amount + " XP!"
    );

}


// =====================================================
// STREAK
// =====================================================

function egUpdateStreak() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    if (
        egUpgradeData.lastStudyDate ===
        today
    ) {

        return;

    }

    if (
        !egUpgradeData.lastStudyDate
    ) {

        egUpgradeData.streak = 1;

    } else {

        const last =
            new Date(
                egUpgradeData.lastStudyDate
            );

        const now =
            new Date(today);

        const difference =
            Math.floor(
                (
                    now - last
                ) /
                86400000
            );

        if (difference === 1) {

            egUpgradeData.streak++;

        } else if (
            difference > 1
        ) {

            egUpgradeData.streak = 1;

        }

    }

    egUpgradeData.lastStudyDate =
        today;

    egSaveUpgradeData();

}


// =====================================================
// QUIZ GENERATOR
// =====================================================

async function egGenerateQuiz() {

    const topic =
        document.getElementById(
            "egQuizTopic"
        )?.value.trim();

    const difficulty =
        document.getElementById(
            "egQuizDifficulty"
        )?.value;

    const count =
        document.getElementById(
            "egQuizCount"
        )?.value;

    const box =
        document.getElementById(
            "egQuizBox"
        );

    if (!topic) {

        alert(
            "Please enter a quiz topic."
        );

        return;

    }

    box.innerHTML =
        `<div class="eg-loading">
            🤖 EduGenie is creating your quiz...
        </div>`;

    try {

        const prompt = `
Create a ${count}-question multiple choice quiz about "${topic}".

Difficulty: ${difficulty}

Return ONLY valid JSON.

Format:
[
 {
  "question":"question",
  "options":["A","B","C","D"],
  "answer":0,
  "explanation":"short explanation"
 }
]

The answer must be the zero-based option number.
No markdown.
`;

        const response =
            await fetch(
                "https://edugenie-1-g40s.onrender.com/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        question: prompt,
                        history: []
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                "Quiz server error"
            );
        }

        const data =
            await response.json();

        let text =
            data.answer || "";

        text =
            text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        const questions =
            JSON.parse(text);

        egRenderQuiz(
            questions,
            box,
            false
        );

    } catch (error) {

        console.error(
            "Quiz error:",
            error
        );

        box.innerHTML =
            `<div class="eg-loading">
                ❌ Quiz generation failed.
                Please try again.
            </div>`;

    }

}


// =====================================================
// RENDER QUIZ
// =====================================================

function egRenderQuiz(
    questions,
    box,
    examMode
) {

    if (
        !Array.isArray(questions) ||
        !questions.length
    ) {

        box.innerHTML =
            "No questions generated.";

        return;

    }

    let current = 0;

    let score = 0;

    function renderQuestion() {

        if (
            current >= questions.length
        ) {

            egUpgradeData.quizzes++;

            egUpgradeData.correctAnswers +=
                score;

            egAddXP(
                score * 10 + 20
            );

            box.innerHTML = `
                <div class="eg-score">
                    🏆 Quiz Complete!<br><br>
                    Score: ${score}/${questions.length}
                    <br><br>
                    +${score * 10 + 20} XP
                </div>
            `;

            egUpdateUpgradeUI();

            return;

        }

        const q =
            questions[current];

        box.innerHTML = `
            <div class="eg-question-card">

                <h4>
                    Question ${current + 1}
                    / ${questions.length}
                </h4>

                <p>${egEscape(
                    q.question
                )}</p>

                <div id="egOptions"></div>

            </div>
        `;

        const options =
            document.getElementById(
                "egOptions"
            );

        q.options.forEach(
            (option, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "eg-option";

                button.innerText =
                    option;

                button.onclick =
                    function () {

                        const buttons =
                            options.querySelectorAll(
                                ".eg-option"
                            );

                        buttons.forEach(
                            b =>
                                b.disabled =
                                    true
                        );

                        if (
                            index ===
                            Number(q.answer)
                        ) {

                            button.classList.add(
                                "eg-correct"
                            );

                            score++;

                            egRobotReact(
                                "🎉 Correct!"
                            );

                        } else {

                            button.classList.add(
                                "eg-wrong"
                            );

                            buttons[
                                Number(q.answer)
                            ]?.classList.add(
                                "eg-correct"
                            );

                            egRobotReact(
                                "💙 Keep learning!"
                            );

                        }

                        setTimeout(
                            () => {

                                current++;

                                renderQuestion();

                            },
                            900
                        );

                    };

                options.appendChild(
                    button
                );

            }
        );

    }

    renderQuestion();

}


// =====================================================
// EXAM MODE
// =====================================================

async function egStartExam() {

    const topic =
        document.getElementById(
            "egExamTopic"
        )?.value.trim();

    const count =
        document.getElementById(
            "egExamQuestions"
        )?.value;

    const minutes =
        Number(
            document.getElementById(
                "egExamTime"
            )?.value
        );

    const box =
        document.getElementById(
            "egExamBox"
        );

    if (!topic) {

        alert(
            "Enter an exam topic."
        );

        return;

    }

    box.innerHTML =
        `<div class="eg-loading">
            🎓 Preparing exam...
        </div>`;

    try {

        const prompt = `
Create a ${count}-question exam about "${topic}".

Return ONLY valid JSON:
[
 {
  "question":"question",
  "options":["A","B","C","D"],
  "answer":0,
  "explanation":"short explanation"
 }
]

No markdown.
`;

        const response =
            await fetch(
                "https://edugenie-1-g40s.onrender.com/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        question: prompt,
                        history: []
                    })
                }
            );

        const data =
            await response.json();

        let text =
            data.answer || "";

        text =
            text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        const questions =
            JSON.parse(text);

        egStartExamTimer(
            minutes * 60
        );

        egRenderQuiz(
            questions,
            box,
            true
        );

    } catch (error) {

        console.error(
            "Exam error:",
            error
        );

        box.innerHTML =
            `<div class="eg-loading">
                ❌ Could not create exam.
            </div>`;

    }

}


// =====================================================
// EXAM TIMER
// =====================================================

let egExamInterval = null;

function egStartExamTimer(seconds) {

    clearInterval(
        egExamInterval
    );

    let remaining =
        seconds;

    const timer =
        document.getElementById(
            "egExamTimer"
        );

    function update() {

        const minutes =
            Math.floor(
                remaining / 60
            );

        const secs =
            remaining % 60;

        timer.innerText =
            `⏱️ ${
                String(minutes)
                    .padStart(2, "0")
            }:${
                String(secs)
                    .padStart(2, "0")
            }`;

        if (
            remaining <= 0
        ) {

            clearInterval(
                egExamInterval
            );

            timer.innerText =
                "⏰ Time's up!";

            return;

        }

        remaining--;

    }

    update();

    egExamInterval =
        setInterval(
            update,
            1000
        );

}


// =====================================================
// FLASHCARDS
// =====================================================

let egFlashcards = [];

let egFlashIndex = 0;

function egGenerateFlashcards() {

    const topic =
        document.getElementById(
            "egFlashTopic"
        )?.value.trim();

    const box =
        document.getElementById(
            "egFlashBox"
        );

    if (!topic) {

        alert(
            "Enter a flashcard topic."
        );

        return;

    }

    box.innerHTML =
        `<div class="eg-loading">
            🧩 Creating flashcards...
        </div>`;

    fetch(
        "https://edugenie-1-g40s.onrender.com/ask",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                question: `
Create 5 flashcards about "${topic}".

Return ONLY JSON:
[
 {"question":"...","answer":"..."}
]

No markdown.
`,
                history: []
            })
        }
    )
        .then(
            response =>
                response.json()
        )
        .then(
            data => {

                let text =
                    data.answer || "";

                text =
                    text
                        .replace(
                            /```json/gi,
                            ""
                        )
                        .replace(
                            /```/g,
                            ""
                        )
                        .trim();

                egFlashcards =
                    JSON.parse(text);

                egFlashIndex = 0;

                egShowFlashcard();

            }
        )
        .catch(
            error => {

                console.error(
                    "Flashcard error:",
                    error
                );

                box.innerHTML =
                    "❌ Flashcard generation failed.";

            }
        );

}


function egShowFlashcard() {

    const box =
        document.getElementById(
            "egFlashBox"
        );

    if (
        !egFlashcards.length
    ) return;

    const card =
        egFlashcards[
            egFlashIndex
        ];

    box.innerHTML = `
        <div
            class="eg-flashcard"
            onclick="window.egFlipFlashcard()"
        >
            <div id="egFlashContent">
                🧩 ${egEscape(
                    card.question
                )}
                <br><br>
                <small>
                    Tap to reveal answer
                </small>
            </div>
        </div>

        <div style="text-align:center;margin-top:10px">

            <button
                class="eg-secondary-btn"
                onclick="window.egNextFlashcard()"
            >
                Next →
            </button>

        </div>
    `;

}


function egFlipFlashcard() {

    const content =
        document.getElementById(
            "egFlashContent"
        );

    if (!content) return;

    const card =
        egFlashcards[
            egFlashIndex
        ];

    content.innerHTML =
        `💡 ${egEscape(
            card.answer
        )}`;

}


function egNextFlashcard() {

    if (!egFlashcards.length)
        return;

    egFlashIndex =
        (
            egFlashIndex + 1
        ) %
        egFlashcards.length;

    egShowFlashcard();

}


// =====================================================
// SMART NOTES
// =====================================================

function egSaveNote() {

    const title =
        document.getElementById(
            "egNoteTitle"
        )?.value.trim();

    const text =
        document.getElementById(
            "egNoteText"
        )?.value.trim();

    if (!text) {

        alert(
            "Write a note first."
        );

        return;

    }

    egUpgradeData.notes.push({

        id:
            Date.now(),

        title:
            title ||
            "Untitled Note",

        text:
            text,

        date:
            new Date()
                .toLocaleString()

    });

    egAddXP(10);

    egSaveUpgradeData();

    document.getElementById(
        "egNoteTitle"
    ).value = "";

    document.getElementById(
        "egNoteText"
    ).value = "";

    egRenderNotes();

    egRobotReact(
        "📝 Note saved!"
    );

}


function egRenderNotes() {

    const box =
        document.getElementById(
            "egNotesBox"
        );

    if (!box) return;

    const search =
        document.getElementById(
            "egNoteSearch"
        )?.value
            .trim()
            .toLowerCase() || "";

    const notes =
        egUpgradeData.notes
            .filter(
                note =>
                    note.title
                        .toLowerCase()
                        .includes(search) ||
                    note.text
                        .toLowerCase()
                        .includes(search)
            );

    if (!notes.length) {

        box.innerHTML =
            `<div class="eg-loading">
                No notes found.
            </div>`;

        return;

    }

    box.innerHTML =
        notes
            .map(
                note => `
                    <div class="eg-note-item">

                        <button
                            class="eg-delete"
                            onclick="window.egDeleteNote(${note.id})"
                        >
                            ✕
                        </button>

                        <strong>
                            ${egEscape(
                                note.title
                            )}
                        </strong>

                        <small>
                            ${egEscape(
                                note.date
                            )}
                        </small>

                        <p>
                            ${egEscape(
                                note.text
                            )}
                        </p>

                    </div>
                `
            )
            .join("");

}


function egDeleteNote(id) {

    egUpgradeData.notes =
        egUpgradeData.notes.filter(
            note =>
                note.id !== id
        );

    egSaveUpgradeData();

    egRenderNotes();

    egUpdateUpgradeUI();

}


// =====================================================
// STUDY TIMER
// =====================================================

let egTimerSeconds = 25 * 60;

let egTimerInterval = null;

function egUpdateTimerDisplay() {

    const display =
        document.getElementById(
            "egTimerDisplay"
        );

    if (!display) return;

    const minutes =
        Math.floor(
            egTimerSeconds / 60
        );

    const seconds =
        egTimerSeconds % 60;

    display.innerText =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}


function egStartTimer() {

    if (egTimerInterval)
        return;

    egTimerInterval =
        setInterval(
            () => {

                if (
                    egTimerSeconds <= 0
                ) {

                    clearInterval(
                        egTimerInterval
                    );

                    egTimerInterval =
                        null;

                    egAddXP(25);

                    egRobotReact(
                        "🎉 Study session complete!"
                    );

                    alert(
                        "🎉 Study session completed!"
                    );

                    return;

                }

                egTimerSeconds--;

                egUpdateTimerDisplay();

            },
            1000
        );

}


function egPauseTimer() {

    clearInterval(
        egTimerInterval
    );

    egTimerInterval =
        null;

}


function egResetTimer() {

    egPauseTimer();

    egTimerSeconds =
        25 * 60;

    egUpdateTimerDisplay();

}


// =====================================================
// DAILY CHALLENGE
// =====================================================

function egDailyChallenge() {

    const box =
        document.getElementById(
            "egDailyChallengeBox"
        );

    if (!box) return;

    const topics = [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "General Knowledge"
    ];

    const topic =
        topics[
            new Date().getDate()
            %
            topics.length
        ];

    box.innerHTML =
        `
        <div class="eg-question-card">

            <h4>
                🧠 Today's Topic: ${topic}
            </h4>

            <p>
                Complete a quick AI quiz on
                <strong>${topic}</strong>
                to earn XP.
            </p>

            <button
                class="eg-primary-btn"
                onclick="
                    document.getElementById('egQuizTopic').value='${topic}';
                    window.egGenerateQuiz();
                "
            >
                🚀 Take Challenge
            </button>

        </div>
        `;

    egAddXP(5);

}


// =====================================================
// ANALYTICS
// =====================================================

function egRenderAnalytics() {

    const box =
        document.getElementById(
            "egAnalyticsBox"
        );

    if (!box) return;

    box.innerHTML = `
        <div class="eg-analytics-grid">

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.xp}
                </strong>
                XP
            </div>

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.quizzes}
                </strong>
                Quizzes
            </div>

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.correctAnswers}
                </strong>
                Correct
            </div>

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.notes.length}
                </strong>
                Notes
            </div>

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.streak}
                </strong>
                Day Streak
            </div>

            <div class="eg-analytics-box">
                <strong>
                    ${egUpgradeData.studyMinutes}
                </strong>
                Study Minutes
            </div>

        </div>
    `;

}


// =====================================================
// BADGES
// =====================================================

function egRenderBadges() {

    const box =
        document.getElementById(
            "egBadgeBox"
        );

    if (!box) return;

    const badges = [

        {
            icon: "🌱",
            name: "First Step",
            unlocked:
                egUpgradeData.xp >= 10
        },

        {
            icon: "🧠",
            name: "Quiz Starter",
            unlocked:
                egUpgradeData.quizzes >= 1
        },

        {
            icon: "📝",
            name: "Note Maker",
            unlocked:
                egUpgradeData.notes.length >= 1
        },

        {
            icon: "🔥",
            name: "3 Day Streak",
            unlocked:
                egUpgradeData.streak >= 3
        },

        {
            icon: "🏆",
            name: "Quiz Master",
            unlocked:
                egUpgradeData.quizzes >= 10
        },

        {
            icon: "⚡",
            name: "100 XP",
            unlocked:
                egUpgradeData.xp >= 100
        }

    ];

    box.innerHTML =
        badges
            .map(
                badge => `
                    <div class="eg-badge ${
                        badge.unlocked
                            ? ""
                            : "locked"
                    }">
                        ${
                            badge.icon
                        }
                        ${
                            badge.name
                        }
                        ${
                            badge.unlocked
                                ? " ✅"
                                : " 🔒"
                        }
                    </div>
                `
            )
            .join("");

    const unlocked =
        badges.filter(
            badge =>
                badge.unlocked
        ).length;

    const counter =
        document.getElementById(
            "egBadges"
        );

    if (counter) {
        counter.innerText =
            unlocked;
    }

}


// =====================================================
// GLOBAL SEARCH
// =====================================================

function egGlobalSearch() {

    const query =
        document.getElementById(
            "egGlobalSearch"
        )?.value
            .trim()
            .toLowerCase();

    const box =
        document.getElementById(
            "egSearchBox"
        );

    if (!box) return;

    if (!query) {

        box.innerHTML = "";

        return;

    }

    let results = [];

    egUpgradeData.notes.forEach(
        note => {

            if (
                note.title
                    .toLowerCase()
                    .includes(query) ||
                note.text
                    .toLowerCase()
                    .includes(query)
            ) {

                results.push(
                    `📝 <strong>${egEscape(
                        note.title
                    )}</strong>`
                );

            }

        }
    );

    if (
        typeof eduGenieChats !==
        "undefined"
    ) {

        eduGenieChats.forEach(
            chat => {

                if (
                    chat.title
                        ?.toLowerCase()
                        .includes(query)
                ) {

                    results.push(
                        `💬 <strong>${egEscape(
                            chat.title
                        )}</strong>`
                    );

                }

            }
        );

    }

    if (!results.length) {

        box.innerHTML =
            `<div class="eg-loading">
                No results found.
            </div>`;

        return;

    }

    box.innerHTML =
        results
            .map(
                item =>
                    `<div class="eg-search-item">
                        ${item}
                    </div>`
            )
            .join("");

}


// =====================================================
// VOICE READER
// =====================================================

function egSpeakText() {

    const text =
        document.getElementById(
            "egVoiceText"
        )?.value.trim();

    if (!text) {

        alert(
            "Enter some text first."
        );

        return;

    }

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Voice reading is not supported."
        );

        return;

    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    speech.lang =
        "en-IN";

    speech.rate =
        0.95;

    window.speechSynthesis.speak(
        speech
    );

}


function egStopVoice() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

}


// =====================================================
// ROBOT REACTION
// =====================================================

function egRobotReact(message) {

    if (
        typeof setRobotMessage ===
        "function"
    ) {

        setRobotMessage(
            message
        );

        setTimeout(
            () => {

                setRobotMessage(
                    "💡 Need help?"
                );

            },
            2500
        );

    }

}


// =====================================================
// HTML ESCAPE
// =====================================================

function egEscape(text) {

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
// UPGRADE UI
// =====================================================

function egUpdateUpgradeUI() {

    egUpdateStreak();

    const xp =
        document.getElementById(
            "egXP"
        );

    const streak =
        document.getElementById(
            "egStreak"
        );

    const notes =
        document.getElementById(
            "egNotesCount"
        );

    if (xp) {
        xp.innerText =
            egUpgradeData.xp;
    }

    if (streak) {
        streak.innerText =
            egUpgradeData.streak;
    }

    if (notes) {
        notes.innerText =
            egUpgradeData.notes.length;
    }

    egRenderAnalytics();

    egRenderBadges();

    egRenderNotes();

}


// =====================================================
// INITIALIZE UPGRADE CENTER
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        egLoadUpgradeData();

        egUpdateTimerDisplay();

        egUpdateUpgradeUI();

    }
);


// =====================================================
// MAKE UPGRADE FUNCTIONS AVAILABLE
// =====================================================

window.egGenerateQuiz =
    egGenerateQuiz;

window.egStartExam =
    egStartExam;

window.egGenerateFlashcards =
    egGenerateFlashcards;

window.egFlipFlashcard =
    egFlipFlashcard;

window.egNextFlashcard =
    egNextFlashcard;

window.egSaveNote =
    egSaveNote;

window.egDeleteNote =
    egDeleteNote;

window.egStartTimer =
    egStartTimer;

window.egPauseTimer =
    egPauseTimer;

window.egResetTimer =
    egResetTimer;

window.egDailyChallenge =
    egDailyChallenge;

window.egGlobalSearch =
    egGlobalSearch;

window.egSpeakText =
    egSpeakText;

window.egStopVoice =
    egStopVoice;

console.log(
    "🚀 EduGenie Upgrade Center loaded!"
);
console.log("🔥 EduGenie app.js FINISHED");

// =====================================================
// EDUGENIE AI LEARNING DASHBOARD
// ADD-ONLY
// =====================================================

function egUpdateLearningDashboard() {

    const data =
        typeof egUpgradeData !== "undefined"
            ? egUpgradeData
            : null;

    if (!data) return;


    // -------------------------------
    // BASIC STATISTICS
    // -------------------------------

    const xp =
        Number(data.xp || 0);

    const streak =
        Number(data.streak || 0);

    const quizzes =
        Number(data.quizzes || 0);

    const correct =
        Number(data.correctAnswers || 0);

    const notes =
        Array.isArray(data.notes)
            ? data.notes.length
            : 0;

    const minutes =
        Number(data.studyMinutes || 0);


    // -------------------------------
    // LEVEL
    // -------------------------------

    let level =
        "Beginner";

    let levelStart =
        0;

    let levelTarget =
        100;

    if (xp >= 1000) {

        level =
            "Master";

        levelStart =
            1000;

        levelTarget =
            1500;

    } else if (xp >= 500) {

        level =
            "Expert";

        levelStart =
            500;

        levelTarget =
            1000;

    } else if (xp >= 250) {

        level =
            "Advanced";

        levelStart =
            250;

        levelTarget =
            500;

    } else if (xp >= 100) {

        level =
            "Intermediate";

        levelStart =
            100;

        levelTarget =
            250;

    }


    const levelXP =
        xp - levelStart;

    const levelRange =
        levelTarget - levelStart;

    const progress =
        Math.min(
            100,
            Math.max(
                0,
                (levelXP / levelRange) * 100
            )
        );


    // -------------------------------
    // UPDATE ELEMENTS
    // -------------------------------

    const levelElement =
        document.getElementById(
            "egDashboardLevel"
        );

    const xpElement =
        document.getElementById(
            "egDashboardXP"
        );

    const progressElement =
        document.getElementById(
            "egDashboardProgress"
        );

    const progressText =
        document.getElementById(
            "egDashboardProgressText"
        );

    const streakElement =
        document.getElementById(
            "egDashboardStreak"
        );

    const quizzesElement =
        document.getElementById(
            "egDashboardQuizzes"
        );

    const correctElement =
        document.getElementById(
            "egDashboardCorrect"
        );

    const notesElement =
        document.getElementById(
            "egDashboardNotes"
        );

    const minutesElement =
        document.getElementById(
            "egDashboardMinutes"
        );

    const badgesElement =
        document.getElementById(
            "egDashboardBadges"
        );


    if (levelElement)
        levelElement.innerText =
            level;

    if (xpElement)
        xpElement.innerText =
            xp + " XP";

    if (progressElement)
        progressElement.style.width =
            progress + "%";

    if (progressText)
        progressText.innerText =
            `${Math.max(
                0,
                xp - levelStart
            )} / ${levelRange} XP`;

    if (streakElement)
        streakElement.innerText =
            streak;

    if (quizzesElement)
        quizzesElement.innerText =
            quizzes;

    if (correctElement)
        correctElement.innerText =
            correct;

    if (notesElement)
        notesElement.innerText =
            notes;

    if (minutesElement)
        minutesElement.innerText =
            minutes;


    // -------------------------------
    // BADGES
    // -------------------------------

    let badgeCount = 0;

    if (xp >= 10)
        badgeCount++;

    if (quizzes >= 1)
        badgeCount++;

    if (notes >= 1)
        badgeCount++;

    if (streak >= 3)
        badgeCount++;

    if (quizzes >= 10)
        badgeCount++;

    if (xp >= 100)
        badgeCount++;

    if (badgesElement)
        badgesElement.innerText =
            badgeCount;


    // -------------------------------
    // TODAY'S GOAL
    // -------------------------------

    const activities =
        Math.min(
            5,
            quizzes +
            notes +
            (minutes >= 25 ? 1 : 0)
        );

    const goalPercent =
        (activities / 5) * 100;

    const goalProgress =
        document.getElementById(
            "egGoalProgress"
        );

    const goalText =
        document.getElementById(
            "egGoalText"
        );

    const goalStatus =
        document.getElementById(
            "egGoalStatus"
        );

    if (goalProgress)
        goalProgress.style.width =
            goalPercent + "%";

    if (goalText)
        goalText.innerText =
            `${activities} / 5 Learning Activities`;

    if (goalStatus) {

        if (activities >= 5) {

            goalStatus.innerText =
                "🎉 Goal completed!";

        } else if (activities >= 3) {

            goalStatus.innerText =
                "🔥 Almost there!";

        } else if (activities >= 1) {

            goalStatus.innerText =
                "💪 Keep going!";

        } else {

            goalStatus.innerText =
                "🚀 Let's start!";

        }

    }


    // -------------------------------
    // AI ROBOT MESSAGE
    // -------------------------------

    const messageElement =
        document.getElementById(
            "egDashboardRobotMessage"
        );

    if (messageElement) {

        let message =
            "💡 Ready to learn something new?";

        if (xp >= 1000) {

            message =
                "🏆 Incredible! You're becoming a true EduGenie Master!";

        } else if (xp >= 500) {

            message =
                "🔥 Amazing progress! Keep pushing your learning level!";

        } else if (xp >= 250) {

            message =
                "🚀 You're making serious progress. Keep going!";

        } else if (quizzes >= 10) {

            message =
                "🧠 Quiz master in progress! Keep testing yourself.";

        } else if (streak >= 7) {

            message =
                "🔥 One week streak! Your consistency is awesome.";

        } else if (streak >= 3) {

            message =
                "💪 Great streak! Don't break it today.";

        } else if (notes >= 5) {

            message =
                "📝 Your notes are growing. Great study habit!";

        } else if (minutes >= 25) {

            message =
                "⏱️ Nice study session! Consistency beats intensity.";

        } else if (quizzes >= 1) {

            message =
                "🧠 Nice! You've started testing your knowledge.";

        }

        messageElement.innerText =
            message;

    }


    // -------------------------------
    // ACHIEVEMENT MESSAGE
    // -------------------------------

    const achievement =
        document.getElementById(
            "egDashboardAchievement"
        );

    if (achievement) {

        if (xp >= 1000) {

            achievement.innerText =
                "👑 Master Learner unlocked!";

        } else if (xp >= 500) {

            achievement.innerText =
                "🏆 Expert Learner unlocked!";

        } else if (xp >= 100) {

            achievement.innerText =
                "⚡ 100 XP milestone reached!";

        } else if (quizzes >= 1) {

            achievement.innerText =
                "🧠 Your first quiz journey has begun!";

        } else if (notes >= 1) {

            achievement.innerText =
                "📝 Your first study note is saved!";

        } else {

            achievement.innerText =
                "🌟 Start learning to unlock your first achievement!";

        }

    }

}


// =====================================================
// AUTOMATIC DASHBOARD REFRESH
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            egUpdateLearningDashboard,
            300
        );

    }
);


// Refresh whenever the page becomes active

window.addEventListener(
    "focus",
    function () {

        setTimeout(
            egUpdateLearningDashboard,
            200
        );

    }
);


// Refresh when EduGenie data changes

setInterval(
    function () {

        egUpdateLearningDashboard();

    },
    3000
);


// Make available globally

window.egUpdateLearningDashboard =
    egUpdateLearningDashboard;


console.log(
    "🤖 EduGenie AI Learning Dashboard loaded!"
);
// =====================================================
// EDUGENIE SMART ROBOT BRAIN
// ADD-ONLY
// =====================================================

let egRobotBubbleTimer = null;
let egRobotIdleTimer = null;


// -----------------------------------------------------
// SHOW ROBOT MESSAGE
// -----------------------------------------------------

function egSmartRobotMessage(message, duration = 3500) {

    const robot =
        document.getElementById(
            "egSmartRobot"
        );

    const bubble =
        document.getElementById(
            "egRobotBubble"
        );

    const icon =
        document.getElementById(
            "egRobotIcon"
        );

    if (!robot || !bubble) return;


    bubble.innerText =
        message;

    bubble.classList.add(
        "show"
    );


    clearTimeout(
        egRobotBubbleTimer
    );


    egRobotBubbleTimer =
        setTimeout(
            function () {

                bubble.classList.remove(
                    "show"
                );

            },
            duration
        );


    egRobotResetIdleTimer();
}


// -----------------------------------------------------
// ROBOT STATE
// -----------------------------------------------------

function egSmartRobotState(
    state
) {

    const robot =
        document.getElementById(
            "egSmartRobot"
        );

    const icon =
        document.getElementById(
            "egRobotIcon"
        );

    if (!robot) return;


    robot.classList.remove(
        "eg-thinking",
        "eg-happy",
        "eg-sleeping"
    );


    if (state === "thinking") {

        robot.classList.add(
            "eg-thinking"
        );

        if (icon)
            icon.innerText = "🤔";

    }


    else if (state === "happy") {

        robot.classList.add(
            "eg-happy"
        );

        if (icon)
            icon.innerText = "🎉";

    }


    else if (state === "sleeping") {

        robot.classList.add(
            "eg-sleeping"
        );

        if (icon)
            icon.innerText = "😴";

    }


    else {

        if (icon)
            icon.innerText = "💙";

    }

}


// -----------------------------------------------------
// ROBOT REACTION
// -----------------------------------------------------

function egSmartRobotReact(
    message,
    state = "happy"
) {

    egSmartRobotState(
        state
    );

    egSmartRobotMessage(
        message
    );

}


// -----------------------------------------------------
// ROBOT CLICK
// -----------------------------------------------------

function egRobotTap() {

    const messages = [

        "👋 Hey! Ready to learn?",

        "🧠 Ask me something!",

        "🚀 Let's increase your XP!",

        "📚 What are we studying today?",

        "✨ You've got this!",

        "🎯 One question at a time!"

    ];


    const message =
        messages[
            Math.floor(
                Math.random() *
                messages.length
            )
        ];


    egSmartRobotReact(
        message,
        "happy"
    );

}


// -----------------------------------------------------
// IDLE DETECTION
// -----------------------------------------------------

function egRobotResetIdleTimer() {

    clearTimeout(
        egRobotIdleTimer
    );


    egRobotIdleTimer =
        setTimeout(
            function () {

                egSmartRobotState(
                    "sleeping"
                );

                egSmartRobotMessage(
                    "😴 Still here when you're ready..."
                );

            },
            45000
        );

}


// -----------------------------------------------------
// USER ACTIVITY
// -----------------------------------------------------

[
    "click",
    "keydown",
    "mousemove",
    "touchstart",
    "scroll"
].forEach(
    eventName => {

        document.addEventListener(
            eventName,
            function () {

                const robot =
                    document.getElementById(
                        "egSmartRobot"
                    );

                if (
                    robot &&
                    robot.classList.contains(
                        "eg-sleeping"
                    )
                ) {

                    egSmartRobotState(
                        "normal"
                    );

                    egSmartRobotMessage(
                        "👋 Welcome back!"
                    );

                }

                egRobotResetIdleTimer();

            },
            {
                passive: true
            }
        );

    }
);


// -----------------------------------------------------
// ROBOT + XP
// -----------------------------------------------------

const egOriginalAddXP =
    typeof egAddXP === "function"
        ? egAddXP
        : null;

if (egOriginalAddXP) {

    window.egAddXP =
        function (amount) {

            egOriginalAddXP(
                amount
            );

            egSmartRobotReact(
                "⚡ +" +
                amount +
                " XP! Amazing!",
                "happy"
            );

        };

}


// -----------------------------------------------------
// ROBOT + DASHBOARD
// -----------------------------------------------------

const egOriginalDashboardUpdate =
    typeof egUpdateLearningDashboard ===
    "function"
        ? egUpdateLearningDashboard
        : null;

if (egOriginalDashboardUpdate) {

    window.egUpdateLearningDashboard =
        function () {

            egOriginalDashboardUpdate();

            const data =
                typeof egUpgradeData !==
                "undefined"
                    ? egUpgradeData
                    : null;

            if (!data) return;

            if (
                Number(data.xp || 0) >=
                100
            ) {

                egSmartRobotMessage(
                    "🏆 100 XP! You're doing amazing!"
                );

            }

        };

}


// -----------------------------------------------------
// ROBOT + QUIZ
// -----------------------------------------------------

const egOriginalGenerateQuiz =
    typeof egGenerateQuiz === "function"
        ? egGenerateQuiz
        : null;

if (egOriginalGenerateQuiz) {

    window.egGenerateQuiz =
        async function () {

            egSmartRobotReact(
                "🤔 Creating your AI quiz...",
                "thinking"
            );

            try {

                const result =
                    await egOriginalGenerateQuiz();

                egSmartRobotReact(
                    "🧠 Your quiz is ready!",
                    "happy"
                );

                return result;

            } catch (error) {

                egSmartRobotReact(
                    "💙 Something went wrong. Try again!",
                    "normal"
                );

                throw error;

            }

        };

}


// -----------------------------------------------------
// ROBOT + FLASHCARDS
// -----------------------------------------------------

const egOriginalFlashcards =
    typeof egGenerateFlashcards ===
    "function"
        ? egGenerateFlashcards
        : null;

if (egOriginalFlashcards) {

    window.egGenerateFlashcards =
        function () {

            egSmartRobotReact(
                "🧩 Making your flashcards...",
                "thinking"
            );

            return egOriginalFlashcards();

        };

}


// -----------------------------------------------------
// INITIAL ROBOT
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                egSmartRobotMessage(
                    "👋 Hi! I'm your EduGenie companion!",
                    4500
                );

                egRobotResetIdleTimer();

            },
            1000
        );

    }
);


// -----------------------------------------------------
// GLOBAL ACCESS
// -----------------------------------------------------

window.egSmartRobotMessage =
    egSmartRobotMessage;

window.egSmartRobotReact =
    egSmartRobotReact;

window.egSmartRobotState =
    egSmartRobotState;

window.egRobotTap =
    egRobotTap;

console.log(
    "🤖 EduGenie Smart Robot Brain loaded!"
);
// =====================================================
// CONNECT SMART REACTIONS TO ORIGINAL ROBOT
// ADD-ONLY
// =====================================================

function egOriginalRobotReact(message, state = "normal") {

    const robot =
        document.getElementById("robotRoamer");

    if (!robot) return;


    // Use the existing robot message system
    if (typeof setRobotMessage === "function") {
        setRobotMessage(message);
    }


    // Existing robot thinking animation
    if (state === "thinking") {
        robot.classList.add("thinking-mode");
    } else {
        robot.classList.remove("thinking-mode");
    }


    // Small reaction animation
    robot.style.transform = "scale(1.08)";

    setTimeout(function () {

        robot.style.transform = "";

    }, 350);
}


// Make existing robot react to important actions
window.egOriginalRobotReact =
    egOriginalRobotReact;


// Initial welcome
document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(function () {

            egOriginalRobotReact(
                "👋 Hi! Ready to learn?"
            );

        }, 1200);

    }
);


// Robot click
const originalRobot =
    document.getElementById("robotRoamer");

if (originalRobot) {

    originalRobot.addEventListener(
        "click",
        function () {

            const messages = [
                "🧠 Ask me something!",
                "📚 Let's learn!",
                "🚀 Ready for a challenge?",
                "✨ You've got this!",
                "🎯 One step at a time!"
            ];

            const message =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];

            egOriginalRobotReact(
                message,
                "happy"
            );

        }
    );

}


console.log(
    "🤖 Original EduGenie robot upgraded!"
);
// =====================================================
// EDUGENIE SETTINGS ENGINE
// ADD-ONLY
// =====================================================

const EG_SETTINGS_STORAGE =
    "eduGenieSettings";

let egSettings = {
    theme: "dark",
    sound: true,
    robot: true,
    animations: true,
    notifications: true
};


// -----------------------------------------------------
// LOAD SETTINGS
// -----------------------------------------------------

function egLoadSettings() {

    try {

        const saved =
            localStorage.getItem(
                EG_SETTINGS_STORAGE
            );

        if (saved) {

            egSettings = {
                ...egSettings,
                ...JSON.parse(saved)
            };

        }

    } catch (error) {

        console.error(
            "EduGenie settings error:",
            error
        );

    }

}


// -----------------------------------------------------
// APPLY SETTINGS
// -----------------------------------------------------

function egApplySettings() {

    // Theme
    document.body.classList.toggle(
        "eg-light-theme",
        egSettings.theme === "light"
    );


    // Robot
    const robot =
        document.getElementById(
            "robotRoamer"
        );

    if (robot) {

        robot.style.display =
            egSettings.robot
                ? ""
                : "none";

    }


    // Animations
    document.body.classList.toggle(
        "eg-no-animations",
        !egSettings.animations
    );


    // Update controls
    const theme =
        document.getElementById(
            "egThemeSetting"
        );

    const sound =
        document.getElementById(
            "egSoundSetting"
        );

    const robotSetting =
        document.getElementById(
            "egRobotSetting"
        );

    const animations =
        document.getElementById(
            "egAnimationSetting"
        );

    const notifications =
        document.getElementById(
            "egNotificationSetting"
        );


    if (theme)
        theme.value =
            egSettings.theme;

    if (sound)
        sound.checked =
            egSettings.sound;

    if (robotSetting)
        robotSetting.checked =
            egSettings.robot;

    if (animations)
        animations.checked =
            egSettings.animations;

    if (notifications)
        notifications.checked =
            egSettings.notifications;

}


// -----------------------------------------------------
// SAVE SETTINGS
// -----------------------------------------------------

function egSaveSettings() {

    const theme =
        document.getElementById(
            "egThemeSetting"
        );

    const sound =
        document.getElementById(
            "egSoundSetting"
        );

    const robot =
        document.getElementById(
            "egRobotSetting"
        );

    const animations =
        document.getElementById(
            "egAnimationSetting"
        );

    const notifications =
        document.getElementById(
            "egNotificationSetting"
        );


    egSettings.theme =
        theme?.value ||
        "dark";

    egSettings.sound =
        sound?.checked ??
        true;

    egSettings.robot =
        robot?.checked ??
        true;

    egSettings.animations =
        animations?.checked ??
        true;

    egSettings.notifications =
        notifications?.checked ??
        true;


    try {

        localStorage.setItem(
            EG_SETTINGS_STORAGE,
            JSON.stringify(
                egSettings
            )
        );

    } catch (error) {

        console.error(
            "Could not save settings:",
            error
        );

    }


    egApplySettings();


    const message =
        document.getElementById(
            "egSettingsMessage"
        );

    if (message) {

        message.innerText =
            "✅ Preferences saved!";

        setTimeout(
            function () {

                message.innerText =
                    "";

            },
            2500
        );

    }


    if (
        typeof setRobotMessage ===
        "function" &&
        egSettings.robot
    ) {

        setRobotMessage(
            "⚙️ Settings saved!"
        );

    }

}


// -----------------------------------------------------
// LIGHT THEME
// -----------------------------------------------------

function egApplyLightTheme() {

    const styleId =
        "egLightThemeStyle";

    if (
        document.getElementById(
            styleId
        )
    ) return;


    const style =
        document.createElement(
            "style"
        );

    style.id =
        styleId;

    style.innerHTML = `
        body.eg-light-theme {
            background:
                linear-gradient(
                    145deg,
                    #eef8ff,
                    #dceef8
                ) !important;
            color: #17324a !important;
        }

        body.eg-light-theme .eg-card,
        body.eg-light-theme .eg-dashboard-card,
        body.eg-light-theme .eg-settings-card,
        body.eg-light-theme .eg-progress-card {
            background:
                rgba(255,255,255,.85) !important;
            border-color:
                rgba(40,140,190,.2) !important;
        }

        body.eg-light-theme h1,
        body.eg-light-theme h2,
        body.eg-light-theme h3,
        body.eg-light-theme h4,
        body.eg-light-theme strong {
            color: #17324a !important;
        }

        body.eg-light-theme p,
        body.eg-light-theme small {
            color: #54748b !important;
        }
    `;

    document.head.appendChild(
        style
    );

}


// -----------------------------------------------------
// NO ANIMATIONS MODE
// -----------------------------------------------------

function egApplyAnimationSetting() {

    const styleId =
        "egNoAnimationsStyle";

    let style =
        document.getElementById(
            styleId
        );


    if (!style) {

        style =
            document.createElement(
                "style"
            );

        style.id =
            styleId;

        document.head.appendChild(
            style
        );

    }


    style.innerHTML =
        egSettings.animations
            ? ""
            : `
                *,
                *::before,
                *::after {
                    animation-duration:
                        0.01ms !important;

                    animation-iteration-count:
                        1 !important;

                    transition:
                        none !important;
                }
            `;

}


// -----------------------------------------------------
// UPDATED APPLY
// -----------------------------------------------------

function egApplyAllSettings() {

    egApplyLightTheme();

    egApplySettings();

    egApplyAnimationSetting();

}


// -----------------------------------------------------
// PAGE LOAD
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        egLoadSettings();

        setTimeout(
            egApplyAllSettings,
            300
        );

    }
);


// -----------------------------------------------------
// GLOBAL ACCESS
// -----------------------------------------------------

window.egSaveSettings =
    egSaveSettings;

window.egLoadSettings =
    egLoadSettings;

window.egApplySettings =
    egApplySettings;


console.log(
    "⚙️ EduGenie Settings loaded!"
);
// =====================================================
// SEPARATE SETTINGS PAGE
// =====================================================

function openSettingsPage() {

    const page =
        document.getElementById("egSettingsPage");

    const settings =
        document.getElementById("egSettings");

    const container =
        document.getElementById("egSettingsPageContent");

    if (!page || !settings || !container) {

        console.error(
            "EduGenie: Settings page elements missing."
        );

        return;
    }

    // Move existing settings section into the page
    if (settings.parentNode !== container) {
        container.appendChild(settings);
    }

    page.hidden = false;
    page.removeAttribute("hidden");
    page.style.display = "block";

    document.body.style.overflow = "hidden";

    // Make sure saved settings are applied
    if (typeof egLoadSettings === "function") {
        egLoadSettings();
    }

    if (typeof egApplyAllSettings === "function") {
        egApplyAllSettings();
    }

    if (typeof setRobotMessage === "function") {
        setRobotMessage("⚙️ Welcome to Settings!");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function closeSettingsPage() {

    const page =
        document.getElementById("egSettingsPage");

    if (!page) return;

    page.hidden = true;
    page.setAttribute("hidden", "");
    page.style.display = "none";

    document.body.style.overflow = "";

    if (typeof setRobotMessage === "function") {
        setRobotMessage("💡 Need help?");
    }
}


// Make functions available to HTML
window.openSettingsPage =
    openSettingsPage;

window.closeSettingsPage =
    closeSettingsPage;

console.log(
    "⚙️ EduGenie Separate Settings Page loaded!"
);

// =====================================================
// 🤖 EDUGENIE ROBOT ACTION SYSTEM
// ADD TO THE VERY BOTTOM OF app.js
// =====================================================

function egRobotAction(action) {

    const robot =
        document.getElementById("robotRoamer");

    if (!robot) return;


    // Remove previous action classes
    robot.classList.remove(
        "robot-thinking",
        "robot-waving",
        "robot-happy",
        "robot-walking"
    );


    // Apply new action
    if (action === "thinking") {

        robot.classList.add(
            "robot-thinking"
        );

    }


    if (action === "wave") {

        robot.classList.add(
            "robot-waving"
        );

    }


    if (action === "happy") {

        robot.classList.add(
            "robot-happy"
        );

    }


    if (action === "walking") {

        robot.classList.add(
            "robot-walking"
        );

    }


    // Automatically return to idle
    if (action !== "idle") {

        setTimeout(function () {

            robot.classList.remove(
                "robot-thinking",
                "robot-waving",
                "robot-happy",
                "robot-walking"
            );

        }, 1800);

    }

}


// =====================================================
// 👋 GREETING
// =====================================================

function egRobotGreeting() {

    egRobotAction("wave");

    if (typeof setRobotMessage === "function") {

        setRobotMessage(
            "👋 Hi! Ready to learn?"
        );

    }

}


// =====================================================
// 🧠 THINKING
// =====================================================

function egRobotThinking() {

    egRobotAction("thinking");

    if (typeof setRobotMessage === "function") {

        setRobotMessage(
            "🧠 Thinking..."
        );

    }

}


// =====================================================
// 🎉 HAPPY
// =====================================================

function egRobotHappy() {

    egRobotAction("happy");

    if (typeof setRobotMessage === "function") {

        setRobotMessage(
            "🎉 Here's your answer!"
        );

    }

}


// =====================================================
// 🚶 WALKING
// =====================================================

function egRobotWalking() {

    egRobotAction("walking");

}


// =====================================================
// MAKE AVAILABLE TO OTHER CODE
// =====================================================

window.egRobotAction =
    egRobotAction;

window.egRobotGreeting =
    egRobotGreeting;

window.egRobotThinking =
    egRobotThinking;

window.egRobotHappy =
    egRobotHappy;

window.egRobotWalking =
    egRobotWalking;


// =====================================================
// 👋 STARTUP GREETING
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(function () {

            egRobotGreeting();

        }, 1200);

    }
);


console.log(
    "🤖 EduGenie Robot Action System loaded!"
);
// =====================================================
// EDUGENIE LOGIN / REGISTER
// STEP 3C - AUTHENTICATION
// ADD-ONLY
// =====================================================

const AUTH_API_URL =
    "https://edugenie-1-g40s.onrender.com";


// =====================================================
// OPEN LOGIN
// =====================================================

function openAuthPage() {

    const overlay =
        document.getElementById("authOverlay");

    if (!overlay) return;

    overlay.hidden = false;

    showLoginForm();

}


// =====================================================
// CLOSE LOGIN
// =====================================================

function closeAuthPage() {

    const overlay =
        document.getElementById("authOverlay");

    if (!overlay) return;

    overlay.hidden = true;

}


// =====================================================
// SHOW LOGIN FORM
// =====================================================

function showLoginForm() {

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const title =
        document.getElementById("authTitle");

    const subtitle =
        document.getElementById("authSubtitle");

    const message =
        document.getElementById("authMessage");


    if (loginForm) {

        loginForm.hidden = false;

    }


    if (registerForm) {

        registerForm.hidden = true;

    }


    if (title) {

        title.innerText =
            "Welcome to EduGenie";

    }


    if (subtitle) {

        subtitle.innerText =
            "Login to save your learning progress.";

    }


    if (message) {

        message.innerText = "";

    }

}


// =====================================================
// SHOW REGISTER FORM
// =====================================================

function showRegisterForm() {

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const title =
        document.getElementById("authTitle");

    const subtitle =
        document.getElementById("authSubtitle");

    const message =
        document.getElementById("authMessage");


    if (loginForm) {

        loginForm.hidden = true;

    }


    if (registerForm) {

        registerForm.hidden = false;

    }


    if (title) {

        title.innerText =
            "Create your EduGenie Account";

    }


    if (subtitle) {

        subtitle.innerText =
            "Save your learning progress across devices.";

    }


    if (message) {

        message.innerText = "";

    }

}


// =====================================================
// AUTH MESSAGE
// =====================================================

function showAuthMessage(
    message,
    type = "normal"
) {

    const messageBox =
        document.getElementById(
            "authMessage"
        );


    if (!messageBox) return;


    messageBox.innerText =
        message;


    if (type === "error") {

        messageBox.style.color =
            "#ff8c9b";

    } else if (type === "success") {

        messageBox.style.color =
            "#6ff0b0";

    } else {

        messageBox.style.color =
            "#72d8ff";

    }

}


// =====================================================
// REGISTER STUDENT
// =====================================================

async function eduGenieRegister() {

    const nameInput =
        document.getElementById(
            "registerName"
        );

    const emailInput =
        document.getElementById(
            "registerEmail"
        );

    const passwordInput =
        document.getElementById(
            "registerPassword"
        );


    if (
        !nameInput ||
        !emailInput ||
        !passwordInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!name) {

        showAuthMessage(
            "⚠️ Please enter your name.",
            "error"
        );

        nameInput.focus();

        return;

    }


    if (!email) {

        showAuthMessage(
            "⚠️ Please enter your email.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (password.length < 6) {

        showAuthMessage(
            "⚠️ Password must contain at least 6 characters.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    showAuthMessage(
        "⏳ Creating your account..."
    );


    try {

        const response =
            await fetch(
                AUTH_API_URL + "/register",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name:
                            name,

                        email:
                            email,

                        password:
                            password

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            showAuthMessage(
                "❌ " +
                (
                    data.message ||
                    "Unable to create account."
                ),
                "error"
            );

            return;

        }


        showAuthMessage(
            "✅ Account created! You can now login.",
            "success"
        );


        passwordInput.value = "";


        setTimeout(
            () => {

                showLoginForm();

                if (emailInput) {

                    const loginEmail =
                        document.getElementById(
                            "loginEmail"
                        );

                    if (loginEmail) {

                        loginEmail.value =
                            email;

                    }

                }

            },
            1200
        );


    } catch (error) {

        console.error(
            "EduGenie Registration Error:",
            error
        );


        showAuthMessage(
            "❌ Unable to connect to EduGenie server. Please try again.",
            "error"
        );

    }

}


// =====================================================
// LOGIN STUDENT
// =====================================================

async function eduGenieLogin() {

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        return;

    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email) {

        showAuthMessage(
            "⚠️ Please enter your email.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (!password) {

        showAuthMessage(
            "⚠️ Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    showAuthMessage(
        "⏳ Logging you in..."
    );


    try {

        const response =
            await fetch(
                AUTH_API_URL + "/login",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email:
                            email,

                        password:
                            password

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            showAuthMessage(
                "❌ " +
                (
                    data.message ||
                    "Invalid email or password."
                ),
                "error"
            );

            return;

        }


        // Save logged-in student
        localStorage.setItem(
            "eduGenieLoggedIn",
            "true"
        );


        localStorage.setItem(
            "eduGenieStudent",
            JSON.stringify(
                data.student
            )
        );


        showAuthMessage(
            "✅ Login successful!",
            "success"
        );


        passwordInput.value = "";


        updateLoggedInStudentUI(
            data.student
        );

        updateEduGenieNavbarAuth();

        setTimeout(
            () => {

                closeAuthPage();

                setRobotMessage(
                    "👋 Welcome back!"
                );

            },
            900
        );


    } catch (error) {

        console.error(
            "EduGenie Login Error:",
            error
        );


        showAuthMessage(
            "❌ Unable to connect to EduGenie server. Please try again.",
            "error"
        );

    }

}


// =====================================================
// CHECK LOGIN
// =====================================================

function isEduGenieLoggedIn() {

    return (
        localStorage.getItem(
            "eduGenieLoggedIn"
        ) === "true"
    );

}


// =====================================================
// GET LOGGED-IN STUDENT
// =====================================================

function getEduGenieStudent() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "eduGenieStudent"
            )
        );

    } catch (error) {

        return null;

    }

}


// =====================================================
// UPDATE UI AFTER LOGIN
// =====================================================

function updateLoggedInStudentUI(
    student
) {

    if (!student) return;


    // Update common profile name
    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.innerText =
            student.name ||
            "Student";

    }


    // Update profile email
    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (profileEmail) {

        profileEmail.innerText =
            student.email ||
            "Not added";

    }


    // Update local profile
    if (
        typeof studentProfile !==
        "undefined"
    ) {

        studentProfile.name =
            student.name ||
            studentProfile.name;

        studentProfile.email =
            student.email ||
            studentProfile.email;


        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(
                studentProfile
            )
        );

    }


    if (
        typeof loadProfile ===
        "function"
    ) {

        loadProfile();

    }

}


// =====================================================
// LOGOUT
// =====================================================

function eduGenieLogout() {

    const student =
        getEduGenieStudent();


    localStorage.removeItem(
        "eduGenieLoggedIn"
    );


    localStorage.removeItem(
        "eduGenieStudent"
    );

    updateEduGenieNavbarAuth();
    
    setRobotMessage(
        "👋 See you again!"
    );


    showAuthMessage(
        "You have been logged out."
    );


    console.log(
        "EduGenie logged out:",
        student
    );

}


// =====================================================
// AUTH UI ON PAGE LOAD
// =====================================================

function initializeEduGenieAuth() {

    const student =
        getEduGenieStudent();


    if (
        isEduGenieLoggedIn() &&
        student
    ) {

        updateLoggedInStudentUI(
            student
        );

    }

}


// =====================================================
// MAKE AUTH FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.openAuthPage =
    openAuthPage;

window.closeAuthPage =
    closeAuthPage;

window.showLoginForm =
    showLoginForm;

window.showRegisterForm =
    showRegisterForm;

window.eduGenieLogin =
    eduGenieLogin;

window.eduGenieRegister =
    eduGenieRegister;

window.eduGenieLogout =
    eduGenieLogout;

window.isEduGenieLoggedIn =
    isEduGenieLoggedIn;

window.getEduGenieStudent =
    getEduGenieStudent;


// =====================================================
// START AUTH
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeEduGenieAuth();

    }
);
// =====================================================
// EDUGENIE NAVBAR LOGIN / LOGOUT FIX
// ADD-ONLY
// =====================================================

function updateEduGenieNavbarAuth() {

    const loginNav =
        document.getElementById("eduGenieLoginNav");

    if (!loginNav) return;

    const loggedIn =
        isEduGenieLoggedIn();

    if (loggedIn) {

        const student =
            getEduGenieStudent();

        loginNav.innerHTML =
            "👤 " +
            (student?.name || "Student") +
            " · Logout";

        loginNav.onclick =
            function (event) {

                event.preventDefault();

                eduGenieLogout();

                updateEduGenieNavbarAuth();

            };

    } else {

        loginNav.innerHTML =
            "🔐 Login";

        loginNav.onclick =
            function (event) {

                event.preventDefault();

                openAuthPage();

            };

    }
}


// Update navbar after page loads
document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateEduGenieNavbarAuth();

    }
);




