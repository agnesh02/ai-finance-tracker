import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"
import Dashboard from "@/components/Dashboard"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 bg-gray-50 text-gray-900">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Financial Tracker
          </h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 hidden md:block">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <Link 
                href="/api/auth/signout"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Sign Out
              </Link>
            </div>
          ) : null}
        </header>

        {/* MAIN CONTENT */}
        {session ? (
          <Dashboard userName={session.user?.name || session.user?.email || "User"} />
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center mt-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Master Your Finances</h2>
            <p className="text-gray-500 max-w-md mb-8">
              The smartest, most secure way to track your income and expenses, powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
              <Link 
                href="/api/auth/signin"
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
        
      </div>
      <footer className="mt-8 text-center text-xs text-gray-400">© {new Date().getFullYear()} BroBot Finance. Built with OpenClaw.</footer>
    </main>
  )
}
