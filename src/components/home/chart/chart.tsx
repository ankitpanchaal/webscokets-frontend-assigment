import React, { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
} from "lightweight-charts";

interface ChartProps {
  latestData: {
    timestamp_str: string;
    ltp: number;
  } | null;
  resetChart: boolean;
}

const Chart: React.FC<ChartProps> = ({ latestData, resetChart }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: "#000000" },
          textColor: "rgba(255, 255, 255, 0.9)",
        },
        grid: {
          vertLines: {
            color: "rgba(197, 203, 206, 0.5)",
          },
          horzLines: {
            color: "rgba(197, 203, 206, 0.5)",
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeries = chart.addLineSeries({
        color: "rgba(4, 111, 232, 1)",
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = lineSeries;

      return () => {
        chart.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (resetChart && seriesRef.current) {
      console.log("Resetting chart data");
      seriesRef.current.setData([]);
    }
  }, [resetChart]);

  useEffect(() => {
    if (latestData && seriesRef.current) {
      console.log("Adding new data point:", latestData);
      const newPoint: LineData = {
        // time: new Date(latestData.timestamp_str).getTime() / 1000,
        time: (new Date(latestData.timestamp_str).getTime() / 1000) as Time,
        value: latestData.ltp,
      };
      seriesRef.current.update(newPoint);
    }
  }, [latestData]);

  return <div ref={chartContainerRef} className="h-[90vh] w-full" />;
};

export default Chart;
