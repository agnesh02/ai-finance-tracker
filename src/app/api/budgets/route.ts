import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        amount: "desc",
      },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Failed to fetch budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { category, amount } = body

    if (!category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert so if they create a "Groceries" budget again, it just updates the existing one.
    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: session.user.id,
          category,
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        category,
        amount: parseFloat(amount),
        userId: session.user.id,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Failed to create budget:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
