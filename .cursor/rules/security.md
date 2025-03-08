# Security Rules

glob: **/*.{js,ts,tsx,jsx}

## Technologie
Kód implementuje bezpečnostní best practices.

## Pravidla
- Ošetřuj user input pro prevenci XSS útoků
- Implementuj CSP (Content Security Policy)
- Používej HTTPS pro všechny externí požadavky
- Ošetřuj autentizaci a autorizaci bezpečně
- Implementuj ochranu proti CSRF útokům
- Minimalizuj informace o chybách poskytované uživatelům
- Aktualizuj závislosti pro prevenci známých zranitelností
- Implementuj rate limiting pro API požadavky 