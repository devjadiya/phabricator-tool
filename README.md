# ArchiWiki Project Working Document

## Overview

**ArchiWiki** is a code architecture visualization tool designed for the MediaWiki ecosystem. It analyzes GitHub repositories or Phabricator issues, summarizes their structure, and provides insights such as file counts, language breakdowns, and directory trees.

---

## Usage Limitations

- **Repository Size**: The maximum file size analyzed per file is configurable (default: 50 MB). Large repositories or files above this limit are skipped.
- **Pattern Filtering**: Users can include or exclude files based on patterns (e.g., file extensions or directory names).
- **Supported Platforms**: Primarily supports GitHub repositories and Wikimedia Phabricator issues.
- **Token Estimation**: Token counts are estimated and may not be exact.
- **Rate Limits**: Subject to GitHub and Phabricator API rate limits.
- **Authentication**: Some API tokens (e.g., for Phabricator) are required and should be set in environment variables.
- **CORS**: All API calls from the frontend are proxied through Next.js API routes to avoid CORS issues.
- **AI Integration**: Solution generation for Phabricator issues uses an AI model (Gemini), which may have its own rate limits and reliability constraints.

---

## API Endpoints

### Internal (Next.js API Routes)

- **`/api/gitingest`**  
  - **POST**  
  - **Body**:  
    ```json
    {
      "input_text": "<GitHub repo URL or username/repo>",
      "token": "",
      "max_file_size": "<MB>",
      "pattern": "<pattern>",
      "pattern_type": "exclude|include"
    }
    ```
  - **Returns**:  
    - Repository summary, directory tree, content preview, etc.

- **`/api/phabissue`**  
  - **POST**  
  - **Body**:  
    ```json
    { "taskId": "T<id>" }
    ```
  - **Returns**:  
    - Phabricator issue details, comments, and user info.

- **`/api/gemini`**  
  - **POST**  
  - **Body**:  
    ```json
    { "prompt": "<AI prompt>" }
    ```
  - **Returns**:  
    - AI-generated solution for a Phabricator issue.

---

## Project Structure

```
/public/                # Static assets (images, SVGs, etc.)
/src/
  /app/
    page.tsx            # Main landing page (GitHub repo analysis)
    [...page]/page.tsx  # Dynamic route for repo/issues (GitHub/Phabricator)
    /api/
      gitingest/        # GitHub repo analysis API
      phabissue/        # Phabricator issue API
      gemini/           # AI solution API
  /components/
    GithubFlow.tsx          # Handles GitHub repo analysis UI/logic
    PhabricatorFlow.tsx     # Handles Phabricator issue UI/logic
    RepoSummaryCard.tsx     # Displays repo summary
    GeminiSolutionCard.tsx  # Displays AI solution
    PhabricatorIssueCard.tsx# Displays Phabricator issue details
    LoadingSpinner.tsx      # Loading indicator
  ...
/i.py                   # Python script for Phabricator API (reference/utility)
README.md
next.config.ts
package.json
...
```

---

## Use Cases

1. **Analyze a GitHub Repository**
   - User enters a GitHub repo URL or `username/repo`.
   - System fetches repo, analyzes structure, summarizes files, languages, and tokens.
   - Displays directory tree, summary, and content preview.

2. **Analyze a Phabricator Issue**
   - User navigates to `/T<id>` route.
   - System fetches issue details and comments from Phabricator.
   - AI generates a solution plan and identifies the most relevant GitHub repo.
   - That repo is then analyzed as above.

3. **Pattern-based Filtering**
   - User can include/exclude files by pattern (e.g., only `.js` files).

4. **Token/Size Limiting**
   - User can set a max file size to avoid analyzing huge files.

---

## Edge Cases

- **Invalid Repository URL**: Shows error if the repo cannot be fetched or parsed.
- **Nonexistent Phabricator Issue**: Displays error if the issue ID is invalid.
- **Empty Input**: Prompts user to enter a value.
- **API Rate Limiting**: Displays error if rate limits are hit.
- **No Files Match Pattern**: Warns user if pattern excludes all files.
- **Large Repositories**: Skips files above the max size, warns user.
- **AI Failure**: If Gemini fails to generate a solution, shows error.
- **Network Errors**: All fetches are wrapped in try/catch with user-friendly error messages.

---

## Libraries Used

- **Next.js**: React framework for SSR/SSG and API routes.
- **React**: UI components.
- **lucide-react**: Icon library for UI icons.
- **react-markdown**: Render markdown (used in AI solution cards).
- **remark-gfm**: GitHub Flavored Markdown support.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **@next/font**: Font optimization (Geist font).
- **node-fetch**: Used in API routes for server-side HTTP requests.
- **Python (i.py)**: Used for reference/utility scripts to interact with Phabricator API.

---

## Tools

- **Dev Container**: Ubuntu 24.04.2 LTS with preinstalled tools (`git`, `docker`, `kubectl`, etc.).
- **Vercel**: Recommended deployment platform.
- **VS Code**: Recommended IDE with integrated terminal, test runner, and output pane.

---

## Environment Variables

- `PHABRICATOR_API_TOKEN`: Required for Phabricator API access. Set in `.env` or deployment environment.

---

## Development

- Start dev server:  
  ```bash
  npm run dev
  ```
- Edit main page:  
  `src/app/page.tsx`
- Edit dynamic analysis page:  
  `src/app/[...page]/page.tsx`
- API logic:  
  `src/app/api/`

---

## Deployment

- Deploy on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
- See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
