// "use client";

// import Answer from "@/components/Answer";
// import Footer from "@/components/Footer";
// import Header from "@/components/Header";
// import Hero from "@/components/Hero";
// import InputArea from "@/components/InputArea";
// import SimilarTopics from "@/components/SimilarTopics";
// import Sources from "@/components/Sources";
// import Image from "next/image";
// import { useRef, useState } from "react";
// import {
//   createParser,
//   ParsedEvent,
//   ReconnectInterval,
// } from "eventsource-parser";

// export default function Home() {
//   const [promptValue, setPromptValue] = useState("");
//   const [question, setQuestion] = useState("");
//   const [showResult, setShowResult] = useState(false);
//   const [sources, setSources] = useState<{ name: string; url: string }[]>([]);
//   const [isLoadingSources, setIsLoadingSources] = useState(false);
//   const [answer, setAnswer] = useState("");
//   const [similarQuestions, setSimilarQuestions] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const chatContainerRef = useRef<HTMLDivElement>(null);

//   const handleDisplayResult = async (newQuestion?: string) => {
//     newQuestion = newQuestion || promptValue;

//     setShowResult(true);
//     setLoading(true);
//     setQuestion(newQuestion);
//     setPromptValue("");

//     await Promise.all([
//       handleSourcesAndAnswer(newQuestion),
//       handleSimilarQuestions(newQuestion),
//     ]);

//     setLoading(false);
//   };

//   async function handleSourcesAndAnswer(question: string) {
//     setIsLoadingSources(true);
//     let sourcesResponse = await fetch("/api/getSources", {
//       method: "POST",
//       body: JSON.stringify({ question }),
//     });
//     if (sourcesResponse.ok) {
//       let sources = await sourcesResponse.json();

//       setSources(sources);
//     } else {
//       setSources([]);
//     }
//     setIsLoadingSources(false);

//     const response = await fetch("/api/getAnswer", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ question, sources }),
//     });

//     if (!response.ok) {
//       throw new Error(response.statusText);
//     }

//     if (response.status === 202) {
//       const fullAnswer = await response.text();
//       setAnswer(fullAnswer);
//       return;
//     }

//     // This data is a ReadableStream
//     const data = response.body;
//     if (!data) {
//       return;
//     }

//     const onParse = (event: ParsedEvent | ReconnectInterval) => {
//       if (event.type === "event") {
//         const data = event.data;
//         try {
//           const text = JSON.parse(data).text ?? "";
//           setAnswer((prev) => prev + text);
//         } catch (e) {
//           console.error(e);
//         }
//       }
//     };

//     // https://web.dev/streams/#the-getreader-and-read-methods
//     const reader = data.getReader();
//     const decoder = new TextDecoder();
//     const parser = createParser(onParse);
//     let done = false;
//     while (!done) {
//       const { value, done: doneReading } = await reader.read();
//       done = doneReading;
//       const chunkValue = decoder.decode(value);
//       parser.feed(chunkValue);
//     }
//   }

//   async function handleSimilarQuestions(question: string) {
//     let res = await fetch("/api/getSimilarQuestions", {
//       method: "POST",
//       body: JSON.stringify({ question }),
//     });
//     let questions = await res.json();
//     setSimilarQuestions(questions);
//   }

//   const reset = () => {
//     setShowResult(false);
//     setPromptValue("");
//     setQuestion("");
//     setAnswer("");
//     setSources([]);
//     setSimilarQuestions([]);
//   };

//   return (
//     <>
//       <Header />
//       <main className="h-full px-4 pb-4">
//         {!showResult && (
//           <Hero
//             promptValue={promptValue}
//             setPromptValue={setPromptValue}
//             handleDisplayResult={handleDisplayResult}
//           />
//         )}

//         {showResult && (
//           <div className="flex h-full min-h-[68vh] w-full grow flex-col justify-between">
//             <div className="container w-full space-y-2">
//               <div className="container space-y-2">
//                 <div className="container flex w-full items-start gap-3 px-5 pt-2 lg:px-10">
//                   <div className="flex w-fit items-center gap-4">
//                     <Image
//                       unoptimized
//                       src={"/img/message-question-circle.svg"}
//                       alt="message"
//                       width={30}
//                       height={30}
//                       className="size-[24px]"
//                     />
//                     <p className="pr-5 font-bold uppercase leading-[152%] text-black">
//                       Question:
//                     </p>
//                   </div>
//                   <div className="grow">&quot;{question}&quot;</div>
//                 </div>
//                 <>
//                   <Sources sources={sources} isLoading={isLoadingSources} />
//                   <Answer answer={answer} />
//                   <SimilarTopics
//                     similarQuestions={similarQuestions}
//                     handleDisplayResult={handleDisplayResult}
//                     reset={reset}
//                   />
//                 </>
//               </div>

//               <div className="pt-1 sm:pt-2" ref={chatContainerRef}></div>
//             </div>
//             <div className="container px-4 lg:px-0">
//               <InputArea
//                 promptValue={promptValue}
//                 setPromptValue={setPromptValue}
//                 handleDisplayResult={handleDisplayResult}
//                 disabled={loading}
//                 reset={reset}
//               />
//             </div>
//           </div>
//         )}
//       </main>
//       <Footer />
//     </>
//   );
// }

"use client";

import Answer from "@/components/Answer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import InputArea from "@/components/InputArea";
import SimilarTopics from "@/components/SimilarTopics";
import Sources from "@/components/Sources";
import Image from "next/image";
import { useRef, useState } from "react";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { RotateCcw } from "lucide-react";
export default function Home() {
  const [promptValue, setPromptValue] = useState("");
  const [question, setQuestion] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [sources, setSources] = useState<{ name: string; url: string }[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [answer, setAnswer] = useState("");
  const [similarQuestions, setSimilarQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false); // New state
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleDisplayResult = async (newQuestion?: string) => {
    newQuestion = newQuestion || promptValue;

    setShowResult(true);
    setLoading(true);
    setQuestion(newQuestion);
    setPromptValue("");

    await Promise.all([
      handleSourcesAndAnswer(newQuestion),
      handleSimilarQuestions(newQuestion),
    ]);

    setLoading(false);
  };

  async function handleSourcesAndAnswer(question: string) {
    setIsLoadingSources(true);
    let sourcesResponse = await fetch("/api/getSources", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    if (sourcesResponse.ok) {
      let sources = await sourcesResponse.json();
      setSources(sources);
    } else {
      setSources([]);
    }
    setIsLoadingSources(false);

    const response = await fetch("/api/getAnswer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, sources }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    if (response.status === 202) {
      const fullAnswer = await response.text();
      setAnswer(fullAnswer);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          setAnswer((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
  }

  async function handleSimilarQuestions(question: string) {
    let res = await fetch("/api/getSimilarQuestions", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    let questions = await res.json();
    setSimilarQuestions(questions);
  }

  const reset = () => {
    setShowResult(false);
    setPromptValue("");
    setQuestion("");
    setAnswer("");
    setSources([]);
    setSimilarQuestions([]);
  };

  // New function for regenerating answer
 const handleRegenerate = async () => {
   if (!question) return;

   setRegenerating(true);
   setAnswer("");
   setSources([]);
   setSimilarQuestions([]);

   await Promise.all([
     handleSourcesAndAnswer(question), // Fetch answer & sources
     handleSimilarQuestions(question), // Fetch similar questions
   ]);

   setRegenerating(false);
 };


  return (
    <>
      <Header />
      <main className="h-full px-4 pb-4">
        {!showResult && (
          <Hero
            promptValue={promptValue}
            setPromptValue={setPromptValue}
            handleDisplayResult={handleDisplayResult}
          />
        )}

        {showResult && (
          <div className="flex h-full min-h-[68vh] w-full grow flex-col justify-between">
            <div className="container w-full space-y-2">
              <div className="container space-y-2">
                <div className="container flex w-full items-start gap-3 px-5 pt-2 lg:px-10">
                  <div className="flex w-fit items-center gap-4">
                    <Image
                      unoptimized
                      src={"/img/message-question-circle.svg"}
                      alt="message"
                      width={30}
                      height={30}
                      className="size-[24px]"
                    />
                    <p className="pr-5 font-bold uppercase leading-[152%] text-black">
                      Question:
                    </p>
                  </div>
                  <div className="grow">&quot;{question}&quot;</div>
                </div>

                <Sources sources={sources} isLoading={isLoadingSources} />

                <Answer answer={answer} />

                {/* Regenerate Button */}
                {/* <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleRegenerate}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                    disabled={regenerating}
                  >
                    {regenerating ? "Regenerating..." : "Regenerate Answer"}
                  </button>
                </div> */}

                <SimilarTopics
                  similarQuestions={similarQuestions}
                  handleDisplayResult={handleDisplayResult}
                  reset={reset}
                />

                {/* Regenerate Button - Now Below Similar Topics */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center justify-center rounded-full bg-[#3A3738] p-2 text-white shadow-md transition-all hover:bg-[#3A3738] disabled:opacity-50 "
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <RotateCcw className="bg- h-4 w-4 animate-spin text-white" />
                    ) : (
                      <RotateCcw className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1 sm:pt-2" ref={chatContainerRef}></div>
            </div>
            <div className="container px-4 lg:px-0">
              <InputArea
                promptValue={promptValue}
                setPromptValue={setPromptValue}
                handleDisplayResult={handleDisplayResult}
                disabled={loading}
                reset={reset}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}






