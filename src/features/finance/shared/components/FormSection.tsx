type FormSectionProps = {
    step: number;
    title: string;
    children: React.ReactNode;
    toggle?: boolean;
    onToggle?: () => void;
};

export const FormSection: React.FC<FormSectionProps> = ({ step, title, children, toggle, onToggle }) => (
    <div
        className="rounded-lg"
        style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}
    >
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 p-3.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {step}
            </span>
            <h3 className="text-sm font-bold uppercase text-gray-800">{title}</h3>
            {/* Toggle Switch */}
            {toggle !== undefined && (
              <button
                onClick={onToggle}
                className="focus:outline-none transition-transform active:scale-90"
                type="button"
                aria-label="Alternar sección"
              >
                {toggle ? (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7H8C5.243 7 3 9.243 3 12s2.243 5 8 5h8c2.757 0 5-2.243 5-5s-2.243-5-5-5zM16 14a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7h8c2.757 0 5 2.243 5 5s-2.243 5-5 5H8c-2.757 0-5-2.243-5-5s2.243-5 5-5zm0 7a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                )}
              </button>
            )}
        </div>
        <div className={`flex flex-col gap-5 p-5 pt-0 
        ${toggle !== undefined ? (toggle ? 'max-h-[2000px] opacity-100 py-4' : 
            'max-h-0 opacity-0 py-0 overflow-hidden') : 'py-4'}`}
        >
            {children}
        </div>
    </div>
);
