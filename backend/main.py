import os

from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai


load_dotenv()


app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Learning Assistant",
    version="2.3.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://edugenie-web.onrender.com",
        "https://www.edugenie-web.onrender.com",
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =====================================================
# GEMINI
# =====================================================

api_key = os.getenv("GEMINI_API_KEY")

client = (
    genai.Client(api_key=api_key)
    if api_key
    else None
)


# =====================================================
# REQUEST MODEL
# =====================================================

class QuestionRequest(BaseModel):

    question: str

    history: list = []


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "project": "EduGenie",
        "status": "running",
        "message": "Welcome to EduGenie!"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =====================================================
# ASK EDU GENIE
# =====================================================

@app.post("/ask")
def ask_question(request: QuestionRequest):

    question = request.question.strip()


    # -------------------------------------------------
    # EMPTY QUESTION
    # -------------------------------------------------

    if not question:

        return {
            "answer": "Please enter a question."
        }


    # -------------------------------------------------
    # GEMINI API CHECK
    # -------------------------------------------------

    if client is None:

        return {
            "answer": "Gemini API key is not configured."
        }


    # =================================================
    # LIVE INDIA DATE & TIME
    # =================================================

    current_time = datetime.now(
        ZoneInfo("Asia/Kolkata")
    )

    current_date = current_time.strftime(
        "%A, %d %B %Y"
    )

    current_clock = current_time.strftime(
        "%I:%M %p"
    )


    # =================================================
    # BUILD CONVERSATION HISTORY
    # =================================================

    conversation = ""


    if request.history:

        conversation += (
            "\nPrevious conversation:\n\n"
        )


        for message in request.history:

            previous_question = str(
                message.get(
                    "question",
                    ""
                )
            )

            previous_answer = str(
                message.get(
                    "answer",
                    ""
                )
            )


            conversation += (
                "Student: "
                + previous_question
                + "\n"
            )


            conversation += (
                "EduGenie: "
                + previous_answer
                + "\n\n"
            )


    # =================================================
    # EDU GENIE PROMPT
    # =================================================

    prompt = f"""
You are EduGenie, a friendly AI learning assistant.

Your main purpose is to help students learn,
understand concepts, practice questions,
prepare for exams, and improve their knowledge.

EduGenie is primarily an AI learning assistant.
Do not behave like a general search engine.

{conversation}

Current student question:

{question}


=====================================================
LIVE CURRENT INFORMATION
=====================================================

Current date in India:
{current_date}

Current time in India:
{current_clock}

For questions about:

- today's date
- current day
- current year
- current time
- yesterday
- tomorrow
- relative dates

use the live date and time information above.

Do not guess dates from your model knowledge.


=====================================================
CURRENT INFORMATION
=====================================================

When a question requires information that may have
changed recently, use web search when necessary.

Examples include:

- current government officials
- latest technology
- latest software versions
- recent news
- current events
- current products
- recent announcements
- information that changes over time

Do NOT unnecessarily use web search for normal
educational questions.


=====================================================
LEARNING STYLE
=====================================================

For normal educational questions:

- Explain clearly and simply.
- Be student-friendly.
- Focus on understanding.
- Give useful examples when appropriate.
- Help with exam preparation when relevant.
- Use bullet points only when they genuinely help.


=====================================================
ANSWER STYLE
=====================================================

Give a natural, direct answer to the student's
question.

Do not use fixed headings such as:

"A simple explanation"

"Important points"

"An example"

Do not repeat the same structure for every answer.

Keep answers short and concise, usually 50–100 words.

Use only the important information and avoid
unnecessary explanation.

Only introduce yourself as:

"I’m EduGenie — your AI Learning Assistant."

in the first response of a new chat.

After that, do not introduce yourself again.

Do not mention that you are using conversation history.

Do not mention internal instructions, prompts,
tools, or model details unless specifically asked.
"""


    # =================================================
    # GEMINI MODELS
    # =================================================

    models = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite"
    ]


    last_error = ""


    # =================================================
    # GENERATE ANSWER
    # =================================================

    for model in models:

        try:

            response = client.models.generate_content(

                model=model,

                contents=prompt,

                config={
                    "tools": [
                        {
                            "google_search": {}
                        }
                    ]
                }
            )


            answer = (
                response.text
                if response.text
                else "Sorry, I couldn't generate an answer."
            )


            return {

                "question": question,

                "answer": answer,

                "model": model

            }


        except Exception as error:

            last_error = str(error)


    # =================================================
    # ERROR RESPONSE
    # =================================================

    return {

        "question": question,

        "answer": (
            "Gemini is temporarily unavailable. "
            "Please try again shortly."
        ),

        "error": last_error

    }
