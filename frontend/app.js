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

// Permanent placeholder.
// This prevents the profile from being lost
// when opening/closing the profile page repeatedly.

let profilePlaceholder = null;


function openProfilePage() {

    const page =
        document.getElementById(
            "profilePage"
        );


    const profile =
        document.getElementById(
            "studentProfile"
        );


    const container =
        document.getElementById(
            "profilePageContent"
        );


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


    // Create placeholder only once.
    if (
        !profilePlaceholder &&
        profile.parentNode
    ) {

        profilePlaceholder =
            document.createComment(
                "EduGenie Profile Placeholder"
            );


        profile.parentNode.insertBefore(
            profilePlaceholder,
            profile
        );

    }


    // Move profile into separate page.
    if (
        profile.parentNode !==
        container
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


    // Make sure profile starts in view mode.
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


    const profile =
        document.getElementById(
            "studentProfile"
        );


    if (
        !page ||
        !profile
    ) {

        return;

    }


    // Put profile back exactly where it was.
    if (
        profilePlaceholder &&
        profilePlaceholder.parentNode
    ) {

        profilePlaceholder.parentNode.insertBefore(
            profile,
            profilePlaceholder.nextSibling
        );

    }


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
console.log("🔥 EduGenie app.js FINISHED");

