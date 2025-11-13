
from backend.app.config import PRIORITY_SEED

def get_priority(seed:str):
    A = 7 + (int(seed[0:2], 16) % 5)
    B = 13 + (int(seed[2:4], 16) % 7)
    C = 3 + (int(seed[4:6], 16) % 3)
    return A , B , C

A,B,C = get_priority(PRIORITY_SEED)

def calculate_priority(base,signup_latency_ms,account_age_days,rapid_actions):
    return base + (signup_latency_ms % A) + (account_age_days % B) - (rapid_actions % C)