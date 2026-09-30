import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai


load_dotenv()


app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Learning Assistant",
    version="2.2.0"
)


# ---------- CORS ----------

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


# ---------- GEMINI ----------

api_key = os.getenv("GEMINI_API_KEY")

client = (
    genai.Client(api_key=api_key)
    if api_key
    else None
)


# ---------- REQUEST MODEL ----------

class QuestionRequest(BaseModel):
    question: str
    history: list = []


# ---------- HOME ----------

@app.get("/")
def home():

    return {
        "project": "EduGenie",
        "status": "running",
        "message": "Welcome to EduGenie!"
    }


# ---------- HEALTH CHECK ----------

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ---------- ASK GEMINI ----------

@app.post("/ask")
def ask_question(request: QuestionRequest):

    question = request.question.strip()

    if not question:

        return {
            "answer": "Please enter a question."
        }

    if client is None:

        return {
            "answer": "Gemini API key is not configured."
        }


    # ---------- BUILD CONVERSATION ----------

    conversation = ""

    if request.history:

        conversation += "\nPrevious conversation:\n\n"

        for message in request.history:

            previous_question = str(
                message.get("question", "")
            )

            previous_answer = str(
                message.get("answer", "")
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


    # ---------- PROMPT ----------

    prompt = f"""
You are EduGenie, a friendly AI learning assistant.

Your job is to help students understand their subjects
clearly and simply.

{conversation}

Current student question:

{question}

Answer the current question while remembering
the previous conversation when it is relevant.

Give:

Give a natural, direct answer to the student's question.
Do not use fixed headings such as "A simple explanation",
"Important points", or "An example".
Use bullet points only when they genuinely help.
Keep the answer student-friendly and easy to understand.

Keep answers short and concise, usually 50–100 words.

Use only the important points and avoid unnecessary explanation.

Only introduce yourself as "I’m EduGenie — your AI Learning Assistant." in the first response of a new chat. After that, do not introduce yourself again.

Do not mention that you are using conversation history.
"""


    # ---------- GEMINI MODELS ----------

    models = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite"
    ]

    last_error = ""


    for model in models:

        try:

            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            return {
                "question": question,
                "answer": response.text,
                "model": model
            }

        except Exception as error:

            last_error = str(error)


    return {
        "question": question,
        "answer": (
            "Gemini is temporarily unavailable. "
            "Please try again shortly."
        ),
        "error": last_error
    }