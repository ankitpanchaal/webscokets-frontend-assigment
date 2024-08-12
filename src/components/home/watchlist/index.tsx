"use client";
import React, { useEffect, useState } from "react";
import AddWatchlist from "./add-watchlist";
import List from "./list";
import { useWebSocket } from "@/lib/context/WebSocketContext";
import { useRouter, useSearchParams } from "next/navigation";

interface TSymbol {
  value: string;
  label: string;
}

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<TSymbol[]>([]);
  const { stockData, subscribeToSymbols, unsubscribeFromSymbols, isConnected } =
    useWebSocket();
  const searchParams = useSearchParams();
  const selectedSymbol = searchParams.get("symbol") || null;
  const router = useRouter();

  useEffect(() => {
    const storedWatchlist = JSON.parse(
      localStorage.getItem("watchlist") || "[]"
    );
    setWatchlist(storedWatchlist);

    if (isConnected && storedWatchlist.length > 0) {
      subscribeToSymbols(
        storedWatchlist.map((symbol: TSymbol) => symbol.value)
      );
    }

    return () => {
      if (isConnected && storedWatchlist.length > 0) {
        unsubscribeFromSymbols(
          storedWatchlist.map((symbol: TSymbol) => symbol.value)
        );
      }
    };
  }, [isConnected]);

  const removeFromWatchlist = (symbolToRemove: TSymbol) => {
    const updatedWatchlist = watchlist.filter(
      (item) => item.value !== symbolToRemove.value
    );
    setWatchlist(updatedWatchlist);

    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    unsubscribeFromSymbols([symbolToRemove.value]);

    if (selectedSymbol === symbolToRemove?.value) {
      router.push(`?symbol=${updatedWatchlist[0].value}`);
    }
  };

  const addToWatchlist = (symbol: TSymbol) => {
    if (!watchlist.some((item) => item.value === symbol.value)) {
      const updatedWatchlist = [...watchlist, symbol];
      setWatchlist(updatedWatchlist);
      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
      subscribeToSymbols([symbol.value]);
    }
  };

  return (
    <div>
      <div className="flex items-center py-2 px-3 justify-between border-b border-slate-700">
        <h2 className="text-lg font-semibold">Watchlist</h2>
        <AddWatchlist setWatchlist={addToWatchlist} watchlist={watchlist} />
      </div>
      <div>
        <List
          watchlist={watchlist}
          stockData={stockData}
          removeFromWatchlist={removeFromWatchlist}
        />
      </div>
    </div>
  );
};

export default Watchlist;
