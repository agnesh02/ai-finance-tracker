import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(goals)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, targetAmount, currentAmount, deadline } = await req.json()
  
  if (!name || !targetAmount) {
    return NextResponse.json({ error: "Name and target amount are required" }, { status: 400 })
  }

  const goal = await prisma.goal.create({
    data: {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || 0),
      deadline: deadline ? new Date(deadline) : null,
      userId: session.user.id,
    },
  })
  return NextResponse.json(goal)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, currentAmount } = await req.json()
  
  const goal = await prisma.goal.update({
    where: { id, userId: session.user.id },
    data: { currentAmount: parseFloat(currentAmount) },
  })
  return NextResponse.json(goal)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  await prisma.goal.delete({
    where: { id, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
}
