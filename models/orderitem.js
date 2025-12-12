'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  OrderItem.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderItem'
  });

  const ensureUnitPrice = async (orderItem, options) => {
    const shouldSetPrice = orderItem.unitPrice === undefined || orderItem.unitPrice === null;
    const productChanged = orderItem.changed && orderItem.changed('productId');
    if ((!shouldSetPrice && !productChanged) || !orderItem.productId) {
      return;
    }

    const transaction = options ? options.transaction : undefined;
    const Product = orderItem.sequelize.models.Product;
    const product = await Product.findByPk(orderItem.productId, { transaction });

    if (product) {
      orderItem.unitPrice = product.price;
    }
  };

  const recalculateOrderTotal = async (orderItem, options) => {
    if (!orderItem || !orderItem.orderId) {
      return;
    }

    const transaction = options ? options.transaction : undefined;
    const order = await orderItem.getOrder({ transaction });
    if (order && order.recalculateTotal) {
      await order.recalculateTotal({ transaction });
    }
  };

  OrderItem.addHook('beforeValidate', ensureUnitPrice);
  OrderItem.addHook('afterCreate', recalculateOrderTotal);
  OrderItem.addHook('afterUpdate', recalculateOrderTotal);
  OrderItem.addHook('afterDestroy', recalculateOrderTotal);

  return OrderItem;
};
