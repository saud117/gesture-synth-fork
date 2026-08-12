import { scaleIntervals, type ScaleType } from "./scale"

export const KEY_OPTIONS = [
  { label: "A", hz: 220.0 },
  { label: "A#/Bb", hz: 233.08 },
  { label: "B", hz: 246.94 },
  { label: "C", hz: 261.63 },
  { label: "C#/Db", hz: 277.18 },
  { label: "D", hz: 293.66 },
  { label: "D#/Eb", hz: 311.13 },
  { label: "E", hz: 329.63 },
  { label: "F", hz: 349.23 },
  { label: "F#/Gb", hz: 369.99 },
  { label: "G", hz: 392.0 },
  { label: "G#/Ab", hz: 415.3 },
] as const

const DEGREE_MAP: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
}

const ROOT_ALIASES: Record<string, number> = {
  C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11,
}

export type ChordTones = {
  root: number
  third: number
  fifth: number
  octaveRoot: number
  octaveThird: number
  maj7Tone: number
  dom7Tone: number
  dim7Tone: number
  dim5Tone: number
}

function semitoneHz(hz: number, semis: number): number {
  return hz * 2 ** (semis / 12)
}


function tonesFromIntervals(root: number, thirdSemi: number, fifthSemi: number, seventhSemi?: number): ChordTones {
  const third = semitoneHz(root, thirdSemi)
  return {
    root,
    third,
    fifth: semitoneHz(root, fifthSemi),
    octaveRoot: root * 2,
    octaveThird: third * 2,
    maj7Tone: semitoneHz(root, seventhSemi ?? 11),
    dom7Tone: semitoneHz(root, 10),
    dim7Tone: semitoneHz(root, 9),
    dim5Tone: semitoneHz(root, 6),
  }
}

export function chordTonesFromRoman(
  roman: string | null | undefined,
  isMajorMode: boolean,
  keyHz: number,
  scale: ScaleType = "natural",
): ChordTones | null {
  if (!roman || roman === "--") return null
  const degree = DEGREE_MAP[roman.toUpperCase().replace("°", "")]
  if (!degree) return null

  // Keep the original major behavior available for practice/sequencer compatibility.
  if (isMajorMode) {
    const majorIntervals = [0, 2, 4, 5, 7, 9, 11]
    const root = semitoneHz(keyHz, majorIntervals[degree - 1])
    return tonesFromIntervals(root, 4, 7, 11)
  }

  const intervals = scaleIntervals(scale)
  const root = semitoneHz(keyHz, intervals[degree - 1])
  const next = intervals[(degree) % 7] + (degree === 7 ? 12 : 0)
  const thirdSemi = next - intervals[degree - 1]
  const fifthDegree = degree + 2
  const fifthIndex = (fifthDegree - 1) % 7
  const fifthOct = fifthDegree > 7 ? 12 : 0
  const fifthSemi = intervals[fifthIndex] + fifthOct - intervals[degree - 1]
  const seventhDegree = degree + 3
  const seventhIndex = (seventhDegree - 1) % 7
  const seventhOct = seventhDegree > 7 ? 12 : 0
  const seventhSemi = intervals[seventhIndex] + seventhOct - intervals[degree - 1]

  return tonesFromIntervals(root, thirdSemi, fifthSemi, seventhSemi)
}

export function notesForQuality(
  tones: ChordTones | null,
  qualityIndex: number,
  isMajorMode: boolean,
): number[] {
  if (!tones) return []
  const { root, third, fifth, octaveRoot, octaveThird, maj7Tone, dom7Tone, dim7Tone, dim5Tone } = tones
  if (qualityIndex === 1) return [root, fifth, octaveRoot, octaveThird]
  if (qualityIndex === 2) return [third, fifth, octaveRoot, octaveThird]
  if (qualityIndex === 3) return [root, third, fifth, isMajorMode ? maj7Tone : dom7Tone]
  if (qualityIndex === 4) {
    return isMajorMode
      ? [root, third, fifth, dom7Tone]
      : [root, third, dim5Tone, dim7Tone]
  }
  return [root, fifth, octaveRoot, octaveThird]
}

export function qualityLabel(
  qualityIndex: number,
  isMajorMode: boolean,
  octaveDown: boolean,
): string {
  const major: Record<number, string> = { 1: "Major", 2: "Major 1st Inv", 3: "Major 7th", 4: "Dominant 7th" }
  const minor: Record<number, string> = { 1: "Minor", 2: "Minor 1st Inv", 3: "Minor 7th", 4: "Diminished 7th" }
  const base = (isMajorMode ? major : minor)[qualityIndex]
  if (!base) return "--"
  return octaveDown ? `${base} (-8ve)` : base
}

export function chordColorVar(roman: string | null): string {
  if (!roman) return "150, 150, 150"
  const key = roman.toUpperCase()
  const rgb: Record<string, string> = {
    I: "61, 255, 224", II: "255, 107, 90", III: "240, 198, 90", IV: "120, 210, 255",
    V: "255, 150, 70", VI: "255, 90, 140", VII: "160, 200, 255",
  }
  return rgb[key] ?? "61, 255, 224"
}

function pitchClassFromHz(hz: number): number {
  const midi = 69 + 12 * Math.log2(hz / 440)
  return ((Math.round(midi) % 12) + 12) % 12
}

const SHARP_ROOT_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const
const FLAT_ROOT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const

function parseCustomChord(symbol: string) {
  const m = symbol.trim().match(/^([A-Ga-g](?:#|b)?)(.*)$/)
  if (!m) return null
  const rootName = m[1][0].toUpperCase() + m[1].slice(1)
  const pc = ROOT_ALIASES[rootName]
  if (pc == null) return null
  const suffix = m[2].trim()
  const lower = suffix.toLowerCase().replace(/\s+/g, "")
  let third = 4
  let fifth = 7
  let seventh: number | undefined

  if (lower.includes("dim")) {
    third = 3
    fifth = 6
    seventh = lower.includes("7") ? 9 : undefined
  } else if (lower.includes("aug") || lower.includes("+")) {
    third = 4
    fifth = 8
  } else if (lower.startsWith("m") || lower.startsWith("-")) {
    third = 3
  }
  if (lower.includes("maj7") || suffix.includes("Δ")) seventh = 11
  else if (lower.includes("7")) seventh = 10
  else if (lower.includes("6")) seventh = 9

  return { pc, suffix, third, fifth, seventh }
}

/** Convert a named custom chord into tones relative to the current tonic. */
export function customChordTones(symbol: string, tonicHz = 220): ChordTones | null {
  const parsed = parseCustomChord(symbol)
  if (!parsed) return null
  const tonicPc = pitchClassFromHz(tonicHz)
  const rootOffset = (parsed.pc - tonicPc + 12) % 12
  const root = semitoneHz(tonicHz, rootOffset)
  return tonesFromIntervals(root, parsed.third, parsed.fifth, parsed.seventh)
}

/** Transpose a custom chord name by semitones while preserving its quality suffix. */
export function transposeCustomChord(symbol: string, semitones: number): string {
  const parsed = parseCustomChord(symbol)
  if (!parsed) return symbol
  const useFlats = parsed.suffix.length >= 0 && /b/.test(symbol)
  const names = useFlats ? FLAT_ROOT_NAMES : SHARP_ROOT_NAMES
  const pc = (parsed.pc + semitones % 12 + 12) % 12
  return `${names[pc]}${parsed.suffix}`
}

export function customChordRoot(symbol: string): string {
  const parsed = parseCustomChord(symbol)
  if (!parsed) return symbol
  const match = symbol.trim().match(/^([A-Ga-g](?:#|b)?)/)
  return match ? match[1][0].toUpperCase() + match[1].slice(1) : symbol
}

export function notesForCustomChord(
  symbol: string,
  qualityIndex: number,
  octaveDown: boolean,
  tonicHz = 220,
): number[] {
  const tones = customChordTones(symbol, tonicHz)
  if (!tones) return []
  let notes: number[]
  if (qualityIndex === 2) notes = [tones.third, tones.fifth, tones.octaveRoot, tones.octaveThird]
  else if (qualityIndex === 3) {
    const lower = symbol.toLowerCase()
    const seventh = lower.includes("maj7") || lower.includes("maj9") || symbol.includes("Δ")
      ? tones.maj7Tone
      : lower.includes("7") || lower.includes("9") || lower.includes("11") || lower.includes("13")
        ? tones.dom7Tone
        : tones.maj7Tone
    notes = [tones.root, tones.third, tones.fifth, seventh]
  } else if (qualityIndex === 4) notes = [tones.root, tones.third, tones.fifth, tones.dom7Tone]
  else notes = [tones.root, tones.fifth, tones.octaveRoot, tones.octaveThird]
  return octaveDown ? notes.map((n) => n / 2) : notes
}

/** Whether a named custom chord has a minor-quality third. Used to infer the tonic scale. */
export function customChordIsMinor(symbol: string): boolean {
  const parsed = parseCustomChord(symbol)
  return parsed?.third === 3
}

export function customChordQualityLabel(symbol: string, qualityIndex: number, octaveDown: boolean): string {
  const labels = ["--", "Triad", "1st Inv", "7th", "Dominant 7th"]
  const base = labels[qualityIndex] ?? "--"
  return octaveDown ? `${symbol} · ${base} (-8ve)` : `${symbol} · ${base}`
}
