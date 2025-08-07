// File: app/api/phabricator/search/route.ts

import { NextRequest, NextResponse } from "next/server";

// --- Configuration ---
const PHABRICATOR_API_URL =
  "https://phabricator.wikimedia.org/api/maniphest.search";
// It's best practice to store secrets in environment variables.
const API_TOKEN =
  process.env.PHABRICATOR_API_TOKEN || "api-nhvap27hnnb6igtgizlu76mcuro5";

/**
 * Handles POST requests to search for Phabricator tasks.
 * Expects a JSON body with a "query" property.
 * e.g., { "query": "Fix login button" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extract the search query from the request body.
    const body = await req.json();
    const searchQuery = body.query;

    if (!searchQuery) {
      return NextResponse.json(
        { error: "Search query is missing" },
        { status: 400 }
      );
    }

    // 2. Prepare the request for the Phabricator API.
    // We use URLSearchParams to correctly format the x-www-form-urlencoded body.
    const params = new URLSearchParams();
    params.append("api.token", API_TOKEN);
    // Use the 'query' constraint to perform a full-text search.
    params.append("constraints[query]", searchQuery);
    // You can request extra data attachments if needed.
    params.append("attachments[projects]", "true");

    // 3. Make the proxied request to the Phabricator API.
    const apiResponse = await fetch(PHABRICATOR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    // 4. Handle non-successful responses from the Phabricator API.
    if (!apiResponse.ok) {
      console.error("Phabricator API Error:", await apiResponse.text());
      return NextResponse.json(
        {
          error: `Phabricator API responded with status ${apiResponse.status}`,
        },
        { status: apiResponse.status }
      );
    }

    // 5. Parse the JSON result and check for application-level errors.
    const result = await apiResponse.json();
    if (result.error_info) {
      console.error("Phabricator Application Error:", result.error_info);
      return NextResponse.json({ error: result.error_info }, { status: 400 });
    }

    // 6. Return the successful result to the client.
    return NextResponse.json(result);
  } catch (err) {
    // Handle unexpected errors (e.g., network issues, JSON parsing errors).
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
