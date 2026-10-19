import os
import sys
import json
from datetime import datetime, timezone, timedelta

sys.stdout.reconfigure(encoding='utf-8')

EXPECTED_CHANNEL_ID = "UCybmO7cI5cmpQgIYE5Om0qA"

def get_env_var(name):
    val = os.environ.get(name)
    if val:
        return val
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(f"{name}="):
                    return line.strip().split("=", 1)[1]
    return None

def publish_video(
    video_path="out/onchain_vault_short.mp4",
    thumbnail_path="out/thumbnail.jpg",
    seo_metadata_path="out/seo_metadata.json",
    privacy_status="public"
):
    """
    Uploads the generated OnChain Vault Short to YouTube via Data API v3 with strict Channel ID verification.
    """
    print("🚀 [OnChain Vault Publisher] Başlatıldı: YouTube yükleme hazırlığı yapılıyor...")

    force = os.getenv("FORCE_PUBLISH", "false").lower() == "true" or "--force" in sys.argv
    trt = datetime.now(timezone(timedelta(hours=3)))
    hour = trt.hour
    minute = trt.minute

    is_window_15 = (hour == 14 and minute >= 50) or (hour == 15 and minute <= 35)
    is_window_02 = (hour == 1 and minute >= 50) or (hour == 2 and minute <= 35)

    if not (is_window_15 or is_window_02) and not force:
        print(f"🛑 [ZAMAN GÜVENLİK KİLİDİ] Saat: {trt.strftime('%H:%M:%S')}. İzin verilen pencereler dışında. Yükleme iptal edildi.")
        return False

    if not os.path.exists(video_path):
        print(f"❌ Video dosyası bulunamadı: {video_path}")
        return False

    title = "Smart Money Alert: Track the Wallets Before the Crowd 📊 #Shorts"
    description = (
        "Don't watch the hype. Track the wallets.\n\n"
        "Daily 40-second briefing on Smart Money movements, Web3 Gaming economies, and hidden Crypto Market mechanics.\n\n"
        "#Crypto #OnChain #Web3Gaming #SmartMoney #Shorts"
    )
    tags = [
        "onchain analysis", "smart money crypto", "whale tracker",
        "web3 gaming", "play to airdrop", "tokenomics", "crypto shorts"
    ]
    pinned_comment = None

    if os.path.exists(seo_metadata_path):
        try:
            with open(seo_metadata_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                title = meta.get("title", title)
                description = meta.get("description", description)
                tags = meta.get("tags", tags)
                pinned_comment = meta.get("pinned_comment")
        except Exception as e:
            print(f"⚠️ SEO meta okuma uyarısı: {e}")

    token_json = get_env_var("YOUTUBE_TOKEN_JSON") or get_env_var("YOUTUBE_CREDENTIALS")

    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload

        creds = None
        if token_json:
            token_data = json.loads(token_json)
            creds = Credentials.from_authorized_user_info(token_data)
        elif os.path.exists("youtube_credentials.json"):
            creds = Credentials.from_authorized_user_file("youtube_credentials.json")

        if not creds:
            print("❌ Geçerli YouTube kimlik doğrulaması bulunamadı.")
            return False

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            print("🔄 [YouTube Auth] OAuth erişim belirteci başarıyla yenilendi.")

        youtube = build("youtube", "v3", credentials=creds)

        # Strict Channel Lock + Deduplication Guard
        channel_resp = youtube.channels().list(mine=True, part="snippet,contentDetails").execute()
        if not channel_resp.get("items"):
            print("❌ Aktif YouTube kanalı bulunamadı.")
            return False

        active_ch = channel_resp["items"][0]
        active_ch_id = active_ch["id"]
        active_ch_title = active_ch["snippet"]["title"]

        if active_ch_id != EXPECTED_CHANNEL_ID:
            print(f"🛑 [KANAL GÜVENLİK KİLİDİ] Aktif kanal ({active_ch_title} / {active_ch_id}) OnChain Vault ({EXPECTED_CHANNEL_ID}) DEĞİL! İşlem iptal edildi.")
            return False

        print(f"🔒 Kanal kilidi doğrulandı: {active_ch_title} ({active_ch_id})")

        if not force:
            try:
                uploads_id = active_ch["contentDetails"]["relatedPlaylists"]["uploads"]
                latest_items = youtube.playlistItems().list(part="snippet", playlistId=uploads_id, maxResults=1).execute()
                if latest_items.get("items"):
                    pub_str = latest_items["items"][0]["snippet"]["publishedAt"]
                    last_pub = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                    now_utc = datetime.now(timezone.utc)
                    elapsed_mins = (now_utc - last_pub).total_seconds() / 60.0
                    if elapsed_mins < 120:
                        print(f"🛑 [MÜKERRER PAYLAŞIM KİLİDİ] Son video {elapsed_mins:.1f} dakika önce yayınlanmış! İptal edildi.")
                        return False
            except Exception as e:
                print(f"⚠️ [Deduplication Kontrol Uyarısı]: {e}")

        body = {
            "snippet": {
                "title": title[:100],
                "description": description,
                "tags": tags,
                "categoryId": "28",  # Science & Technology
                "defaultLanguage": "en-US",
                "defaultAudioLanguage": "en-US"
            },
            "status": {
                "privacyStatus": privacy_status,
                "selfDeclaredMadeForKids": False,
            }
        }

        print(f"📤 YouTube'a yükleniyor: '{title}' ({privacy_status})")
        media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype="video/mp4")
        request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"⏳ Yükleme ilerlemesi: %{int(status.progress() * 100)}")

        video_id = response.get("id")
        print(f"✅ Video OnChain Vault kanalına başarıyla yüklendi! Video ID: {video_id}")
        print(f"🔗 URL: https://youtube.com/shorts/{video_id}")

        if thumbnail_path and os.path.exists(thumbnail_path):
            try:
                youtube.thumbnails().set(
                    videoId=video_id,
                    media_body=MediaFileUpload(thumbnail_path, mimetype="image/jpeg")
                ).execute()
                print("✅ Kapak görseli başarıyla atandı!")
            except Exception as e:
                print(f"⚠️ Kapak görseli atanamadı: {e}")

        if pinned_comment:
            try:
                youtube.commentThreads().insert(
                    part="snippet",
                    body={
                        "snippet": {
                            "videoId": video_id,
                            "topLevelComment": {
                                "snippet": {
                                    "textOriginal": pinned_comment
                                }
                            }
                        }
                    }
                ).execute()
                print(f"💬 Sabitlenen yorum paylaşıldı: {pinned_comment}")
            except Exception as e:
                print(f"⚠️ Yorum paylaşılamadı: {e}")

        if os.path.exists("out/consumed_queue_item.json"):
            try:
                with open("out/consumed_queue_item.json", "r", encoding="utf-8") as f:
                    consumed = json.load(f)
                vid_file = consumed.get("vid_src")
                meta_file = consumed.get("meta_src")
                if vid_file and os.path.exists(vid_file):
                    os.remove(vid_file)
                if meta_file and os.path.exists(meta_file):
                    os.remove(meta_file)
                print(f"🗑️ [Stok Kuyruğu] Yüklenen video kuyruktan silindi: {consumed.get('name')}")
            except Exception as e:
                print(f"⚠️ Kuyruk temizleme uyarısı: {e}")

        return True

    except Exception as e:
        print(f"❌ YouTube yükleme hatası: {e}")
        return False

if __name__ == "__main__":
    success = publish_video()
    if not success:
        sys.exit(1)
