"use client";
import { X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ children, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      } transition-all duration-300`}
    >
      <div
        className="bg-slate-950 rounded-lg shadow-lg p-6 w-full max-w-md"
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {children}
        <X
          className="absolute top-2 right-2 z-10 text-black cursor-pointer"
          size={24}
          onClick={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
