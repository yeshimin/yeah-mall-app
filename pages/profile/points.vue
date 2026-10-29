<template>
  <view class="points-page">
    <view v-if="pageLoading" class="page-state">积分信息加载中...</view>
    <view v-else-if="pageError" class="page-state">
      <text>{{ pageError }}</text>
      <button class="retry-btn" @click="reloadPage">重新加载</button>
    </view>
    <template v-else>
    <view class="balance-card">
      <text class="balance-label">可用积分</text>
      <text class="balance-value">{{ overview.balance }}</text>
      <view class="summary-row">
        <view><text>累计获得</text><text class="summary-value">{{ overview.totalEarned }}</text></view>
        <view><text>累计使用</text><text class="summary-value">{{ overview.totalUsed }}</text></view>
      </view>
    </view>

    <view class="mall-entry" @click="openPointsMall">
      <view>
        <text class="mall-eyebrow">POINTS MARKET</text>
        <text class="mall-title">去积分商城逛逛</text>
        <text class="mall-copy">好物、优惠券与会员权益</text>
      </view>
      <text class="mall-arrow">›</text>
    </view>

    <view class="section">
      <text class="section-title">积分明细</text>
      <view v-if="ledger.length" class="ledger-list">
        <view v-for="item in ledger" :key="item.id" class="ledger-item">
          <view class="ledger-main">
            <text class="ledger-desc">{{ item.description }}</text>
            <text class="ledger-time">{{ item.createTime }}</text>
          </view>
          <view class="ledger-value">
            <text :class="item.changePoints >= 0 ? 'plus' : 'minus'">{{ item.changePoints >= 0 ? '+' : '' }}{{ item.changePoints }}</text>
            <text class="ledger-balance">余额 {{ item.balanceAfter }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty">暂无积分明细</view>
      <button v-if="hasMore" class="more-btn" :loading="loading" @click="loadMore">加载更多</button>
    </view>

    <view class="section rules-section">
      <text class="section-title">积分规则</text>
      <view v-for="rule in rules" :key="rule.name" class="rule-item">
        <text>{{ rule.name }}</text>
        <text>{{ rule.description }}</text>
      </view>
    </view>
    </template>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchPointsLedger, fetchPointsOverview, fetchPointsRules } from '@/utils/api.js'

const overview = reactive({ balance: 0, totalEarned: 0, totalUsed: 0 })
const ledger = ref([])
const rules = ref([])
const current = ref(1)
const loading = ref(false)
const hasMore = ref(false)
const pageLoading = ref(true)
const pageError = ref('')

async function loadPage() {
  const [overviewData, ruleData] = await Promise.all([fetchPointsOverview(), fetchPointsRules()])
  Object.assign(overview, overviewData || {})
  rules.value = ruleData || []
  await loadLedger(true)
}

async function loadLedger(reset = false) {
  if (loading.value) return
  if (reset) {
    current.value = 1
    ledger.value = []
  }
  loading.value = true
  try {
    const data = await fetchPointsLedger({ current: current.value, size: 10 })
    const records = data?.records || []
    ledger.value = [...ledger.value, ...records]
    hasMore.value = Number(data?.current || current.value) < Number(data?.pages || 0)
    if (hasMore.value) current.value += 1
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadLedger()
}

function openPointsMall() {
  uni.navigateTo({ url: '/pages/points-mall/list' })
}

async function reloadPage() {
  pageLoading.value = true
  pageError.value = ''
  try {
    await loadPage()
  } catch (error) {
    pageError.value = error?.message || '积分信息加载失败，请稍后重试'
  } finally {
    pageLoading.value = false
  }
}

onLoad(reloadPage)
</script>

<style scoped>
.points-page { min-height: 100vh; padding: 24rpx; background: var(--ym-paper); box-sizing: border-box; }
.page-state { display: flex; min-height: 50vh; align-items: center; justify-content: center; flex-direction: column; gap: 24rpx; color: var(--ym-muted); font-size: 26rpx; text-align: center; }
.retry-btn { padding: 0 34rpx; color: #fff; background: var(--ym-brand); font-size: 24rpx; }
.retry-btn::after { border: 0; }
.balance-card { padding: 42rpx 36rpx 30rpx; color: #fff; border-radius: var(--ym-radius-card); background: linear-gradient(135deg, var(--ym-ink), var(--ym-brand)); box-shadow: var(--ym-shadow-card); }
.balance-label { display: block; font-size: 26rpx; opacity: .85; }
.balance-value { display: block; margin: 10rpx 0 34rpx; font-size: 72rpx; font-weight: 700; }
.summary-row { display: flex; gap: 60rpx; }
.summary-row view { display: flex; flex-direction: column; gap: 8rpx; font-size: 24rpx; }
.summary-value { font-size: 30rpx; font-weight: 700; }
.section { margin-top: 24rpx; padding: 28rpx; border: 1rpx solid var(--ym-line); border-radius: var(--ym-radius-card); background: var(--ym-surface); }
.section-title { display: block; margin-bottom: 18rpx; color: var(--ym-ink); font-size: 30rpx; font-weight: 700; }
.ledger-item { display: flex; justify-content: space-between; align-items: center; padding: 22rpx 0; border-bottom: 1rpx solid var(--ym-line); }
.ledger-item:last-child { border-bottom: 0; }
.ledger-main, .ledger-value { display: flex; flex-direction: column; gap: 8rpx; }
.ledger-desc { color: var(--ym-ink); font-size: 27rpx; }
.ledger-time, .ledger-balance { color: var(--ym-muted); font-size: 22rpx; }
.ledger-value { text-align: right; }
.ledger-value > text { font-size: 30rpx; font-weight: 700; }
.plus { color: var(--ym-price); }.minus { color: var(--ym-brand); }
.empty { padding: 60rpx 0; color: var(--ym-muted); text-align: center; }
.more-btn { margin-top: 20rpx; color: var(--ym-brand); background: var(--ym-brand-soft); font-size: 24rpx; }
.more-btn::after { border: 0; }
.rule-item { display: flex; flex-direction: column; gap: 8rpx; padding: 18rpx 0; border-bottom: 1rpx solid var(--ym-line); }
.rule-item:last-child { border-bottom: 0; }
.rule-item text:first-child { color: var(--ym-ink); font-size: 27rpx; font-weight: 600; }
.rule-item text:last-child { color: var(--ym-muted); font-size: 24rpx; line-height: 1.5; }
.mall-entry { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; padding: 28rpx 30rpx; color: #fff; border-radius: var(--ym-radius-card); background: linear-gradient(130deg, var(--ym-ink), var(--ym-brand)); box-shadow: var(--ym-shadow-card); }
.mall-entry text { display: block; }.mall-eyebrow { font-size: 17rpx; letter-spacing: 4rpx; opacity: .6; }.mall-title { margin-top: 6rpx; font-size: 30rpx; font-weight: 700; }.mall-copy { margin-top: 7rpx; font-size: 21rpx; opacity: .75; }.mall-arrow { font-size: 52rpx; opacity: .8; }
</style>
