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
    # =====================================================
# STUDENT DATABASE
# =====================================================

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import psycopg


# ---------- PASSWORD HELPERS ----------

def hash_password(password: str):

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        100000
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(password: str, stored_password: str):

    try:

        salt, stored_hash = stored_password.split("$", 1)

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt.encode(),
            100000
        ).hex()

        return secrets.compare_digest(
            password_hash,
            stored_hash
        )

    except Exception:

        return False


# ---------- DATABASE CONNECTION ----------

def get_db():

    database_url = os.getenv("DATABASE_URL")

    if not database_url:

        raise Exception(
            "DATABASE_URL is not configured."
        )

    return psycopg.connect(
        database_url
    )


# ---------- CREATE STUDENT TABLE ----------

def create_student_table():

    with get_db() as connection:

        with connection.cursor() as cursor:

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS students (

                    id SERIAL PRIMARY KEY,

                    name VARCHAR(100) NOT NULL,

                    email VARCHAR(150) UNIQUE NOT NULL,

                    password_hash TEXT NOT NULL,

                    xp INTEGER DEFAULT 0,

                    streak INTEGER DEFAULT 0,

                    quiz_count INTEGER DEFAULT 0,

                    correct_answers INTEGER DEFAULT 0,

                    study_minutes INTEGER DEFAULT 0,

                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

                )
            """)

        connection.commit()


# ---------- INITIALIZE DATABASE ----------

try:

    create_student_table()

except Exception as error:

    print(
        "Database initialization error:",
        error
    )


# =====================================================
# REGISTER
# =====================================================

class RegisterRequest(BaseModel):

    name: str

    email: str

    password: str


@app.post("/register")
def register_student(request: RegisterRequest):

    name = request.name.strip()

    email = request.email.strip().lower()

    password = request.password


    if not name:

        return {
            "success": False,
            "message": "Please enter your name."
        }


    if not email:

        return {
            "success": False,
            "message": "Please enter your email."
        }


    if len(password) < 6:

        return {
            "success": False,
            "message": "Password must contain at least 6 characters."
        }


    try:

        password_hash = hash_password(
            password
        )


        with get_db() as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO students
                    (
                        name,
                        email,
                        password_hash
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    (
                        name,
                        email,
                        password_hash
                    )
                )

                student_id = cursor.fetchone()[0]


            connection.commit()


        return {

            "success": True,

            "message":
                "Student account created successfully.",

            "student_id":
                student_id

        }


    except Exception as error:

        error_text = str(error).lower()


        if (
            "unique" in error_text
            or "duplicate" in error_text
        ):

            return {

                "success": False,

                "message":
                    "An account with this email already exists."

            }


        print(
            "Registration error:",
            error
        )


        return {

            "success": False,

            "message":
                "Unable to create account right now."

        }


# =====================================================
# LOGIN
# =====================================================

class LoginRequest(BaseModel):

    email: str

    password: str


@app.post("/login")
def login_student(request: LoginRequest):

    email = request.email.strip().lower()

    password = request.password


    try:

        with get_db() as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        name,
                        email,
                        password_hash,
                        xp,
                        streak,
                        quiz_count,
                        correct_answers,
                        study_minutes
                    FROM students
                    WHERE email = %s
                    """,
                    (email,)
                )

                student = cursor.fetchone()


        if not student:

            return {

                "success": False,

                "message":
                    "Invalid email or password."

            }


        (
            student_id,
            name,
            student_email,
            password_hash,
            xp,
            streak,
            quiz_count,
            correct_answers,
            study_minutes
        ) = student


        if not verify_password(
            password,
            password_hash
        ):

            return {

                "success": False,

                "message":
                    "Invalid email or password."

            }


        return {

            "success": True,

            "message":
                "Login successful.",

            "student": {

                "id":
                    student_id,

                "name":
                    name,

                "email":
                    student_email,

                "xp":
                    xp,

                "streak":
                    streak,

                "quiz_count":
                    quiz_count,

                "correct_answers":
                    correct_answers,

                "study_minutes":
                    study_minutes

            }

        }


    except Exception as error:

        print(
            "Login error:",
            error
        )


        return {

            "success": False,

            "message":
                "Unable to login right now."

        }
