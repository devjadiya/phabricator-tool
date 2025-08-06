import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text: string;
}

const LoadingSpinner = ({ text }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/10 rounded-xl">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
      <p className="text-white font-semibold text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
