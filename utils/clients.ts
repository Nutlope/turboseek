import Exa from "exa-js";
import Together from "together-ai";
import { createTogetherAI } from '@ai-sdk/togetherai';


export const togetherClient = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://together.helicone.ai/v1",
    defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Property-AppName": "turboseek",
    },
});


export const togetherClientAISDK = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY ?? '',
});


export const exaClient = new Exa(process.env.EXA_API_KEY);