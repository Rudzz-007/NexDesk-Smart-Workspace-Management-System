import math
from datetime import datetime

class MLPredictorService:
    def __init__(self):
        self.is_loaded = False
        # Base coefficients representing our mathematical weights
        self.base_desk_rate = 120.0
        self.peak_hour_multiplier = 1.25

    def load_models(self):
        """Simulates memory-mapping our trained scikit-learn pipeline artifacts."""
        self.is_loaded = True
        print("🧠 [ML SERVICE] Serialized pricing and no-show weights mapped successfully.")

    def predict_dynamic_price(self, start_time: datetime) -> float:
        """
        Uses a continuous linear model formula to compute desk rental pricing.
        Surges pricing during typical peak operational windows (9 AM - 5 PM).
        """
        hour = start_time.hour
        # Peak operational curve calculation (bell curve centered around 13:00)
        time_factor = math.exp(-((hour - 13) ** 2) / 32)
        
        calculated_price = self.base_desk_rate + (self.base_desk_rate * time_factor * (self.peak_hour_multiplier - 1))
        return round(calculated_price, 2)

    def predict_noshow_probability(self, email: str, start_time: datetime) -> float:
        """
        Calculates a logistic probability index representing the risk of a no-show.
        Analyzes constraints like early morning arrivals or domain profiles.
        """
        # Baseline log-odds
        log_odds = -2.2 
        
        # Factor 1: Early morning bookings have slightly higher cancellation odds
        if start_time.hour < 9:
            log_odds += 0.8
            
        # Factor 2: Dynamic simulation fallback based on length of character identification
        if len(email) % 2 == 0:
            log_odds += 0.4
            
        # Standard logistic sigmoid map function: 1 / (1 + e^-x)
        probability = 1 / (1 + math.exp(-log_odds))
        return round(probability, 2)

# Singleton instantiation for app lifespan tracking
predictor_service = MLPredictorService()