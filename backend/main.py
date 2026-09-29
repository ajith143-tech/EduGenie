import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Learning Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


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
def ask_question(question: str):

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=question
    )

    return {
        "question": question,
        "answer": response.text
    }