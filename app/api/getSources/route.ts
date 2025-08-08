import { NextResponse } from "next/server";
import { exaClient } from "@/utils/clients";
import { SearchResults } from "@/utils/sharedTypes";

let excludedSites = ["youtube.com", "nytimes.com", "x.com"];

export async function POST(request: Request) {
  let { question } = await request.json();

  try {
    const response = await exaClient.searchAndContents(question, {
      numResults: 9,
      excludeDomains: excludedSites,
      type: "auto",
    });

    let results: SearchResults[] = response.results.map((result) => ({
      title: result.title || undefined,
      url: result.url,
      content: result.text
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Exa search error:", error);
    throw new Error("Failed to search with Exa");
  }
}
