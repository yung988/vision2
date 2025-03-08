# Animation Rules

glob: **/*.{js,ts,tsx,jsx,css,scss}

## Technologie
Kód obsahuje sofistikované animace využívající GSAP, Framer Motion, Lottie nebo CSS animations.

## Pravidla
- Preferuj GSAP pro komplexní animační sekvence a timeline-based animace
- Používej Framer Motion pro React komponenty a gesture-based animace
- Implementuj scroll-triggered animace pomocí Intersection Observer API nebo GSAP ScrollTrigger
- Zajisti, že animace jsou optimalizovány pro výkon (používej transforms, opacity)
- Animace by měly reagovat na uživatelské interakce (hover, click, scroll)
- Implementuj plynulé přechody mezi stránkami pomocí page transitions
- Používej cubic-bezier pro přirozené ease funkce
- Zajisti, že animace jsou přístupné (respektuj prefers-reduced-motion) 