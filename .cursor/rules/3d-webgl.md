# 3D WebGL Development Rules

glob: **/*.{js,ts,tsx,jsx}

## Technologie
Kód používá WebGL, Three.js nebo React Three Fiber pro 3D vizualizace. Využívá moderní přístupy k 3D na webu.

## Pravidla
- Používej React Three Fiber pro integraci Three.js do React aplikací
- Optimalizuj performance pomocí instancing pro opakující se objekty
- Používej postupy jako frustrum culling a LOD (Level of Detail)
- Implementuj post-processing efekty pro lepší vizuální zážitek
- Zajisti správné načítání 3D modelů (GLTF/GLB formáty)
- Používej ECS (Entity Component System) architekturu pro komplexní scény
- Implementuj custom shadery pro unikátní vizuální efekty
- Pamatuj na fallback pro zařízení s omezenou podporou WebGL