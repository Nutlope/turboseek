import { NextResponse } from "next/server";
import { exaClient } from "@/utils/clients";

let excludedSites = ["youtube.com"];

export async function POST(request: Request) {
  let { question } = await request.json();

  try {
    const response = await exaClient.searchAndContents(question, {
      numResults: 6,
      excludeDomains: excludedSites,
      useAutoprompt: true,
      type: "neural",
    });

    let results = response.results.map((result) => ({
      name: result.title,
      url: result.url,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Exa search error:", error);
    throw new Error("Failed to search with Exa");
  }
}
