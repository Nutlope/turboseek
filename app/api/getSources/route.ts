import { NextResponse } from "next/server";
import { z } from "zod";
import { Spider } from "@spider-cloud/spider-client";

let excludedSites = ["youtube.com"];

type SearchEngine = "bing" | "serper" | "spider";

let searchEngine: SearchEngine = "serper";

export async function POST(request: Request) {
  let { question } = await request.json();

  if (searchEngine === "bing") {
    const BING_API_KEY = process.env["BING_API_KEY"];
    if (!BING_API_KEY) {
      throw new Error("BING_API_KEY is required");
    }

    const params = new URLSearchParams({
      q: `${question} ${excludedSites.map((site) => `-site:${site}`).join(" ")}`,
      mkt: "en-US",
      count: "6",
      safeSearch: "Strict",
    });

    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?${params}`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": BING_API_KEY,
        },
      },
    );

    const BingJSONSchema = z.object({
      webPages: z.object({
        value: z.array(z.object({ name: z.string(), url: z.string() })),
      }),
    });

    const rawJSON = await response.json();
    const data = BingJSONSchema.parse(rawJSON);

    let results = data.webPages.value.map((result) => ({
      name: result.name,
      url: result.url,
    }));

    return NextResponse.json(results);
  } else if (searchEngine === "serper") {
    const SERPER_API_KEY = process.env["SERPER_API_KEY"];
    if (!SERPER_API_KEY) {
      throw new Error("SERPER_API_KEY is required");
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: question,
        num: 6,
      }),
    });

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
  } else if (searchEngine === "spider") {
    const SPIDER_API_KEY = process.env["SPIDER_API_KEY"];
    if (!SPIDER_API_KEY) {
      throw new Error("SPIDER_API_KEY is required");
    }

    const app = new Spider({ apiKey: SPIDER_API_KEY });
    const response = await app.search(question, { fetch_page_content: false, limit: 5 });

    let results = response.content.map((result: { title: string, url: string }) => ({
      name: result.title,
      url: result.url,
      source: "spider",
    }));

    return NextResponse.json(results);
  }
}
