// Utility functions for journal entry processing

// Validate that journal entries follow double-entry accounting rules
export function validateJournalEntries(entries: any[]) {
  if (!entries || entries.length === 0) {
    return { isValid: false, message: "No entries to validate" }
  }

  // Calculate total debits and credits
  const totalDebit = entries.reduce((sum, entry) => sum + (Number.parseFloat(entry.debit) || 0), 0)
  const totalCredit = entries.reduce((sum, entry) => sum + (Number.parseFloat(entry.credit) || 0), 0)

  // Check if debits equal credits (allowing for small floating point differences)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const difference = totalDebit - totalCredit

  return {
    isValid: isBalanced,
    totalDebit,
    totalCredit,
    difference: totalDebit - totalCredit,
    message: isBalanced
      ? "Journal entries are balanced"
      : `Journal entries are not balanced. Difference: $${difference.toFixed(2)}`,
  }
}

// Generate a prompt for the AI model to suggest journal entries
export function generateJournalPrompt(transaction: any, chartOfAccounts: any[]) {
  return `
    As an AI accounting assistant, analyze this transaction and suggest appropriate journal entries:
    
    Transaction Details:
    - Date: ${transaction.date}
    - Description: ${transaction.description}
    - Amount: $${transaction.amount.toFixed(2)}
    - Vendor/Customer: ${transaction.vendor}
    - Category: ${transaction.category}
    
    Available Accounts:
    ${chartOfAccounts.map((account) => `- ${account.id}: ${account.name} (${account.type})`).join("\n")}
    
    Create journal entries following these rules:
    1. Use double-entry accounting (debits must equal credits)
    2. Select the most appropriate accounts based on the transaction details
    3. Provide a brief explanation for your accounting treatment
    
    Format your response as JSON with:
    - An array of entries, each with accountId, description, debit, and credit fields
    - A confidence score (0-1) for each entry
    - An explanation field with your reasoning
  `
}

// Format currency values
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Check if a transaction has been processed before
export function isTransactionProcessed(transactionId: string, processedTransactions: string[]) {
  return processedTransactions.includes(transactionId)
}

// Generate a unique journal entry ID
export function generateJournalEntryId() {
  return `je-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}
