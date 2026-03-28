"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Transaction = {
  id: string
  amount: number
  date: string
  category: string
  note: string | null
  type: "INCOME" | "EXPENSE"
}

export default function Dashboard({ userName }: { userName: string }) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [note, setNote] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions")
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, type, note }),
    })

    if (res.ok) {
      // Reset form
      setAmount("")
      setCategory("")
      setNote("")
      // Refresh list
      fetchTransactions()
      router.refresh()
    }
  }

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0)
  const netBalance = totalIncome - totalExpense

  return (
    <div className="w-full flex flex-col gap-8">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-gray-500 text-sm font-medium">Net Balance</p>
          <p className={`text-3xl font-bold mt-2 ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${netBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-gray-500 text-sm font-medium">Income</p>
          <p className="text-2xl font-semibold mt-2 text-green-600">+${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-gray-500 text-sm font-medium">Expenses</p>
          <p className="text-2xl font-semibold mt-2 text-red-600">-${totalExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD TRANSACTION FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === "EXPENSE" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                onClick={() => setType("EXPENSE")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === "INCOME" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                onClick={() => setType("INCOME")}
              >
                Income
              </button>
            </div>
            
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Category (e.g. Groceries, Salary)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className={`w-full py-3 text-white font-medium rounded-lg transition-colors mt-2 ${type === "INCOME" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              Add {type === "INCOME" ? "Income" : "Expense"}
            </button>
          </form>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Transactions</h2>
          {loading ? (
            <p className="text-gray-500">Loading your data...</p>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">No transactions yet. Add your first one!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{t.category}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString()} {t.note && `• ${t.note}`}
                    </span>
                  </div>
                  <span className={`font-bold ${t.type === "INCOME" ? "text-green-600" : "text-gray-900"}`}>
                    {t.type === "INCOME" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
