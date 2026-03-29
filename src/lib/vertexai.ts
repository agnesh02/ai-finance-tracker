import { VertexAI } from "@google-cloud/vertexai";

const projectId = process.env.VERTEX_AI_PROJECT;
const location = process.env.VERTEX_AI_LOCATION || "us-central1";
const useFallback = !projectId;

let vertexAI: VertexAI | null = null;
if (!useFallback) {
  vertexAI = new VertexAI({ project: projectId, location });
}

/**
 * Fallback categorization using keyword matching.
 * Used when Vertex AI is not configured.
 */
function fallbackCategorize(text: string): string {
  const lower = text.toLowerCase();
  
  const keywords: Record<string, string[]> = {
    "Food": ["restaurant", "cafe", "coffee", "food", "grocery", "supermarket", "mart", "kitchen", "bakery", "pizza", "burger", "sushi", "meal", "dining"],
    "Transport": ["uber", "lyft", "taxi", "cab", "fuel", "gas", "petrol", "parking", "toll", "metro", "subway", "train", "bus", "ride", "transport", "travel"],
    "Shopping": ["amazon", "flipkart", "store", "shop", "mall", "clothing", "shoes", "electronics", "gadget", "clothes", "fashion"],
    "Entertainment": ["netflix", "spotify", "youtube", "prime", "ott", "movie", "theatre", "concert", "game", "gaming", "fun"],
    "Utilities": ["electric", "water", "gas", "internet", "phone", "mobile", "broadband", "utility", "bill", "electricity"],
    "Healthcare": ["hospital", "clinic", "doctor", "medicine", "pharmacy", "health", "medical", "dental", "dentist"],
    "Education": ["course", "book", "kindle", "udemy", "coursera", "school", "college", "tuition", "education", "learning"],
    "Travel": ["flight", "airline", "hotel", "booking", "airbnb", "vacation", "holiday", "trip"],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lower.includes(word))) {
      return category;
    }
  }

  return "Other";
}

const VALID_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment",
  "Utilities", "Healthcare", "Education", "Travel", "Other"
];

/**
 * Extracts text from Gemini response
 */
function extractResponseText(response: any): string {
  try {
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts && parts.length > 0) {
        return parts[0].text || "";
      }
    }
  } catch (e) {
    console.error("Error extracting text from response:", e);
  }
  return "";
}

/**
 * Categorizes a transaction description using Vertex AI Gemini.
 * Falls back to keyword matching if Vertex AI is not configured.
 * 
 * @param text - The transaction note/description
 * @returns One of: "Food", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Education", "Travel", "Other"
 */
export async function categorizeTransaction(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return "Other";
  }

  // Use fallback if no Vertex AI configured
  if (useFallback) {
    console.log("Using fallback categorizer (VERTEX_AI_PROJECT not set)");
    return fallbackCategorize(text);
  }

  try {
    const generativeModel = vertexAI!.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
You are a financial assistant that categorizes expenses. 
Given a transaction description, classify it into ONE of these categories:
- Food
- Transport
- Shopping
- Entertainment
- Utilities
- Healthcare
- Education
- Travel
- Other

Transaction: "${text}"

Respond ONLY with the category name (single word, no explanation).
`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = extractResponseText(response).trim();

    if (!responseText) {
      return "Other";
    }

    // Exact match
    if (VALID_CATEGORIES.includes(responseText)) {
      return responseText;
    }

    // Case-insensitive partial match
    const lowerResponse = responseText.toLowerCase();
    for (const valid of VALID_CATEGORIES) {
      if (lowerResponse.includes(valid.toLowerCase())) {
        return valid;
      }
    }

    return "Other";
  } catch (error) {
    console.error("Vertex AI categorization error:", error);
    return "Other";
  }
}

/**
 * Batch categorize multiple transaction descriptions.
 * Processes sequentially to avoid rate limits.
 */
export async function categorizeTransactionsBatch(texts: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const text of texts) {
    const category = await categorizeTransaction(text);
    results.push(category);
  }
  return results;
}
