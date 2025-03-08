# Internationalization Rules

glob: **/*.{js,ts,tsx,jsx}

## Technologie
Kód podporuje vícejazyčnost a lokalizaci.

## Pravidla
- Používej next-i18next nebo react-intl pro správu překladů
- Extrahuj všechny texty do překladových souborů
- Zajisti správnou lokalizaci dat, čísel a měn
- Implementuj přepínání jazyků
- Používej ICU syntax pro pluralizaci a podmíněné formátování
- Zajisti, že layout funguje pro jazyky s různou délkou textu
- Podporuj right-to-left (RTL) jazyky, kde je to potřeba 