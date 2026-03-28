import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(goals)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, targetAmount, currentAmount, deadline } = await req.json()
  
  const parsedTarget = parseFloat(targetAmount)
  const parsedCurrent = parseFloat(currentAmount || 0)

  if (!name || !Number.isFinite(parsedTarget) || parsedTarget < 0) {
    return NextResponse.json({ error: "Valid name and target amount are required" }, { status: 400 })
  }

  const goal = await prisma.goal.create({
    data: {
      name,
      targetAmount: parsedTarget,
      currentAmount: Number.isFinite(parsedCurrent) ? parsedCurrent : 0,
      deadline: deadline ? new Date(deadline) : null,
      userId: session.user.id,
    },
  })
  return NextResponse.json(goal)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, currentAmount } = await req.json()
  const parsedAmount = parseFloat(currentAmount)

  if (!id || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: "Valid ID and currentAmount are required" }, { status: 400 })
  }
  
  const goal = await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data: { currentAmount: parsedAmount },
  })

  if (goal.count === 0) {
    return NextResponse.json({ error: "Goal not found or unauthorized" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  const result = await prisma.goal.deleteMany({
    where: { id, userId: session.user.id },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Goal not found or unauthorized" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
