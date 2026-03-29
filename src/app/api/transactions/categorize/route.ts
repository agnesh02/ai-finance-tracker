import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({ project: process.env.VERTEX_AI_PROJECT, location: process.env.VERTEX_AI_LOCATION });
const model = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text input is required for categorization' }, { status: 400 });
    }

    const prompt = `Categorize the following transaction description into one of these categories: Food, Transport, Utilities, Rent, Salary, Entertainment, Shopping, Health, Education, Groceries, Other. If none apply, use 'Other'.\nTransaction: "${text}"\nCategory:`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const category = responseText.split('Category:')[1] ? responseText.split('Category:')[1].trim() : responseText.trim();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Vertex AI Error:', error);
    return NextResponse.json({ error: 'Failed to categorize transaction', details: String(error) }, { status: 500 });
  }
}
