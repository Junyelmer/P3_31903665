'use strict';

const axios = require('axios');
const BasePaymentStrategy = require('./basePaymentStrategy');

const PAYMENT_ENDPOINT = 'https://fakepayment.onrender.com/payments';

class CreditCardPaymentStrategy extends BasePaymentStrategy {
  async processPayment({ amount, currency, paymentDetails }) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('El monto del pago debe ser un número positivo');
    }

    const effectiveCurrency = currency || 'USD';
    if (!paymentDetails || typeof paymentDetails !== 'object') {
      throw new Error('paymentDetails es requerido para el método CreditCard');
    }

    const {
      cardNumber,
      cvv,
      expirationMonth,
      expirationYear,
      fullName,
      description,
      reference
    } = paymentDetails;

    const missingField = [
      ['cardNumber', cardNumber],
      ['cvv', cvv],
      ['expirationMonth', expirationMonth],
      ['expirationYear', expirationYear],
      ['fullName', fullName]
    ].find(([, value]) => !value);

    if (missingField) {
      throw new Error(`paymentDetails.${missingField[0]} es requerido para pagos con tarjeta`);
    }

    const bearerToken = process.env.FAKE_PAYMENT_TOKEN;
    if (!bearerToken) {
      throw new Error('FAKE_PAYMENT_TOKEN no está configurado en las variables de entorno');
    }

    const payload = {
      amount: amount.toFixed(2),
      'card-number': cardNumber,
      cvv,
      'expiration-month': expirationMonth,
      'expiration-year': expirationYear,
      'full-name': fullName,
      currency: effectiveCurrency,
      description: description || 'Order payment',
      reference: reference || `order-${Date.now()}`
    };

    try {
      const response = await axios.post(PAYMENT_ENDPOINT, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`
        }
      });
      return response.data;
    } catch (axiosError) {
      const providerResponse = axiosError.response ? axiosError.response.data : null;
      const message = providerResponse && providerResponse.message
        ? providerResponse.message
        : (axiosError.message || 'La pasarela de pago rechazó la transacción');
      const error = new Error(message);
      error.isPaymentError = true;
      error.providerResponse = providerResponse;
      error.httpStatus = axiosError.response ? axiosError.response.status : undefined;
      throw error;
    }
  }
}

module.exports = CreditCardPaymentStrategy;
