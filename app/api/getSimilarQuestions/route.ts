import { togetherClient } from "@/utils/clients";
import { NextResponse } from "next/server";
import { SearchResults } from "@/utils/sharedTypes";
import { unstable_cache } from "next/cache";
import { createHash } from "crypto";
import {
  endAndFlushBraintrustSpan,
  logBraintrustEvent,
  serializeBraintrustError,
  startBraintrustSpan,
} from "@/utils/braintrust";

const SIMILAR_QUESTIONS_MODEL = "openai/gpt-oss-20b";

// Create a cached version of the similar questions generation
const getCachedSimilarQuestions = unstable_cache(
  async (question: string, sourcesContext: string) => {
    // Define a proper JSON schema for Together AI
    const jsonSchema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "string",
          },
          minItems: 3,
          maxItems: 3,
        },
      },
      required: ["questions"],
    };

    const startedAt = performance.now();
    const span = startBraintrustSpan({
      name: "turboseek.similar-questions",
      type: "llm",
      event: {
        input: { question },
        metadata: {
          model: SIMILAR_QUESTIONS_MODEL,
          route: "/api/getSimilarQuestions",
          sourceCharacters: sourcesContext.length,
        },
      },
    });

    try {
      const similarQuestions = await togetherClient.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
            You are a helpful assistant that helps the user to ask related questions, based on user's original question and the search results found for that question. Please identify worthwhile topics that can be follow-ups, and write 3 questions no longer than 20 words each. Please make sure that specifics, like events, names, locations, are included in follow up questions so they can be asked standalone. For example, if the original question asks about "the Manhattan project", in the follow up question, do not just say "the project", but use the full name "the Manhattan project". Your related questions must be in the same language as the original question.

            Use the search results below to generate more relevant and specific follow-up questions that dive deeper into the topic or explore related aspects mentioned in the sources.

            Please provide these 3 related questions as a JSON object with a "questions" array containing 3 strings. Do NOT repeat the original question. ONLY return the JSON object, I will get fired if you don't return JSON.`,
          },
          {
            role: "user",
            content: `Original question: ${question}

${sourcesContext ? `Search results:\n${sourcesContext}` : ""}

Generate 3 related follow-up questions based on the original question and the search results above.`,
          },
        ],
        // @ts-ignore
        response_format: { type: "json_object", schema: jsonSchema },
        model: SIMILAR_QUESTIONS_MODEL,
      });

      const response =
        similarQuestions.choices?.[0].message?.content || '{"questions": []}';
      const parsedResponse = JSON.parse(response);
      const questions = parsedResponse.questions || [];
      const metrics: Record<string, number> = {
        duration_ms: performance.now() - startedAt,
      };
      if (similarQuestions.usage?.prompt_tokens !== undefined) {
        metrics.prompt_tokens = similarQuestions.usage.prompt_tokens;
      }
      if (similarQuestions.usage?.completion_tokens !== undefined) {
        metrics.completion_tokens = similarQuestions.usage.completion_tokens;
      }
      if (similarQuestions.usage?.total_tokens !== undefined) {
        metrics.tokens = similarQuestions.usage.total_tokens;
      }

      logBraintrustEvent(span, {
        output: { questions },
        metadata: { success: true },
        metrics,
      });
      return questions;
    } catch (error) {
      logBraintrustEvent(span, {
        error: serializeBraintrustError(error, [
          process.env.TOGETHER_API_KEY,
          process.env.BRAINTRUST_API_KEY,
        ]),
        metadata: { success: false },
        metrics: { duration_ms: performance.now() - startedAt },
      });
      throw error;
    } finally {
      await endAndFlushBraintrustSpan(span);
    }
  },
  ["similar-questions"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["similar-questions"],
  },
);

export async function POST(request: Request) {
  let { question, sources } = await request.json();

  // Create context from sources
  const sourcesContext =
    sources && sources.length > 0
      ? sources
          .map(
            (source: SearchResults) =>
              `Title: ${source.title}\nContent: ${source.content?.substring(0, 10_000)}...`,
          )
          .join("\n\n")
      : "";

  // Create a cache key based on question and sources content
  const cacheKey = createHash("md5")
    .update(`${question}:${sourcesContext}`)
    .digest("hex");

  try {
    const questions = await getCachedSimilarQuestions(question, sourcesContext);
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error generating similar questions:", error);
    return NextResponse.json([]);
  }
}
