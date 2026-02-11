

export const ResultCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  value: string;
}> = ({ icon, title, description, value }) => (
  <div className="col">
    <div className="card shadow-sm bs-card-a1">
      <div className="card-header">
        <h3 className="card-title fs-5">
          <i className={icon} />
        </h3>
      </div>
      <div className="card-body">
        <span className="fs-7">{title}</span><br />
        <small className="text-muted fs-8">{description}</small>
      </div>
      <div className="card-footer">
        <h2 className="fs-4 mb-0">{value}</h2>
      </div>
    </div>
  </div>
);