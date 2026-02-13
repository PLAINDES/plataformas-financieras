// Component: Balance Sheet Visual Block
export const BalanceSheetBlock: React.FC<{
  koa: string;
  kd: string;
  ke: string;
}> = ({ koa, kd, ke }) => (
  <div className="bs-balance-block" style={{ height: '250px', width: '300px', margin: 'auto' }}>
    <div className="bs-balance-content" >
      <div style={{ width: '50%' }}>
        <div className="bs-block-activo">
          <div className="bs-block-label">Activo</div>
          <div className="bs-block-value">Koa = {koa}</div>
        </div>
      </div>
      <div style={{ width: '50%' }}>
        <div className="bs-block-pasivo">
          <div className="bs-block-label">Pasivo</div>
          <div className="bs-block-value">Kd(1-T) = {kd}</div>
        </div>
        <div className="bs-block-patrimonio">
          <div className="bs-block-label">Patrimonio</div>
          <div className="bs-block-value">Ke = {ke}</div>
        </div>
      </div>
    </div>
    <div className="bs-block-legend">
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-ke"></div>
        <div className="bs-legend-text">Ke</div>
      </div>
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-koa"></div>
        <div className="bs-legend-text">Koa</div>
      </div>
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-kd"></div>
        <div className="bs-legend-text">Kd*(1-T)</div>
      </div>
    </div>
  </div>
);
