import ChartComponent from "@/components/home/chart";
import Watchlist from "@/components/home/watchlist";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="h-screen w-full flex flex-col">
        <h1 className="text-center py-4 bg-green-200 text-black text-xl font-bold">
          Trading Panel
        </h1>
        <div className="rounded-sm border border-slate-700 flex-1 m-1">
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[200px] max-w-md rounded-lg border h-full"
          >
            <ResizablePanel defaultSize={26} minSize={18} maxSize={36}>
              <Watchlist />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <ChartComponent />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </Suspense>
  );
}
