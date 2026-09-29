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
    version="2.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://edugenie-web.onrender.com",
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Gemini
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key) if api_key else None


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "project": "EduGenie",
        "status": "running",
        "message": "Welcome to EduGenie!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


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

    prompt = f"""
You are EduGenie, a friendly AI learning assistant.

Explain the student's question clearly and simply.

Student question:
{question}

Give a clear, moderately detailed answer.

Include:
1. A simple explanation
2. Important points
3. An example when useful

Keep the answer student-friendly and easy to understand.

Avoid answers that are too short or too long.
Usually keep the response around 150–250 words,
depending on the question.

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