"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface WatchlistDataItem {
  symbol: string;
  ltp: number;
  change: string;
}

interface WebSocketContextType {
  stockData: { [key: string]: WatchlistDataItem };
  subscribeToSymbols: (symbols: string[]) => void;
  unsubscribeFromSymbols: (symbols: string[]) => void;
  isConnected: boolean;
}

//init context
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stockData, setStockData] = useState<{
    [key: string]: WatchlistDataItem;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const subscribedSymbols = useRef<Set<string>>(new Set());

  const connectWebSocket = () => {
    // if (
    //   socketRef.current && socketRef.current.readyState === WebSocket.OPEN
    // ) {
    //   return;
    // }
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/dataWS?token=abcd`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      if (subscribedSymbols.current.size > 0) {
        socket.send(
          JSON.stringify({
            action: "subscribe",
            tokens: Array.from(subscribedSymbols.current),
          })
        );
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "Data") {
        setStockData((prev) => ({
          ...prev,
          [message.data.symbol]: {
            symbol: message.data.symbol,
            ltp: message.data.ltp,
            change: (
              ((message.data.ltp - message.data.prev_day_close) /
                message.data.prev_day_close) *
              100
            ).toFixed(2),
          },
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000); // reconnect after 5 seconds
    };

    socket.onerror = (error) => {
      console.error("WebSocket error: >?> ", error);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const subscribeToSymbols = (symbols: string[]) => {
    symbols.forEach((symbol) => subscribedSymbols.current.add(symbol));
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: "subscribe", tokens: symbols })
      );
    }
  };

  const unsubscribeFromSymbols = (symbols: string[]) => {
    symbols.forEach((symbol) => subscribedSymbols.current.delete(symbol));
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: "unsubscribe", tokens: symbols })
      );
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        stockData,
        subscribeToSymbols,
        unsubscribeFromSymbols,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
