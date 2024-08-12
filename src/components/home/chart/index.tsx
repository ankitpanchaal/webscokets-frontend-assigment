"use client";
import React, { useEffect, useState, useRef } from "react";
import Chart from "./chart";
import { useSearchParams } from "next/navigation";
import { useWebSocket } from "@/lib/context/WebSocketContext";

interface DataPoint {
  timestamp_str: string;
  ltp: number;
}

const ChartComponent: React.FC = () => {
  const [latestData, setLatestData] = useState<DataPoint | null>(null);
  const [resetChart, setResetChart] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { stockData, subscribeToSymbols, unsubscribeFromSymbols, isConnected } =
    useWebSocket();

  const selectedSymbol = searchParams.get("symbol") || null;
  const currentSymbolRef = useRef<string | null>(selectedSymbol);

  useEffect(() => {
    if (isConnected && currentSymbolRef.current !== selectedSymbol) {
      console.log(
        "Symbol changed, resetting chart and updating subscription >?>"
      );
      setResetChart(true);
      setLatestData(null);

      if (currentSymbolRef.current) {
        unsubscribeFromSymbols([currentSymbolRef.current]);
      }

      currentSymbolRef.current = selectedSymbol;

      if (selectedSymbol) {
        subscribeToSymbols([selectedSymbol]);
      }
    }
  }, [selectedSymbol, isConnected, subscribeToSymbols]);

  useEffect(() => {
    if (selectedSymbol && stockData[selectedSymbol]) {
      setLatestData({
        timestamp_str: new Date().toISOString(),
        ltp: stockData[selectedSymbol].ltp,
      });
    }
  }, [stockData, selectedSymbol]);

  useEffect(() => {
    if (resetChart) {
      console.log("Resetting chart flag >?>");
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
