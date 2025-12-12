'use strict';

const { getStrategy } = require('./paymentStrategies');

const selectStrategy = (paymentMethod) => {
  if (!paymentMethod) {
    throw new Error('paymentMethod es requerido');
  }

  const strategy = getStrategy(paymentMethod);

  if (!strategy) {
    const error = new Error(`Método de pago no soportado: ${paymentMethod}`);
    error.isUnsupportedPayment = true;
    throw error;
  }

  return strategy;
};

module.exports = { selectStrategy };
