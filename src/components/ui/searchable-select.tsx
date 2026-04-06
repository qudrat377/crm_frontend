"use client";
import React, { forwardRef, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, X, Loader2, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

interface SearchableSelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: any) => void;
  name?: string;
  onSearchChange?: (term: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const SearchableSelect = forwardRef<HTMLInputElement, SearchableSelectProps>(
  ({ className, label, error, options, placeholder = "Tanlang...", required, disabled, value, onChange, name, onSearchChange, isLoading, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutside(containerRef, () => setIsOpen(false));

    // Internal filtering if onSearchChange is not provided
    const displayOptions = onSearchChange
      ? options
      : options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const selectedOption = options.find(o => o.value === value);

    const handleSelect = (val: string) => {
      setIsOpen(false);
      setSearchTerm("");
      
      // Mimic standard "onChange" event for react-hook-form and generic handlers
      if (onChange) {
        onChange({ target: { name, value: val } });
      }
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* React Hook Form binding */}
          <input type="hidden" ref={ref} name={name} value={value || ""} {...props} />

          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between rounded-xl border bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-surface-50 dark:bg-surface-900/50 disabled:cursor-not-allowed",
              error ? "border-danger-300 focus:ring-danger-500" : "border-surface-200 dark:border-surface-700 hover:border-surface-300",
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn("block truncate", !selectedOption && "text-surface-400 dark:text-surface-500")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-1 text-surface-400 dark:text-surface-500">
              {selectedOption && !disabled && (
                <div
                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect("");
                  }}
                >
                  <X className="w-3.5 h-3.5 hover:text-danger-500 transition-colors" />
                </div>
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </div>
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-surface-100 dark:border-surface-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-surface-400 dark:text-surface-500 flex-shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-sm text-surface-900 dark:text-surface-50 placeholder:text-surface-400 focus:outline-none"
                  placeholder="Qidiruv..."
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                />
                {isLoading && <Loader2 className="w-4 h-4 text-brand-500 animate-spin flex-shrink-0" />}
              </div>
              
              <ul className="max-h-60 overflow-y-auto p-1 space-y-1">
                {displayOptions.length === 0 ? (
                  <li className="py-3 text-center text-sm text-surface-500 dark:text-surface-400">
                    Natija topilmadi
                  </li>
                ) : (
                  displayOptions.map((o) => {
                    const isSelected = o.value === value;
                    return (
                      <li
                        key={o.value}
                        className={cn(
                          "flex items-center py-2 px-3 text-sm rounded-lg cursor-pointer transition-colors",
                          isSelected
                            ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium"
                            : "text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800"
                        )}
                        onClick={() => handleSelect(o.value)}
                      >
                        <span className="flex-1 truncate">{o.label}</span>
                        {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      </div>
    );
  }
);
SearchableSelect.displayName = "SearchableSelect";
