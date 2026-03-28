import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="z-10 max-w-2xl w-full p-8 bg-white shadow-xl rounded-2xl flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Financial Tracker (v1 Foundation)
        </h1>
        
        {session ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-gray-600">
              Welcome back, <span className="font-semibold">{session.user?.name || session.user?.email}</span>
            </p>
            <Link 
              href="/api/auth/signout"
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Sign Out
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <p className="text-lg text-gray-600 text-center mb-2">
              You are not logged in.
            </p>
            
            <Link 
              href="/api/auth/signin"
              className="w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Log In
            </Link>
            
            <Link 
              href="/register"
              className="w-full text-center px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
