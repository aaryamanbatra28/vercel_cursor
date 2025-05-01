from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import tempfile
import json
from pathlib import Path

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Financial Controller AI",
    description="AI-powered financial controller for automated accounting tasks",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for file storage
temp_dir = Path(tempfile.gettempdir()) / "financial_controller"
temp_dir.mkdir(exist_ok=True)
os.environ['TEMP_DIR'] = str(temp_dir)

# Initialize data storage
transactions_file = temp_dir / "transactions.json"
if not transactions_file.exists():
    transactions_file.write_text("[]")

# Import routers
from modules.ingestion import router as ingestion_router
from modules.ledger import router as ledger_router
from modules.reporting import router as reporting_router
from modules.variance import router as variance_router

# Include routers
app.include_router(ingestion_router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(ledger_router, prefix="/api/ledger", tags=["ledger"])
app.include_router(reporting_router, prefix="/api/reporting", tags=["reporting"])
app.include_router(variance_router, prefix="/api/variance", tags=["variance"])

@app.get("/")
async def root():
    return {"message": "Financial Controller AI API is running"}

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
