<a href="https://www.turboseek.io">
  <img alt="Turbo Seek" src="./public/og-image.png">
  <h1 align="center">TurboSeek</h1>
</a>

<p align="center">
  An open source AI search engine. Powered by Together.ai.
</p>

## Tech stack

- Next.js app router with Tailwind
- Together AI for LLM inference
- Mixtral 8x7B & Llama-3 for the LLMs
- Bing for the search API
- Helicone for observability
- Plausible for website analytics

## How it works

1. Take in a user's question
2. Make a request to the bing search API to look up the top 6 results and show them
3. Scrape text from the 6 links bing sent back and store it as context
4. Make a request to Mixtral-8x7B with the user's question + context & stream it back to the user
5. Make another request to Llama-3-8B to come up with 3 related questions the user can follow up with

## Cloning & running

1. Fork or clone the repo
2. Create an account at [Together AI](https://dub.sh/together-ai)
3. Create an account with Azure to get a [Bing search API key](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)
4. Create an account at [Helicone](https://www.helicone.ai/)
5. Create a `.env` (use the `.example.env` for reference) and replace the API keys
6. Run `npm install` and `npm run dev` to install dependencies and run locally

## Future tasks

- [ ] Try to parse the sources in a more efficient way to make the app faster overall: Try Serper API
- [ ] Have the AI tool ignore video links like Youtube cause can't scrape them fast
- [ ] Make sure the answer correctly cites all the sources in the text & number the citations in the UI
- [ ] Add sharability to allow folks to share answers
- [ ] Automatically scroll when an answer is happening, especially for mobile
- [ ] Fix hard refresh in the header and footer by migrating answers to a new page
- [ ] Add upstash redis for caching results & rate limiting users
- [ ] Add in more advanced RAG techniques like keyword search & question rephrasing
- [ ] Add authentication with Clerk if it gets popular along with postgres/prisma to save user sessions

## Inspiration

- Perplexity
- You.com
- Lepton search
