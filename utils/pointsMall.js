export const POINTS_PRODUCT_TYPE = Object.freeze({
  PHYSICAL: 1,
  COUPON: 2,
  BENEFIT: 3,
})

export const POINTS_FULFILLMENT_TYPE = Object.freeze({
  LOGISTICS: 1,
  AUTO_COUPON: 2,
  MANUAL: 3,
})

export const POINTS_ORDER_STATUS = Object.freeze({
  PENDING_FULFILLMENT: '1',
  SHIPPED: '2',
  COMPLETED: '3',
  CANCELED: '4',
})

export const POINTS_UNLIMITED_PER_MEMBER_LIMIT = 0

export const POINTS_EXCHANGE_MIN_QUANTITY = 1

export const POINTS_ORDER_STATUS_OPTIONS = [
  { value: POINTS_ORDER_STATUS.PENDING_FULFILLMENT, label: '待履约' },
  { value: POINTS_ORDER_STATUS.SHIPPED, label: '已发货' },
  { value: POINTS_ORDER_STATUS.COMPLETED, label: '已完成' },
  { value: POINTS_ORDER_STATUS.CANCELED, label: '已取消' },
]

export function getPointsFulfillmentText(value) {
  const text = {
    [POINTS_FULFILLMENT_TYPE.LOGISTICS]: '物流配送',
    [POINTS_FULFILLMENT_TYPE.AUTO_COUPON]: '自动发券',
    [POINTS_FULFILLMENT_TYPE.MANUAL]: '人工履约',
  }
  return text[value] || '-'
}

export function getPointsFulfillmentDescription(value) {
  const descriptions = {
    [POINTS_FULFILLMENT_TYPE.LOGISTICS]: '兑换后由平台安排物流发货，请填写收货地址。',
    [POINTS_FULFILLMENT_TYPE.AUTO_COUPON]: '兑换成功后优惠券自动发放至我的优惠券。',
    [POINTS_FULFILLMENT_TYPE.MANUAL]: '兑换成功后由平台人工处理，无需物流。',
  }
  return descriptions[value] || ''
}

export function getPointsOrderStatusText(value) {
  return POINTS_ORDER_STATUS_OPTIONS.find((item) => item.value === String(value))?.label || '-'
}

export function getPointsOrderStatusClass(value) {
  const classes = {
    [POINTS_ORDER_STATUS.PENDING_FULFILLMENT]: 'points-status-pending',
    [POINTS_ORDER_STATUS.SHIPPED]: 'points-status-shipped',
    [POINTS_ORDER_STATUS.COMPLETED]: 'points-status-completed',
    [POINTS_ORDER_STATUS.CANCELED]: 'points-status-canceled',
  }
  return classes[String(value)] || ''
}
