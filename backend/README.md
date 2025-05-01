# Financial Controller AI Backend

This is the backend service for the Financial Controller AI platform, providing automated financial data processing, journal entry management, reporting, and variance analysis.

## Features

- Data ingestion from multiple sources (CSV, Excel, APIs)
- Transaction and journal entry management
- Financial statement generation (P&L, Balance Sheet, Cash Flow)
- Variance analysis with AI-powered insights
- Forecast data management

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///ledger.db
```

4. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Ingestion Module
- `POST /api/ingestion/upload` - Upload financial data files
- `GET /api/ingestion/sources` - List available data sources

### Ledger Module
- `POST /api/ledger/transactions` - Create a new transaction
- `POST /api/ledger/journal-entries` - Create a new journal entry
- `GET /api/ledger/transactions` - Get transactions with filtering

### Reporting Module
- `POST /api/reporting/profit-and-loss` - Generate P&L statement
- `POST /api/reporting/balance-sheet` - Generate Balance Sheet
- `POST /api/reporting/cash-flow` - Generate Cash Flow statement

### Variance Module
- `POST /api/variance/analyze` - Analyze variances between actual and forecast
- `POST /api/variance/upload-forecast` - Upload forecast data

## Data Structure

### Transactions Table
- id (INTEGER PRIMARY KEY)
- date (DATE)
- description (TEXT)
- amount (DECIMAL)
- account_code (TEXT)
- transaction_type (TEXT)
- source_document (TEXT)
- created_at (TIMESTAMP)

### Forecasts Table
- id (INTEGER PRIMARY KEY)
- account_code (TEXT)
- amount (DECIMAL)
- period_start (DATE)
- period_end (DATE)
- created_at (TIMESTAMP)

## Development

1. The backend uses FastAPI for the API framework
2. DuckDB for local data storage
3. Pandas for data manipulation
4. LangChain for LLM integration
5. Jinja2 for report templating

## Testing

Run tests with:
```bash
pytest
```

## Security Considerations

1. Always validate input data
2. Use proper authentication for API endpoints
3. Implement rate limiting
4. Encrypt sensitive data
5. Regular backups of the database 