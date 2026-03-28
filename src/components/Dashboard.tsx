"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

type Goal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
}

export default function Dashboard({ userName = "User" }: { userName?: string }) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
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

  // Goal form state
  const [goalName, setGoalName] = useState("")
  const [goalTarget, setGoalTarget] = useState("")
  const [goalCurrent, setGoalCurrent] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, budgRes, subRes, goalRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/subscriptions"),
        fetch("/api/goals")
      ])
      
      if (!transRes.ok) throw new Error("Failed to fetch transactions")
      if (!budgRes.ok) throw new Error("Failed to fetch budgets")
      if (!subRes.ok) throw new Error("Failed to fetch subscriptions")
      if (!goalRes.ok) throw new Error("Failed to fetch goals")

      setTransactions(await transRes.json())
      setBudgets(await budgRes.json())
      setSubscriptions(await subRes.json())
      setGoals(await goalRes.json())
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

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalName || !goalTarget) return

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: goalName, targetAmount: goalTarget, currentAmount: goalCurrent }),
    })

    if (res.ok) {
      setGoalName("")
      setGoalTarget("")
      setGoalCurrent("")
      fetchData()
    }
  }

  const handleUpdateGoalProgress = async (id: string, newAmount: number) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentAmount: newAmount }),
      })
      if (!res.ok) {
        console.error("Failed to update goal progress")
        fetchData() // Re-sync on failure
      }
    } catch (error) {
      console.error("Error updating goal progress", error)
      fetchData() // Re-sync on error
    }
  }

  const handleCancelSubscription = async (id: string) => {
    const res = await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0)
  const netBalance = totalIncome - totalExpense
  const totalSubscriptions = subscriptions.reduce((acc, s) => acc + s.amount, 0)

  // Chart Logic
  const expenseByCategory = useMemo(() => {
    const categories: Record<string, number> = {}
    transactions
      .filter(t => t.type === "EXPENSE")
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
      })
    return categories
  }, [transactions])

  const chartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(expenseByCategory),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(20, 184, 166, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(20, 184, 166, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* WELCOME MESSAGE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Hello, {userName}!</h2>
        <p className="text-gray-500 text-sm">Here is your financial summary for this month.</p>
      </div>

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
        {/* LEFT COLUMN: FORMS */}
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
                type="number" step="0.01" min="0" placeholder="Amount ($)"
                value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text" placeholder="Category (e.g. Groceries, Salary)"
                value={category} onChange={(e) => setCategory(e.target.value)} required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text" placeholder="Note (optional)"
                value={note} onChange={(e) => setNote(e.target.value)}
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
                type="text" placeholder="Category (e.g. Groceries)"
                value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number" step="0.01" min="0" placeholder="Limit ($)"
                value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} required
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
                type="text" placeholder="Service (e.g. Netflix)"
                value={subName} onChange={(e) => setSubName(e.target.value)} required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4">
                <input
                  type="number" step="0.01" min="0" placeholder="Monthly ($)"
                  value={subAmount} onChange={(e) => setSubAmount(e.target.value)} required
                  className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <input
                  type="number" min="1" max="31" placeholder="Day (1-31)"
                  value={subDate} onChange={(e) => setSubDate(e.target.value)} required
                  className="p-3 border border-gray-200 rounded-lg w-24 outline-none focus:ring-2 focus:ring-blue-500"
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

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">New Savings Goal</h2>
            <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
              <input
                type="text" placeholder="Goal (e.g. New MacBook)"
                value={goalName} onChange={(e) => setGoalName(e.target.value)} required
                className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-4">
                <input
                  type="number" step="0.01" min="0" placeholder="Target ($)"
                  value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required
                  className="p-3 border border-gray-200 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number" step="0.01" min="0" placeholder="Current ($)"
                  value={goalCurrent} onChange={(e) => setGoalCurrent(e.target.value)}
                  className="p-3 border border-gray-200 rounded-lg w-24 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors mt-2"
              >
                Create Goal
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: DATA PANELS */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          
          {/* ANALYTICS PANEL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Expense Analytics</h2>
            {Object.keys(expenseByCategory).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64">
                  <Pie 
                    data={chartData} 
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} 
                  />
                </div>
                <div className="h-64">
                  <Bar 
                    data={chartData} 
                    options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">Add some expenses to see your breakdown.</p>
            )}
          </div>

          {/* SAVINGS GOALS */}
          {goals.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Savings Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((g) => {
                  const percentage = g.targetAmount > 0 
                    ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) 
                    : 0
                  return (
                    <div key={g.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">{g.name}</span>
                        <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-teal-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">${g.currentAmount.toFixed(2)}</span>
                        <span className="text-gray-400">of ${g.targetAmount.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0" max={g.targetAmount} step="10" value={g.currentAmount}
                        aria-label={`Current progress for goal ${g.name}`}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setGoals(prev => prev.map(goal => 
                            goal.id === g.id ? { ...goal, currentAmount: val } : goal
                          ));
                        }}
                        onMouseUp={(e) => handleUpdateGoalProgress(g.id, parseFloat((e.target as HTMLInputElement).value))}
                        onTouchEnd={(e) => handleUpdateGoalProgress(g.id, parseFloat((e.target as HTMLInputElement).value))}
                        onKeyUp={(e) => handleUpdateGoalProgress(g.id, parseFloat((e.target as HTMLInputElement).value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* BUDGET TRACKER */}
          {budgets.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Budget Tracker</h2>
              <div className="flex flex-col gap-5">
                {budgets.map((b) => {
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
