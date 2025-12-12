'use strict';

const { Op } = require('sequelize');
const { Order, OrderItem, Product, sequelize } = require('../models');
const { getStrategy } = require('./paymentStrategies');

const ORDER_RELATIONS = [
  {
    model: OrderItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product'
      }
    ]
  }
];

class ServiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ServiceError';
    this.type = options.type || 'SERVICE_ERROR';
    this.field = options.field;
    this.status = options.status;
    this.providerResponse = options.providerResponse || null;
  }
}

class OrderService {
  constructor({ sequelizeInstance, models, paymentStrategyFactory }) {
    this.sequelize = sequelizeInstance;
    this.Order = models.Order;
    this.OrderItem = models.OrderItem;
    this.Product = models.Product;
    this.paymentStrategyFactory = paymentStrategyFactory;
  }

  aggregateItems(rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ServiceError('Debe proporcionar al menos un item para crear la orden.', { type: 'VALIDATION', field: 'items' });
    }

    const aggregated = new Map();

    for (const item of rawItems) {
      const productId = Number(item && item.productId);
      const quantity = Number(item && item.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new ServiceError('productId inválido en uno de los items.', { type: 'VALIDATION', field: 'items' });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ServiceError('quantity debe ser un entero mayor a cero.', { type: 'VALIDATION', field: 'items' });
      }

      const current = aggregated.get(productId) || 0;
      aggregated.set(productId, current + quantity);
    }

    return Array.from(aggregated.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }

  async createOrder({ userId, items, paymentMethod, paymentDetails }) {
    if (!paymentMethod) {
      throw new ServiceError('paymentMethod es requerido', { type: 'VALIDATION', field: 'paymentMethod' });
    }

    if (!paymentDetails || typeof paymentDetails !== 'object') {
      throw new ServiceError('paymentDetails es requerido y debe ser un objeto', { type: 'VALIDATION', field: 'paymentDetails' });
    }

    const aggregatedItems = this.aggregateItems(items);

    const orderId = await this.sequelize.transaction(async (transaction) => {
      const productIds = aggregatedItems.map(({ productId }) => productId);

      const products = await this.Product.findAll({
        where: { id: { [Op.in]: productIds } },
        transaction
      });

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const missing = productIds.find((id) => !foundIds.has(id));
        throw new ServiceError(`Producto ${missing} no existe`, { type: 'VALIDATION', field: 'items' });
      }

      const productsById = new Map(products.map((product) => [product.id, product]));

      let totalAmount = 0;
      for (const item of aggregatedItems) {
        const product = productsById.get(item.productId);
        const currentStock = Number(product.stock);
        if (currentStock < item.quantity) {
          throw new ServiceError(`Stock insuficiente para el producto ${product.name}`, { type: 'VALIDATION', field: 'items' });
        }

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;
      }

      const roundedTotal = Math.round(totalAmount * 100) / 100;

      const strategy = this.paymentStrategyFactory(paymentMethod);
      if (!strategy) {
        throw new ServiceError(`Método de pago no soportado: ${paymentMethod}`, { type: 'VALIDATION', field: 'paymentMethod' });
      }

      try {
        await strategy.processPayment({
          amount: roundedTotal,
          currency: paymentDetails.currency || 'USD',
          paymentDetails,
          paymentMethod
        });
      } catch (paymentError) {
        if (paymentError.isPaymentError) {
          throw new ServiceError(paymentError.message || 'Error procesando el pago', {
            type: 'PAYMENT',
            status: paymentError.httpStatus || 402,
            providerResponse: paymentError.providerResponse || null
          });
        }
        throw paymentError;
      }

      for (const { productId, quantity } of aggregatedItems) {
        const product = productsById.get(productId);
        product.stock = Number(product.stock) - quantity;
        await product.save({ transaction });
      }

      const order = await this.Order.create({
        userId,
        status: this.Order.STATUSES.COMPLETED,
        totalAmount: roundedTotal
      }, { transaction });

      const itemsPayload = aggregatedItems.map(({ productId, quantity }) => ({
        orderId: order.id,
        productId,
        quantity,
        unitPrice: productsById.get(productId).price
      }));

      await this.OrderItem.bulkCreate(itemsPayload, { validate: true, transaction });

      return order.id;
    });

    return this.getOrderById({ userId, orderId: orderId, includeRelations: true });
  }

  async getOrders({ userId, page = 1, limit = 10 }) {
    const effectivePage = Math.max(Number(page) || 1, 1);
    const effectiveLimit = Math.max(Number(limit) || 10, 1);
    const offset = (effectivePage - 1) * effectiveLimit;

    const { rows, count } = await this.Order.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: effectiveLimit,
      offset,
      include: ORDER_RELATIONS
    });

    const meta = {
      total: count,
      page: effectivePage,
      limit: effectiveLimit,
      totalPages: Math.max(Math.ceil(count / effectiveLimit), 1)
    };

    return { orders: rows, meta };
  }

  async getOrderById({ userId, orderId, includeRelations = true }) {
    return this.Order.findOne({
      where: {
        id: orderId,
        userId
      },
      include: includeRelations ? ORDER_RELATIONS : undefined
    });
  }
}

const orderService = new OrderService({
  sequelizeInstance: sequelize,
  models: { Order, OrderItem, Product },
  paymentStrategyFactory: getStrategy
});

module.exports = {
  orderService,
  ServiceError
};
