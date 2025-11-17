/**
 * Advanced Risk Analysis with ML-inspired algorithms
 */

/**
 * Analyze transaction velocity (frequency of transactions)
 * @param {array} recentTransactions - Recent user transactions
 * @returns {object} Velocity analysis
 */
export const analyzeTransactionVelocity = (recentTransactions) => {
  if (!recentTransactions || recentTransactions.length === 0) {
    return { riskScore: 0, reason: 'No transaction history' };
  }

  const now = new Date();
  const last24Hours = recentTransactions.filter(
    (t) => new Date(t.timestamp) > new Date(now - 24 * 60 * 60 * 1000)
  );
  const lastHour = recentTransactions.filter(
    (t) => new Date(t.timestamp) > new Date(now - 60 * 60 * 1000)
  );

  let riskScore = 0;
  const reasons = [];

  // High frequency in last hour
  if (lastHour.length > 5) {
    riskScore += 30;
    reasons.push(`${lastHour.length} transactions in last hour`);
  }

  // Very high frequency in 24 hours
  if (last24Hours.length > 20) {
    riskScore += 25;
    reasons.push(`${last24Hours.length} transactions in 24 hours`);
  }

  // Rapid succession
  if (last24Hours.length >= 2) {
    const timeDiffs = [];
    for (let i = 1; i < last24Hours.length; i++) {
      const diff =
        new Date(last24Hours[i].timestamp) -
        new Date(last24Hours[i - 1].timestamp);
      timeDiffs.push(diff / 1000 / 60); // Convert to minutes
    }
    const avgTimeBetween =
      timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    if (avgTimeBetween < 5) {
      riskScore += 20;
      reasons.push('Transactions too close together');
    }
  }

  return {
    riskScore: Math.min(riskScore, 100),
    reasons,
    velocityMetrics: {
      last24Hours: last24Hours.length,
      lastHour: lastHour.length,
    },
  };
};

/**
 * Geolocation-based risk analysis
 * @param {object} currentLocation - Current transaction location
 * @param {object} previousLocation - Previous transaction location
 * @param {number} timeDiffMinutes - Time difference in minutes
 * @returns {object} Geolocation analysis
 */
export const analyzeGeolocation = (currentLocation, previousLocation, timeDiffMinutes) => {
  if (!previousLocation || !currentLocation) {
    return { riskScore: 0, reason: 'No location history' };
  }

  // Calculate distance (simplified - using Haversine formula)
  const distance = calculateDistance(
    previousLocation.lat,
    previousLocation.lon,
    currentLocation.lat,
    currentLocation.lon
  );

  // Calculate required speed (km/h)
  const requiredSpeed = (distance / timeDiffMinutes) * 60;

  let riskScore = 0;
  const reasons = [];

  // Impossible travel speed (faster than airplane)
  if (requiredSpeed > 900) {
    riskScore += 50;
    reasons.push(`Impossible travel speed: ${requiredSpeed.toFixed(0)} km/h`);
  } else if (requiredSpeed > 200) {
    // Suspicious travel speed
    riskScore += 30;
    reasons.push(`Suspicious travel speed: ${requiredSpeed.toFixed(0)} km/h`);
  }

  // Different country
  if (currentLocation.country !== previousLocation.country) {
    riskScore += 20;
    reasons.push('Transaction from different country');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    reasons,
    geoMetrics: {
      distance: distance.toFixed(2),
      requiredSpeed: requiredSpeed.toFixed(2),
    },
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Device fingerprint analysis
 * @param {string} currentDeviceId - Current device ID
 * @param {array} knownDeviceIds - List of known user devices
 * @returns {object} Device analysis
 */
export const analyzeDeviceFingerprint = (currentDeviceId, knownDeviceIds) => {
  if (!knownDeviceIds || knownDeviceIds.length === 0) {
    return { riskScore: 10, reason: 'New device (first transaction)' };
  }

  const isKnownDevice = knownDeviceIds.includes(currentDeviceId);

  if (!isKnownDevice) {
    return {
      riskScore: 25,
      reason: 'Unknown device',
      isNewDevice: true,
    };
  }

  return {
    riskScore: 0,
    reason: 'Known device',
    isNewDevice: false,
  };
};

/**
 * Pattern-based anomaly detection
 * @param {object} currentTransaction - Current transaction
 * @param {array} historicalTransactions - Historical transactions
 * @returns {object} Anomaly analysis
 */
export const detectAnomalies = (currentTransaction, historicalTransactions) => {
  if (!historicalTransactions || historicalTransactions.length < 5) {
    return { riskScore: 0, reason: 'Insufficient history for pattern analysis' };
  }

  const amounts = historicalTransactions.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
    amounts.length
  );

  let riskScore = 0;
  const reasons = [];

  // Amount anomaly (Z-score)
  const zScore = Math.abs((currentTransaction.amount - mean) / stdDev);
  if (zScore > 3) {
    riskScore += 40;
    reasons.push(`Amount significantly different from user pattern (${zScore.toFixed(1)}σ)`);
  } else if (zScore > 2) {
    riskScore += 20;
    reasons.push(`Amount moderately different from pattern (${zScore.toFixed(1)}σ)`);
  }

  // Round number amounts (often used in fraud)
  if (currentTransaction.amount % 1000 === 0 && currentTransaction.amount > 1000) {
    riskScore += 15;
    reasons.push('Suspicious round number amount');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    reasons,
    patternMetrics: {
      meanAmount: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      zScore: zScore.toFixed(2),
    },
  };
};

/**
 * Comprehensive risk analysis
 * @param {object} transaction - Transaction to analyze
 * @param {object} context - Analysis context (history, location, device, etc.)
 * @returns {object} Complete risk analysis
 */
export const comprehensiveRiskAnalysis = (transaction, context) => {
  const velocityAnalysis = analyzeTransactionVelocity(context.recentTransactions || []);
  const deviceAnalysis = analyzeDeviceFingerprint(
    context.currentDeviceId,
    context.knownDeviceIds || []
  );
  const anomalyAnalysis = detectAnomalies(
    transaction,
    context.historicalTransactions || []
  );

  let geoAnalysis = { riskScore: 0, reasons: [] };
  if (context.currentLocation && context.previousLocation && context.timeDiffMinutes) {
    geoAnalysis = analyzeGeolocation(
      context.currentLocation,
      context.previousLocation,
      context.timeDiffMinutes
    );
  }

  // Weighted risk score
  const totalRiskScore =
    velocityAnalysis.riskScore * 0.25 +
    geoAnalysis.riskScore * 0.30 +
    deviceAnalysis.riskScore * 0.20 +
    anomalyAnalysis.riskScore * 0.25;

  const allReasons = [
    ...(velocityAnalysis.reasons || []),
    ...(geoAnalysis.reasons || []),
    ...(deviceAnalysis.reason ? [deviceAnalysis.reason] : []),
    ...(anomalyAnalysis.reasons || []),
  ];

  return {
    overallRiskScore: Math.round(totalRiskScore),
    riskLevel:
      totalRiskScore > 70
        ? 'HIGH'
        : totalRiskScore > 40
          ? 'MEDIUM'
          : 'LOW',
    factors: {
      velocity: velocityAnalysis,
      geolocation: geoAnalysis,
      device: deviceAnalysis,
      anomaly: anomalyAnalysis,
    },
    reasons: allReasons,
    recommendation:
      totalRiskScore > 70
        ? 'Block transaction and verify user identity'
        : totalRiskScore > 40
          ? 'Require additional verification (2FA/OTP)'
          : 'Proceed with transaction',
  };
};

export default {
  analyzeTransactionVelocity,
  analyzeGeolocation,
  analyzeDeviceFingerprint,
  detectAnomalies,
  comprehensiveRiskAnalysis,
};






