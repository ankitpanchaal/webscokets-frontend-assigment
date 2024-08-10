"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import AddWatchlist from "./add-watchlist";
import List from "./list";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<TSymbol[]>([]);
  const [stockData, setStockData] = useState<{
    [key: string]: WatchlistDataItem;
  }>({});
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/dataWS?token=abcd`
    );
    socketRef.current = socket;

    // Load watchlist from local storage
    const storedWatchlist = JSON.parse(
      localStorage.getItem("watchlist") || "[]"
    );
    if (storedWatchlist) {
      setWatchlist(storedWatchlist);
    }

    socket.onopen = () => {
      console.log("WebSocket connected");
      storedWatchlist.forEach((symbol: TSymbol) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({ action: "subscribe", tokens: [symbol.value] })
          );
        }
      });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "Data") {
        setStockData((prev) => ({
          ...prev,
          [data.data.symbol]: {
            symbol: data.data.symbol,
            ltp: data.data.ltp,
            change: (
              ((data.data.ltp - data.data.prev_day_close) /
                data.data.prev_day_close) *
              100
            ).toFixed(2),
          },
        }));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }, [watchlist]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              action: "unsubscribe",
              tokens: watchlist.map((item) => item.value),
            })
          );
        }
        socketRef.current.close();
      }
    };
  }, []);

  const removeFromWatchlist = (symbolToRemove: TSymbol) => {
    const updatedWatchlist = watchlist.filter(
      (item) => item.value !== symbolToRemove.value
    );
    setWatchlist(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));

    setStockData((prevStockData) => {
      const updatedStockData = { ...prevStockData };
      delete updatedStockData[symbolToRemove.value];
      return updatedStockData;
    });
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: "unsubscribe",
          tokens: [symbolToRemove.value],
        })
      );
    }
  };

  const addToWatchlist = (symbol: TSymbol) => {
    if (!watchlist.some((item) => item.value === symbol.value)) {
      const updatedWatchlist = [...watchlist, symbol];
      setWatchlist(updatedWatchlist);
      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({ action: "subscribe", tokens: [symbol.value] })
        );
      }
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
