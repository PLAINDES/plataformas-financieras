import { useEffect } from "react";

export function useScrollSpy(
  sectionIds: string[],                // IDs de las secciones
  setActive: (id: string) => void,     // Función para actualizar el menú activo
  offset: number = 120                 // Compensación por header fixed
) {
  useEffect(() => {

    const handleScroll = () => {
      // scrollY = cuánto has bajado en la página
      const scrollPosition = window.scrollY + offset;
      // Le sumamos un offset para compensar el header fixed

      for (let id of sectionIds) {
        const section = document.getElementById(id);

        if (!section) continue;

        const sectionTop = section.offsetTop;
        // Distancia desde arriba del documento hasta la sección

        const sectionHeight = section.offsetHeight;
        // Altura total de la sección

        // Si el scroll está dentro del rango de esta sección
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActive(id);
          break;
          // break para evitar seguir revisando innecesariamente
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Ejecutamos una vez al montar
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);

  }, [sectionIds, setActive, offset]);
}
