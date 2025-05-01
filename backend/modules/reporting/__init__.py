from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
import pandas as pd
import duckdb
import plotly.graph_objects as go
from jinja2 import Template
import os

router = APIRouter()

# Connect to the ledger database
conn = duckdb.connect('ledger.db')

class FinancialStatementRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    format: Optional[str] = "json"  # json, html, or pdf

@router.post("/profit-and-loss")
async def generate_profit_and_loss(request: FinancialStatementRequest):
    """
    Generate a Profit and Loss statement
    """
    try:
        # Query transactions for the period
        df = conn.execute("""
            SELECT 
                account_code,
                transaction_type,
                SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE -amount END) as amount
            FROM transactions
            WHERE date BETWEEN ? AND ?
            GROUP BY account_code, transaction_type
        """, (request.start_date, request.end_date)).fetchdf()

        # Group by account type and calculate totals
        income = df[df['account_code'].str.startswith('4')]['amount'].sum()
        expenses = df[df['account_code'].str.startswith('5')]['amount'].sum()
        net_income = income - expenses

        result = {
            "period": {
                "start": request.start_date,
                "end": request.end_date
            },
            "income": income,
            "expenses": expenses,
            "net_income": net_income,
            "breakdown": df.to_dict(orient='records')
        }

        if request.format == "html":
            # Generate HTML report using Jinja2 template
            template_path = os.path.join(os.path.dirname(__file__), "templates", "profit_and_loss.html")
            with open(template_path) as f:
                template = Template(f.read())
            return template.render(**result)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/balance-sheet")
async def generate_balance_sheet(request: FinancialStatementRequest):
    """
    Generate a Balance Sheet
    """
    try:
        # Query transactions for the period
        df = conn.execute("""
            SELECT 
                account_code,
                transaction_type,
                SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE -amount END) as amount
            FROM transactions
            WHERE date <= ?
            GROUP BY account_code, transaction_type
        """, (request.end_date,)).fetchdf()

        # Calculate totals for each section
        assets = df[df['account_code'].str.startswith('1')]['amount'].sum()
        liabilities = df[df['account_code'].str.startswith('2')]['amount'].sum()
        equity = df[df['account_code'].str.startswith('3')]['amount'].sum()

        result = {
            "as_of_date": request.end_date,
            "assets": assets,
            "liabilities": liabilities,
            "equity": equity,
            "breakdown": df.to_dict(orient='records')
        }

        if request.format == "html":
            template_path = os.path.join(os.path.dirname(__file__), "templates", "balance_sheet.html")
            with open(template_path) as f:
                template = Template(f.read())
            return template.render(**result)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cash-flow")
async def generate_cash_flow(request: FinancialStatementRequest):
    """
    Generate a Cash Flow statement
    """
    try:
        # Query cash-related transactions
        df = conn.execute("""
            SELECT 
                date,
                account_code,
                transaction_type,
                SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE -amount END) as amount
            FROM transactions
            WHERE date BETWEEN ? AND ?
            AND account_code LIKE '1%'  -- Cash accounts typically start with 1
            GROUP BY date, account_code, transaction_type
            ORDER BY date
        """, (request.start_date, request.end_date)).fetchdf()

        # Calculate cash flow categories
        operating = df[df['account_code'].str.startswith('11')]['amount'].sum()
        investing = df[df['account_code'].str.startswith('12')]['amount'].sum()
        financing = df[df['account_code'].str.startswith('13')]['amount'].sum()
        net_cash_flow = operating + investing + financing

        result = {
            "period": {
                "start": request.start_date,
                "end": request.end_date
            },
            "operating_activities": operating,
            "investing_activities": investing,
            "financing_activities": financing,
            "net_cash_flow": net_cash_flow,
            "breakdown": df.to_dict(orient='records')
        }

        if request.format == "html":
            template_path = os.path.join(os.path.dirname(__file__), "templates", "cash_flow.html")
            with open(template_path) as f:
                template = Template(f.read())
            return template.render(**result)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 