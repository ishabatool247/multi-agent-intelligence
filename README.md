# Multi-Agent Intelligence

A full-stack AI multi-agent workflow system built with Django REST Framework, React, Tailwind CSS, and LangGraph.

## Overview

Multi-Agent Intelligence is an AI workspace that coordinates multiple specialized agents to process tasks through a structured workflow.

The system includes five agents:

- Manager — Orchestrates the workflow
- Researcher — Collects structured research
- Writer — Generates professional content
- Reviewer — Reviews quality and accuracy
- Publisher — Finalizes approved output

## Workflow

Manager → Researcher → Writer → Reviewer → Publisher

Conditional routing is supported:

- PASS → Publisher
- REVISE → Writer for another revision

The system supports up to three revision cycles.

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- LangGraph

### Frontend
- React
- Vite
- Tailwind CSS
- Lucide React

### Database
- SQLite

## Features

- Multi-agent AI orchestration
- Conditional workflow routing
- Research, writing, review, and publishing agents
- Execution history
- Review feedback
- Revision tracking
- Real-time workflow status
- React-based SaaS dashboard
- Django REST API
- Agent monitoring
- System settings
- Execution statistics

## API Endpoints

```text
GET  /api/health/
POST /api/run-agent/
GET  /api/history/
Local Development
Backend
python -m venv .venv

Activate the virtual environment and install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Start Django:

python manage.py runserver
Frontend
cd frontend
npm install
npm run dev
Project Status

The core multi-agent workflow, Django REST API, React dashboard, execution history, agent monitoring, and conditional routing are implemented and working.

Author

Isha Batool