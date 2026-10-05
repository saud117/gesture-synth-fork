/**
 * Instruments for Gesture Synth Fork.
 *
 * "synth" is the original sustained sawtooth voice (handled in SynthEngine / LoopEngine).
 * "piano" and "guitar" are sustained, held-chord voices: the whole chord starts together and
 * keeps sounding for as long as you hold it (no plucking, no re-strikes). Each note is a
 * pair of slightly detuned oscillators with a hand-shaped harmonic recipe, a soft attack and
 * a slow brightness settle, so a held chord breathes instead of sounding like a flat tone.
 * Works on a live AudioContext and on an OfflineAudioContext (used when loops are rendered).
 */

export type Instrument = "synth" | "piano" | "guitar"

export const INSTRUMENTS: { value: Instrument; label: string; hint: string }[] = [
  { value: "synth", label: "Synth", hint: "Bright sawtooth chords" },
  { value: "piano", label: "Piano", hint: "Warm held piano chords" },
  { value: "guitar", label: "Guitar", hint: "Held guitar chords" },
]

/** True for instruments that use the held-voice engine below (everything except the classic synth). */
export function usesVoices(instrument: Instrument): instrument is "piano" | "guitar" {
  return instrument !== "synth"
}

type Recipe = {
  /** Relative strength of harmonics 1..n */
  harmonics: number[]
  /** Peak level of a note */
  level: number
  /** Level the note settles to while held (fraction of peak) and how fast */
  settle: number
  settleTc: number
  /** Per-note lowpass: starts at freq*openMul, relaxes to freq*closeMul */
  openMul: number
  closeMul: number
  filterTc: number
  attack: number
  /** Detune (cents) of the two oscillators in each note */
  spread: number
  /** Vibrato depth in cents (0 = none) and rate in Hz */
  vibrato: number
  vibratoRate: number
}

const RECIPES: Record<"piano" | "guitar", Recipe> = {
  piano: {
    harmonics: [1, 0.62, 0.42, 0.28, 0.2, 0.14, 0.1, 0.07, 0.05, 0.035, 0.025, 0.02],
    level: 0.7,
    settle: 0.78,
    settleTc: 1.4,
    openMul: 14,
    closeMul: 4.5,
    filterTc: 0.9,
    attack: 0.006,
    spread: 1.3,
    vibrato: 0,
    vibratoRate: 0,
  },
  guitar: {
    harmonics: [1, 0.75, 0.6, 0.38, 0.3, 0.2, 0.14, 0.1, 0.08, 0.05, 0.03, 0.03, 0.02, 0.02],
    level: 0.7,
    settle: 0.85,
    settleTc: 0.35,
    openMul: 10,
    closeMul: 5,
    filterTc: 0.5,
    attack: 0.008,
    spread: 1.8,
    vibrato: 6,
    vibratoRate: 5.3,
  },
}

const waveCache = new WeakMap<BaseAudioContext, Partial<Record<"piano" | "guitar", PeriodicWave>>>()

function getWave(ctx: BaseAudioContext, instrument: "piano" | "guitar"): PeriodicWave {
  let perCtx = waveCache.get(ctx)
  if (!perCtx) {
    perCtx = {}
    waveCache.set(ctx, perCtx)
  }
  const hit = perCtx[instrument]
  if (hit) return hit
  const h = RECIPES[instrument].harmonics
  const real = new Float32Array(h.length + 1)
  const imag = new Float32Array(h.length + 1)
  h.forEach((amp, i) => {
    imag[i + 1] = amp
  })
  const wave = ctx.createPeriodicWave(real, imag)
  perCtx[instrument] = wave
  return wave
}

export type SustainVoice = {
  /** Release the note. `when` is context time; omit for "now". */
  stop: (when?: number, release?: number) => void
}

/** Start one held note. It keeps sounding until `stop()` is called. */
export function startSustained(
  ctx: BaseAudioContext,
  dest: AudioNode,
  instrument: "piano" | "guitar",
  freq: number,
  when: number,
  velocity = 1,
): SustainVoice | null {
  if (!Number.isFinite(freq) || freq < 20 || freq > 8000) return null
  const r = RECIPES[instrument]
  const wave = getWave(ctx, instrument)
  const peak = r.level * velocity

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.Q.value = 0.5
  const open = Math.min(9000, freq * r.openMul)
  const close = Math.max(700, Math.min(open, freq * r.closeMul))
  filter.frequency.setValueAtTime(open, when)
  filter.frequency.setTargetAtTime(close, when + 0.02, r.filterTc)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(peak, when + r.attack)
  gain.gain.setTargetAtTime(peak * r.settle, when + r.attack, r.settleTc)

  filter.connect(gain)
  gain.connect(dest)

  // Two slightly detuned oscillators per note give a living, chorused body.
  const wobble = (Math.random() - 0.5) * 3
  const oscs = [-1, 1].map((sign) => {
    const osc = ctx.createOscillator()
    osc.setPeriodicWave(wave)
    osc.frequency.value = freq
    osc.detune.value = sign * r.spread + wobble
    const mix = ctx.createGain()
    mix.gain.value = 0.5
    osc.connect(mix)
    mix.connect(filter)
    osc.start(when)
    return osc
  })

  let lfo: OscillatorNode | null = null
  if (r.vibrato > 0) {
    lfo = ctx.createOscillator()
    lfo.frequency.value = r.vibratoRate * (0.94 + Math.random() * 0.12)
    const depth = ctx.createGain()
    depth.gain.setValueAtTime(0, when)
    depth.gain.linearRampToValueAtTime(r.vibrato, when + 0.9)
    lfo.connect(depth)
    oscs.forEach((o) => depth.connect(o.detune))
    lfo.start(when)
  }

  let stopped = false
  return {
    stop(at = ctx.currentTime, release = 0.12) {
      if (stopped) return
      stopped = true
      const t = Math.max(at, when)
      try {
        gain.gain.cancelScheduledValues(t)
        gain.gain.setTargetAtTime(0, t, release / 4)
        const end = t + release + 0.05
        oscs.forEach((o) => o.stop(end))
        lfo?.stop(end)
      } catch {
        /* already stopped */
      }
    },
  }
}

/** Start every note of a chord together (no strum). */
export function startChord(
  ctx: BaseAudioContext,
  dest: AudioNode,
  instrument: "piano" | "guitar",
  freqs: number[],
  when: number,
  velocity = 1,
): SustainVoice[] {
  const voices: SustainVoice[] = []
  for (const hz of freqs) {
    const v = startSustained(ctx, dest, instrument, hz, when, velocity)
    if (v) voices.push(v)
  }
  return voices
}
