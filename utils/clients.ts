import Exa from "exa-js";
import Together from "together-ai";

export const togetherClient = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://together.helicone.ai/v1",
    defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Property-AppName": "turboseek",
    },
});


export const exaClient = new Exa(process.env.EXA_API_KEY);