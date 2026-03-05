import { useEffect } from "react";

export function useScrollSpy(
  sectionIds: string[],                
  setActive: (id: string) => void,    
  offset: number = 120                
) {
  useEffect(() => {

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      for (let id of sectionIds) {
        const section = document.getElementById(id);

        if (!section) continue;

        const sectionTop = section.offsetTop;

        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActive(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Ejecutamos una vez al montar
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);

  }, [sectionIds, setActive, offset]);
}
