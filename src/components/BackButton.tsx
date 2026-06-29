"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

const BackButton = ({ className, onClick }: BackButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-sm
      transition-all duration-300 hover:bg-white/20 active:scale-95 ${className ?? ""}`}
      aria-label="Go back"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  );
};

export default BackButton;
