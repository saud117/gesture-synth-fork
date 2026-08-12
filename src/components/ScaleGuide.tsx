import { useMemo } from "react"
import { activeRoman, scaleGuideForKey, scaleLabelForType, type ScaleType } from "../music/scale"
import styles from "./ScaleGuide.module.css"

type Props = {
  keyHz: number
  chord: string | null
  visible: boolean
  scaleType: ScaleType
  chordMode: "scale" | "custom"
  customChords: string[]
}

export function ScaleGuide({ keyHz, chord, visible, scaleType, chordMode, customChords }: Props) {
  const degrees = useMemo(() => scaleGuideForKey(keyHz, scaleType), [keyHz, scaleType])
  const active = activeRoman(chord)

  if (!visible) return null

  const keyLabel =
    degrees[0]?.note != null
      ? scaleLabelForType(degrees[0].note, scaleType)
      : "Scale"

  return (
    <div className={styles.guide} aria-label={`${keyLabel} scale guide`}>
      <p className={styles.caption}>
        Left hand · {keyLabel} · {chordMode === "custom" ? "custom chords" : "scale chords"}
      </p>
      <div className={styles.row}>
        {degrees.map((d, i) => {
          const isActive = !d.isOctave && active === d.roman.toUpperCase().replace("°", "").replace("+", "")
          return (
            <div
              key={`${d.roman}-${d.note}-${i}`}
              className={styles.pad}
              data-active={isActive}
              data-octave={d.isOctave || undefined}
            >
              <span className={styles.roman}>
                {d.isOctave
                  ? "I′"
                  : chordMode === "custom"
                    ? (customChords[i] || d.roman)
                    : d.roman}
              </span>
              <span className={styles.hint}>{d.gesture}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
