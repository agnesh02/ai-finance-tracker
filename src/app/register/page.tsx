"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    })

    if (res.ok) {
      router.push("/api/auth/signin")
    } else {
      const data = await res.json()
      setError(data.message)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="z-10 max-w-md w-full p-8 bg-white shadow-xl rounded-2xl flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            name="name" 
            placeholder="Name" 
            required 
            className="p-3 border rounded-lg w-full"
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required 
            className="p-3 border rounded-lg w-full"
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            className="p-3 border rounded-lg w-full"
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mt-2"
          >
            Sign Up
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/api/auth/signin" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  )
}
