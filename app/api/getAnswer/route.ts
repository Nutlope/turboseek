import { streamText } from 'ai';
import { SearchResults } from "@/utils/sharedTypes";
import { togetherClientAISDK } from '@/utils/clients';

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const { question, sources } = await request.json();

    if (!sources || !Array.isArray(sources)) {
      return new Response(JSON.stringify({ error: 'Invalid sources format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const finalResults: SearchResults[] = sources;

    const mainAnswerPrompt = `
    Given a user question and some context, please write a clean, concise and accurate answer to the question based on the context. You will be given a set of related contexts to the question, each starting with a reference number like [[citation:x]], where x is a number. Please use the context when crafting your answer.

    Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

    Here are the set of contexts:

    <contexts>
    ${finalResults.map(
      (result, index) => `[[citation:${index}]] ${result.content.slice(0, 10_000)} \n\n`,
    )}
    </contexts>

    Remember, don't blindly repeat the contexts verbatim and don't tell the user how you used the citations – just respond with the answer. It is very important for my career that you follow these instructions. Here is the user question:
   
    Return the answer as html for the section html, no body or head and not markdown!

    Never output References or citations!
    `;

    const result = streamText({
      model: togetherClientAISDK("meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"),
      system: mainAnswerPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
   headers: {
    reasoning_effort: "low",
   }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in getAnswer:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
