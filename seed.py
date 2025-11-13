import hashlib
start_time ="202511111300" # Başlama zamanı: 2025.11.11 13.00
first_commit_epoch = "1762855868"
remote_url = "https://github.com/TamerYurdakul/drop-spot.git"

def generate_seed (remote , epoch ,start):
    raw = f"{remote}|{epoch}|{start}"
    return (hashlib.sha256(raw.encode()).hexdigest()[:12])

seed = generate_seed(
    remote=remote_url,
    epoch=first_commit_epoch,
    start=start_time,
)
print(seed) # seed = 94b2521c4b73