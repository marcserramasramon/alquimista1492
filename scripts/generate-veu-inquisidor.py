"""Genera public/audio/alerta-inquisidor.mp3: la veu de l'Inquisidor (NO la de Fra
Francesc — per això no viu a scripts/generate-audio.py). Mateix model TTS, però amb
un altre parlant i un post-processat que l'enfosqueix i l'alenteix per fer-la
amenaçadora, més un eco de cripta.

Guió: content/public/missatgesMaster.ts (ALERTA_INQUISIDOR). Si es canvia el text,
torna a executar aquest script.

Necessita: node, `pip install onnxruntime numpy huggingface_hub imageio-ffmpeg`,
i un ffmpeg amb librubberband (el d'imageio-ffmpeg ja en porta).
Usage: python scripts/generate-veu-inquisidor.py [--force]
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
OUT = ROOT / "public" / "audio" / "alerta-inquisidor.mp3"

SPEAKER = 5  # Pere, north-western Catalan male (LaFresCat) — base diferent del de Fra Francesc (12)
TEMPERATURE = 0.75  # natural, amb ràbia continguda (massa baix sonava pla i menys amenaçador)
LENGTH_SCALE = 0.95  # ritme normal, una mica sec/tallant — la lentitud sonava arrossegada, no amenaçadora
SAMPLE_RATE = 22050
SENTENCE_GAP = 0.30
PARAGRAPH_GAP = 0.45

# Post-processat: pitch avall amb "formant=preserved" (sense això sonava a robot/
# xip: canviar el to sense preservar el timbre de la veu humana fa aquest efecte),
# compressió suau i un toc curtíssim d'espai. Sense eco llarg ni filtres agressius.
FILTER_COMPLEX = (
    "[0:a]rubberband=pitch=0.80:tempo=1.02:formant=preserved:pitchq=quality,"
    "acompressor=threshold=-20dB:ratio=2.5:attack=5:release=150:makeup=1.5,"
    "aecho=0.5:0.2:18:0.12,"
    "highpass=f=85,"
    "loudnorm=I=-14:TP=-1.5"
)

# El model llegeix grafemes: cal escriure els números en lletres.
NUMBERS = {}

_punctuation = ';:,.!?¡¿—…"«»“”()- '
_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
_letters_ipa = "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ"
_letters_accented = "àáèéìíòóùú·üïöñ’#´"
SYMBOLS = ["_"] + list(_punctuation) + list(_letters) + list(_letters_ipa) + list(_letters_accented)
SYMBOL_ID = {s: i for i, s in enumerate(SYMBOLS)}

COLLECT_JS = """
import { pathToFileURL } from "node:url";
const mod = await import(pathToFileURL("content/public/missatgesMaster.ts").href);
const m = mod.MISSATGES_MASTER.find((x) => x.id === "inquisidor-alerta");
process.stdout.write(JSON.stringify({ titol: m.titol, paragrafs: m.text.split(/(?<=[.!?]) +/) }));
"""


def load_guio():
    res = subprocess.run(
        ["node", "--no-warnings", "--input-type=module", "-e", COLLECT_JS],
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
        raise ValueError(f"Caràcters que el model no llegeix: {unknown} a: {text[:60]}...")
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
    if OUT.exists() and not force:
        print(f"ja existeix {OUT} (--force per regenerar-lo)")
        return

    guio = load_guio()
    print(f"Guió: {guio['titol']!r}, {len(guio['paragrafs'])} frases")
    session = ort.InferenceSession(hf_hub_download(MODEL_REPO, MODEL_FILE), providers=["CPUExecutionProvider"])
    ffmpeg = find_ffmpeg()

    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        parts = []
        for p, paragraph in enumerate(guio["paragrafs"]):
            if p:
                parts.append(silence(PARAGRAPH_GAP - SENTENCE_GAP))
            for s in sentences(paragraph):
                parts += [synth(session, s), silence(SENTENCE_GAP)]
        write_wav(raw, np.concatenate(parts))

        subprocess.run(
            [ffmpeg, "-y", "-loglevel", "error", "-i", str(raw),
             "-filter_complex", FILTER_COMPLEX,
             "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", str(OUT)],
            check=True,
        )
    print(f"ok   {OUT}")


if __name__ == "__main__":
    main()
