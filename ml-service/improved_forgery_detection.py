"""
Improved Forgery Detection with Reduced False Positives
This file contains the updated analyze_forgery function with configurable thresholds
"""

import numpy as np
from PIL import Image
import tempfile
import os
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

# Import configuration
try:
    from fraud_detection_config import get_thresholds, SCREENSHOT_FEATURES, GENUINE_SCREENSHOT_ADJUSTMENTS
except ImportError:
    # Fallback to default balanced thresholds
    def get_thresholds():
        return {
            'ela_edited_threshold': 18,
            'ela_high_threshold': 28,
            'frequency_variance_ratio': 6,
            'noise_std_high': 30,
            'noise_std_moderate': 18,
            'sharp_edge_high': 0.08,
            'sharp_edge_moderate': 0.05,
            'low_variance_threshold': 12,
            'edit_score_high': 70,
            'edit_score_moderate': 45,
            'edit_score_low': 25,
            'forgery_clean_threshold': 15,
            'forgery_suspicious_threshold': 40,
            'missing_metadata_score': 10,
        }
    SCREENSHOT_FEATURES = {
        'common_aspect_ratios': [16/9, 9/16, 19.5/9, 20/9, 18.5/9, 4/3, 3/4, 21/9, 18/9],
        'ratio_tolerance': 0.03,
        'min_mobile_width': 600,
        'min_mobile_height': 1200,
        'authenticity_adjustment': 20,
    }
    GENUINE_SCREENSHOT_ADJUSTMENTS = {
        'forgery_score_reduction': 25,
        'confidence_reduction': 0.15,
        'edit_score_reduction': 30,
    }

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not available - some forensics features disabled")

def analyze_forgery_improved(image: Image.Image) -> Tuple[float, str, float, bool, float, List[str]]:
    """
    IMPROVED forgery detection with reduced false positives
    Returns: (forgery_score, verdict, confidence, is_edited, edit_confidence, edit_indicators)
    """
    # Get current thresholds
    T = get_thresholds()
    
    # Convert to numpy array
    img_array = np.array(image)
    
    forgery_score = 0.0
    confidence = 0.4  # Start lower to reduce false positives
    reasons = []
    
    width, height = image.size
    
    # ===== SCREENSHOT DETECTION (Genuine Detection) - MORE LENIENT =====
    aspect_ratio = width / height if height > 0 else 1
    common_ratios = SCREENSHOT_FEATURES['common_aspect_ratios']
    tolerance = SCREENSHOT_FEATURES['ratio_tolerance'] * 1.5  # More lenient tolerance
    
    def matches_ratio(ratio: float, tol: float = tolerance) -> bool:
        return abs(aspect_ratio - ratio) < tol or abs((1 / aspect_ratio) - ratio) < tol
    
    is_common_ratio = any(matches_ratio(r) for r in common_ratios)
    # More lenient resolution check - many screenshots are smaller
    has_mobile_resolution = (min(width, height) >= 400 and max(width, height) >= 800)  # Lowered from 600/1200
    # Don't require divisible_by_10 - many screenshots don't meet this
    # Just check if dimensions are reasonable for screenshots
    reasonable_dimensions = width >= 300 and height >= 500
    
    # Screenshot if: common ratio OR (mobile resolution AND reasonable dimensions)
    is_typical_screenshot = is_common_ratio or (has_mobile_resolution and reasonable_dimensions)
    
    # Track strong forgery indicators (score additions >= 25)
    strong_indicators: List[str] = []
    
    # ===== FORENSICS ANALYSIS =====
    def filter_meaningful_indicators(indicators: List[str]) -> List[str]:
        """
        Remove benign indicator texts so we only react to true edit evidence.
        """
        benign_keywords = [
            "no editing indicators",
            "authentic screenshot",
            "transaction screenshot detected",
        ]
        filtered = []
        for text in indicators or []:
            lower_text = text.lower()
            if any(keyword in lower_text for keyword in benign_keywords):
                continue
            filtered.append(text)
        return filtered
    
    # 1. METADATA ANALYSIS - Less aggressive
    try:
        exif_data = image._getexif() if hasattr(image, '_getexif') else None
        if exif_data is None:
            if is_typical_screenshot:
                # Screenshots normally don't have EXIF - this is FINE
                forgery_score += 2
                reasons.append("No EXIF metadata (normal for screenshots)")
            else:
                # Non-screenshots missing EXIF is more suspicious
                forgery_score += T['missing_metadata_score']
                reasons.append("Missing EXIF metadata")
                if T['missing_metadata_score'] >= 20:
                    confidence += 0.10
                    strong_indicators.append("metadata_missing")
        else:
            # Check for editing software
            if 'Software' in exif_data:
                software = str(exif_data['Software']).lower()
                editing_software = ['photoshop', 'gimp', 'lightroom', 'pixlr', 'affinity']
                if any(sw in software for sw in editing_software):
                    forgery_score += 35
                    reasons.append(f"Editing software detected: {exif_data['Software']}")
                    confidence += 0.25
                    strong_indicators.append("editing_software")
    except Exception as e:
        logger.debug(f"Metadata analysis error: {e}")
        if not is_typical_screenshot:
            forgery_score += 5
            reasons.append("Unable to read metadata")
    
    # 2. COMPRESSION ARTIFACTS ANALYSIS - More forgiving
    if len(img_array.shape) == 3:
        block_size = 8
        if height >= block_size * 2 and width >= block_size * 2:
            block_variances = []
            for i in range(0, min(height - block_size, 64), block_size):
                for j in range(0, min(width - block_size, 64), block_size):
                    block = img_array[i:i+block_size, j:j+block_size]
                    block_variances.append(np.var(block))
            
            if len(block_variances) > 0:
                avg_block_var = np.mean(block_variances)
                # More forgiving threshold - only flag very suspicious patterns
                if avg_block_var < 30 and not is_typical_screenshot:  # Reduced from 50
                    forgery_score += 20
                    reasons.append("Suspicious compression patterns detected")
                    confidence += 0.12
                    strong_indicators.append("compression")
    
    # 3. NOISE INCONSISTENCY DETECTION - More forgiving thresholds
    if len(img_array.shape) == 3:
        regions_noise = []
        region_size = min(height, width) // 4
        
        if region_size > 10:
            for i in range(0, height - region_size, region_size):
                for j in range(0, width - region_size, region_size):
                    region = img_array[i:i+region_size, j:j+region_size]
                    regions_noise.append(np.std(region))
        
        if len(regions_noise) > 1:
            noise_std = np.std(regions_noise)
            
            # Use configurable thresholds
            if noise_std > T['noise_std_high']:
                forgery_score += 25
                reasons.append(f"Inconsistent noise levels (σ={noise_std:.1f})")
                confidence += 0.15
                strong_indicators.append("noise_high")
            elif noise_std > T['noise_std_moderate']:
                forgery_score += 12
                reasons.append("Moderate noise inconsistency")
                confidence += 0.08
    
    # 4. EDGE DETECTION ANOMALIES - More forgiving
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2).astype(np.uint8)
        
        if gray.shape[0] > 2 and gray.shape[1] > 2:
            grad_x = np.abs(np.diff(gray, axis=1))
            grad_y = np.abs(np.diff(gray, axis=0))
            
            sharp_edges_x = np.sum(grad_x > 100)
            sharp_edges_y = np.sum(grad_y > 100)
            total_pixels = gray.shape[0] * gray.shape[1]
            
            sharp_edge_ratio = (sharp_edges_x + sharp_edges_y) / total_pixels
            
            # Use configurable thresholds
            if sharp_edge_ratio > T['sharp_edge_high']:
                forgery_score += 30
                reasons.append(f"Unusual sharp edges ({sharp_edge_ratio*100:.1f}%)")
                confidence += 0.18
                strong_indicators.append("edges_high")
            elif sharp_edge_ratio > T['sharp_edge_moderate']:
                forgery_score += 15
                reasons.append("Moderate edge anomalies")
                confidence += 0.08
    
    # 5. STATISTICAL INCONSISTENCY - More forgiving
    if len(img_array.shape) == 3:
        std_val = np.std(img_array)
        
        # Use configurable threshold
        if std_val < T['low_variance_threshold']:
            forgery_score += 20
            reasons.append(f"Low variance (σ={std_val:.1f})")
            confidence += 0.12
            strong_indicators.append("low_variance")
    
    # 6. RESOLUTION CHECKS - Less aggressive
    if width < 150 or height < 150:  # Only flag very small images
        forgery_score += 20
        reasons.append("Very low resolution")
        confidence += 0.12
        strong_indicators.append("low_resolution")
    
    # ===== AUTHENTICITY ADJUSTMENT FOR SCREENSHOTS =====
    if is_typical_screenshot:
        adjustment = SCREENSHOT_FEATURES['authenticity_adjustment']
        if forgery_score > 0:
            forgery_score = max(0, forgery_score - adjustment)
            reasons.append(f"Native screenshot detected (-{adjustment} forgery score)")
        confidence = max(0.05, confidence - 0.10)
    
    # If genuine screenshot with no strong indicators, mark as clean
    authentic_screenshot = is_typical_screenshot and len(strong_indicators) == 0
    if authentic_screenshot:
        reasons.append("Authentic native screenshot - no manipulation detected")
        forgery_score = min(forgery_score, 8)
        confidence = min(confidence, 0.30)
    
    # ===== ENHANCED EDIT DETECTION (More Accurate) =====
    is_edited = False
    edit_confidence = 0.0
    edit_indicators = []
    edit_score = 0.0
    
    # Method 1: Error Level Analysis (ELA) - Use improved thresholds
    if CV2_AVAILABLE and len(img_array.shape) == 3:
        try:
            import cv2
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            
            temp_path = tempfile.mktemp(suffix='.jpg')
            cv2.imwrite(temp_path, gray, [cv2.IMWRITE_JPEG_QUALITY, 90])
            recompressed = cv2.imread(temp_path, cv2.IMREAD_GRAYSCALE)
            os.remove(temp_path)
            
            diff = np.abs(gray.astype(np.float32) - recompressed.astype(np.float32))
            ela_score = np.mean(diff)
            ela_std = np.std(diff)
            
            # Use configurable thresholds
            if ela_score > T['ela_high_threshold']:
                is_edited = True
                edit_score += 50
                edit_confidence = max(edit_confidence, 0.85)
                edit_indicators.append(f"High compression artifacts (ELA: {ela_score:.2f})")
            elif ela_score > T['ela_edited_threshold']:
                is_edited = True
                edit_score += 30
                edit_confidence = max(edit_confidence, 0.68)
                edit_indicators.append(f"Moderate compression artifacts (ELA: {ela_score:.2f})")
            
            # Inconsistent compression
            if ela_std > 12:  # Keep this threshold
                is_edited = True
                edit_score += 22
                edit_confidence = max(edit_confidence, 0.70)
                edit_indicators.append(f"Inconsistent compression (std: {ela_std:.2f})")
        except Exception as e:
            logger.debug(f"ELA analysis error: {e}")
    
    # Method 2: Frequency Domain Analysis - ALMOST IGNORE FOR SCREENSHOTS
    if len(img_array.shape) == 3:
        try:
            from numpy import fft
            gray = np.mean(img_array, axis=2)
            f_transform = fft.fft2(gray)
            f_shift = fft.fftshift(f_transform)
            magnitude_spectrum = np.abs(f_shift)
            
            freq_variance = np.var(magnitude_spectrum)
            freq_mean = np.mean(magnitude_spectrum)
            
            # Screenshots naturally contain lots of grid/UI elements, text, buttons, icons
            # These create frequency patterns that are COMPLETELY NORMAL for screenshots
            # We should ALMOST NEVER flag screenshots based on frequency patterns alone
            freq_ratio_threshold = T['frequency_variance_ratio']
            if is_typical_screenshot:
                # For screenshots, frequency patterns are NORMAL - only flag EXTREME cases
                # Use a VERY high threshold - essentially ignore frequency analysis for screenshots
                freq_ratio_threshold *= 15.0  # HUGE multiplier - screenshots have natural UI patterns
                # Only flag if variance is EXTREMELY EXTREMELY high (10x normal threshold)
                # This should almost never trigger for real screenshots
                extreme_threshold = freq_mean * freq_ratio_threshold * 3.0
                if freq_variance > extreme_threshold:
                    # Even then, use very low confidence and score
                    is_edited = True
                    edit_score += 5  # Very low score
                    edit_confidence = max(edit_confidence, 0.40)  # Very low confidence
                    edit_indicators.append("Extreme frequency patterns (rare - may be normal for complex UI)")
                    logger.warning(f"Frequency pattern flagged for screenshot (variance={freq_variance:.1f}, threshold={extreme_threshold:.1f})")
                else:
                    # Normal screenshot frequency patterns - ignore completely
                    logger.info(f"Screenshot frequency patterns are normal (variance={freq_variance:.1f}, mean={freq_mean:.1f}) - ignoring")
            else:
                # For non-screenshots, use normal threshold
                if freq_variance > freq_mean * freq_ratio_threshold:
                    is_edited = True
                    edit_score += 18
                    edit_confidence = max(edit_confidence, 0.62)
                    edit_indicators.append("Unnatural frequency domain patterns detected")
        except Exception as e:
            logger.debug(f"Frequency analysis error: {e}")
    
    # Method 3: High forgery score correlation - MUCH higher thresholds for screenshots
    high_forgery_threshold = 75 if is_typical_screenshot else 50  # Increased from 65
    moderate_forgery_threshold = 55 if is_typical_screenshot else 35  # Increased from 45
    
    if forgery_score >= high_forgery_threshold:
        is_edited = True
        edit_score += 20 if is_typical_screenshot else 30  # Reduced for screenshots
        edit_confidence = max(edit_confidence, 0.75 if is_typical_screenshot else 0.78)
        edit_indicators.append("High forgery score indicates manipulation")
    elif forgery_score >= moderate_forgery_threshold:
        is_edited = True
        edit_score += 8 if is_typical_screenshot else 15  # Reduced for screenshots
        edit_confidence = max(edit_confidence, 0.55 if is_typical_screenshot else 0.60)
        edit_indicators.append("Moderate forgery indicators detected")
    
    # Final determination with configurable thresholds
    if edit_score >= T['edit_score_high']:
        is_edited = True
        edit_confidence = min(0.96, 0.65 + (edit_score / 200))
    elif edit_score >= T['edit_score_moderate']:
        is_edited = True
        edit_confidence = min(0.88, 0.55 + (edit_score / 250))
    elif edit_score >= T['edit_score_low']:
        is_edited = True
        edit_confidence = min(0.75, 0.45 + (edit_score / 300))
    else:
        # Original image
        is_edited = False
        edit_confidence = max(0.70, 1.0 - (forgery_score / 250))
        if not edit_indicators:
            edit_indicators.append("No editing indicators detected - Image appears original")
    
    # Override for authentic screenshots - EXTREMELY AGGRESSIVE in recognizing genuine screenshots
    if authentic_screenshot:
        meaningful_edit_indicators = filter_meaningful_indicators(edit_indicators)
        # Require EXTREMELY STRONG evidence of editing before flagging authentic screenshots
        # For screenshots, we need MUCH MUCH higher edit scores to be confident it's edited
        screenshot_edit_threshold = T['edit_score_high'] * 1.8  # 80% higher threshold for screenshots (was 1.3)
        significant_edit_signal = (
            edit_score >= screenshot_edit_threshold or  # Require very very high edit score
            (edit_score >= T['edit_score_moderate'] * 1.5 and len(meaningful_edit_indicators) >= 5)  # Or high moderate + many strong indicators
        )
        
        if not significant_edit_signal:
            # Apply EXTREMELY generous reductions when only minor or no edit signals exist.
            edit_score = max(
                0,
                edit_score - GENUINE_SCREENSHOT_ADJUSTMENTS.get('edit_score_reduction', 0) * 2.0  # 100% more reduction (was 1.5)
            )
            forgery_score = min(forgery_score, 3)  # Even lower cap (was 5)
            confidence = min(confidence, 0.20)  # Even lower confidence (was 0.25)
            is_edited = False
            edit_confidence = 0.10  # Very very low confidence in edit detection (was 0.15)
            edit_indicators = ["Authentic screenshot - no editing detected"]
            logger.info("✅ Authentic screenshot detected - applying EXTREME authenticity boost")
        else:
            # Preserve detected edits but note why authenticity boost was blocked.
            reasons.append("Screenshot authenticity boost skipped due to extremely strong edit signals")
            edit_confidence = max(edit_confidence, 0.45)  # Lower confidence even when edits detected (was 0.50)
            logger.warning("⚠️ Authentic screenshot but extremely strong edit signals detected")
    
    # Additional check: If it looks like a screenshot but wasn't caught above, still be lenient
    if is_typical_screenshot and not authentic_screenshot:
        # It's a screenshot but has some indicators - still be more lenient
        if edit_score < T['edit_score_moderate']:
            # Low edit score - treat as authentic
            edit_score = max(0, edit_score - 20)  # Reduce edit score
            if edit_score < 15:
                is_edited = False
                edit_confidence = max(0.15, edit_confidence - 0.2)
                logger.info("✅ Screenshot with low edit indicators - treating as authentic")
    
    # CAP SCORES
    forgery_score = max(0, min(100, forgery_score))
    confidence = max(0.15, min(1.0, confidence))
    
    # DETERMINE VERDICT - Use configurable thresholds
    if forgery_score < T['forgery_clean_threshold']:
        verdict = "clean"
    elif forgery_score < T['forgery_suspicious_threshold']:
        verdict = "suspicious"
    else:
        verdict = "tampered"
    
    # Log results
    if reasons:
        logger.info(f"Forgery analysis: {verdict} (score: {forgery_score:.1f}, confidence: {confidence:.2f})")
        logger.info(f"Reasons: {', '.join(reasons[:3])}")
    
    if is_edited:
        logger.info(f"Edit detection: EDITED (confidence: {edit_confidence:.2f}, score: {edit_score:.1f})")
        logger.info(f"Indicators: {', '.join(edit_indicators[:2])}")
    else:
        logger.info(f"Edit detection: ORIGINAL (confidence: {edit_confidence:.2f})")
    
    return forgery_score, verdict, confidence, is_edited, edit_confidence, edit_indicators




