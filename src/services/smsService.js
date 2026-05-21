// src/services/smsService.js
import axios from 'axios';
import logger from '../utils/logger';
import { retryAsync } from '../utils/retry';
import { buildMessage, validateMessage } from './dltValidator';

const BASE_URL = 'http://login.aquasms.com/sendSMS';

export default class SMSService {
  constructor() {
    this.username = process.env.REACT_APP_AQUASMS_USERNAME || 'Joel';
    this.apikey = process.env.REACT_APP_AQUASMS_APIKEY || '591c111b-338b-434b-94c7-95d982024edf';
    this.sendername = process.env.REACT_APP_AQUASMS_SENDERNAME || 'TRINKT';
    this.smstype = process.env.REACT_APP_AQUASMS_SMSTYPE || 'TRANS';
  }

  /**
   * Send OTP via AquaSMS GET request.
   * Returns { msgid, otp } on success.
   */
  async sendOtp(mobile, otp, minutes = 5) {
    // 1. Validate AquaSMS API parameters
    if (!this.username) throw new Error('Missing parameter: username');
    if (!this.apikey) throw new Error('Missing parameter: apikey');
    if (!this.sendername || this.sendername !== 'TRINKT') throw new Error('Invalid sendername (must be TRINKT)');
    if (!this.smstype || this.smstype !== 'TRANS') throw new Error('Invalid smstype (must be TRANS)');

    // 2. Ensure mobile number has country code, no "+" symbol, no spaces (e.g. 919886311108)
    const cleanMobile = mobile.replace(/[+\s]/g, '');
    const mobilePattern = /^[0-9]{10,15}$/;
    if (!mobilePattern.test(cleanMobile)) {
      throw new Error(`Invalid mobile number format: "${mobile}". Must include country code, contain no '+' or spaces, and be 10-15 digits.`);
    }

    // 3. Build & validate message matches DLT exactly
    const message = buildMessage(otp, minutes);
    if (!validateMessage(message, otp, minutes)) {
      throw new Error('DLT template mismatch');
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `${BASE_URL}?username=${this.username}&apikey=${this.apikey}&sendername=${this.sendername}&smstype=${this.smstype}&numbers=${cleanMobile}&message=${encodedMessage}`;

    // Debug logs
    console.log("Generated OTP:", otp);
    console.log("SMS Message:", message);
    console.log("Encoded Message:", encodedMessage);
    console.log("Final API URL:", url);

    const fetchFn = async () => {
      try {
        const response = await axios.get(url);
        
        // Debug logs as requested
        console.log("response", response);
        console.log("response.data", response.data);
        console.log("response.status", response.status);
        console.log("typeof response.data", typeof response.data);

        const responseData = response.data;
        let status = null;
        let msgid = null;
        let errCode = null;

        // Handle array response, object response, string, or unexpected formats safely
        if (Array.isArray(responseData)) {
          const firstObj = responseData[0] || {};
          status = firstObj.status;
          msgid = firstObj.msgid;
          errCode = firstObj.err_code;
        } else if (typeof responseData === 'object' && responseData !== null) {
          status = responseData.status;
          msgid = responseData.msgid;
          errCode = responseData.err_code;
        } else if (typeof responseData === 'string') {
          try {
            const parsed = JSON.parse(responseData);
            if (Array.isArray(parsed)) {
              const firstObj = parsed[0] || {};
              status = firstObj.status;
              msgid = firstObj.msgid;
              errCode = firstObj.err_code;
            } else if (typeof parsed === 'object' && parsed !== null) {
              status = parsed.status;
              msgid = parsed.msgid;
              errCode = parsed.err_code;
            }
          } catch (e) {
            // Handle plain text response
            const lowerData = responseData.toLowerCase();
            if (lowerData.includes('success')) {
              status = 'success';
            } else {
              status = 'error';
              errCode = responseData.trim();
            }
          }
        }

        // Validate success status
        if (status !== 'success') {
          const finalErrCode = errCode || status || 'unknown';
          const mappedMsg = SMSService.mapErrorCode(finalErrCode);
          const apiErr = new Error(`AquaSMS Gateway Error: ${mappedMsg} (code: ${finalErrCode})`);
          apiErr.code = finalErrCode;
          throw apiErr;
        }

        return { msgid, status };

      } catch (error) {
        // Detailed Axios error logging
        console.error("error.message", error.message);
        if (error.response) {
          console.error("error.response", error.response);
          console.error("error.response.data", error.response.data);
          console.error("error.response.status", error.response.status);
        }
        throw error;
      }
    };

    let result;
    try {
      result = await retryAsync(fetchFn, 3, 200);
    } catch (err) {
      const apiErr = new Error(err.message || 'AquaSMS failed');
      apiErr.code = err.code || 500;
      throw apiErr;
    }

    return { msgid: result.msgid, otp };
  }

  /**
   * Map AquaSMS error codes to user‑friendly messages.
   */
  static mapErrorCode(code) {
    const map = {
      101: 'Missing parameters',
      102: 'Invalid authentication',
      103: 'Insufficient balance',
      104: 'Invalid mobile number',
      105: 'Unapproved sender ID',
      106: 'DLT template mismatch',
      429: 'Too many requests',
      500: 'Internal gateway/carrier error',
    };
    return map[code] || `Unknown error: ${code}`;
  }
}
