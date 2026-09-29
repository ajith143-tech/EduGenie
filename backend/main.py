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
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://edugenie-web.onrender.com",
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Gemini client
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None


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

    try:

        prompt = f"""
You are EduGenie, a friendly AI learning assistant.

Help the student understand the topic clearly and simply.

Student question:
{question}

Give a student-friendly answer with:
- Simple explanation
- Important points
- Example when useful
"""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        return {
            "question": question,
            "answer": response.text
        }

    except Exception as error:

        return {
            "question": question,
            "answer": "Gemini error: " + str(error)
        }