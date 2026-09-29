from fastapi import FastAPI

app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Learning Assistant",
    version="1.0.0"
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
    return {
        "question": question,
        "message": "Gemini AI response will appear here."
    }