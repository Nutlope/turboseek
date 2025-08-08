import { Readability } from "@mozilla/readability";
import jsdom, { JSDOM } from "jsdom";
import {
  TogetherAIStream,
  TogetherAIStreamPayload,
} from "@/utils/TogetherAIStream";
import { togetherClient } from "@/utils/clients";
import { SearchResults } from "@/utils/sharedTypes";


export const maxDuration = 45;

export async function POST(request: Request) {
  let { question, sources } = await request.json();

  const finalResults: SearchResults[] = sources

  const mainAnswerPrompt = `
  Given a user question and some context, please write a clean, concise and accurate answer to the question based on the context. You will be given a set of related contexts to the question, each starting with a reference number like [[citation:x]], where x is a number. Please use the context when crafting your answer.

  Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

  Here are the set of contexts:

  <contexts>
  ${finalResults.map(
    (result, index) => `[[citation:${index}]] ${result.content} \n\n`,
  )}
  </contexts>

  Remember, don't blindly repeat the contexts verbatim and don't tell the user how you used the citations – just respond with the answer. It is very important for my career that you follow these instructions. Here is the user question:
    `;

  try {
    const payload: TogetherAIStreamPayload = {
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: mainAnswerPrompt },
        {
          role: "user",
          content: question,
        },
      ],
      stream: true,
    };

    console.log(
      "[getAnswer] Fetching answer stream from Together API using text and question",
    );
    const stream = await TogetherAIStream(payload);
    // TODO: Need to add error handling here, since a non-200 status code doesn't throw.
    return new Response(stream, {
      headers: new Headers({
        "Cache-Control": "no-cache",
      }),
    });
  } catch (e) {
    // If for some reason streaming fails, we can just call it without streaming
    console.log(
      "[getAnswer] Answer stream failed. Try fetching non-stream answer.",
    );
    let answer = await togetherClient.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: mainAnswerPrompt },
        {
          role: "user",
          content: question,
        },
      ],
    });

    let parsedAnswer = answer.choices![0].message?.content;
    console.log("Error is: ", e);
    return new Response(parsedAnswer, { status: 202 });
  }
}

