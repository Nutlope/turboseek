import Image from "next/image";
import SourceCard from "./SourceCard";
import { SearchResults } from "@/utils/sharedTypes";

export default function Sources({
  sources,
  isLoading,
}: {
  sources: SearchResults[];
  isLoading: boolean;
}) {
  return (
    <div className="container h-auto w-full shrink-0 rounded-lg border border-solid border-[#C2C2C2] bg-white p-4 lg:p-8">
      <div className="flex items-start gap-4 pb-3 lg:pb-3.5">
        <Image
          unoptimized
          src="/img/sources.svg"
          alt="footer"
          width={24}
          height={24}
        />
        <h3 className="text-base font-bold uppercase leading-[152.5%] text-black">
          sources:{" "}
        </h3>
      </div>
      <div className="flex w-full max-w-[890px] flex-wrap content-center items-center gap-[15px]">
        {isLoading ? (
          <>
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
          </>
        ) : sources.length > 0 ? (
          sources.map((source) => (
            <SourceCard source={source} key={source.url} />
          ))
        ) : (
          <div>Could not fetch sources.</div>
        )}
      </div>
    </div>
  );
}
