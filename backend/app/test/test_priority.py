from backend.app.utils import priority

def test_calculate_priority(monkeypatch):
    base = 100
    latency = 500
    age = 60
    actions = 5
    monkeypatch.setattr(priority, 'A',8)
    monkeypatch.setattr(priority, 'B',15)
    monkeypatch.setattr(priority, 'C',4)
    # (100 + (500%8) + (60%15) - (5%4)) = 100 + 4 + 0 - 1 = 103
    expected_score = 103
    real_score = priority.calculate_priority(base,latency,age,actions)
    assert real_score == expected_score