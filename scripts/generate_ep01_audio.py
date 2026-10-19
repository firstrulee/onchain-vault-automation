import asyncio
import json
import math
import os
import struct
import subprocess
import sys
import wave
import edge_tts

sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_TEXT = (
    "Before you buy any gaming or AI token this week, look at wallet zero-x-seven-one-C. "
    "Forty-eight hours before a hyped Web3 game token dumped sixty-four percent, retail volume hit an all-time high. "
    "Why? Because influencers were paid to push a tournament right before a forty-eight million dollar VC cliff unlock. "
    "Smart money never reads hype threads. They audit three numbers in sixty seconds. "
    "Rule one: divide Fully Diluted Valuation by Market Cap. Above five means you are the exit liquidity. "
    "Rule two: never buy within seven days of a five percent supply unlock. "
    "Rule three: track multisig outflows to exchange deposit wallets. "
    "Save this checklist and subscribe so we track the whales for you, especially..."
)

DISPLAY_MAP = {
    "zero-x-seven-one-C.": "0x71C...89A2.",
    "zero-x-seven-one-C": "0x71C...89A2",
    "Forty-eight": "48",
    "forty-eight": "$48.5M",
    "sixty-four": "-64%",
    "percent,": "%,",
    "sixty": "60",
    "five": "5x",
    "seven": "7",
}

def generate_dark_terminal_bed(wav_path: str, duration_sec: float, card_cue_times: list[float]):
    """Generates a clean institutional dark-ambient sub-bass pulse + subtle UI telemetry ticks."""
    sample_rate = 44100
    n_samples = int(duration_sec * sample_rate)
    cue_samples = [int(t * sample_rate) for t in card_cue_times]

    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        frames = bytearray()
        for i in range(n_samples):
            t = i / sample_rate
            # Deep atmospheric 55Hz + 110Hz dark pulse modulated slowly at 0.5Hz
            mod = 0.65 + 0.35 * math.sin(2.0 * math.pi * 0.5 * t)
            sub = (
                0.55 * math.sin(2.0 * math.pi * 55.0 * t)
                + 0.25 * math.sin(2.0 * math.pi * 110.0 * t)
                + 0.12 * math.sin(2.0 * math.pi * 165.0 * t)
            ) * mod * 0.08

            # Subtle high-tech UI telemetry click/chime on card transitions
            ui_sig = 0.0
            for cs in cue_samples:
                dt = (i - cs) / sample_rate
                if 0.0 <= dt <= 0.14:
                    env = math.exp(-dt * 32.0)
                    freq = 880.0 if dt < 0.04 else 1320.0
                    ui_sig += math.sin(2.0 * math.pi * freq * dt) * env * 0.14

            val = max(-0.95, min(0.95, sub + ui_sig))
            frames.extend(struct.pack("<h", int(val * 32767)))

        wf.writeframes(frames)

async def main():
    os.makedirs("public", exist_ok=True)
    vo_path = "public/ep01_vo_raw.mp3"
    bed_path = "public/ep01_bed.wav"
    master_path = "public/ep01_master_audio.mp3"

    communicate = edge_tts.Communicate(
        SCRIPT_TEXT,
        voice="en-US-ChristopherNeural",
        rate="+10%",
        pitch="-3Hz",
        boundary="WordBoundary"
    )

    words = []
    audio_bytes = bytearray()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            start_s = chunk["offset"] / 10_000_000.0
            dur_s = chunk["duration"] / 10_000_000.0
            raw_w = chunk["text"]
            disp_w = DISPLAY_MAP.get(raw_w, raw_w)
            words.append({
                "word": disp_w,
                "start": round(start_s, 3),
                "end": round(start_s + max(dur_s, 0.12), 3)
            })

    with open(vo_path, "wb") as f:
        f.write(audio_bytes)

    from mutagen.mp3 import MP3
    vo_duration = MP3(vo_path).info.length
    duration_sec = vo_duration + 0.45

    # Find phase transition timestamps based on word triggers
    p2_time = 4.2
    p3_time = 13.5
    p4_time = 29.0
    for w in words:
        lw = w["word"].lower()
        if "48" in lw or "forty-eight" in lw:
            p2_time = w["start"]
            break
    for w in words:
        if w["word"].lower() == "smart":
            p3_time = w["start"]
            break
    for w in words:
        if w["word"].lower() == "save":
            p4_time = w["start"]
            break

    generate_dark_terminal_bed(bed_path, duration_sec, [0.05, p2_time, p3_time, p4_time])

    fps = 30
    duration_frames = int(math.ceil(duration_sec * fps))

    props = {
        "episodeNumber": "01",
        "voFile": "ep01_vo_raw.mp3",
        "bedFile": "ep01_bed.wav",
        "brollFile": "ep01_flow_broll.mp4",
        "durationInFrames": duration_frames,
        "phaseTimes": {
            "phase1Start": 0.0,
            "phase2Start": p2_time,
            "phase3Start": p3_time,
            "phase4Start": p4_time
        },
        "words": words
    }

    with open("public/ep01_props.json", "w", encoding="utf-8") as f:
        json.dump(props, f, indent=2)

    print(f"AUDIO_AND_PROPS_READY: duration={duration_sec:.2f}s ({duration_frames} frames), words={len(words)}, phases={[0.0, p2_time, p3_time, p4_time]}")

if __name__ == "__main__":
    asyncio.run(main())
