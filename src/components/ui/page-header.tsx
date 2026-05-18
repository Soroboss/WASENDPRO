import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="page-title flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/25 bg-neon/10 text-neon shadow-glow">
              <Icon className="h-5 w-5" />
            </span>
          )}
          {title}
        </h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
