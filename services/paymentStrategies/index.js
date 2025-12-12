'use strict';

const CreditCardPaymentStrategy = require('./creditCardStrategy');

const STRATEGY_REGISTRY = {
  CreditCard: () => new CreditCardPaymentStrategy()
};

const getStrategy = (paymentMethod) => {
  const factory = STRATEGY_REGISTRY[paymentMethod];
  if (!factory) {
    return null;
  }
  return factory();
};

module.exports = { getStrategy };
