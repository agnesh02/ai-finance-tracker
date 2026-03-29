# Vertex AI Integration Notes

## Setup Required

**Before using Vertex AI features, complete these steps:**

1. **Google Cloud Project**
   - Create/select a GCP project
   - Enable Vertex AI API: https://console.cloud.google.com/vertex-ai
   - Enable Cloud Language API (optional, if using different model)

2. **Service Account**
   - Create a service account with "Vertex AI User" role
   - Generate a JSON key file
   - Save it securely (e.g., `~/.vertexai/service-account-key.json`)

3. **Environment Variables** (add to `.env.production` and local `.env`):
   ```
   VERTEX_AI_PROJECT=your-gcp-project-id
   VERTEX_AI_LOCATION=us-central1  # or your preferred region
   GOOGLE_APPLICATION_CREDENTIALS=~/.vertexai/service-account-key.json
   ```

4. **Install Dependencies**
   ```bash
   npm install @google-cloud/vertexai
   ```

## Features Enabled

- **Auto-categorization**: AI suggests expense categories based on transaction notes/descriptions
- Endpoint: `POST /api/transactions/categorize`
- Frontend: "✨ Auto-categorize" button in the transaction form

## Testing

```bash
# Local test with curl
curl -X POST http://localhost:3000/api/transactions/categorize \
  -H "Content-Type: application/json" \
  -d '{"text": "Uber ride to airport"}'
```

Expected response: `{ "category": "Transport" }`
