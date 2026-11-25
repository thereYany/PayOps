<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { auth, logout, refreshMe } from '../auth'

const router = useRouter()
const products = ref([])
const orders = ref([])
const buyingId = ref(null)
const message = ref('')
const messageType = ref('success')
let messageTimer = null

function money(value) {
  return Number(value ?? 0).toFixed(2)
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-'
}

function canBuy(product) {
  return Number(auth.user?.cnyBalance ?? 0) >= Number(product.price)
}

function showMessage(text, type = 'success') {
  message.value = text
  messageType.value = type
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
  messageTimer = setTimeout(() => {
    message.value = ''
  }, 4000)
}

async function loadProducts() {
  products.value = await api('/products')
}

async function loadOrders() {
  orders.value = await api('/orders/my')
}

async function buy(product) {
  buyingId.value = product.id
  try {
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id })
    })
    await Promise.all([refreshMe(), loadOrders()])
    showMessage(`已购买 ${product.name}，token 已到账。`)
  } catch (exception) {
    showMessage(exception.message, 'error')
  } finally {
    buyingId.value = null
  }
}

function handleLogout() {
  logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), loadOrders()])
  } catch (exception) {
    showMessage(exception.message, 'error')
  }
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand">
          <div class="brand-mark">P</div>
          <span>PayOps</span>
        </div>
        <span class="divider"></span>
        <span class="topbar-title">用户商城</span>
      </div>

      <div class="topbar-right">
        <div class="user-chip">
          <span>{{ auth.user?.username }}</span>
          <span class="role-badge">用户</span>
        </div>
        <div class="balance-pill">现金 <strong>¥{{ money(auth.user?.cnyBalance) }}</strong></div>
        <div class="balance-pill">Token <strong>{{ money(auth.user?.tokenBalance) }}</strong></div>
        <button class="btn btn-ghost" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="page-head">
      <h1>选择你的 token 套餐</h1>
      <p>注册赠送的 ¥10.00 已到账。购买后余额立即扣减，token 立即到账。</p>
    </div>

    <div v-if="message" class="banner" :class="messageType">{{ message }}</div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">现金余额</div>
        <div class="stat-value blue">¥{{ money(auth.user?.cnyBalance) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Token 余额</div>
        <div class="stat-value green">{{ money(auth.user?.tokenBalance) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">我的订单</div>
        <div class="stat-value">{{ orders.length }}</div>
      </div>
    </div>

    <div v-if="products.length" class="product-grid">
      <article v-for="product in products" :key="product.id" class="product-card">
        <div>
          <div class="product-token">{{ money(product.tokenAmount) }}<span>token</span></div>
          <div class="product-name">{{ product.name }}</div>
        </div>
        <div class="product-price">支付 <strong>¥{{ money(product.price) }}</strong></div>
        <button
          class="btn btn-primary"
          :disabled="buyingId === product.id || !canBuy(product)"
          @click="buy(product)"
        >
          {{ buyingId === product.id ? '购买中...' : canBuy(product) ? '立即购买' : '余额不足' }}
        </button>
      </article>
    </div>
    <div v-else class="card empty">暂无上架套餐</div>

    <section class="card">
      <div class="card-header">
        <h2>我的订单</h2>
        <span class="muted">最近订单</span>
      </div>

      <div v-if="orders.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>套餐</th>
              <th>支付</th>
              <th>到账</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ formatTime(order.createdAt) }}</td>
              <td>{{ order.productName }}</td>
              <td>¥{{ money(order.price) }}</td>
              <td>{{ money(order.tokenAmount) }} token</td>
              <td><span class="status paid">已支付</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">还没有订单，先买一个 token 套餐。</div>
    </section>
  </div>
</template>
