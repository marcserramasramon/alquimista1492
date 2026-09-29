"""Generates Fra Francesc's narration for the ambient geofence videos in
content/public/missatgesMaster.ts and mounts it onto each video's audio track
in place (public/video/*.mp4). Unlike generate-audio.py (textos.ts, separate
mp3 files) and generate-veu-inquisidor.py (his own darker voice), these use
Fra Francesc's regular voice muxed directly into the video file, because
VistaMissatgeVideo.tsx only plays the <video>'s own audio track.

Same model/voice/params as generate-audio.py, so the narration matches his
other lines. If a text changes, rerun this for that id (--force to redo one
that already looks processed via the .done marker next to it).

Needs: node, `pip install onnxruntime numpy huggingface_hub imageio-ffmpeg`.
Usage: python scripts/generate-audio-ambient.py [--force] [id ...]
"""

import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download

ROOT = Path(__file__).resolve().parent.parent
MODEL_REPO = "BSC-LT/matxa-tts-v2-ca-multiaccent-graphemes"
MODEL_FILE = "matxa_v2_multiaccent_graphemes_20_steps_wavenext.onnx"
SPEAKER = 12  # CM, central Catalan male (EnVeuAlta) — same as generate-audio.py
TEMPERATURE = 0.80
LENGTH_SCALE = 1.08
SAMPLE_RATE = 22050
SENTENCE_GAP = 0.35
POST_FILTER = "highpass=f=70,loudnorm=I=-16:TP=-1.5"

# Ids in content/public/missatgesMaster.ts whose `video` gets Fra Francesc's narration.
AMBIENT_IDS = ["aigua-esglesia", "terra-vinyals", "anima-cami-malla", "foc-placa-creu"]

NUMBERS = {"1472": "mil quatre-cents setanta-dos"}

_punctuation = ';:,.!?¡¿—…"«»“”()- '
_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
_letters_ipa = "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ"
_letters_accented = "àáèéìíòóùú·üïöñ’#´"
SYMBOLS = ["_"] + list(_punctuation) + list(_letters) + list(_letters_ipa) + list(_letters_accented)
SYMBOL_ID = {s: i for i, s in enumerate(SYMBOLS)}

COLLECT_JS = """
import { pathToFileURL } from "node:url";
const mod = await import(pathToFileURL("content/public/missatgesMaster.ts").href);
const ids = new Set(%s);
const out = mod.MISSATGES_MASTER.filter((m) => ids.has(m.id)).map((m) => ({ id: m.id, text: m.text, video: m.video }));
process.stdout.write(JSON.stringify(out));
"""


def load_missatges(ids):
    js = COLLECT_JS % json.dumps(ids)
    res = subprocess.run(
        ["node", "--no-warnings", "--input-type=module", "-e", js],
        cwd=ROOT, capture_output=True, check=True,
    )
    return json.loads(res.stdout.decode("utf-8"))


def find_ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def normalize(text):
    for num, words in NUMBERS.items():
        text = text.replace(num, words)
    text = " ".join(text.lower().split())
    unknown = sorted({c for c in text if c not in SYMBOL_ID})
    if unknown:
        raise ValueError(f"Characters the model cannot read: {unknown} in: {text[:60]}...")
    return text


def sentences(paragraph):
    return [s for s in re.split(r"(?<=[.!?…])\s+", paragraph.strip()) if s]


def synth(session, sentence):
    ids = [SYMBOL_ID[c] for c in normalize(sentence)]
    x = [0] * (len(ids) * 2 + 1)
    x[1::2] = ids
    mel_lengths, wav = session.run(None, {
        "x": np.array([x], dtype=np.int64),
        "x_lengths": np.array([len(x)], dtype=np.int64),
        "scales": np.array([TEMPERATURE, LENGTH_SCALE], dtype=np.float32),
        "spks": np.array([SPEAKER], dtype=np.int64),
    })
    return wav[0][: int(mel_lengths[0]) * 256]


def silence(seconds):
    return np.zeros(int(SAMPLE_RATE * seconds), dtype=np.float32)


def write_wav(path, audio):
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm.tobytes())


def main():
    args = sys.argv[1:]
    force = "--force" in args
    wanted = [a for a in args if not a.startswith("--")] or AMBIENT_IDS

    items = load_missatges(wanted)
    found = {i["id"] for i in items}
    for missing in set(wanted) - found:
        print(f"WARN: id {missing!r} not found in missatgesMaster.ts (or has no video)")
    items = [i for i in items if i.get("video")]

    session = None
    ffmpeg = find_ffmpeg()
    failures = 0

    with tempfile.TemporaryDirectory() as tmp:
        for item in items:
            video = ROOT / "public" / item["video"].lstrip("/")
            marker = video.with_suffix(".narrat")
            if marker.exists() and not force:
                print(f"skip {item['id']} (ja té narració; --force per refer-ho)")
                continue
            if not video.exists():
                print(f"FAIL {item['id']}: no existeix {video}")
                failures += 1
                continue
            try:
                if session is None:
                    session = ort.InferenceSession(
                        hf_hub_download(MODEL_REPO, MODEL_FILE), providers=["CPUExecutionProvider"]
                    )
                raw = Path(tmp) / f"{item['id']}-raw.wav"
                narracio = Path(tmp) / f"{item['id']}-narracio.wav"
                out = Path(tmp) / f"{item['id']}-out.mp4"

                parts = []
                for s in sentences(item["text"]):
                    parts += [synth(session, s), silence(SENTENCE_GAP)]
                write_wav(raw, np.concatenate(parts))

                subprocess.run(
                    [ffmpeg, "-y", "-loglevel", "error", "-i", str(raw), "-af", POST_FILTER,
                     "-ar", "44100", "-ac", "1", str(narracio)],
                    check=True,
                )

                subprocess.run(
                    [ffmpeg, "-y", "-loglevel", "error",
                     "-i", str(video), "-i", str(narracio),
                     "-map", "0:v:0", "-map", "1:a:0",
                     "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                     "-movflags", "+faststart", str(out)],
                    check=True,
                )
                out.replace(video)
                marker.write_text("narrat\n", encoding="utf-8")
                print(f"ok   {item['id']} -> {item['video']}")
            except Exception as e:
                print(f"FAIL {item['id']}: {e}")
                failures += 1

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
