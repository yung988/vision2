# Frontend Architecture Rules

glob: **/*.{js,ts,tsx,jsx}

## Technologie
Kód sleduje moderní frontend architekturu s důrazem na React, Next.js a TypeScript.

## Pravidla
- Používej Next.js pro server-side rendering a optimální performance
- Piš kód v TypeScript s důsledným typováním
- Implementuj komponentovou architekturu s jasnou separací concerns
- Používej state management vhodný pro komplexnost aplikace (Context API, Redux, Zustand)
- Implementuj error boundaries pro izolaci chyb
- Používej custom hooks pro znovupoužitelnou logiku
- Piš čistý, čitelný a dobře organizovaný kód
- Zajisti správnou správu efektů (useEffect dependencies)
- Optimalizuj pro opětovné renderování pomocí useMemo a useCallback
- Implementuj správné lazy loading a code splitting strategie 