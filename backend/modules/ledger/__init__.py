from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os
from pathlib import Path

router = APIRouter()

# Get the temp directory path
temp_dir = Path(os.environ.get('TEMP_DIR', '/tmp'))
transactions_file = temp_dir / "transactions.json"

def load_transactions():
    if not transactions_file.exists():
        return []
    with open(transactions_file, 'r') as f:
        return json.load(f)

def save_transactions(transactions):
    with open(transactions_file, 'w') as f:
        json.dump(transactions, f)

class Transaction(BaseModel):
    date: datetime
    description: str
    amount: float
    account_code: str
    transaction_type: str
    source_document: Optional[str] = None

class JournalEntry(BaseModel):
    transactions: List[Transaction]
    description: str
    reference: Optional[str] = None

@router.post("/transactions")
async def create_transaction(transaction: Transaction):
    """
    Create a new transaction
    """
    try:
        transactions = load_transactions()
        transaction_dict = transaction.dict()
        transaction_dict['date'] = transaction_dict['date'].isoformat()
        transactions.append(transaction_dict)
        save_transactions(transactions)
        return {"message": "Transaction created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/journal-entries")
async def create_journal_entry(journal_entry: JournalEntry):
    """
    Create a new journal entry with multiple transactions
    """
    try:
        # Ensure debits equal credits
        total_debits = sum(t.amount for t in journal_entry.transactions if t.transaction_type == "debit")
        total_credits = sum(t.amount for t in journal_entry.transactions if t.transaction_type == "credit")
        
        if abs(total_debits - total_credits) > 0.01:  # Allow for small floating point differences
            raise HTTPException(status_code=400, detail="Debits and credits must balance")
        
        transactions = load_transactions()
        for transaction in journal_entry.transactions:
            transaction_dict = transaction.dict()
            transaction_dict['date'] = transaction_dict['date'].isoformat()
            transaction_dict['description'] = f"{journal_entry.description} - {transaction.description}"
            transaction_dict['source_document'] = journal_entry.reference
            transactions.append(transaction_dict)
        
        save_transactions(transactions)
        return {"message": "Journal entry created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions")
async def get_transactions(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    account_code: Optional[str] = None
):
    """
    Get transactions with optional filtering
    """
    try:
        transactions = load_transactions()
        
        # Convert string dates back to datetime objects for comparison
        for t in transactions:
            t['date'] = datetime.fromisoformat(t['date'])
        
        # Apply filters
        if start_date:
            transactions = [t for t in transactions if t['date'] >= start_date]
        if end_date:
            transactions = [t for t in transactions if t['date'] <= end_date]
        if account_code:
            transactions = [t for t in transactions if t['account_code'] == account_code]
        
        # Convert dates back to strings for JSON serialization
        for t in transactions:
            t['date'] = t['date'].isoformat()
        
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
