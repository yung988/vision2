# Testing Rules

glob: **/*.{test,spec}.{js,ts,tsx,jsx}

## Technologie
Kód je pokryt testy s využitím moderních testovacích nástrojů.

## Pravidla
- Používej Jest a React Testing Library pro unit a integration testy
- Piš testy v TDD (Test-Driven Development) stylu, kde je to vhodné
- Implementuj E2E testy pomocí Cypress nebo Playwright
- Používej mock data a služby pro testování
- Testuj edge cases a error stavy
- Implementuj visual regression testing pro UI komponenty
- Zajisti, že testy jsou čitelné a maintainable
- Používej snapshot testing s rozmyslem 