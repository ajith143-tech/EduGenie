🤖 EduGenie — AI Learning Assistant

🚀 Google Gemini Powered Learning Platform

EduGenie is a web-based AI learning assistant designed to help students Ask, Learn, Practice, Revise, and Grow from one interactive platform.

It combines Generative AI with useful academic tools such as AI Chat, Smart Notes, Quizzes, Flashcards, Exam Mode, Study Timer, Learning Analytics, and more.

---

✨ Features

- 🤖 AI Learning Chat — Ask academic questions and get AI-powered explanations.

- 📝 Smart Notes — Create, save, search, and manage study notes.

- 🧠 AI Quiz Arena — Practice with AI-generated questions.

- 🃏 AI Flashcards — Create flashcards for quick revision.

- 🎯 Exam Mode — Practice in an exam-style environment.

- ⏱️ Study Timer — Maintain focused study sessions.

- 📊 Learning Analytics — Track learning activity and progress.

- 🏆 XP, Streaks & Achievements — Stay motivated while learning.

- 🎤 Voice Input & Reader — Support hands-free learning.

- 👤 Student Profile — Manage student information and statistics.

- 🔍 EduGenie Search — Find saved learning content and conversations.

---

🛠️ Technologies Used

Technology| Purpose:

HTML5| Website structure

CSS3| UI design and animations

JavaScript| Frontend functionality

Python| Backend development

FastAPI| REST API

Google Gemini API| Generative AI

GitHub| Version control

Render| Deployment

---

🏗️ System Architecture

┌─────────────────────────────┐
│        Student/User         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      EduGenie Frontend      │
│       HTML / CSS / JS       │
└──────────────┬──────────────┘
               │
               │ HTTPS API
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│          Python             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Google Gemini API      │
│       Generative AI         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       AI Generated Answer   │
└─────────────────────────────┘

---

📂 Project Structure

EduGenie/
│
├── index.html
├── style.css
├── app.js
│
├── main.py
├── requirements.txt
├── .env
│
└── README.md

«🔐 Never commit your Gemini API key to GitHub. Store it securely using environment variables.»

---

⚙️ How It Works

1. Student opens EduGenie.
2. Student enters an academic question.
3. The frontend sends the question to the FastAPI backend.
4. The backend communicates with Google Gemini.
5. Gemini generates the response.
6. EduGenie displays the answer.
7. Learning activity can be tracked through the platform.

---

🚀 Getting Started

1. Clone the Repository

git clone https://github.com/ajith143-tech/EduGenie.git

2. Open the Project

cd EduGenie

3. Install Dependencies

pip install -r requirements.txt

4. Configure Environment Variables

Create a ".env" file:

GEMINI_API_KEY=your_api_key_here

5. Run the Backend

uvicorn main:app --reload

6. Run the Frontend

Open "index.html" using a local development server such as VS Code Live Server.

---

🌐 Deployment

- GitHub: Source code management
- Render: Web/API deployment
- Google Gemini API: AI processing

🔗 Project Links

GitHub:
https://github.com/ajith143-tech/EduGenie

Live Website:
https://edugenie-web.onrender.com/

Backend API:
https://edugenie-1-g40s.onrender.com/

---

👥 Team Members

Name| Role
Ajith| 👑 Team Leader

Perumal Raja| 👨‍💻 Team Member

Sridhar| 👨‍💻 Team Member

Kishore| 👨‍💻 Team Member

Sowmiya| 👩‍💻 Team Member


🚀 Team — EduGenie

Together we Ask • Learn • Practice • Revise • Grow

---

🎯 Project Objective

The main objective of EduGenie is to create a centralized AI-powered learning environment where students can access academic assistance and study tools from a single platform.

       ASK
        ↓
      LEARN
        ↓
    PRACTICE
        ↓
      REVISE
        ↓
      TRACK
        ↓
      GROW 🚀

---

🔮 Future Scope

- 📷 Image-based question solving
- 📚 Personalized study plans
- 🌐 Multilingual learning
- 📊 Advanced learning analytics
- 📱 Mobile application
- 🎙️ Improved voice interaction
- 🤝 Collaborative learning features

---

👨‍💻 Project

EduGenie — Google Gemini Powered AI Learning Assistant

Built as an academic project to explore the use of Generative AI in student learning and education.

❤️ Built With

HTML • CSS • JavaScript • Python • FastAPI • Google Gemini

---

📜 License

This project is created for educational and academic purposes.