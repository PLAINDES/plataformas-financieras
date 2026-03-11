export interface TooltipProps {
  id: string;
  content: string;
  className?: string;
}

export const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  id,
  content,
  className,
  children,
}) => (
  <div className={`relative group ${className ?? ""}`}>
    {children}
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none absolute right-0 top-9 z-20 w-64 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      {content}
    </div>
  </div>
);
