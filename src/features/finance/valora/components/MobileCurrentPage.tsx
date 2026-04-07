export interface MobileCurrentPageProps {
  children: React.ReactNode;
}

export const MobileCurrentPage: React.FC<MobileCurrentPageProps> = ({
  children,
}) => <div className="flex-1 overflow-auto">{children}</div>;
