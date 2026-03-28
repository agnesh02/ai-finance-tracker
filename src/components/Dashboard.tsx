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

type Budget = {
  id: string
  category: string
  amount: number
}

type Subscription = {
  id: string
  name: string
  amount: number
  billingDate: number
  category: string
  status: string
}

export default function Dashboard({ userName }: { userName: string }) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  // Transaction form state
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [note, setNote] = useState("")

  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")

  // Subscription form state
  const [subName, setSubName] = useState("")
  const [subAmount, setSubAmount] = useState("")
  const [subDate, setSubDate] = useState("1")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, budgRes, subRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/subscriptions")
      ])
      
      if (transRes.ok) {
        const tData = await transRes.json()
        setTransactions(tData)
      }
      
      if (budgRes.ok) {
        const bData = await budgRes.json()
        setBudgets(bData)
      }

      if (subRes.ok) {
        const sData = await subRes.json()
        setSubscriptions(sData)
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, type, note }),
    })

    if (res.ok) {
      setAmount("")
      setCategory("")
      setNote("")
      fetchData()
      router.refresh()
    }
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budgetAmount || !budgetCategory) return

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: budgetAmount, category: budgetCategory }),
    })

    if (res.ok) {
      setBudgetAmount("")
      setBudgetCategory("")
      fetchData()
    }
  }

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subName || !subAmount || !subDate) return

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subName, amount: subAmount, billingDate: subDate }),
    })

    if (res.ok) {
      setSubName("")
      setSubAmount("")
      setSubDate("1")
      fetchData()
    }
  }

  const handleCancelSubscription = async (id: string) => {
    const res = await fetch(`/api/subscriptions?id=${id}`, {
      method: "DELETE",
    })
    
    if (res.ok) {
      fetchData()
    }
  }

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0)
  const netBalance = totalIncome - totalExpense
  const totalSubscriptions = subscriptions.reduce((acc, s) => acc + s.amount, 0)

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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 h-fit flex flex-col gap-6">
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Transaction</h2>
            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
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

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Set Monthly Budget</h2>
            <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Category (e.g. Groceries)"
                value={budgetCategory}
                onChange={(e) => setBudgetCategory(e.target.value)}
                required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Limit ($)"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mt-2"
              >
                Set Budget limit
              </button>
            </form>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Add Subscription</h2>
            <form onSubmit={handleAddSubscription} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Service (e.g. Netflix)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Monthly ($)"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  required
                  className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day (1-31)"
                  value={subDate}
                  onChange={(e) => setSubDate(e.target.value)}
                  required
                  className="p-3 border border-gray-200 rounded-lg w-24 outline-none focus:ring-2 focus:ring-blue-500"
                  title="Day of the month it bills"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mt-2"
              >
                Add Subscription
              </button>
            </form>
          </div>

        </div>

        {/* DATA PANELS */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          
          {/* BUDGET TRACKER */}
          {budgets.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Budget Tracker</h2>
              <div className="flex flex-col gap-5">
                {budgets.map((b) => {
                  // Calculate how much was spent in this category
                  const spent = transactions
                    .filter(t => t.type === "EXPENSE" && t.category.toLowerCase() === b.category.toLowerCase())
                    .reduce((acc, t) => acc + t.amount, 0)
                  
                  const percentage = Math.min((spent / b.amount) * 100, 100)
                  const isOver = spent > b.amount

                  return (
                    <div key={b.id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="font-medium text-gray-800">{b.category}</span>
                        <span className="text-sm font-medium text-gray-600">
                          ${spent.toFixed(2)} <span className="text-gray-400">/ ${b.amount.toFixed(2)}</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${isOver ? 'bg-red-500' : 'bg-purple-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {isOver && <span className="text-xs text-red-500 font-medium">Over budget by ${(spent - b.amount).toFixed(2)}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SUBSCRIPTION MANAGER */}
          {subscriptions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Monthly Subscriptions</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  ${totalSubscriptions.toFixed(2)} / mo
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {subscriptions.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{s.name}</span>
                      <span className="text-sm text-gray-500">
                        Bills on the {s.billingDate}{s.billingDate === 1 || s.billingDate === 21 || s.billingDate === 31 ? "st" : s.billingDate === 2 || s.billingDate === 22 ? "nd" : s.billingDate === 3 || s.billingDate === 23 ? "rd" : "th"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-900">
                        ${s.amount.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleCancelSubscription(s.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSACTIONS LIST */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
    </div>
  )
}
