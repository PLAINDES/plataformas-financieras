interface BookProps {
  href: string;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export function Book({
  href,
  width = 200,
  height = 260,
  interactive = true,
}: BookProps) {
  const spineThickness = 50; // El grosor del lomo
  const pagesHeight = height - 12; // Pequeño margen superior/inferior

  // Posición del lomo: ancho total - mitad del grosor - ajuste de borde
  const pagesTranslateX = width - spineThickness / 2 - 3;

  return (
    <div
      className={`flex items-center justify-center [perspective:900px] ${
        interactive ? "group" : ""
      }`}
      style={{ width: width + 60, height: height + 20 }} // Contenedor con margen
    >
      <div
        className={`relative transition-transform duration-[750ms] ease-out [transform-style:preserve-3d] [transform:rotateY(-15deg)] ${
          interactive ? "group-hover:[transform:rotateY(0deg)]" : ""
        }`}
        style={{ width, height }}
      >
        {/* Portada */}
        <img
          src={href}
          alt="Book Cover"
          className="w-full h-full absolute rounded-r rounded-l-[3px] shadow-[6px_8px_18px_rgba(0,0,0,0.35)] z-10"
        />

        {/* Páginas (Lomo lateral) */}
        <div
          className="bg-white absolute top-1.5 [transform-style:preserve-3d]"
          style={{
            height: pagesHeight,
            width: spineThickness,
            transform: `translateX(${pagesTranslateX}px) rotateY(90deg) translateX(${spineThickness / 2}px)`,
          }}
        />

        {/* Contratapa */}
        <div
          className="rounded-r bg-[#062f7d] absolute left-0 shadow-[0px_0_2px_2px_#2e2e2e]"
          style={{
            width,
            height,
            transform: `translateZ(-${spineThickness}px)`,
          }}
        />
      </div>
    </div>
  );
}
