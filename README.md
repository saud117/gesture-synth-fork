# Gesture Synth Fork

## 🎵 Live Demo

👉 **[Try Gesture Synth Fork](https://gesture-synth-fork.vercel.app/)**

The live version is hosted on Vercel.


A customized fork of [Gesture Synth](https://www.gesturesynth.com/) focused on a simpler interface, custom chord control, and pitch transposition for musicians who are comfortable with familiar chord shapes or using a capo.

> **Want the original Gesture Synth?**
> Visit the original project at [gesturesynth.com](https://www.gesturesynth.com/).

## ✨ What's Different in This Fork?

- 🎸 **Removed the left-hand tilt feature** from the original interaction system.
- 🎵 **Added Pitch / Transpose control** to move the whole instrument by semitones, up to 12 half-steps.
- 🎸 **Added custom chord configuration**.
- 🎼 The **first custom chord determines the displayed scale**.
- 🎨 Redesigned the interface with a **dark black and blue** theme.
- 🔊 Changed the audio/volume visualizer from teal to **blue**.
- 📚 Disabled the automatic first-visit tutorial panel.
- ⚙️ Simplified the settings interface.
- 🔗 Added fork credits and social links.

## 🎸 Custom Chords

The default custom chords are:

**Am · G · F · E · Dm · C · Em**

You can replace these with your own chords.

The **first custom chord determines the scale**.

Examples:

```text
Am → Scale: A minor
G  → Scale: G major
C  → Scale: C major
Dm → Scale: D minor
```

If you change the first custom chord from `Am` to `G`, the displayed scale changes from:

```text
Scale: A minor
```

to:

```text
Scale: G major
```

## 🎵 Pitch / Capo Feature

The Pitch control transposes the whole instrument by semitones.

This feature is especially useful for guitarists who:

- Are comfortable with open chords.
- Prefer to keep the same familiar chord shapes.
- Use a capo.
- Want to change the sounding key without changing their chord shapes.

For example, if the current scale is:

```text
Scale: A minor
```

raising the pitch by one semitone changes it to:

```text
Scale: A# minor
```

The chord/audio output and scale display move together with the pitch.

## 🚀 Usage

### Requirements

Before running Gesture Synth Fork, make sure you have:

- [Node.js](https://nodejs.org/) installed
- npm (included with Node.js)
- A modern web browser such as Chrome, Firefox, or Edge
- A working webcam
- Speakers or headphones

### Installation

Clone the repository:

```bash
git clone https://github.com/saud117/gesture-synth-fork.git
cd gesture-synth-fork
```

Install the project dependencies:

```bash
npm -i
```

Then run:

```bash
npm install
```

### Optional: Fix npm Audit Issues

You can optionally run:

```bash
npm audit fix
```

> `npm audit fix` is optional. If the project is already working correctly, you do not necessarily need to run it.

### Build the Application

Create the production build:

```bash
npm run build
```

This generates the production files in the `dist` directory.

### Run the Production Build

Serve the built application locally:

```bash
npx serve dist
```

The terminal will provide a local URL. Open that URL in your browser.

### First Time Setup

When you open the application:

1. Allow camera access when your browser asks for permission.
2. Make sure your camera can clearly see your hand.
3. Position yourself so the gesture tracking can detect your hand.
4. The application will open directly to the main interface.

The automatic first-visit tutorial has been disabled in this fork.

## 🎼 Scale Display

The current scale is shown at the top center of the interface.

It is intentionally compact so it remains visible without taking up much space.

For example:

```text
Scale: A minor
```

or:

```text
Scale: G major
```

The scale updates when:

- The first custom chord changes.
- The pitch changes.

## 🔊 Audio Visualizer

The main interface includes a volume/audio visualizer.

The visualizer has been changed from the original teal appearance to **blue** to match the fork's black-and-blue design.

## 🎨 Interface

Gesture Synth Fork uses a dark black and blue visual style.

The interface includes:

- Dark black background
- Blue accent colors
- Blue audio visualizer
- Compact scale display
- Custom chord controls
- Pitch/transposition controls
- Simplified settings
- Fork and social links

## 🔄 Original Project

If you want the **original, unmodified version of Gesture Synth**, check out:

**https://www.gesturesynth.com/**

This repository is a modified fork of the original project.

If you prefer the original feature set and interaction design, please use the original project.

## 👨‍💻 Credits

### Fork by Saud Nasir

This fork and its modifications were made by **Saud Nasir**.

GitHub:

**https://github.com/saud117**

### Original Developer

**Developed by Ethan**

The original project and its underlying work remain credited to the original developer.

## 🌐 Social Links

- **GitHub:** https://github.com/saud117
- **LinkedIn:** https://www.linkedin.com/in/saudnasir
- **Instagram:** https://www.instagram.com/saudnasir____
- **TikTok — Fretful Melodies:** https://www.tiktok.com/@fretfull_melodies
- **YouTube — Fretful Melodies:** https://youtube.com/@fretfulmelodies

## 📦 Production Build

To create a production build:

```bash
npm run build
```

The production files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

Then open the local URL shown in the terminal.

## ⚠️ Attribution & License

Gesture Synth Fork is a modification/fork of the original Gesture Synth project.

The original project and its original contributions remain credited to their respective author(s).

Please refer to the original project and its license for the applicable licensing and attribution requirements.

If you redistribute or further modify this fork, please preserve the original project's required attribution and license information.

## 🔗 Project Links

**Gesture Synth Fork:**  
https://github.com/saud117/gesture-synth-fork

**Original Gesture Synth:**  
https://www.gesturesynth.com/

---

**Gesture Synth Fork**  
**Fork by Saud Nasir**
