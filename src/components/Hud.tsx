import { useEffect, useState } from "react"
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
}

const BARS = 8

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
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const mode = "gesture" as const
  const socials = activeSocialLinks()
  const litCount = Math.round(volume * BARS)
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
            className={styles.iconBtn}
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
          >
            Settings
          </button>
        </div>
      </div>

      <div className={styles.topRight}>
        <div className={styles.meter} aria-label="Volume meter">
          {Array.from({ length: BARS }, (_, i) => (
            <div key={i} className={styles.bar} data-lit={i >= BARS - litCount} />
          ))}
        </div>
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
          <span className={styles.pitchValue}>+{pitchShift}</span>
        </div>
        <div className={styles.tone}>
          Tone: {tonePct > 0 ? "+" : ""}
          {tonePct}%
        </div>
      </div>

      <div className={styles.scaleLabel}>Scale: {scaleLabel}</div>

      <div className={styles.chordBlock}>
        <p className={styles.chord}>{chord ?? "--"}</p>
        <p className={styles.quality}>{quality}</p>
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
          <svg
            className={styles.githubIcon}
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden
          >
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
                className={styles.iconBtn}
                onClick={() => setSettingsOpen(false)}
              >
                Done
              </button>
            </div>

            <div className={styles.configRow}>
              <span className={styles.configLabel}>Custom chords</span>
              <div className={styles.customChordGrid}>
                {customChords.map((value, i) => (
                  <label key={i} className={styles.customChordField}>
                    <span>{["i","ii","III","iv","V","VI","vii"][i]}</span>
                    <input
                      value={value}
                      onChange={(e) => {
                        const next = [...customChords]
                        next[i] = e.target.value
                        onCustomChordsChange(next)
                      }}
                      placeholder="Am7"
                      aria-label={`Custom chord ${i + 1}`}
                    />
                  </label>
                ))}
              </div>
              <p className={styles.configHint}>
                Each of the seven left-hand chord slots uses its custom chord.
              </p>
            </div>

            {mode === "gesture" && (
              <>
                <div className={styles.configRow}>
                  <span className={styles.configLabel}>Right hand</span>
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
              </>
            )}

            <div className={styles.configRow}>
              <span className={styles.configLabel}>Sequencer</span>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={sequencerVisible}
                  onChange={(e) => onSequencerVisibleChange(e.target.checked)}
                />
                <span>Show loop sequencer</span>
              </label>
              <p className={styles.configHint}>
                Beat grid and loop transport stay hidden until you turn this on.
              </p>
            </div>

            <div className={styles.about}>
              <span className={styles.configLabel}>About</span>
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
          </div>
        </>
      )}
    </div>
  )
}
