'use strict';

class BasePaymentStrategy {
  async processPayment() {
    throw new Error('processPayment() debe ser implementado por la estrategia concreta');
  }
}

module.exports = BasePaymentStrategy;
