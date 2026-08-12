const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11] as const
const MAJOR_ROMANS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"] as const
const NATURAL_ROMANS = ["i", "ii°", "III", "iv", "v", "VI", "VII"] as const
const HARMONIC_ROMANS = ["i", "ii°", "III+", "iv", "V", "VI", "vii°"] as const

export type ScaleType = "major" | "natural" | "harmonic"

export type ScaleDegreeGuide = {
  roman: string
  note: string
  isOctave?: boolean
  gesture: string
}

const GESTURES: Record<string, string> = {
  "i": "1 finger", "I": "1 finger",
  "ii°": "2 fingers", "ii": "2 fingers",
  "III": "3 fingers", "iii": "3 fingers",
  "III+": "3 fingers",
  "iv": "4 fingers", "IV": "4 fingers",
  "v": "5 fingers", "V": "5 fingers",
  "VI": "index + pinky", "vi": "index + pinky",
  "VII": "index + pinky + thumb", "vii": "index + pinky + thumb", "vii°": "index + pinky + thumb",
}

function pitchClassFromKeyHz(keyHz: number): number {
  const midi = 69 + 12 * Math.log2(keyHz / 440)
  return ((Math.round(midi) % 12) + 12) % 12
}

function prefersFlats(keyHz: number): boolean {
  const pc = pitchClassFromKeyHz(keyHz)
  return pc === 1 || pc === 3 || pc === 5 || pc === 8 || pc === 10
}

function noteName(pitchClass: number, flats: boolean): string {
  return (flats ? FLAT_NAMES : SHARP_NAMES)[((pitchClass % 12) + 12) % 12]
}

export function scaleIntervals(scale: ScaleType): readonly number[] {
  if (scale === "major") return MAJOR_INTERVALS
  return scale === "harmonic" ? HARMONIC_MINOR_INTERVALS : NATURAL_MINOR_INTERVALS
}

export function scaleNotesForKey(keyHz: number, scale: ScaleType): string[] {
  const root = pitchClassFromKeyHz(keyHz)
  const flats = prefersFlats(keyHz)
  return scaleIntervals(scale).map((semi) => noteName(root + semi, flats))
}

export function scaleGuideForKey(
  keyHz: number,
  scale: ScaleType = "natural",
): ScaleDegreeGuide[] {
  const root = pitchClassFromKeyHz(keyHz)
  const flats = prefersFlats(keyHz)
  const intervals = scaleIntervals(scale)
  const romans = scale === "major" ? MAJOR_ROMANS : scale === "harmonic" ? HARMONIC_ROMANS : NATURAL_ROMANS
  const degrees: ScaleDegreeGuide[] = intervals.map((semi, i) => ({
    roman: romans[i],
    note: noteName(root + semi, flats),
    gesture: GESTURES[romans[i]],
  }))
  degrees.push({
    roman: "I",
    note: noteName(root, flats),
    isOctave: true,
    gesture: "1 finger (oct)",
  })
  return degrees
}

export function scaleLabelForType(note: string, scale: ScaleType): string {
  if (scale === "major") return `${note} major`
  if (scale === "harmonic") return `${note} harmonic minor`
  return `${note} minor`
}

export function activeRoman(chord: string | null): string | null {
  if (!chord || chord === "--") return null
  return chord.toUpperCase().replace("°", "")
}
