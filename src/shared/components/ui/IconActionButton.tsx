export interface IconActionButtonProps {
  iconClassName: string;
  ariaLabel: string;
  onClick?: () => void;
}

export const IconActionButton: React.FC<IconActionButtonProps> = ({
  iconClassName,
  ariaLabel,
  onClick,
}) => (
  <button
    type="button"
    className="cursor-pointer inline-flex items-center justify-center rounded bg-sky-50 px-6 py-3 text-blue-600 transition-colors hover:bg-sky-100"
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <i className={iconClassName}></i>
  </button>
);
