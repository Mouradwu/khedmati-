// Motif géométrique inspiré des zelliges algériens — sert d'ancrage visuel
// au hero plutôt qu'un dégradé générique. Construit à partir d'une seule
// tuile en étoile à 8 branches répétée, avec la palette KHEDMATI.
export function ZelligeMotif() {
  const tile = (x: number, y: number, fill: string, opacity: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity={opacity}>
      <path
        d="M28 0 L35 14 L50 14 L38 24 L42 40 L28 31 L14 40 L18 24 L6 14 L21 14 Z"
        fill={fill}
        transform="scale(0.62)"
      />
    </g>
  );

  const positions: Array<[number, number, string, number]> = [
    [0, 0, "#0E6B4F", 1],
    [70, 0, "#C08F35", 0.85],
    [140, 0, "#0E6B4F", 0.6],
    [35, 55, "#B7532E", 0.9],
    [105, 55, "#0E6B4F", 0.75],
    [0, 110, "#C08F35", 0.6],
    [70, 110, "#B7532E", 0.7],
    [140, 110, "#0E6B4F", 1],
    [35, 165, "#0E6B4F", 0.5],
    [105, 165, "#C08F35", 0.9],
  ];

  return (
    <svg
      viewBox="0 0 210 220"
      className="h-full w-full"
      role="img"
      aria-label="Motif géométrique décoratif inspiré des zelliges algériens"
    >
      <rect x="0" y="0" width="210" height="220" rx="18" fill="#0A4F3A" />
      <g transform="translate(10 8)">{positions.map(([x, y, fill, o]) => tile(x, y, fill, o))}</g>
      <rect
        x="1.5"
        y="1.5"
        width="207"
        height="217"
        rx="16.5"
        fill="none"
        stroke="#EFEADC"
        strokeOpacity="0.15"
      />
    </svg>
  );
}
