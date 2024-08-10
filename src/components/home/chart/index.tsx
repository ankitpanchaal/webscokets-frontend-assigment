"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  MutableRefObject,
} from "react";
import Chart from "./chart";
import { useRouter, useSearchParams } from "next/navigation";

interface DataPoint {
  timestamp_str: string;
  ltp: number;
}

const ChartComponent: React.FC = () => {
  const [latestData, setLatestData] = useState<DataPoint | null>(null);
  const [resetChart, setResetChart] = useState<boolean>(false);
  const searchParams = useSearchParams();

  const selectedSymbol = searchParams.get("symbol") || null;

  const socketRef = useRef<WebSocket | null>(null);
  const currentSymbolRef = useRef<string | null>(
    selectedSymbol
  ) as MutableRefObject<string | null>;

  const cleanUpSocket = useCallback(() => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      currentSymbolRef.current
    ) {
      socketRef.current.send(
        JSON.stringify({
          action: "unsubscribe",
          tokens: [currentSymbolRef.current],
        })
      );
    }
  }, []);

  const subscribeToSymbol = useCallback((symbol: string | null) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      symbol
    ) {
      socketRef.current.send(
        JSON.stringify({ action: "subscribe", tokens: [symbol] })
      );
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/dataWS?token=abcd`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected, subscribing to", selectedSymbol);
      subscribeToSymbol(selectedSymbol);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "Data") {
        const dataPoint: DataPoint = {
          timestamp_str: message.data.timestamp_str,
          ltp: message.data.ltp,
        };
        console.log("Received data point:", dataPoint);
        setLatestData(dataPoint);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed", event.reason);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [subscribeToSymbol]);

  useEffect(() => {
    if (currentSymbolRef.current !== selectedSymbol) {
      console.log("Symbol changed, resetting chart and updating subscription");
      setResetChart(true);
      setLatestData(null);

      cleanUpSocket(); // Unsubscribe  old symbol
      currentSymbolRef.current = selectedSymbol;

      // Subscribe to the new symbol
      subscribeToSymbol(selectedSymbol);
    }
  }, [selectedSymbol, subscribeToSymbol]);

  useEffect(() => {
    if (resetChart) {
      console.log("Resetting chart flag");
      setResetChart(false);
    }
  }, [resetChart]);

  return (
    <div className="grid h-full w-full">
      <Chart resetChart={resetChart} latestData={latestData} />
    </div>
  );
};

export default ChartComponent;
