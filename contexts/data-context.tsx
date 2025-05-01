"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// Define the shape of our context
type DataContextType = {
  documents: any[]
  transactions: any[]
  journalEntries: any[]
  addDocument: (document: any) => void
  addTransaction: (transaction: any) => void
  addJournalEntry: (entry: any) => void
  refreshData: () => void
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  documents: [],
  transactions: [],
  journalEntries: [],
  addDocument: () => {},
  addTransaction: () => {},
  addJournalEntry: () => {},
  refreshData: () => {},
})

// Custom hook to use the data context
export const useData = () => useContext(DataContext)

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load initial data from localStorage only once
  useEffect(() => {
    if (!isInitialized) {
      try {
        const storedDocuments = localStorage.getItem("documents")
        const storedTransactions = localStorage.getItem("transactions")
        const storedJournalEntries = localStorage.getItem("journalEntries")

        if (storedDocuments) setDocuments(JSON.parse(storedDocuments))
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
        if (storedJournalEntries) setJournalEntries(JSON.parse(storedJournalEntries))
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Save data to localStorage when it changes, but use a separate effect
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("documents", JSON.stringify(documents))
      } catch (error) {
        console.error("Error saving documents to localStorage:", error)
      }
    }
  }, [documents, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("transactions", JSON.stringify(transactions))
      } catch (error) {
        console.error("Error saving transactions to localStorage:", error)
      }
    }
  }, [transactions, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("journalEntries", JSON.stringify(journalEntries))
      } catch (error) {
        console.error("Error saving journal entries to localStorage:", error)
      }
    }
  }, [journalEntries, isInitialized])

  // Functions to add new items - use useCallback to prevent recreation on every render
  const addDocument = useCallback((document: any) => {
    setDocuments((prev) => [...prev, document])
  }, [])

  const addTransaction = useCallback((transaction: any) => {
    setTransactions((prev) => [...prev, transaction])
  }, [])

  const addJournalEntry = useCallback((entry: any) => {
    setJournalEntries((prev) => [...prev, entry])
  }, [])

  const refreshData = useCallback(() => {
    // This function would typically fetch fresh data from an API
    // For now, it's just a placeholder
    console.log("Refreshing data...")
  }, [])

  return (
    <DataContext.Provider
      value={{
        documents,
        transactions,
        journalEntries,
        addDocument,
        addTransaction,
        addJournalEntry,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
