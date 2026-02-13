// Component: Form Section
export const FormSection: React.FC<{
  title: string;
  number: number;
  subtitle?: string;
  children: React.ReactNode;
  toggle?: boolean;
  onToggle?: () => void;
}> = ({ title, number, subtitle, children, toggle, onToggle }) => (
  <>
    <div className="card-header px-2 mt-2">
      <div className="card-title">
        <span className="badge bg-info rounded-circle me-1 fs-6  ">{number}</span>
        <div className="ms-2 me-auto lh-1">
          <div className="fw-semibold fs-7">
            {title}
            {toggle !== undefined && (
              <label className="float-end ms-2">
                <i 
                  className={`fa-solid ${toggle ? 'fa-toggle-on' : 'fa-toggle-off'} fs-5 text-dark`}
                  style={{ cursor: 'pointer' }}
                  onClick={onToggle}
                />
              </label>
            )}
          </div>
          {subtitle && <small className="fs-8">{subtitle}</small>}
        </div>
      </div>
    </div>
    <div className={`card-body px-2 pb-0 ${toggle !== undefined ? `collapse ${toggle ? 'show' : ''}` : ''}`}>
      {children}
    </div>
  </>
);