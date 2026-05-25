import os
import urllib.request

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'frontend', 'public', 'models')
PUBLIC_DIR = os.path.join(BASE_DIR, 'frontend', 'public')

# Create directory if it doesn't exist
os.makedirs(MODELS_DIR, exist_ok=True)

# List of face-api.js model files to download
CDN_BASE_URL = "https://justadudewhohacks.github.io/face-api.js/models/"
FILES_TO_DOWNLOAD = [
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
]

print("======================================================")
print("     Ritika Library Face-AI Local Setup")
print("======================================================")

# 1. Download face-api.min.js
script_url = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
script_target = os.path.join(PUBLIC_DIR, "face-api.min.js")

if not os.path.exists(script_target):
    try:
        print("[+] Downloading face-api.min.js script locally...")
        urllib.request.urlretrieve(script_url, script_target)
        print("[SUCCESS] Saved face-api.min.js to public/")
    except Exception as e:
        print(f"[ERROR] Failed to download face-api.min.js script: {e}")
else:
    print("[-] face-api.min.js already exists locally (skipping)")

# 2. Download model files
print("\n[+] Downloading weights/model files...")
for filename in FILES_TO_DOWNLOAD:
    target_path = os.path.join(MODELS_DIR, filename)
    url = CDN_BASE_URL + filename
    
    if os.path.exists(target_path):
        print(f"[-] Already exists: {filename} (skipping)")
        continue
        
    try:
        print(f"[+] Downloading model: {filename}...")
        urllib.request.urlretrieve(url, target_path)
        print(f"[SUCCESS] Saved: {filename}")
    except Exception as e:
        print(f"[ERROR] Error downloading {filename}: {e}")

print("\nFace-AI library and models successfully set up locally!")
