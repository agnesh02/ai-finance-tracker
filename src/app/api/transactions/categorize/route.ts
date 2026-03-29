import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = process.env.VERTEX_AI_PROJECT;
  const locationId = process.env.VERTEX_AI_LOCATION;

  if (!projectId || !locationId) {
    console.error('Missing VERTEX_AI_PROJECT or VERTEX_AI_LOCATION environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let ai;
  try {
    ai = new GoogleGenAI({
      project: projectId,
      location: locationId,
      vertexai: true,
    });
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI client:', error);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text input is required for categorization' }, { status: 400 });
    }

    const prompt = `Categorize the following transaction description into one of these categories: Food, Transport, Utilities, Rent, Salary, Entertainment, Shopping, Health, Education, Groceries, Other. If none apply, use 'Other'.\nTransaction: "${text}"\nCategory:`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    
    let responseText = '';
    if (response && response.text) {
      responseText = response.text.trim();
    } else if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts[0].text?.trim() || '';
      }
    }

    if (!responseText) {
      responseText = 'Other';
    }

    const category = responseText.includes('Category:') 
      ? responseText.split('Category:')[1].trim() 
      : responseText.trim();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Vertex AI Error:', error);
    return NextResponse.json({ error: 'Failed to categorize transaction' }, { status: 500 });
  }
}
