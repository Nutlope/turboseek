import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let { question } = await request.json();
  let results;

  if (process.env.SEARCH_API === "serper") {
    // Use Serper API
    const response = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(question)}&api_key=${process.env.SERPER_API_KEY}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serperJson = await response.json();

    if (serperJson.error) {
      console.error("Serper API error:", serperJson.error);
      return NextResponse.json([]);
    }

    results = serperJson.organic_results;
  } else {
    // Use Bing Search API (existing code)
    const params = new URLSearchParams({
      q: question,
      mkt: "en-US",
    });

    const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params}`, {
      method: "GET",
      // @ts-ignore since that header key isn't part of the header type
      headers: {
        "Ocp-Apim-Subscription-Key": process.env["BING_API_KEY"],
      },
    });

    const bingJson = await response.json();
    results = bingJson.webPages?.value;
  }

  if (!results) {
    console.error("No search results found");
    return NextResponse.json([]);
  }

  const firstSixResults = results.slice(0, 6).map((result: any) => ({
    name: result.title || result.name,
    url: result.link || result.url,
  }));

  return NextResponse.json(firstSixResults);
}
