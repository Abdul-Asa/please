import { useState, useEffect } from "react";

//Custom hook to detect screen size
//Add any other breakpoints if needed

type QueryPoint = "mobile" | "tablet" | "desktop";
const mediaQueries: Record<QueryPoint, string> = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

export function useMediaQuery(queryPoint: QueryPoint) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = mediaQueries[queryPoint];
    const media = window.matchMedia(mediaQuery);
    const updateMatches = () => setMatches(media.matches);

    updateMatches();

    media.addEventListener("change", updateMatches);

    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [queryPoint]);

  return matches;
}
