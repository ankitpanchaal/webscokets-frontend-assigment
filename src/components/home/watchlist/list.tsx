import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useRouter, useSearchParams } from "next/navigation";

type ListProps = {
  stockData: {
    [key: string]: WatchlistDataItem;
  };
  watchlist: TSymbol[];
  removeFromWatchlist: (symbol: TSymbol) => void;
};
const List = ({ stockData, watchlist, removeFromWatchlist }: ListProps) => {
  const [sortColumn, setSortColumn] = useState<keyof WatchlistDataItem | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedSymbol = searchParams.get("symbol") || null;

  const sortedData = sortColumn
    ? watchlist
        .map((item) => ({
          ...stockData[item.value],
          symbol: item.value,
          label: item.label,
        }))
        .sort((a, b) => {
          const valueA = a[sortColumn];
          const valueB = b[sortColumn];
          if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
          if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
    : watchlist.map((item) => ({
        ...stockData[item.value],
        symbol: item.value,
        label: item.label,
      }));

  //UI
  const renderSymbolColumn = () => (
    <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-slate-950 text-white border-b border-slate-700">
            {renderTableHeader("Symbol", "symbol")}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.symbol}
              className={`border-b border-slate-700 group cursor-pointer ${
                selectedSymbol === item.symbol ? "bg-slate-700" : ""
              }`}
              onClick={() => handleRowClick(item.symbol)}
            >
              <td className="py-2 px-3 border-r border-slate-700 font-medium flex justify-between items-center">
                {item.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist({
                      value: item.symbol,
                      label: item.label,
                    });
                  }}
                  className="hidden group-hover:block text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ResizablePanel>
  );

  const handleSort = (column: keyof WatchlistDataItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const handleRowClick = (symbol: string) => {
    router.push(`/?symbol=${symbol}`);
  };

  const renderTableHeader = (
    title: string,
    column: keyof WatchlistDataItem
  ) => (
    <th
      className="py-2 px-3 text-left font-semibold cursor-pointer"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-x-2">
        {title}
        {renderSortIcon(column)}
      </div>
    </th>
  );

  const renderSortIcon = (column: keyof WatchlistDataItem) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? (
        <ChevronUp size={16} />
      ) : (
        <ChevronDown size={16} />
      );
    }
    return <ChevronUp size={16} className="text-slate-500 hover:text-white" />;
  };

  const renderDataColumn = (
    title: string,
    column: keyof WatchlistDataItem,
    cellRenderer: (item: WatchlistDataItem) => React.ReactNode
  ) => (
    <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-slate-950 text-white border-b border-slate-700">
            {renderTableHeader(title, column)}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.symbol}
              className={`border-b border-slate-700 cursor-pointer ${
                selectedSymbol === item.symbol ? "bg-slate-700" : ""
              }`}
              onClick={() => handleRowClick(item.symbol)}
            >
              <td className="py-2 px-3 font-medium">{cellRenderer(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ResizablePanel>
  );

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        {renderSymbolColumn()}
        <ResizableHandle />
        {renderDataColumn("Change", "change", (item) => (
          <span
            className={
              Number(item.change) < 0 ? "text-red-500" : "text-green-500"
            }
          >
            {item.change || "-"}%
          </span>
        ))}
        <ResizableHandle />
        {renderDataColumn("LTP", "ltp", (item) => item.ltp || "-")}
      </ResizablePanelGroup>
    </div>
  );
};

export default List;
