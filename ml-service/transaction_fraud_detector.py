"""
Transaction Fraud Detector - Focus on Transaction Data, Not Image Quality
This module prioritizes transaction validation over image forensics
"""

import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class TransactionFraudDetector:
    """
    Smart fraud detector that focuses on TRANSACTION DATA
    Image editing is secondary - transaction patterns are primary
    """
    
    def __init__(self):
        # Fake UPI patterns
        self.fake_upi_keywords = [
            'test', 'demo', 'fake', 'dummy', 'sample', 'example',
            '123456', '111111', '000000', 'abc', 'xyz', 'qwerty',
            'admin', 'user', 'temp', 'trial', 'mock'
        ]
        
        # Suspicious UPI providers (known for testing)
        self.suspicious_providers = []  # Keep empty to avoid false positives
        
        # Known legitimate providers
        self.legitimate_providers = [
            'paytm', 'phonepe', 'googlepay', 'gpay', 'bhim',
            'amazonpay', 'mobikwik', 'freecharge', 'ybl',
            'icici', 'sbi', 'hdfc', 'axis', 'kotak', 'pnb'
        ]
    
    def analyze_transaction(self, transaction_data: Dict) -> Dict:
        """
        Analyze transaction data for fraud indicators
        Returns fraud detection results with clear verdict
        """
        upi_id = transaction_data.get('upiId', '').lower().strip()
        amount = transaction_data.get('amount', '')
        reference = transaction_data.get('referenceId', '').strip()
        
        fraud_score = 0
        fraud_indicators = []
        is_fraud = False
        confidence = 0.0
        
        # ===== UPI ID VALIDATION (Primary Check) =====
        upi_fraud_score, upi_indicators = self._validate_upi_id(upi_id)
        fraud_score += upi_fraud_score
        fraud_indicators.extend(upi_indicators)
        
        # ===== TRANSACTION REFERENCE VALIDATION (Primary Check) =====
        ref_fraud_score, ref_indicators = self._validate_reference(reference)
        fraud_score += ref_fraud_score
        fraud_indicators.extend(ref_indicators)
        
        # ===== AMOUNT VALIDATION (Secondary Check) =====
        amount_fraud_score, amount_indicators = self._validate_amount(amount)
        fraud_score += amount_fraud_score
        fraud_indicators.extend(amount_indicators)
        
        # ===== DETERMINE FRAUD VERDICT =====
        # This is the KEY LOGIC - transaction data is primary
        if fraud_score >= 60:
            is_fraud = True
            confidence = min(0.95, 0.70 + (fraud_score / 200))
            verdict = "FRAUD_DETECTED"
        elif fraud_score >= 35:
            is_fraud = True
            confidence = min(0.85, 0.60 + (fraud_score / 250))
            verdict = "HIGHLY_SUSPICIOUS"
        elif fraud_score >= 20:
            is_fraud = True
            confidence = min(0.70, 0.50 + (fraud_score / 300))
            verdict = "SUSPICIOUS"
        else:
            is_fraud = False
            confidence = max(0.80, 1.0 - (fraud_score / 100))
            verdict = "LEGITIMATE"
        
        # Log results
        if is_fraud:
            logger.warning(f"🚨 FRAUD DETECTED - Score: {fraud_score}, Confidence: {confidence:.2%}")
            logger.warning(f"   Indicators: {', '.join(fraud_indicators[:3])}")
        else:
            logger.info(f"✅ LEGITIMATE TRANSACTION - Score: {fraud_score}, Confidence: {confidence:.2%}")
        
        return {
            'is_fraud': is_fraud,
            'fraud_score': min(100, fraud_score),
            'confidence': confidence,
            'verdict': verdict,
            'fraud_indicators': fraud_indicators,
            'validation_details': {
                'upi_id_valid': upi_fraud_score < 30,
                'reference_valid': ref_fraud_score < 30,
                'amount_valid': amount_fraud_score < 20,
            }
        }
    
    def _validate_upi_id(self, upi_id: str) -> Tuple[int, List[str]]:
        """Validate UPI ID - PRIMARY FRAUD INDICATOR"""
        score = 0
        indicators = []
        
        if not upi_id:
            score += 40
            indicators.append("Missing UPI ID - Cannot verify transaction")
            return score, indicators
        
        # Check for fake keywords (STRONG INDICATOR)
        for keyword in self.fake_upi_keywords:
            if keyword in upi_id:
                score += 70  # Very high score for obvious fakes
                indicators.append(f"Fake UPI ID detected: Contains '{keyword}'")
                logger.warning(f"🚨 FAKE UPI ID: {upi_id} contains '{keyword}'")
                return score, indicators  # Return immediately - this is definitive
        
        # Check format (should be username@provider)
        if '@' not in upi_id:
            score += 50
            indicators.append("Invalid UPI ID format - Missing '@' separator")
            return score, indicators
        
        # Split username and provider
        try:
            username, provider = upi_id.split('@', 1)
            
            # Check username
            if len(username) < 3:
                score += 30
                indicators.append("Suspicious UPI ID - Username too short")
            
            # Check for repeated characters in username (111111, aaaaaa)
            if len(set(username)) <= 2 and len(username) >= 4:
                score += 60
                indicators.append(f"Fake UPI ID pattern - Repeated characters: {username}")
            
            # Check for sequential numbers (123456, 012345)
            if username.isdigit() and self._is_sequential(username):
                score += 60
                indicators.append(f"Fake UPI ID pattern - Sequential numbers: {username}")
            
            # Check provider
            provider_lower = provider.lower()
            
            # Check if legitimate provider
            if any(legit in provider_lower for legit in self.legitimate_providers):
                # Legitimate provider - reduce score if we added any
                if score > 0 and score < 30:
                    score = max(0, score - 15)
                    indicators.append(f"Legitimate UPI provider detected: {provider}")
            else:
                # Unknown provider - slight suspicion
                if not any(fake in provider_lower for fake in self.fake_upi_keywords):
                    score += 10
                    indicators.append(f"Unknown UPI provider: {provider}")
        
        except Exception as e:
            score += 40
            indicators.append("Unable to parse UPI ID format")
            logger.error(f"UPI parsing error: {e}")
        
        return score, indicators
    
    def _validate_reference(self, reference: str) -> Tuple[int, List[str]]:
        """Validate transaction reference - PRIMARY FRAUD INDICATOR"""
        score = 0
        indicators = []
        
        if not reference:
            score += 30
            indicators.append("Missing transaction reference")
            return score, indicators
        
        # Remove spaces and special characters
        clean_ref = ''.join(c for c in reference if c.isdigit())
        
        if not clean_ref:
            score += 40
            indicators.append("Invalid transaction reference - No digits found")
            return score, indicators
        
        # Check length (should be 12 digits for UPI)
        if len(clean_ref) < 10:
            score += 50
            indicators.append(f"Invalid reference length: {len(clean_ref)} digits (expected 12)")
        elif len(clean_ref) > 14:
            score += 30
            indicators.append(f"Suspicious reference length: {len(clean_ref)} digits")
        
        # Check for repeated digits (STRONG INDICATOR)
        if len(set(clean_ref)) <= 2:
            score += 80  # Very high - obviously fake
            indicators.append(f"FAKE reference - Repeated digits: {clean_ref}")
            logger.warning(f"🚨 FAKE REFERENCE: {clean_ref} (repeated pattern)")
            return score, indicators
        
        # Check for sequential digits (STRONG INDICATOR)
        if self._is_sequential(clean_ref):
            score += 80  # Very high - obviously fake
            indicators.append(f"FAKE reference - Sequential pattern: {clean_ref}")
            logger.warning(f"🚨 FAKE REFERENCE: {clean_ref} (sequential pattern)")
            return score, indicators
        
        # Check for alternating patterns (121212, 010101)
        if self._is_alternating(clean_ref):
            score += 70
            indicators.append(f"FAKE reference - Alternating pattern: {clean_ref}")
        
        return score, indicators
    
    def _validate_amount(self, amount) -> Tuple[int, List[str]]:
        """Validate transaction amount - SECONDARY INDICATOR"""
        score = 0
        indicators = []
        
        try:
            # Convert to float
            if isinstance(amount, str):
                amount_value = float(amount.replace(',', '').replace('₹', '').strip())
            else:
                amount_value = float(amount)
            
            # Check for suspicious amounts
            if amount_value == 0:
                score += 50
                indicators.append("Zero amount transaction - Suspicious")
            elif amount_value < 0:
                score += 60
                indicators.append("Negative amount - Invalid transaction")
            elif amount_value >= 100000:
                # Very high amount - just flag, don't add too much score
                score += 15
                indicators.append(f"High amount transaction: ₹{amount_value:,.2f}")
            
            # Check for suspiciously round amounts (50000, 100000, 99999)
            if amount_value >= 50000:
                if amount_value % 10000 == 0:
                    score += 20
                    indicators.append(f"Suspicious round amount: ₹{amount_value:,.0f}")
                elif amount_value in [99999, 99990, 88888, 77777]:
                    score += 30
                    indicators.append(f"Suspicious pattern amount: ₹{amount_value:,.0f}")
        
        except (ValueError, AttributeError) as e:
            score += 25
            indicators.append("Invalid amount format")
            logger.debug(f"Amount validation error: {e}")
        
        return score, indicators
    
    def _is_sequential(self, s: str) -> bool:
        """Check if string contains sequential digits"""
        if len(s) < 4:
            return False
        
        # Check ascending (01234, 12345)
        for i in range(len(s) - 3):
            try:
                if (int(s[i+1]) == int(s[i]) + 1 and
                    int(s[i+2]) == int(s[i]) + 2 and
                    int(s[i+3]) == int(s[i]) + 3):
                    return True
            except ValueError:
                continue
        
        # Check descending (54321, 98765)
        for i in range(len(s) - 3):
            try:
                if (int(s[i+1]) == int(s[i]) - 1 and
                    int(s[i+2]) == int(s[i]) - 2 and
                    int(s[i+3]) == int(s[i]) - 3):
                    return True
            except ValueError:
                continue
        
        return False
    
    def _is_alternating(self, s: str) -> bool:
        """Check if string has alternating pattern (121212, 010101)"""
        if len(s) < 6:
            return False
        
        # Check if pattern repeats (e.g., 121212)
        pattern_len = 2
        pattern = s[:pattern_len]
        expected = pattern * (len(s) // pattern_len + 1)
        return s in expected[:len(s)]


# ===== COMBINED FRAUD DETECTION =====

def detect_fraud_comprehensive(transaction_data: Dict, image_analysis: Dict = None) -> Dict:
    """
    Comprehensive fraud detection that PRIORITIZES transaction data
    
    Logic:
    1. Transaction data is PRIMARY indicator (70% weight)
    2. Image forensics is SECONDARY indicator (30% weight)
    3. Genuine screenshot + Fake transaction = FRAUD
    4. Edited screenshot + Real transaction = SUSPICIOUS (not definitive fraud)
    """
    
    detector = TransactionFraudDetector()
    
    # Analyze transaction data (PRIMARY)
    transaction_result = detector.analyze_transaction(transaction_data)
    
    # Get image analysis (SECONDARY)
    image_edited = False
    image_confidence = 0.0
    if image_analysis:
        image_edited = image_analysis.get('is_edited', False)
        image_confidence = image_analysis.get('edit_confidence', 0.0)
    
    # ===== DECISION LOGIC =====
    # Transaction data is 70% of decision, image is 30%
    
    transaction_fraud = transaction_result['is_fraud']
    transaction_score = transaction_result['fraud_score']
    transaction_confidence = transaction_result['confidence']
    
    # Weighted scoring
    final_fraud_score = (transaction_score * 0.70) + (image_confidence * 100 * 0.30 if image_edited else 0)
    
    # Determine final verdict
    if transaction_fraud:
        # Transaction data indicates fraud - THIS IS DEFINITIVE
        final_verdict = "FRAUD_DETECTED"
        final_confidence = transaction_confidence
        is_fraud = True
        primary_reason = "Transaction data indicates fraud"
    elif transaction_score >= 20:
        # Some suspicious indicators in transaction
        final_verdict = "SUSPICIOUS"
        final_confidence = min(0.75, transaction_confidence)
        is_fraud = False
        primary_reason = "Some suspicious transaction patterns detected"
    elif image_edited and image_confidence > 0.85:
        # High confidence image editing but transaction looks okay
        final_verdict = "IMAGE_EDITED"
        final_confidence = 0.60  # Lower confidence - not definitive fraud
        is_fraud = False
        primary_reason = "Image appears edited but transaction data looks legitimate"
    else:
        # Everything looks okay
        final_verdict = "LEGITIMATE"
        final_confidence = max(0.85, transaction_confidence)
        is_fraud = False
        primary_reason = "Transaction data and image both appear legitimate"
    
    # Compile indicators
    all_indicators = transaction_result['fraud_indicators'].copy()
    if image_edited:
        all_indicators.insert(0, f"Image appears edited (confidence: {image_confidence:.0%})")
    
    logger.info(f"Final verdict: {final_verdict} (Transaction: {transaction_fraud}, Image edited: {image_edited})")
    
    return {
        'is_fraud': is_fraud,
        'fraud_detected': transaction_fraud,  # Based on transaction data
        'verdict': final_verdict,
        'confidence': final_confidence,
        'fraud_score': min(100, final_fraud_score),
        'fraud_indicators': all_indicators,
        'primary_reason': primary_reason,
        'details': {
            'transaction_analysis': transaction_result,
            'image_edited': image_edited,
            'image_edit_confidence': image_confidence,
        }
    }




