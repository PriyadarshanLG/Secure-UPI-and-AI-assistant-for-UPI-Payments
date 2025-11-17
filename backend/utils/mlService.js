import axios from 'axios';
import logger from './logger.js';
import { readFileSync } from 'fs';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
// Enable ML service by default (for hackathon demo)
const ML_SERVICE_ENABLED = process.env.ML_SERVICE_ENABLED !== 'false';

/**
 * Analyze image for forgery and extract OCR text
 * @param {string} filePath - Path to the image file
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeImage = async (filePathOrData) => {
  // Handle both string (filePath) and object (with manualData)
  let filePath, manualData, manualOnly;
  
  if (typeof filePathOrData === 'string') {
    filePath = filePathOrData;
  } else {
    filePath = filePathOrData.filePath;
    manualData = filePathOrData.manualData;
    manualOnly = filePathOrData.manualOnly;
  }

  // Manual-only mode: validate transaction data without image
  if (manualOnly && manualData) {
    logger.info('Manual-only mode: Validating transaction data without image');
    
    if (!ML_SERVICE_ENABLED) {
      // Return simple validation results
      return {
        ocrText: `Manual Validation:\nUPI: ${manualData.upiId || 'N/A'}\nAmount: ₹${manualData.amount || 'N/A'}\nReference: ${manualData.referenceId || 'N/A'}`,
        forgeryScore: 0,
        verdict: 'manual',
        confidence: 1.0,
        transactionValidation: { verdict: 'REQUIRES_REVIEW' },
        extractedData: manualData,
        fraudDetected: false,
        fraudIndicators: [],
      };
    }

    try {
      // Call ML service with manual data only (no image)
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/forensics/validate`,
        { manualData },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      return {
        ocrText: response.data.ocrText || 'Manual validation',
        forgeryScore: 0,
        verdict: 'manual',
        confidence: 1.0,
        transactionValidation: response.data.transactionValidation || {},
        extractedData: response.data.extractedData || manualData,
        fraudDetected: response.data.fraudDetected || false,
        fraudIndicators: response.data.fraudIndicators || [],
      };
    } catch (error) {
      logger.error('ML service manual validation error:', error.message);
      // Return basic validation on error
      return {
        ocrText: `Manual Validation:\nUPI: ${manualData.upiId || 'N/A'}\nAmount: ₹${manualData.amount || 'N/A'}\nReference: ${manualData.referenceId || 'N/A'}`,
        forgeryScore: 0,
        verdict: 'manual',
        confidence: 1.0,
        transactionValidation: { verdict: 'ERROR' },
        extractedData: manualData,
        fraudDetected: false,
        fraudIndicators: ['ML service unavailable'],
      };
    }
  }

  if (!ML_SERVICE_ENABLED) {
    // Return stub/mock results if ML service is disabled
    logger.info('ML service disabled, returning stub results');
    return {
      ocrText: 'Mock OCR text: Transaction screenshot detected',
      forgeryScore: Math.floor(Math.random() * 30), // Random low score for mock
      verdict: 'clean',
      confidence: 0.85,
    };
  }

  try {
    // Read file and convert to base64
    const imageBuffer = readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    // Prepare request payload
    const payload = {
      image: base64Image,
      format: 'base64',
    };

    // Add manual data if provided
    if (manualData) {
      payload.manualData = manualData;
      logger.info('Sending manual data to ML service');
    }

    // Call ML service
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/forensics/analyze`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return {
      ocrText: response.data.ocrText || '',
      forgeryScore: response.data.forgeryScore || 0,
      verdict: response.data.verdict || 'unknown',
      confidence: response.data.confidence || 0.5,
      transactionValidation: response.data.transactionValidation || {},
      extractedData: response.data.extractedData || {},
      fraudDetected: response.data.fraudDetected || false,
      fraudIndicators: response.data.fraudIndicators || [],
      isEdited: response.data.isEdited || false,
      editConfidence: response.data.editConfidence || 0.0,
      editIndicators: response.data.editIndicators || [],
    };
  } catch (error) {
    logger.error('ML service error:', error.message);
    
    // Return fallback results on error
    return {
      ocrText: 'OCR analysis failed',
      forgeryScore: 50, // Medium risk on error
      verdict: 'unknown',
      confidence: 0.3,
      error: error.message,
    };
  }
};


