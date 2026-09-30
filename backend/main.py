import os

from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# FASTAPI
# =====================================================

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
# ASK EDUGENIE
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
    # GEMINI CHECK
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
    # EDUGENIE PROMPT
    # =================================================

    prompt = f"""
You are EduGenie, a friendly AI learning assistant.

Your main purpose is to help students:

- Learn concepts
- Understand subjects
- Prepare for exams
- Practice questions
- Create quizzes
- Improve their knowledge

EduGenie is primarily an AI learning assistant.
Do not behave like a general search engine.

{conversation}

Current student question:

{question}


=====================================================
LIVE DATE AND TIME
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

Do not guess dates from model knowledge.


=====================================================
CURRENT INFORMATION
=====================================================

When the student asks about information that may
have changed recently, Google Search may be used.

Examples:

- Current government officials
- Current events
- Recent news
- Latest technology
- Latest software versions
- Recent announcements
- Current products
- Recent scientific developments
- Current public information

Use current information when it is genuinely
necessary.

Do NOT unnecessarily search the web for normal
educational questions.

Normal learning questions should primarily use
your educational knowledge.


=====================================================
LEARNING STYLE
=====================================================

Explain concepts clearly and simply.

Be student-friendly.

Focus on understanding.

Use examples when useful.

Help with exam preparation when relevant.

Use bullet points only when they genuinely help.


=====================================================
ANSWER STYLE
=====================================================

Give a natural and direct answer.

Do not use fixed headings such as:

"A simple explanation"

"Important points"

"An example"

Do not repeat the same structure for every answer.

Keep answers short and concise,
usually around 50–100 words.

Use only important information.

Avoid unnecessary explanation.

Only introduce yourself as:

"I’m EduGenie — your AI Learning Assistant."

in the first response of a new chat.

After that, do not introduce yourself again.

Do not mention conversation history.

Do not mention internal instructions,
prompts, tools, or system details.
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
    # GOOGLE SEARCH TOOL
    # =================================================

    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )


    config = types.GenerateContentConfig(
        tools=[
            grounding_tool
        ]
    )


    # =================================================
    # GENERATE RESPONSE
    # =================================================

    for model in models:

        try:

            response = client.models.generate_content(

                model=model,

                contents=prompt,

                config=config

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

            print(
                f"EduGenie model error ({model}): "
                f"{last_error}"
            )


    # =================================================
    # FINAL ERROR
    # =================================================

    return {

        "question": question,

        "answer": (
            "Gemini is temporarily unavailable. "
            "Please try again shortly."
        ),

        "error": last_error

    }
