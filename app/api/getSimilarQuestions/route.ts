import { togetherClient } from "@/utils/clients";
import { NextResponse } from "next/server";
import { SearchResults } from "@/utils/sharedTypes";

export async function POST(request: Request) {
  let { question, sources } = await request.json();

  // Define a proper JSON schema for Together AI
  const jsonSchema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "string"
        },
        minItems: 3,
        maxItems: 3
      }
    },
    required: ["questions"]
  };

  // Create context from sources
  const sourcesContext = sources && sources.length > 0
    ? sources.map((source: SearchResults) => `Title: ${source.title}\nContent: ${source.content?.substring(0, 500)}...`).join('\n\n')
    : '';

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

${sourcesContext ? `Search results:\n${sourcesContext}` : ''}

Generate 3 related follow-up questions based on the original question and the search results above.`,
      },
    ],
    // @ts-ignore
    response_format: { type: "json_object", schema: jsonSchema },
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  });

  let response = similarQuestions.choices?.[0].message?.content || '{"questions": []}';
  let parsedResponse = JSON.parse(response);

  return NextResponse.json(parsedResponse.questions || []);
}
