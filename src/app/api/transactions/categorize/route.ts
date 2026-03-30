import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { categorizeTransaction, categorizeTransactionsBatch } from "@/lib/vertexai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, texts } = body;

    // Single categorization
    if (text) {
      const category = await categorizeTransaction(text);
      return NextResponse.json({ category });
    }

    // Batch categorization
    if (texts && Array.isArray(texts)) {
      const categories = await categorizeTransactionsBatch(texts);
      return NextResponse.json({ categories });
    }

    return NextResponse.json(
      { error: "Please provide 'text' (single) or 'texts' (batch array)" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Categorization API error:", error);
    return NextResponse.json(
      { error: "Failed to categorize transaction" },
      { status: 500 }
    );
  }
}
