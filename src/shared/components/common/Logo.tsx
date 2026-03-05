// src/components/common/Logo.tsx

interface LogoProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export function Logo({ src, alt, className = '', onClick }: LogoProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });

    }
  };

  return (
    <a href="/" onClick={(e) => { e.preventDefault(); handleClick(); }}>
      <img 
        src={src} 
        alt={alt} 
        className={className}
        style={{ cursor: 'pointer' }}
      />
    </a>
  );
}