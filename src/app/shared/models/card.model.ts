export type cardTranslations = {
  wholeCard: thirdDimensionalMapping
}
export type thirdDimensionalMapping = {
  x: number,
  y: number,
  z: number
}

/** Shared zoom bounds for consistent Z-axis clamping across directive and component */
export const ZOOM_BOUNDS = {
  min: -50,
  max: 30
} as const;
