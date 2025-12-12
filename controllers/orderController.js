'use strict';

const { success, fail, error } = require('../utils/jsend');
const { orderService, ServiceError } = require('../services/orderService');

const buildValidationResponse = (err) => {
  const payload = { message: err.message };
  if (err.field) {
    payload.field = err.field;
  }
  if (err.providerResponse) {
    payload.provider = err.providerResponse;
  }
  return payload;
};

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder({
      userId: req.userId,
      items: req.body ? req.body.items : undefined,
      paymentMethod: req.body ? req.body.paymentMethod : undefined,
      paymentDetails: req.body ? req.body.paymentDetails : undefined
    });

    return res.status(201).json(success(order));
  } catch (err) {
    if (err instanceof ServiceError) {
      if (err.type === 'VALIDATION') {
        return res.status(400).json(fail(buildValidationResponse(err)));
      }
      if (err.type === 'PAYMENT') {
        return res.status(err.status || 402).json(fail(buildValidationResponse(err)));
      }
    }

    return res.status(500).json(error(err.message));
  }
};

exports.getOrders = async (req, res) => {
  try {
    const page = req.query ? req.query.page : undefined;
    const limit = req.query ? req.query.limit : undefined;

    const result = await orderService.getOrders({
      userId: req.userId,
      page,
      limit
    });

    return res.status(200).json(success(result));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById({
      userId: req.userId,
      orderId: req.params.id
    });

    if (!order) {
      return res.status(404).json(fail({ message: 'Orden no encontrada' }));
    }

    return res.status(200).json(success(order));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};
