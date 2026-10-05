import { useEffect, useRef, useState, type ReactNode } from "react"
import { INSTRUMENTS, type Instrument } from "../audio/instruments"
import {
  FIXED_QUALITY_OPTIONS,
  type FixedQuality,
  type GestureSettings,
  type QualityControl,
} from "../music/gestureSettings"
import {
  SAUD,
  ETHAN,
  ERIC,
  GITHUB_CONTRIBUTORS,
  GITHUB_REPO,
  activeSocialLinks,
} from "../lib/siteLinks"
import { customChordTones } from "../music/chords"
import styles from "./Hud.module.css"

type Props = {
  pitchShift: number
  onPitchShiftChange: (shift: number) => void
  customChords: string[]
  onCustomChordsChange: (chords: string[]) => void
  gestureSettings: GestureSettings
  onGestureSettingsChange: (next: GestureSettings) => void
  sequencerVisible: boolean
  onSequencerVisibleChange: (visible: boolean) => void
  volume: number
  tonePct: number
  chord: string | null
  quality: string
  octaveDown: boolean
  statusText: string
  scaleLabel: string
  instrument: Instrument
  onInstrumentChange: (instrument: Instrument) => void
}

const BARS = 8
const WAVE_BARS = 8
const WAVE_SHAPE = [0.18, 0.28, 0.4, 0.55, 0.7, 0.82, 0.92, 1]
const ROMAN = ["i", "ii", "III", "iv", "V", "VI", "vii"]
const isInvalidChord = (value: string) =>
  value.trim() !== "" && customChordTones(value.trim(), 220) === null

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...stroke}>
      {children}
    </svg>
  )
}

function InstrumentIcon({ kind }: { kind: Instrument }) {
  if (kind === "piano") {
    return (
      <Icon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M9 5v14M15 5v14" />
      </Icon>
    )
  }
  if (kind === "guitar") {
    return (
      <Icon>
        <path d="M12 3c4 0 7 3 7 7 0 5-4 11-7 11S5 15 5 10c0-4 3-7 7-7z" />
      </Icon>
    )
  }
  return (
    <Icon>
      <path d="M3 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
    </Icon>
  )
}

export function Hud({
  pitchShift,
  onPitchShiftChange,
  customChords,
  onCustomChordsChange,
  gestureSettings,
  onGestureSettingsChange,
  sequencerVisible,
  onSequencerVisibleChange,
  volume,
  tonePct,
  chord,
  quality,
  octaveDown,
  statusText,
  scaleLabel,
  instrument,
  onInstrumentChange,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [instOpen, setInstOpen] = useState(false)
  const instRef = useRef<HTMLDivElement>(null)
  const currentInst = INSTRUMENTS.find((o) => o.value === instrument) ?? INSTRUMENTS[0]
  const mode = "gesture" as const
  const socials = activeSocialLinks()
  const litCount = Math.round(volume * BARS)
  const waveLit = Math.round(volume * WAVE_BARS)
  const volumePct = Math.round(volume * 100)
  const idle = chord === null
  const { modeControl, fixedMode, qualityControl, fixedQuality } = gestureSettings

  const patch = (partial: Partial<GestureSettings>) => {
    onGestureSettingsChange({ ...gestureSettings, ...partial })
  }

  const qualityOptionLabel = (value: FixedQuality) => {
    const opt = FIXED_QUALITY_OPTIONS.find((o) => o.value === value)!
    if (modeControl === "fixed") {
      return fixedMode === "major" ? opt.major : opt.minor
    }
    return `${opt.major} / ${opt.minor}`
  }

  useEffect(() => {
    if (!instOpen) return
    const onDown = (e: PointerEvent) => {
      if (!instRef.current?.contains(e.target as Node)) setInstOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInstOpen(false)
    }
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [instOpen])

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [settingsOpen])

  return (
    <div className={styles.hud}>
      <div className={styles.topLeft}>
        <h1 className={styles.brand}>Gesture Synth Fork</h1>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.menuBtn}
            data-open={settingsOpen}
            onClick={() => setSettingsOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
          >
            <Icon>
              <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="17" r="2" />
            </Icon>
            <span>Settings</span>
            <svg className={styles.chev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div className={styles.instWrap} ref={instRef}>
            <button
              type="button"
              className={styles.menuBtn}
              data-open={instOpen}
              onClick={() => setInstOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={instOpen}
              aria-label={`Instrument: ${currentInst.label}`}
            >
              <InstrumentIcon kind={instrument} />
              <span>{currentInst.label}</span>
              <svg className={styles.chev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {instOpen && (
              <div className={styles.instMenu} role="menu" aria-label="Instrument">
                {INSTRUMENTS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={opt.value === instrument}
                    className={styles.instItem}
                    data-active={opt.value === instrument}
                    onClick={() => {
                      onInstrumentChange(opt.value)
                      setInstOpen(false)
                    }}
                  >
                    <span className={styles.sumIcon}>
                      <InstrumentIcon kind={opt.value} />
                    </span>
                    <span className={styles.instText}>
                      <span className={styles.instName}>{opt.label}</span>
                      <span className={styles.instHint}>{opt.hint}</span>
                    </span>
                    {opt.value === instrument && (
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...stroke} className={styles.instCheck}>
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.topRight}>
        <div className={styles.meter} aria-label="Volume meter">
          {Array.from({ length: BARS }, (_, i) => (
            <div key={i} className={styles.bar} data-lit={i >= BARS - litCount} />
          ))}
        </div>
        <div className={styles.rightPanel} aria-label="Right hand controls">
          <span className={styles.panelLabel}>Right hand</span>
          <dl className={styles.readouts}>
            <div>
              <dt>Volume</dt>
              <dd>{volumePct}%</dd>
            </div>
            <div>
              <dt>Tone</dt>
              <dd>
                {tonePct > 0 ? "+" : ""}
                {tonePct}%
              </dd>
            </div>
          </dl>
          <div className={styles.pitchControl} aria-label="Pitch shift">
            <span className={styles.pitchLabel}>Pitch</span>
            <input
              className={styles.pitchSlider}
              type="range"
              min="0"
              max="12"
              step="1"
              value={pitchShift}
              onChange={(e) => onPitchShiftChange(Number(e.target.value))}
              aria-label="Pitch shift in semitones"
            />
            <span className={styles.pitchValue}>+{pitchShift} st</span>
          </div>
        </div>
      </div>

      <div className={styles.chordBlock} data-idle={idle}>
        <div className={styles.stage}>
          <div className={`${styles.wave} ${styles.waveLeft}`} aria-hidden>
            {WAVE_SHAPE.map((h, i) => (
              <span
                key={i}
                className={styles.waveBar}
                style={{ height: `${h * 100}%` }}
                data-lit={i >= WAVE_BARS - waveLit}
              />
            ))}
          </div>
          <div className={styles.ring}>
            <p className={styles.chord}>{chord ?? "--"}</p>
          </div>
          <div className={`${styles.wave} ${styles.waveRight}`} aria-hidden>
            {WAVE_SHAPE.map((h, i) => (
              <span
                key={i}
                className={styles.waveBar}
                style={{ height: `${h * 100}%` }}
                data-lit={i >= WAVE_BARS - waveLit}
              />
            ))}
          </div>
        </div>
        <p className={styles.quality}>{quality}</p>
        <div className={styles.scaleLabel}>Scale: {scaleLabel}</div>
        {octaveDown && <span className={styles.octaveBadge}>-8ve</span>}
      </div>

      <div className={styles.bottomLeft}>
        <div className={styles.status}>{statusText}</div>
      </div>

      <div className={styles.cornerLinks}>
        <a
          className={styles.github}
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className={styles.githubIcon} viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
            />
          </svg>
          GitHub
        </a>
        <div className={styles.credit}>
          Fork by{" "}
          <a href={SAUD.href} target="_blank" rel="noopener noreferrer">
            {SAUD.name}
          </a>
        </div>
        <div className={styles.credit}>
          Developed by{" "}
          <a href={ETHAN.href} target="_blank" rel="noopener noreferrer">
            {ETHAN.name}
          </a>
        </div>
      </div>

      {settingsOpen && (
        <>
          <button
            type="button"
            className={styles.settingsBackdrop}
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          />
          <div className={styles.settingsSheet} role="dialog" aria-label="Settings">
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>Settings</span>
              <button
                type="button"
                className={styles.doneBtn}
                onClick={() => setSettingsOpen(false)}
              >
                Done
              </button>
            </div>

            <details className={styles.section} open>
              <summary className={styles.summary}>
                <span className={styles.sumIcon}>
                  <Icon>
                    <path d="M9 18V5l11-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="17" cy="16" r="3" />
                  </Icon>
                </span>
                <span className={styles.sumText}>Custom chords</span>
                <svg className={styles.sumChev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className={styles.sectionBody}>
                <div className={styles.customChordGrid}>
                  {customChords.map((value, i) => {
                    const bad = isInvalidChord(value)
                    return (
                      <label key={i} className={styles.customChordField}>
                        <span>{ROMAN[i]}</span>
                        <input
                          value={value}
                          data-invalid={bad || undefined}
                          aria-invalid={bad || undefined}
                          onChange={(e) => {
                            const next = [...customChords]
                            next[i] = e.target.value
                            onCustomChordsChange(next)
                          }}
                          placeholder="Am7"
                          aria-label={`Custom chord ${i + 1}`}
                        />
                      </label>
                    )
                  })}
                </div>
                {customChords.some(isInvalidChord) && (
                  <p className={styles.configError} role="alert">
                    Some chords aren't recognized. Try names like Am, F#m, or G7.
                  </p>
                )}
                <p className={styles.configHint}>
                  Each of the seven left-hand chord slots uses its custom chord.
                  The first one sets the scale.
                </p>
              </div>
            </details>

            {mode === "gesture" && (
              <details className={styles.section} open>
                <summary className={styles.summary}>
                  <span className={styles.sumIcon}>
                    <Icon>
                      <path d="M5 20V10M12 20V4M19 20v-7" />
                    </Icon>
                  </span>
                  <span className={styles.sumText}>Right hand</span>
                  <svg className={styles.sumChev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className={styles.sectionBody}>
                  <select
                    className={styles.selectSm}
                    value={qualityControl}
                    onChange={(e) =>
                      patch({ qualityControl: e.target.value as QualityControl })
                    }
                    aria-label="Right hand quality control"
                  >
                    <option value="fingers">Finger layout = chord style</option>
                    <option value="fixed">Fixed chord style</option>
                  </select>
                  {qualityControl === "fixed" && (
                    <select
                      className={styles.selectSm}
                      value={fixedQuality}
                      onChange={(e) =>
                        patch({ fixedQuality: Number(e.target.value) as FixedQuality })
                      }
                      aria-label="Fixed chord style"
                    >
                      {FIXED_QUALITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {qualityOptionLabel(o.value)}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className={styles.configHint}>
                    {qualityControl === "fingers"
                      ? "1–4 fingers set triad / inversion / 7ths. Height = volume, tilt = tone."
                      : "Chord style is locked. Right hand still controls volume, tone, and octave."}
                  </p>
                </div>
              </details>
            )}

            <details className={styles.section} open>
              <summary className={styles.summary}>
                <span className={styles.sumIcon}>
                  <Icon>
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                  </Icon>
                </span>
                <span className={styles.sumText}>Sequencer</span>
                <svg className={styles.sumChev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className={styles.sectionBody}>
                <label className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    className={styles.switch}
                    checked={sequencerVisible}
                    onChange={(e) => onSequencerVisibleChange(e.target.checked)}
                  />
                  <span>Show loop sequencer</span>
                </label>
                <p className={styles.configHint}>
                  Beat grid and loop transport stay hidden until you turn this on.
                </p>
              </div>
            </details>

            <details className={styles.section}>
              <summary className={styles.summary}>
                <span className={styles.sumIcon}>
                  <Icon>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                  </Icon>
                </span>
                <span className={styles.sumText}>About</span>
                <svg className={styles.sumChev} viewBox="0 0 24 24" width="14" height="14" aria-hidden {...stroke}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className={styles.sectionBody}>
                <p className={styles.aboutLine}>
                  Fork by{" "}
                  <a href={SAUD.href} target="_blank" rel="noopener noreferrer">
                    {SAUD.name}
                  </a>
                </p>
                <p className={styles.aboutLine}>
                  Built by{" "}
                  <a href={ETHAN.href} target="_blank" rel="noopener noreferrer">
                    {ETHAN.name}
                  </a>
                </p>
                <p className={styles.aboutLine}>
                  Inspired by{" "}
                  <a href={ERIC.href} target="_blank" rel="noopener noreferrer">
                    {ERIC.name}
                  </a>
                </p>
                <p className={styles.aboutLine}>
                  <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                    Source on GitHub
                  </a>
                </p>
                <p className={styles.aboutLine}>
                  <a href={GITHUB_CONTRIBUTORS} target="_blank" rel="noopener noreferrer">
                    GitHub contributors
                  </a>
                </p>

                {socials.length > 0 && (
                  <div className={styles.socialBlock}>
                    <span className={styles.configLabel}>Follow Gesture Synth</span>
                    <div className={styles.socialRow}>
                      {socials.map((link) => (
                        <a
                          key={link.label}
                          className={styles.socialLink}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  )
}
