'use strict';
const { Model } = require('sequelize');

const ORDER_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
};

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
      Order.belongsToMany(models.Product, {
        through: models.OrderItem,
        foreignKey: 'orderId',
        otherKey: 'productId',
        as: 'products'
      });
    }

    static get STATUSES() {
      return ORDER_STATUSES;
    }

    async recalculateTotal(options = {}) {
      const transaction = options.transaction;
      const items = await this.getItems({ transaction });
      const total = items.reduce((acc, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return acc + quantity * unitPrice;
      }, 0);
      const roundedTotal = Math.round(total * 100) / 100;
      this.totalAmount = roundedTotal;
      if (this.changed('totalAmount')) {
        await this.save({ transaction, hooks: false });
      }
      return this.totalAmount;
    }
  }

  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ORDER_STATUSES.PENDING,
      validate: {
        isIn: [Object.values(ORDER_STATUSES)]
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Order'
  });

  Order.addHook('beforeValidate', (order) => {
    if (!order.status) {
      order.status = ORDER_STATUSES.PENDING;
    }
  });

  return Order;
};
