import { NextResponse } from "next/server";
import { z } from "zod";

let excludedSites = ["youtube.com"];
let searchEngine: "serper" = "serper"; // Ensuring we're only using Serper API

export async function POST(request: Request) {
  let { question } = await request.json();

  if (searchEngine === "serper") {
    const SERPER_API_KEY = process.env["SERPER_API_KEY"];
    if (!SERPER_API_KEY) {
      throw new Error("SERPER_API_KEY is required");
    }

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: `${question} ${excludedSites.map((site) => `-site:${site}`).join(" ")}`,
          num: 6,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const rawJSON = await response.json();

      const SerperJSONSchema = z.object({
        organic: z.array(z.object({ title: z.string(), link: z.string() })),
      });

      const data = SerperJSONSchema.parse(rawJSON);

      let results = data.organic.map((result) => ({
        name: result.title,
        url: result.link,
      }));

      return NextResponse.json(results);
    } catch (error) {
      console.error("Search API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: 500 },
      );
    }
  }
}
