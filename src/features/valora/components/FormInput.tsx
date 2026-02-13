// Component: Form Input
export const FormInput: React.FC<{
  label: string;
  name: string;
  type?: 'text' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  suffix?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  tooltip?: string;
}> = ({ label, name, type = 'text', value, onChange, options, suffix, required, readOnly, placeholder, tooltip }) => (
  <div className="mb-2 row">
    <label className="col-lg-4 col-form-label col-form-label-sm">
      {label}
      {tooltip && <i className="fas fa-info-circle ms-1 fs-8" title={tooltip} />}
    </label>
    <div className="col-lg-8">
      <div className={suffix ? 'input-group input-group-sm' : ''}>
        {type === 'select' ? (
          <select className="form-select form-select-sm" name={name} value={value} onChange={onChange} required={required}>
            <option value="">SELECCIONE</option>
            {options?.map(item => <option className='fw-normal' key={item} value={item}>{item}</option>)}
          </select>
        ) : (
          <input 
            type="text" 
            className="form-control form-control-sm" 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
          />
        )}
        {suffix && <span className="input-group-text fs-8">{suffix}</span>}
      </div>
      {name === 'dc_ratio' && <div className="form-text fs-8">Ingrese como decimal (ej: 0.35 para 35%)</div>}
      {name === 'effective_tax_rate' && <div className="form-text fs-8">Tasa efectiva real de impuestos de la empresa</div>}
      {name === 'beta_levered' && <div className="form-text fs-8">Beta que refleja el riesgo financiero y operativo</div>}
      {name === 'beta_unlevered' && <div className="form-text fs-8">Beta sin riesgo financiero, solo riesgo del negocio</div>}
    </div>
  </div>
);
