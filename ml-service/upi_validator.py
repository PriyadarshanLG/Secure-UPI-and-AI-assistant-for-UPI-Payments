"""
UPI ID and Transaction Validation Module
"""

import re
import random
from datetime import datetime, timedelta

# Known fake/suspicious UPI IDs (blacklist)
BLACKLISTED_UPI_IDS = [
    'fake@upi', 'test@paytm', 'scam@phonepe', 'fraud@googlepay',
    '123456@paytm', 'tempupi@axis', 'dummy@upi'
]

# Valid UPI providers
VALID_UPI_PROVIDERS = [
    'paytm', 'phonepe', 'googlepay', 'axis', 'icici', 'hdfc', 'sbi',
    'ybl', 'oksbi', 'okhdfcbank', 'okicici', 'axisbank', 'ibl', 'airtel'
]


def validate_upi_id(upi_id: str) -> dict:
    """
    Validate UPI ID format and authenticity
    Returns: dict with validation results
    """
    if not upi_id:
        return {
            'valid': False,
            'reason': 'UPI ID is empty',
            'risk_score': 100
        }
    
    upi_id = upi_id.strip().lower()
    
    # Check blacklist
    if upi_id in BLACKLISTED_UPI_IDS:
        return {
            'valid': False,
            'reason': 'UPI ID is blacklisted (known fraud)',
            'risk_score': 100
        }
    
    # UPI ID format: username@provider
    upi_pattern = r'^[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{2,}$'
    
    if not re.match(upi_pattern, upi_id):
        return {
            'valid': False,
            'reason': 'Invalid UPI ID format',
            'risk_score': 90
        }
    
    # Extract provider
    parts = upi_id.split('@')
    if len(parts) != 2:
        return {
            'valid': False,
            'reason': 'UPI ID must contain exactly one @',
            'risk_score': 95
        }
    
    username, provider = parts
    
    # Check username length
    if len(username) < 3:
        return {
            'valid': False,
            'reason': 'UPI username too short (min 3 characters)',
            'risk_score': 80
        }
    
    if len(username) > 50:
        return {
            'valid': False,
            'reason': 'UPI username too long (max 50 characters)',
            'risk_score': 75
        }
    
    # Check provider validity
    if provider not in VALID_UPI_PROVIDERS:
        return {
            'valid': False,
            'reason': f'Unknown UPI provider: {provider}',
            'risk_score': 85
        }
    
    # Check for suspicious patterns
    risk_score = 0
    warnings = []
    
    # Numeric-only username
    if username.isdigit():
        risk_score += 30
        warnings.append('Username is all numbers (suspicious)')
    
    # Very simple username
    if len(username) <= 5 and username.isalnum():
        risk_score += 20
        warnings.append('Very simple username')
    
    # Sequential numbers
    if re.search(r'12345|23456|34567|111111|000000', username):
        risk_score += 40
        warnings.append('Sequential or repeated numbers detected')
    
    # Common fraud keywords - Only flag if keyword is the ENTIRE username or clearly fake
    # Don't flag if keyword is part of a longer legitimate username
    fraud_keywords = ['test', 'fake', 'temp', 'dummy']
    username_lower = username.lower()
    
    # Only flag if:
    # 1. Keyword is the entire username (e.g., "test@paytm")
    # 2. Keyword is followed by only numbers (e.g., "test123@paytm" - suspicious)
    # 3. Username starts with keyword and is very short (e.g., "test1@paytm")
    for keyword in fraud_keywords:
        if username_lower == keyword:
            # Entire username is a fraud keyword
            risk_score += 60
            warnings.append(f'Suspicious username: "{keyword}" is a known test keyword')
            break
        elif username_lower.startswith(keyword) and len(username) <= len(keyword) + 3:
            # Very short username starting with fraud keyword
            risk_score += 50
            warnings.append(f'Suspicious username pattern: "{keyword}" prefix with short username')
            break
        elif keyword in username_lower and len(username) <= 8:
            # Short username containing fraud keyword
            risk_score += 30
            warnings.append(f'Possible test username: contains "{keyword}"')
            break
    
    # Determine validity - More lenient threshold to reduce false positives
    is_valid = risk_score < 60
    
    return {
        'valid': is_valid,
        'upi_id': upi_id,
        'provider': provider,
        'risk_score': min(risk_score, 100),
        'warnings': warnings,
        'reason': warnings[0] if warnings and not is_valid else 'Valid format'
    }


def validate_transaction_id(txn_id: str) -> dict:
    """
    Validate transaction/UTR ID format
    Returns: dict with validation results
    """
    if not txn_id:
        return {
            'valid': False,
            'reason': 'Transaction ID is empty',
            'risk_score': 100
        }
    
    txn_id = txn_id.strip()
    
    risk_score = 0
    warnings = []
    
    # UPI transaction IDs are typically 12-16 digits
    if not txn_id.isdigit():
        risk_score += 40
        warnings.append('Transaction ID contains non-numeric characters')
    
    # Length check
    if len(txn_id) < 10:
        risk_score += 50
        warnings.append('Transaction ID too short (typical: 12+ digits)')
    elif len(txn_id) > 20:
        risk_score += 30
        warnings.append('Transaction ID too long')
    
    # Check for sequential/repeated patterns
    if re.search(r'(\d)\1{5,}', txn_id):
        risk_score += 60
        warnings.append('Repeated digit pattern detected')
    
    if re.search(r'123456|234567|345678|111111|000000', txn_id):
        risk_score += 50
        warnings.append('Sequential number pattern detected')
    
    # Very simple patterns
    if txn_id in ['0000000000', '1111111111', '1234567890']:
        risk_score += 100
        warnings.append('Obvious fake transaction ID')
    
    is_valid = risk_score < 50
    
    return {
        'valid': is_valid,
        'transaction_id': txn_id,
        'risk_score': min(risk_score, 100),
        'warnings': warnings,
        'reason': warnings[0] if warnings and not is_valid else 'Valid format'
    }


def validate_amount(amount: float, user_history: list = None) -> dict:
    """
    Validate transaction amount
    Returns: dict with validation results
    """
    risk_score = 0
    warnings = []
    
    # Negative or zero amount
    if amount <= 0:
        return {
            'valid': False,
            'amount': amount,
            'risk_score': 100,
            'reason': 'Invalid amount (must be positive)'
        }
    
    # Very large amounts (potential fraud)
    if amount > 100000:
        risk_score += 40
        warnings.append(f'Very large amount: ₹{amount:,.2f}')
    elif amount > 50000:
        risk_score += 20
        warnings.append(f'Large amount: ₹{amount:,.2f}')
    
    # Round amounts (often used in scams)
    if amount % 1000 == 0 and amount >= 1000:
        risk_score += 15
        warnings.append('Suspiciously round amount')
    
    # Check against user history if provided
    if user_history and len(user_history) > 3:
        avg_amount = sum(user_history) / len(user_history)
        if amount > avg_amount * 5:
            risk_score += 30
            warnings.append(f'Amount {int(amount/avg_amount)}x higher than usual')
    
    is_valid = risk_score < 60
    
    return {
        'valid': is_valid,
        'amount': amount,
        'risk_score': min(risk_score, 100),
        'warnings': warnings,
        'reason': warnings[0] if warnings and not is_valid else 'Valid amount'
    }


def validate_date(date_str: str) -> dict:
    """
    Validate transaction date
    Returns: dict with validation results
    """
    risk_score = 0
    warnings = []
    
    try:
        # Try to parse date (multiple formats)
        date_formats = [
            '%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d',
            '%d/%m/%Y %H:%M', '%d-%m-%Y %H:%M:%S'
        ]
        
        parsed_date = None
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str.split()[0], fmt.split()[0])
                break
            except:
                continue
        
        if not parsed_date:
            return {
                'valid': False,
                'risk_score': 50,
                'reason': 'Unable to parse date format'
            }
        
        # Check if date is in the future
        if parsed_date > datetime.now():
            risk_score += 100
            warnings.append('Transaction date is in the future!')
        
        # Check if date is too old (>1 year)
        if parsed_date < datetime.now() - timedelta(days=365):
            risk_score += 30
            warnings.append('Transaction is over 1 year old')
        
        # Check if date is very recent (within seconds - might be faked)
        if abs((datetime.now() - parsed_date).total_seconds()) < 60:
            risk_score += 20
            warnings.append('Transaction timestamp is very recent')
        
        is_valid = risk_score < 70
        
        return {
            'valid': is_valid,
            'date': parsed_date.isoformat(),
            'risk_score': min(risk_score, 100),
            'warnings': warnings,
            'reason': warnings[0] if warnings and not is_valid else 'Valid date'
        }
    
    except Exception as e:
        return {
            'valid': False,
            'risk_score': 60,
            'reason': f'Date validation error: {str(e)}'
        }


def comprehensive_transaction_validation(transaction_data: dict) -> dict:
    """
    Comprehensive validation of all transaction details
    Returns: overall validation result
    """
    results = {
        'overall_valid': True,
        'overall_risk_score': 0,
        'fraud_detected': False,
        'validations': {},
        'warnings': [],
        'fraud_indicators': []
    }
    
    # Validate UPI ID
    if 'upi_id' in transaction_data and transaction_data['upi_id']:
        upi_result = validate_upi_id(transaction_data['upi_id'])
        results['validations']['upi_id'] = upi_result
        results['overall_risk_score'] += upi_result['risk_score'] * 0.3
        
        if not upi_result['valid']:
            results['overall_valid'] = False
            results['fraud_indicators'].append(f"Invalid UPI ID: {upi_result['reason']}")
    
    # Validate Transaction ID
    if 'transaction_id' in transaction_data and transaction_data['transaction_id']:
        txn_result = validate_transaction_id(transaction_data['transaction_id'])
        results['validations']['transaction_id'] = txn_result
        results['overall_risk_score'] += txn_result['risk_score'] * 0.25
        
        if not txn_result['valid']:
            results['overall_valid'] = False
            results['fraud_indicators'].append(f"Invalid Transaction ID: {txn_result['reason']}")
    
    # Validate Amount
    if 'amount' in transaction_data and transaction_data['amount']:
        amount_result = validate_amount(transaction_data['amount'])
        results['validations']['amount'] = amount_result
        results['overall_risk_score'] += amount_result['risk_score'] * 0.25
        
        if not amount_result['valid']:
            results['overall_valid'] = False
            results['fraud_indicators'].append(f"Suspicious amount: {amount_result['reason']}")
    
    # Validate Date
    if 'date' in transaction_data and transaction_data['date']:
        date_result = validate_date(transaction_data['date'])
        results['validations']['date'] = date_result
        results['overall_risk_score'] += date_result['risk_score'] * 0.2
        
        if not date_result['valid']:
            results['warnings'].append(f"Date issue: {date_result['reason']}")
    
    # Cap risk score
    results['overall_risk_score'] = min(results['overall_risk_score'], 100)
    
    # Determine if fraud detected - IMPROVED LOGIC
    # Flag as fraud if:
    # 1. Risk score is very high (>= 60)
    # 2. OR multiple invalid fields with moderate risk (>= 50)
    # 3. OR UPI ID is blacklisted/invalid (definitive fraud)
    upi_invalid = False
    if 'upi_id' in results['validations']:
        upi_invalid = not results['validations']['upi_id'].get('valid', True) or results['validations']['upi_id'].get('risk_score', 0) >= 70
    
    results['fraud_detected'] = (
        results['overall_risk_score'] >= 60 or 
        (not results['overall_valid'] and results['overall_risk_score'] >= 50) or
        upi_invalid
    )
    
    # Set verdict - IMPROVED DETECTION LOGIC
    if results['fraud_detected']:
        results['verdict'] = 'FRAUD_DETECTED'
        results['recommendation'] = '🚨 BLOCK TRANSACTION - Fraud indicators detected!'
    elif results['overall_risk_score'] >= 30:
        results['verdict'] = 'SUSPICIOUS'
        results['recommendation'] = '⚠️ REQUIRE ADDITIONAL VERIFICATION - Suspicious patterns detected'
    elif results['overall_risk_score'] >= 15:
        results['verdict'] = 'REVIEW_REQUIRED'
        results['recommendation'] = '⚠️ Review recommended - Some unusual patterns detected'
    else:
        results['verdict'] = 'LEGITIMATE'
        results['recommendation'] = '✅ Transaction appears legitimate'
    
    return results


