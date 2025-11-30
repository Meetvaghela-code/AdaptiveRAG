# AdaptiveRAG

Smart retrieval-augmented generation (RAG) that fuses knowledge graphs with LLMs for accurate, context-aware answers.

## Table of contents
- [About](#about)
- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend (Python)](#backend-python)
  - [Frontend (React + Vite)](#frontend-react--vite)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
<img width="400" height="600" alt="image" src="https://github.com/user-attachments/assets/29d0bd88-18c3-4d11-a344-9d8d38989de1" />


## About

AdaptiveRAG is a modular retrieval-augmented generation system that combines a lightweight knowledge graph with vector retrieval and LLM orchestration to deliver low-latency, explainable answers. It is built as a simple Python backend with a React + Vite frontend for quick experimentation and integration.

## Features

- Knowledge-graph enhanced context for LLM prompts
- Vector retrieval for relevant document/graph fragments
- Modular backend + React frontend (demo + UI)
- Incremental updates to knowledge store
- Designed for research, developer tools, and customer support workflows

## Architecture & Tech Stack

- Backend: Python (lightweight API, data ingestion, retrieval)
- Frontend: React + Vite
- Retrieval: Vector store (pluggable) + graph-context layer
- LLM: Model-agnostic prompting/orchestration layer

Diagram (high-level):

Client (React) ↔ Backend API (Python) ↔ Retrieval + Graph Layer ↔ LLM

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Python 3.9+ (or your preferred 3.x)
- Node.js 16+ and npm
- (Optional) Virtual environment for Python

### Backend (Python)

1. Open a terminal in the `backend/` folder.
2. Create and activate a virtual environment (recommended):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Run the backend:

```powershell
python main.py
```

The backend listens on the port configured in `main.py` (or the default printed in the console). Configure the frontend to point to this backend (see Configuration).

### Frontend (React + Vite)

1. Open a terminal in the `frontend/` folder.
2. Install dependencies and run the dev server:

```powershell
npm install
npm run dev
```

3. Open the local dev URL printed by Vite (commonly `http://localhost:5173/`).

If `npm run dev` fails, ensure Node.js and npm are at compatible versions and reinstall node modules:

```powershell
rm -r node_modules; npm install
```

## Usage

- Use the UI to query the system and observe answers enriched with graph-backed context.
- Backend exposes API endpoints (examples):

```http
POST /api/query  # send user query, get RAG response
POST /api/index  # index documents or graph updates
```

Adjust endpoints in the frontend `src` if your backend host/port differs.

## Configuration

- Frontend: set `VITE_BACKEND_URL` (or similar) in `.env` at `frontend/` to point to your backend. Example:

```
VITE_BACKEND_URL=http://localhost:8000
```

- Backend: configure model, vector DB, and graph options in the backend config or environment variables used by `main.py`.

## Contributing

Contributions welcome — open an issue or submit a pull request. Please include:

- Clear description of the change or feature
- Steps to reproduce (if bugfix)
- Relevant tests or manual verification steps

Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Open a PR against `main` with a description and screenshots/demos if applicable

## License

This project is released under the MIT License. Replace with your preferred license if different.

## Contact

- Maintainer: Meetvaghela-code
- Repo: https://github.com/Meetvaghela-code/AdaptiveRAG


