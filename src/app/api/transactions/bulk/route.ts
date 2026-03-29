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
    const body = await req.json().catch(() => null);

    if (!body || !body.transactions || !Array.isArray(body.transactions) || body.transactions.length === 0) {
      return NextResponse.json({ error: "No transactions provided" }, { status: 400 })
    }

    const { transactions } = body;

    interface TransactionInput {
      amount: string | number;
      category?: string;
      type?: "INCOME" | "EXPENSE";
      note?: string;
      date?: string | Date;
    }

    // Format data for Prisma createMany
    const formattedTransactions = [];
    
    for (const t of transactions as TransactionInput[]) {
      const amountStr = t.amount.toString();
      const amount = parseFloat(amountStr);
      
      // Reject if amount is NaN or if the string contains more than just the number (partial parse)
      if (isNaN(amount) || !/^-?\d+(\.\d+)?$/.test(amountStr)) {
        return NextResponse.json({ error: `Invalid amount format: ${amountStr}` }, { status: 400 });
      }

      if (t.type && t.type !== "INCOME" && t.type !== "EXPENSE") {
        return NextResponse.json({ error: `Invalid transaction type: ${t.type}` }, { status: 400 });
      }

      const type = t.type || "EXPENSE"; // Keeping EXPENSE as default if missing, but rejecting unknown.
      // Wait, the comment said: "Don't default unknown types to EXPENSE"
      // If t.type is provided but invalid, we reject. 
      // If t.type is MISSING, we can still default to EXPENSE or reject. 
      // I'll make type required or reject if missing/invalid to be safe.
      
      if (!t.type) {
        return NextResponse.json({ error: "Transaction type is required" }, { status: 400 });
      }

      formattedTransactions.push({
        amount,
        category: t.category || "Uncategorized",
        type: t.type,
        note: t.note || "",
        date: t.date ? new Date(t.date) : new Date(),
        userId: session.user.id,
      });
    }

    const result = await prisma.transaction.createMany({
      data: formattedTransactions,
    })

    return NextResponse.json({ 
      message: `Successfully imported ${result.count} transactions`,
      count: result.count 
    }, { status: 201 })

  } catch (error) {
    console.error("Failed to bulk import transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
