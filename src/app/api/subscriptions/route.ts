import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { billingDate: "asc" },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, amount, billingDate, category } = body

    if (!name || amount === undefined || !billingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedAmount = parseFloat(amount)
    const parsedDate = parseInt(billingDate)

    if (isNaN(parsedAmount) || isNaN(parsedDate) || parsedDate < 1 || parsedDate > 31) {
      return NextResponse.json({ error: "Invalid amount or billing date" }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        amount: parsedAmount,
        billingDate: parsedDate,
        category: category || "Subscription",
        userId: session.user.id,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    await prisma.subscription.update({
      where: { id, userId: session.user.id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}