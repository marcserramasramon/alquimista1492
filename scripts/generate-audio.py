"""Generates public/audio/*.mp3 (Fra Francesc's voice) from content/public/textos.ts.

Model: Matxa-TTS v2 multiaccent graphemes (BSC-LT, ONNX end-to-end with the alVoCat vocoder).
Needs: node, `pip install onnxruntime numpy huggingface_hub imageio-ffmpeg`.
Usage: python scripts/generate-audio.py [--force]
"""

import json
import os
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
SPEAKER = 12  # CM, central Catalan male (EnVeuAlta)
TEMPERATURE = 0.55
LENGTH_SCALE = 1.08
SAMPLE_RATE = 22050
SENTENCE_GAP = 0.35
PARAGRAPH_GAP = 0.7
POST_FILTER = "highpass=f=70,aecho=0.95:0.9:35:0.07,loudnorm=I=-16:TP=-1.5"

# The model reads graphemes only: numbers must be written out.
NUMBERS = {"1472": "mil quatre-cents setanta-dos"}

# Symbol table of the v2-graphemes branch (matcha/text/symbols.py); the order defines the ids.
_punctuation = ';:,.!?¡¿—…"«»“”()- '
_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
_letters_ipa = "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ"
_letters_accented = "àáèéìíòóùú·üïöñ’#´"
SYMBOLS = ["_"] + list(_punctuation) + list(_letters) + list(_letters_ipa) + list(_letters_accented)
SYMBOL_ID = {s: i for i, s in enumerate(SYMBOLS)}

COLLECT_JS = """
import { pathToFileURL } from "node:url";
const textos = await import(pathToFileURL("content/public/textos.ts").href);
const out = [];
const visit = (v) => {
  if (!v || typeof v !== "object") return;
  if (typeof v.audio === "string" && Array.isArray(v.paragrafs)) { out.push({ audio: v.audio, paragrafs: v.paragrafs }); return; }
  Object.values(v).forEach(visit);
};
visit(textos);
process.stdout.write(JSON.stringify(out));
"""


def load_narrations():
    res = subprocess.run(
        ["node", "--no-warnings", "--input-type=module", "-e", COLLECT_JS],
        cwd=ROOT, capture_output=True, check=True,
    )
    return json.loads(res.stdout.decode("utf-8"))


def find_ffmpeg():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


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
    force = "--force" in sys.argv
    narrations = load_narrations()
    session = ort.InferenceSession(hf_hub_download(MODEL_REPO, MODEL_FILE), providers=["CPUExecutionProvider"])
    ffmpeg = find_ffmpeg()
    failures = 0

    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        for item in narrations:
            mp3 = ROOT / "public" / item["audio"].lstrip("/")
            if mp3.exists() and not force:
                print(f"skip {item['audio']}")
                continue
            try:
                parts = []
                for p, paragraph in enumerate(item["paragrafs"]):
                    if p:
                        parts.append(silence(PARAGRAPH_GAP - SENTENCE_GAP))
                    for s in sentences(paragraph):
                        parts += [synth(session, s), silence(SENTENCE_GAP)]
                write_wav(raw, np.concatenate(parts))
                subprocess.run(
                    [ffmpeg, "-y", "-loglevel", "error", "-i", str(raw), "-af", POST_FILTER,
                     "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "96k", str(mp3)],
                    check=True,
                )
                print(f"ok   {item['audio']}")
            except Exception as e:
                print(f"FAIL {item['audio']}: {e}")
                failures += 1

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
