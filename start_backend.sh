#!/bin/bash
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
echo "Starting FastAPI Backend on http://localhost:8000"
uvicorn main:app --reload --port 8000
