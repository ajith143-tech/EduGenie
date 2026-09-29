# EduGenie – Project Workflow

## 1. User Interaction
The student enters a question or learning request through the EduGenie interface.

## 2. Request Processing
The frontend sends the student's request to the FastAPI backend.

## 3. Prompt Preparation
The backend prepares the request into a suitable prompt for Google Gemini.

## 4. AI Processing
Google Gemini processes the prompt and generates an educational response.

## 5. Response Validation
The backend receives and processes the AI response before sending it to the student.

## 6. Learning Assistance
The student receives explanations, examples, summaries, or practice questions.

## 7. Feedback
The student can provide feedback to improve the learning experience.

## System Flow

Student
↓
EduGenie Frontend
↓
FastAPI Backend
↓
Prompt Processing
↓
Google Gemini API
↓
Response Processing
↓
EduGenie Frontend
↓
Student

## Development Workflow

Planning → Design → Development → Testing → Deployment → Evaluation