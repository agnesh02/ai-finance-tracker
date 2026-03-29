import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { transactions } = await req.json()

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "No transactions provided" }, { status: 400 })
    }

    // Format data for Prisma createMany
    const formattedTransactions = transactions.map((t: any) => ({
      amount: parseFloat(t.amount),
      category: t.category || "Uncategorized",
      type: t.type || "EXPENSE",
      note: t.note || "",
      date: t.date ? new Date(t.date) : new Date(),
      userId: session.user.id,
    }))

    const result = await prisma.transaction.createMany({
      data: formattedTransactions,
    })

    return NextResponse.json({ 
      message: `Successfully imported ${result.count} transactions`,
      count: result.count 
    }, { status: 201 })

  } catch (error) {
    console.error("Failed to bulk import transactions:", error)
    return NextResponse.json({ error: "Failed to bulk import transactions" }, { status: 500 })
  }
}
