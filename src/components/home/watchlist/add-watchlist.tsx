"use client";
import Dialog from "@/components/ui/dialog";
import { SYMBOLS } from "@/constants/symbols";
import { Plus, Search } from "lucide-react";
import React, { useState } from "react";

type AddWatchlistProps = {
  setWatchlist: (watchlist: TSymbol) => void;
  watchlist: TSymbol[];
};

const AddWatchlist = ({ watchlist, setWatchlist }: AddWatchlistProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const filteredSymbols = SYMBOLS.filter(
    (symbol) =>
      symbol.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !watchlist.some((w) => w.value === symbol.value)
  );

  return (
    <div className="flex items-center space-x-2">
      <button
        className="bg-slate-950 hover:bg-slate-800 text-white font-bold p-2 rounded-md "
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus size={16} />
      </button>

      <Dialog isOpen={isDialogOpen} onClose={handleDialogClose}>
        <div className="flex flex-col space-y-4 bg-slate-950">
          <div className="flex items-center border border-slate-700 rounded-full p-2">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search stocks"
              className="w-full border-none rounded bg-transparent text-white focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            {filteredSymbols.map((symbol) => (
              <button
                onClick={() => setWatchlist(symbol)}
                key={symbol.value}
                className="bg-slate-900  hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md flex items-center gap-x-4"
              >
                <span className="p-3 h-fit rounded-full bg-slate-300 flex-shrink-0"></span>
                {symbol.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-md"
              onClick={handleDialogClose}
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AddWatchlist;
