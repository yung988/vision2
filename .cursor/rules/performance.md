# Performance Optimization Rules

glob: **/*.{js,ts,tsx,jsx}

## Technologie
Kód je optimalizován pro maximální výkon, zejména u 3D a animovaného obsahu.

## Pravidla
- Implementuj code splitting a lazy loading pro komponenty a assets
- Používej virtualizaci pro dlouhé seznamy
- Optimalizuj Critically Rendering Path
- Minimalizuj layout shifts (CLS)
- Implementuj efektivní asset loading strategii (preloading, prefetching)
- Používej memoizaci pro výpočetně náročné operace
- Optimalizuj bundle size pomocí tree-shaking a správy závislostí
- Používej web workers pro výpočetně náročné operace, které by blokovaly hlavní vlákno
- Implementuj postupné načítání 3D assetů a textur
- Používej debounce a throttle pro event handlery 