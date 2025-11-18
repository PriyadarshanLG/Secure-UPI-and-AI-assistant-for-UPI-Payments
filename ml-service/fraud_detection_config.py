"""
Fraud Detection Configuration
Adjustable thresholds for reducing false positives while maintaining security
"""

# DETECTION SENSITIVITY LEVELS
# Use 'balanced' for production (recommended)
# Use 'strict' for high-security environments
# Use 'lenient' for reducing false positives

SENSITIVITY_LEVEL = "balanced"  # Options: 'strict', 'balanced', 'lenient'

# ========== THRESHOLDS BY SENSITIVITY ==

=========

THRESHOLDS = {
    'strict': {
        # Very aggressive - High false positives
        'ela_edited_threshold': 12,  # ELA score to mark as edited
        'ela_high_threshold': 20,  # ELA score for high confidence
        'frequency_variance_ratio': 4,  # Frequency domain variance threshold
        'noise_std_high': 20,  # Noise inconsistency threshold (high)
        'noise_std_moderate': 10,  # Noise inconsistency threshold (moderate)
        'sharp_edge_high': 0.05,  # Sharp edge ratio (high)
        'sharp_edge_moderate': 0.03,  # Sharp edge ratio (moderate)
        'low_variance_threshold': 20,  # Low variance threshold
        'edit_score_high': 50,  # Edit score for high confidence
        'edit_score_moderate': 30,  # Edit score for moderate confidence
        'edit_score_low': 15,  # Edit score for low confidence (triggers detection)
        'forgery_clean_threshold': 10,  # Below this = clean
        'forgery_suspicious_threshold': 30,  # Below this = suspicious
        'missing_metadata_score': 25,  # Score for missing EXIF
    },
    
    'balanced': {
        # Recommended for production - Balanced accuracy
        'ela_edited_threshold': 18,  # Increased from 12 (more forgiving)
        'ela_high_threshold': 28,  # Increased from 20
        'frequency_variance_ratio': 6,  # Increased from 4 (less sensitive)
        'noise_std_high': 30,  # Increased from 20 (more forgiving)
        'noise_std_moderate': 18,  # Increased from 10
        'sharp_edge_high': 0.08,  # Increased from 0.05 (more forgiving)
        'sharp_edge_moderate': 0.05,  # Increased from 0.03
        'low_variance_threshold': 12,  # Decreased from 20 (less sensitive)
        'edit_score_high': 70,  # Increased from 50 (harder to trigger)
        'edit_score_moderate': 45,  # Increased from 30
        'edit_score_low': 25,  # Increased from 15 (reduces false positives)
        'forgery_clean_threshold': 15,  # Increased from 10
        'forgery_suspicious_threshold': 40,  # Increased from 30
        'missing_metadata_score': 10,  # Reduced from 25 (screenshots often lack EXIF)
    },
    
    'lenient': {
        # Minimum false positives - Use when getting too many false alarms
        'ela_edited_threshold': 25,  # Very high threshold
        'ela_high_threshold': 35,
        'frequency_variance_ratio': 8,  # Very high ratio
        'noise_std_high': 40,
        'noise_std_moderate': 25,
        'sharp_edge_high': 0.12,
        'sharp_edge_moderate': 0.08,
        'low_variance_threshold': 8,
        'edit_score_high': 90,
        'edit_score_moderate': 60,
        'edit_score_low': 35,
        'forgery_clean_threshold': 20,
        'forgery_suspicious_threshold': 50,
        'missing_metadata_score': 5,  # Almost ignore missing metadata
    }
}

# Get current thresholds based on sensitivity level
def get_thresholds():
    """Get current detection thresholds based on sensitivity level"""
    return THRESHOLDS.get(SENSITIVITY_LEVEL, THRESHOLDS['balanced'])

# ========== SCREENSHOT DETECTION CONFIG ==========

# Screenshot characteristics (genuine screenshots have these)
SCREENSHOT_FEATURES = {
    'common_aspect_ratios': [16/9, 9/16, 19.5/9, 20/9, 18.5/9, 4/3, 3/4, 21/9, 18/9],
    'ratio_tolerance': 0.03,
    'min_mobile_width': 600,
    'min_mobile_height': 1200,
    'authenticity_adjustment': 20,  # Reduce forgery score for authentic screenshots
}

# ========== FALSE POSITIVE REDUCTION ==========

# If image has these characteristics, reduce detection sensitivity
GENUINE_SCREENSHOT_INDICATORS = [
    'native_screenshot_dimensions',  # Matches common phone/screen sizes
    'consistent_compression',  # Uniform compression throughout
    'no_editing_software_metadata',  # No editing software in EXIF
    'typical_noise_levels',  # Normal noise distribution
]

# Weight adjustments for genuine screenshots
GENUINE_SCREENSHOT_ADJUSTMENTS = {
    'forgery_score_reduction': 25,  # Reduce forgery score by this much
    'confidence_reduction': 0.15,  # Lower confidence in detection
    'edit_score_reduction': 30,  # Reduce edit score by this much
}

# ========== FRAUD DETECTION (Transaction Validation) ==========

# These stay strict - we still want to catch fake transactions
TRANSACTION_VALIDATION_STRICT = True  # Always use strict validation for UPI/amount/reference

# UPI ID patterns that indicate fraud (keep strict)
FRAUD_UPI_PATTERNS = [
    'test', 'demo', 'fake', 'dummy', 'sample', 'example',
    '123456', '111111', '000000', 'abc', 'xyz'
]

# Transaction reference patterns indicating fraud
FRAUD_REFERENCE_PATTERNS = [
    'repeated_digits',  # 111111111111, 222222222222
    'sequential',  # 123456789012
    'too_short',  # Less than 12 digits
    'too_long',  # More than 12 digits
]

# Amount patterns indicating fraud
SUSPICIOUS_AMOUNTS = {
    'min_suspicious_round': 50000,  # Round amounts above this are suspicious
    'max_normal_transaction': 200000,  # Amounts above this need extra verification
}

# ========== RECOMMENDATION ==========

RECOMMENDATIONS = {
    'strict': "Use only in high-security environments. Expect false positives on genuine screenshots.",
    'balanced': "Recommended for production. Good balance between security and user experience.",
    'lenient': "Use if getting too many false positives. Still catches obvious fraud.",
}

def get_recommendation():
    """Get recommendation for current sensitivity level"""
    return RECOMMENDATIONS.get(SENSITIVITY_LEVEL, RECOMMENDATIONS['balanced'])

def print_current_config():
    """Print current configuration"""
    print(f"\n{'='*60}")
    print(f"FRAUD DETECTION CONFIGURATION")
    print(f"{'='*60}")
    print(f"Sensitivity Level: {SENSITIVITY_LEVEL.upper()}")
    print(f"Recommendation: {get_recommendation()}")
    print(f"{'='*60}\n")
    
    thresholds = get_thresholds()
    print("Current Thresholds:")
    for key, value in thresholds.items():
        print(f"  {key}: {value}")
    print(f"\n{'='*60}\n")



