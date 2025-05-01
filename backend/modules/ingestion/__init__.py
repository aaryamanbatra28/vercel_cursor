from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd
import os
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process financial data files (CSV, Excel, etc.)
    """
    try:
        # Use temp directory for file storage
        temp_dir = os.environ.get('TEMP_DIR', 'uploads')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(temp_dir, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Basic validation
        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Return basic info about the processed data
        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "file_path": file_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def list_data_sources():
    """
    List available data sources and their status
    """
    return {
        "sources": [
            {
                "name": "ERP System",
                "type": "API",
                "status": "Not Configured"
            },
            {
                "name": "Bank Statements",
                "type": "File Upload",
                "status": "Available"
            },
            {
                "name": "Spreadsheets",
                "type": "File Upload",
                "status": "Available"
            }
        ]
    } 