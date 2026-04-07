import { useState } from "react";

export type ReportCheckboxProps = {
  name: string;
  label: string;
};

export const ReportCheckbox: React.FC<ReportCheckboxProps> = ({
  name,
  label,
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex items-center gap-4 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        className="sr-only"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      <div
        className="h-5 w-5 rounded border border-gray-200 bg-white flex items-center justify-center transition-colors"
        style={{ backgroundColor: checked ? "#155dfc" : "#ffffff" }}
      >
        <svg
          className={`h-3 w-3 text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.415l2.793 2.793 6.793-6.793a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {label}
    </label>
  );
};
