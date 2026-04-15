import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const EmptyState = ({ icon: Icon, title, subtitle, buttonLabel, onButtonClick }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="px-5 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
