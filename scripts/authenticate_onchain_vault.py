import os
import sys
import json
import base64
import requests
import http.server
import socketserver
import urllib.parse
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from nacl import encoding, public

sys.stdout.reconfigure(encoding='utf-8')
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl"
]
PORT = 8097
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
EXPECTED_CHANNEL_ID = "UCybmO7cI5cmpQgIYE5Om0qA"

def ensure_github_repo(repo_name="onchain-vault-automation"):
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    check = requests.get(f"https://api.github.com/repos/firstrulee/{repo_name}", headers=headers)
    if check.status_code == 200:
        print(f"✅ GitHub deposu mevcut: firstrulee/{repo_name}", flush=True)
        return True
    create = requests.post(
        "https://api.github.com/user/repos",
        headers=headers,
        json={
            "name": repo_name,
            "description": "OnChain Vault (@OnChainVault) Autonomous YouTube Shorts Pipeline & Publisher",
            "private": False,
            "auto_init": True
        }
    )
    if create.status_code in (200, 201):
        print(f"✅ Yeni GitHub deposu oluşturuldu: firstrulee/{repo_name}", flush=True)
        return True
    print(f"⚠️ GitHub deposu oluşturma yanıtı: {create.status_code} {create.text}", flush=True)
    return False

def set_github_secret(secret_name, secret_val, repo="firstrulee/onchain-vault-automation"):
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }

    pk_url = f"https://api.github.com/repos/{repo}/actions/secrets/public-key"
    r = requests.get(pk_url, headers=headers)
    if r.status_code != 200:
        print(f"❌ GitHub public key alınamadı ({repo}): {r.status_code} {r.text}", flush=True)
        return False

    pk_data = r.json()
    key_id = pk_data["key_id"]
    public_key_b64 = pk_data["key"]

    pub_key = public.PublicKey(public_key_b64.encode("utf-8"), encoding.Base64Encoder)
    sealed_box = public.SealedBox(pub_key)
    encrypted = sealed_box.encrypt(secret_val.encode("utf-8"))
    encrypted_b64 = base64.b64encode(encrypted).decode("utf-8")

    put_url = f"https://api.github.com/repos/{repo}/actions/secrets/{secret_name}"
    payload = {
        "encrypted_value": encrypted_b64,
        "key_id": key_id
    }
    pr = requests.put(put_url, headers=headers, json=payload)
    if pr.status_code in (201, 204):
        print(f"✅ GitHub Secret ({repo} -> {secret_name}) başarıyla güncellendi!", flush=True)
        return True
    else:
        print(f"⚠️ Secret güncellenemedi ({repo} -> {secret_name}): {pr.status_code} {pr.text}", flush=True)
        return False

def authenticate():
    print("🔐 [OnChain Vault] YouTube Kanal Yetkilendirmesi Başlatılıyor...", flush=True)

    secret_file = "client_secret.json"
    if not os.path.exists(secret_file):
        print("❌ HATA: client_secret.json bulunamadı!", flush=True)
        sys.exit(1)

    redirect_uri = f"http://localhost:{PORT}/"
    flow = InstalledAppFlow.from_client_secrets_file(
        secret_file,
        SCOPES,
        redirect_uri=redirect_uri
    )

    auth_url, state = flow.authorization_url(prompt="consent", access_type="offline")

    with open("auth_url.txt", "w", encoding="utf-8") as f:
        f.write(auth_url)

    print(f"\nAUTH_URL_READY: {auth_url}\n", flush=True)

    auth_code_container = {}

    class OAuthHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)

            if "code" in params:
                auth_code_container["url"] = f"http://localhost:{PORT}" + self.path
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                html = """
                <html>
                <head><title>OnChain Vault - Yetkilendirme Başarılı</title></head>
                <body style="font-family: 'Inter', system-ui; text-align: center; padding: 60px; background: #06080C; color: #F8FAFC;">
                    <h1 style="color: #10B981;">⚡ OnChain Vault (@OnChainVault) - Yetkilendirme Başarılı!</h1>
                    <p style="font-size: 18px; color: #94A3B8;">YouTube kanalınız kalıcı OAuth (In Production) ile otomasyona bağlandı.</p>
                </body>
                </html>
                """
                self.wfile.write(html.encode("utf-8"))
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Hata: Kod alinamadi.")

        def log_message(self, format, *args):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("localhost", PORT), OAuthHandler)
    server.timeout = 300

    print(f"📡 Yerel OAuth sunucusu dinleniyor (http://localhost:{PORT}/)...", flush=True)
    while "url" not in auth_code_container:
        server.handle_request()

    server.server_close()

    print("🔑 Token oluşturuluyor...", flush=True)
    flow.fetch_token(authorization_response=auth_code_container["url"])
    creds = flow.credentials

    # Verify which channel was authorized
    youtube = build("youtube", "v3", credentials=creds)
    ch_resp = youtube.channels().list(mine=True, part="snippet").execute()
    items = ch_resp.get("items", [])
    if not items:
        print("❌ HATA: Bu hesapta aktif YouTube kanalı bulunamadı!", flush=True)
        sys.exit(1)

    ch_id = items[0]["id"]
    ch_title = items[0]["snippet"]["title"]
    ch_custom_url = items[0]["snippet"].get("customUrl", "")
    print(f"📌 Yetkilendirilen Kanal: {ch_title} ({ch_custom_url}) | ID: {ch_id}", flush=True)

    if ch_id != EXPECTED_CHANNEL_ID:
        print(f"❌ YANLIŞ KANAL SEÇİLDİ! Beklenen: {EXPECTED_CHANNEL_ID} (OnChain Vault), Seçilen: {ch_id} ({ch_title})", flush=True)
        sys.exit(2)

    cred_data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
        "channel_id": ch_id,
        "channel_title": ch_title
    }

    with open("youtube_credentials.json", "w", encoding="utf-8") as f:
        json.dump(cred_data, f, indent=2)

    print("✅ youtube_credentials.json kaydedildi!", flush=True)

    ensure_github_repo("onchain-vault-automation")
    cred_json_str = json.dumps(cred_data)

    # Set secrets on dedicated repo
    set_github_secret("YOUTUBE_TOKEN_JSON", cred_json_str, repo="firstrulee/onchain-vault-automation")
    set_github_secret("YOUTUBE_CREDENTIALS", cred_json_str, repo="firstrulee/onchain-vault-automation")

    # Also store on grace-of-jesus-automation as ONCHAIN_VAULT_TOKEN_JSON
    set_github_secret("ONCHAIN_VAULT_TOKEN_JSON", cred_json_str, repo="firstrulee/grace-of-jesus-automation")

    print("🎉 TEBRİKLER! OnChain Vault (@OnChainVault) kalıcı OAuth yetkilendirmesi ve GitHub Secrets kurulumu %100 tamamlandı!", flush=True)

if __name__ == "__main__":
    authenticate()
