# Conference Wiki Documents

Upload documents here to feed the conference AI assistant and wiki.

## Supported formats

- `.md` — Markdown (preferred)
- `.txt` — Plain text
- `.pdf` — PDF documents (text extracted automatically)
- `.docx` — Word documents (text extracted automatically)

## How it works

1. Drop documents into this folder or use the **Admin → Conference Wiki** page to upload files.
2. The system extracts text and creates/updates wiki entries in Firestore (`conferenceWikiEntries`).
3. The home-page chat assistant uses these entries to answer questions about the conference.
4. All visitor questions and AI responses are logged in `conferenceChatLogs` for review.

## What to include

- Conference agendas and schedules
- Speaker bios and session descriptions
- Sponsor and exhibitor information
- Venue, hotel, and travel details
- FAQ documents
- Policy and advocacy talking points

## Document processing

- Keep files under 10 MB when possible.
- Use clear headings; the AI uses them to chunk content into wiki entries.
- After uploading, visit the admin wiki page to review generated entries and publish them.
