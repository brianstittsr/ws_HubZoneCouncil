# SAM.gov Opportunity Search Agent - Migration Prompt

Use this prompt to migrate the SAM.gov Opportunity Search Agent into an existing application.

---

## Migration Prompt

```
I need to integrate a SAM.gov Opportunity Search Agent into my existing application. The agent provides natural language search for federal government contract opportunities with the following capabilities:

### Core Features to Migrate:
1. **Natural Language Search** - Users can search using plain English queries like "Find software development opportunities with NAICS code 541511"
2. **Advanced Filters** - NAICS code, PSC code, Set-Aside type, Notice Type, State, Status (Active/Inactive), Response Deadline date range, Posted Date
3. **Paginated Results** - Client-side pagination with configurable page sizes (10, 25, 50, 100)
4. **Opportunity Detail View** - Full details including description, contacts, attachments, dates, classification codes
5. **Excel Export** - Automatic export of search results to Excel spreadsheets
6. **LLM Integration** - Uses OpenAI/Anthropic for parsing natural language queries into structured API parameters

### Technical Stack:
- **Backend**: Node.js with Express
- **Frontend**: HTML with Tailwind CSS (shadcn/ui-inspired design)
- **APIs**: SAM.gov Public API (opportunities search, details, attachments)
- **LLM**: OpenAI GPT-4 or Anthropic Claude (configurable)
- **Export**: ExcelJS for spreadsheet generation

### Key Files to Migrate:

#### Backend Components:
1. `utils/samApiClient.js` - SAM.gov API client with methods:
   - `searchOpportunities(params)` - Search opportunities
   - `fetchOpportunityDetails(noticeId)` - Get full opportunity details
   - `fetchResourceLinks(noticeId)` - Get attachments/documents
   - `transformSamResponse(response)` - Normalize API responses

2. `agents/samAgent.js` - LangGraph-style agent with:
   - `parseUserInputNode(state)` - LLM parses natural language to search params
   - `searchOpportunitiesNode(state)` - Executes multi-page API search
   - `analyzeResultsNode(state)` - LLM generates recommendations
   - `runSamAgent(query, filters)` - Main entry point

3. `routes/api.js` - Express routes:
   - `POST /api/agent` - Natural language search endpoint
   - `POST /api/search` - Direct API search
   - `POST /api/opportunity/:id` - Get opportunity details
   - `GET /api/settings` / `POST /api/settings` - LLM configuration

4. `utils/excelExporter.js` - Excel export functionality
5. `utils/settingsManager.js` - LLM provider/model settings

#### Frontend Components:
1. `public/agent-ui.html` - Main search interface with:
   - Search input with natural language support
   - Collapsible advanced filters panel
   - Paginated results grid
   - Summary statistics

2. `public/opportunity-detail.html` - Detail view with:
   - Project summary
   - Basic info, dates, classification codes
   - Place of performance
   - Description
   - Points of contact
   - Attachments/resources list
   - Award information (if applicable)

3. `public/settings.html` - LLM configuration UI

### Environment Variables Required:
```env
SAM_API_KEY=your_sam_gov_api_key
OPENAI_API_KEY=your_openai_key (optional)
ANTHROPIC_API_KEY=your_anthropic_key (optional)
PORT=3000
```

### SAM.gov API Endpoints Used:
- Search: `https://api.sam.gov/opportunities/v2/search`
- Details: `https://api.sam.gov/opportunities/v2/search?noticeid={id}`
- Resources: `https://sam.gov/api/prod/opps/v3/opportunities/{id}/resources`
- Download: `https://sam.gov/api/prod/opps/v3/opportunities/resources/files/{resourceId}/download`
- UI Link: `https://sam.gov/opp/{noticeId}/view`

### Integration Options:

**Option A: Full Integration**
- Copy all backend files into your existing Express app
- Mount routes under a prefix (e.g., `/sam/*`)
- Include frontend as views or serve as static files
- Share existing authentication/session management

**Option B: Microservice**
- Deploy as standalone service
- Call via internal API from your main application
- Use as iframe or redirect for UI

**Option C: API Only**
- Integrate only the backend API endpoints
- Build custom frontend in your existing framework (React, Vue, etc.)
- Use the samApiClient and samAgent modules directly

### Data Models:

**Search Request:**
```json
{
  "query": "software development opportunities",
  "filters": {
    "naics": "541511",
    "psc": "D301",
    "set_aside": "SBA",
    "notice_type": "o",
    "pop_state": "CA",
    "is_active": "true",
    "response_date_from": "2024-01-01",
    "response_date_to": "2024-12-31"
  }
}
```

**Opportunity Object:**
```json
{
  "noticeId": "abc123",
  "title": "Software Development Services",
  "solicitationNumber": "W12345-24-R-0001",
  "active": "true",
  "type": "Solicitation",
  "organizationHierarchy": "DEPT OF DEFENSE.ARMY.ACC-APG",
  "postedDate": "2024-01-15",
  "responseDeadLine": "2024-02-15",
  "naicsCode": "541511",
  "classificationCode": "D301",
  "typeOfSetAside": "SBA",
  "description": "...",
  "pointOfContact": [...],
  "resourceLinks": [...],
  "uiLink": "https://sam.gov/opp/abc123/view"
}
```

Please help me integrate these components into my existing [DESCRIBE YOUR APPLICATION STACK HERE - e.g., "React/Node.js application", "Django backend with Vue frontend", etc.]. 

My specific requirements are:
1. [List any specific integration requirements]
2. [Authentication/authorization needs]
3. [UI framework preferences]
4. [Database requirements if any]
```

---

## Quick Reference - Key Integration Points

### To add SAM.gov search to any Node.js app:

```javascript
// 1. Copy these files:
//    - utils/samApiClient.js
//    - agents/samAgent.js
//    - utils/logger.js

// 2. Install dependencies:
//    npm install @langchain/openai @langchain/anthropic langchain axios exceljs

// 3. Import and use:
const { runSamAgent } = require('./agents/samAgent');

// 4. Call the agent:
const results = await runSamAgent("Find IT services contracts in California", {
  is_active: "true",
  pop_state: "CA"
});

console.log(results.searchResults); // Array of opportunities
console.log(results.recommendation); // AI-generated recommendation
```

### To add as Express routes:

```javascript
const express = require('express');
const { runSamAgent } = require('./agents/samAgent');

const router = express.Router();

router.post('/search', async (req, res) => {
  const { query, filters } = req.body;
  const results = await runSamAgent(query, filters);
  res.json(results);
});

app.use('/api/sam', router);
```

---

## Repository

**Source Code:** https://github.com/brianstittsr/CGray_samgovapiserver.git

Clone and explore the full implementation for reference.
