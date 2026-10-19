import argparse
import sys
import os
import shutil
import json
import subprocess
from datetime import datetime, timezone, timedelta

sys.stdout.reconfigure(encoding='utf-8')

def extract_thumbnail_ffmpeg(video_path="out/onchain_vault_short.mp4", output_path="out/thumbnail.jpg"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = f'ffmpeg -y -ss 00:00:02.500 -i "{video_path}" -vframes 1 -q:v 2 "{output_path}"'
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def check_and_pop_queue():
    queue_dir = "queue"
    if not os.path.exists(queue_dir):
        return None

    videos = sorted([f for f in os.listdir(queue_dir) if f.endswith(".mp4")])
    if not videos:
        return None

    trt_hour = datetime.now(timezone(timedelta(hours=3))).hour
    selected_vid = None

    if trt_hour >= 20 or trt_hour <= 5:
        night_vids = [v for v in videos if "2100" in v or "0200" in v]
        if night_vids:
            selected_vid = night_vids[0]
    else:
        daytime_vids = [v for v in videos if "1500" in v]
        if daytime_vids:
            selected_vid = daytime_vids[0]

    if not selected_vid:
        selected_vid = videos[0]

    vid_src = os.path.join(queue_dir, selected_vid)
    meta_src = os.path.join(queue_dir, selected_vid.replace(".mp4", "_metadata.json"))

    os.makedirs("out", exist_ok=True)
    out_vid = "out/onchain_vault_short.mp4"
    out_meta = "out/seo_metadata.json"

    shutil.copyfile(vid_src, out_vid)
    if os.path.exists(meta_src):
        shutil.copyfile(meta_src, out_meta)

    extract_thumbnail_ffmpeg(out_vid, "out/thumbnail.jpg")

    with open("out/consumed_queue_item.json", "w", encoding="utf-8") as f:
        json.dump({
            "vid_src": vid_src,
            "meta_src": meta_src if os.path.exists(meta_src) else None,
            "name": selected_vid
        }, f, indent=2)

    remaining = len(videos) - 1
    print("=" * 70)
    print(f"📦 [OnChain Vault Kuyruğu] Video kuyruktan alındı: {selected_vid} (Kalan: {remaining})")
    print("=" * 70)
    return out_vid

def main():
    parser = argparse.ArgumentParser(description="OnChain Vault - Autonomous YouTube Shorts CLI")
    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("run", help="Pop next Short from queue for publishing")
    args = parser.parse_args()

    queued = check_and_pop_queue()
    if not queued:
        print("ℹ️ [OnChain Vault] Kuyrukta bekleyen video yok, işlem güvenle tamamlandı.")
        sys.exit(0)

if __name__ == "__main__":
    main()
