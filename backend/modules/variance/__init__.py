from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import pandas as pd
import duckdb
import os
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

router = APIRouter()

# Initialize LLM for variance analysis
llm = OpenAI(temperature=0)

class VarianceAnalysisRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    account_codes: Optional[List[str]] = None

@router.post("/analyze")
async def analyze_variance(request: VarianceAnalysisRequest):
    """
    Analyze variances between actual and forecast data
    """
    try:
        # Query actual data
        actual_df = duckdb.connect('ledger.db').execute("""
            SELECT 
                account_code,
                SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE -amount END) as actual_amount
            FROM transactions
            WHERE date BETWEEN ? AND ?
            GROUP BY account_code
        """, (request.start_date, request.end_date)).fetchdf()

        # Query forecast data (assuming we have a forecasts table)
        forecast_df = duckdb.connect('ledger.db').execute("""
            SELECT 
                account_code,
                amount as forecast_amount
            FROM forecasts
            WHERE period_start <= ? AND period_end >= ?
        """, (request.end_date, request.start_date)).fetchdf()

        # Merge actual and forecast data
        comparison_df = pd.merge(
            actual_df,
            forecast_df,
            on='account_code',
            how='outer'
        ).fillna(0)

        # Calculate variances
        comparison_df['variance'] = comparison_df['actual_amount'] - comparison_df['forecast_amount']
        comparison_df['variance_percentage'] = (comparison_df['variance'] / comparison_df['forecast_amount'] * 100).fillna(0)

        # Generate LLM analysis
        analysis_prompt = PromptTemplate(
            input_variables=["data"],
            template="""
            Analyze the following financial variances and provide a clear explanation:
            {data}
            
            Focus on significant variances (over 10%) and provide potential reasons for the differences.
            """
        )

        chain = LLMChain(llm=llm, prompt=analysis_prompt)
        analysis = chain.run(comparison_df.to_string())

        return {
            "comparison": comparison_df.to_dict(orient='records'),
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-forecast")
async def upload_forecast(file: UploadFile = File(...)):
    """
    Upload forecast data
    """
    try:
        # Create forecasts directory if it doesn't exist
        os.makedirs("forecasts", exist_ok=True)
        
        # Save the file
        file_path = f"forecasts/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process the forecast file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Validate required columns
        required_columns = ['account_code', 'amount', 'period_start', 'period_end']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail="Missing required columns")
        
        # Store in database
        conn = duckdb.connect('ledger.db')
        conn.execute("""
            CREATE TABLE IF NOT EXISTS forecasts (
                id INTEGER PRIMARY KEY,
                account_code TEXT,
                amount DECIMAL(10,2),
                period_start DATE,
                period_end DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        for _, row in df.iterrows():
            conn.execute("""
                INSERT INTO forecasts (account_code, amount, period_start, period_end)
                VALUES (?, ?, ?, ?)
            """, (
                row['account_code'],
                row['amount'],
                row['period_start'],
                row['period_end']
            ))
        
        return {"message": "Forecast data uploaded successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
