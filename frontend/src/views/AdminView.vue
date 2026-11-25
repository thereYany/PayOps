<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { auth, logout } from '../auth'

const router = useRouter()
const users = ref([])
const products = ref([])
const orders = ref([])
const editingId = ref(null)
const saving = ref(false)
const message = ref('')
const messageType = ref('success')
let messageTimer = null

const form = reactive({
  name: '',
  price: 1,
  tokenAmount: 1,
  enabled: true
})

function money(value) {
  return Number(value ?? 0).toFixed(2)
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-'
}

function roleLabel(role) {
  return role === 'ADMIN' ? '管理员' : '用户'
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

function resetForm() {
  editingId.value = null
  form.name = ''
  form.price = 1
  form.tokenAmount = 1
  form.enabled = true
}

function editProduct(product) {
  editingId.value = product.id
  form.name = product.name
  form.price = product.price
  form.tokenAmount = product.tokenAmount
  form.enabled = product.enabled
}

async function loadAll() {
  const [userList, productList, orderList] = await Promise.all([
    api('/admin/users'),
    api('/admin/products'),
    api('/admin/orders')
  ])
  users.value = userList
  products.value = productList
  orders.value = orderList
}

async function saveProduct() {
  const name = form.name.trim()
  if (!name) {
    showMessage('请输入套餐名称', 'error')
    return
  }
  if (!(Number(form.price) > 0) || !(Number(form.tokenAmount) > 0)) {
    showMessage('售价和 token 数量必须大于 0', 'error')
    return
  }

  saving.value = true
  try {
    const body = JSON.stringify({
      name,
      price: Number(form.price),
      tokenAmount: Number(form.tokenAmount),
      enabled: form.enabled
    })
    if (editingId.value) {
      await api(`/admin/products/${editingId.value}`, { method: 'PUT', body })
      showMessage('套餐已更新')
    } else {
      await api('/admin/products', { method: 'POST', body })
      showMessage('套餐已新增')
    }
    await loadAll()
    resetForm()
  } catch (exception) {
    showMessage(exception.message, 'error')
  } finally {
    saving.value = false
  }
}

async function toggleProduct(product) {
  try {
    await api(`/admin/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        tokenAmount: product.tokenAmount,
        enabled: !product.enabled
      })
    })
    await loadAll()
    showMessage(product.enabled ? '套餐已停用' : '套餐已上架')
  } catch (exception) {
    showMessage(exception.message, 'error')
  }
}

function handleLogout() {
  logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    await loadAll()
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
        <span class="topbar-title">管理后台</span>
      </div>

      <div class="topbar-right">
        <div class="user-chip">
          <span>{{ auth.user?.username }}</span>
          <span class="role-badge admin">管理员</span>
        </div>
        <button class="btn btn-ghost" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="page-head">
      <h1>运营与数据</h1>
      <p>维护 token 套餐，查看注册用户和全部购买订单。</p>
    </div>

    <div v-if="message" class="banner" :class="messageType">{{ message }}</div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">注册用户</div>
        <div class="stat-value">{{ users.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Token 套餐</div>
        <div class="stat-value blue">{{ products.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">购买订单</div>
        <div class="stat-value green">{{ orders.length }}</div>
      </div>
    </div>

    <div class="admin-grid">
      <section class="card form-card">
        <div class="card-header">
          <h2>{{ editingId ? '编辑套餐' : '新增套餐' }}</h2>
          <span class="muted">{{ editingId ? `ID ${editingId}` : '创建新的 token 套餐' }}</span>
        </div>

        <form @submit.prevent="saveProduct">
          <div class="field">
            <label>套餐名称</label>
            <input v-model.trim="form.name" placeholder="例如 10 元 token" />
          </div>

          <div class="form-row">
            <div class="field">
              <label>售价（元）</label>
              <input v-model.number="form.price" type="number" min="0.01" step="0.01" />
            </div>
            <div class="field">
              <label>到账 token</label>
              <input v-model.number="form.tokenAmount" type="number" min="0.01" step="0.01" />
            </div>
          </div>

          <label class="checkbox">
            <input v-model="form.enabled" type="checkbox" />
            上架，允许用户购买
          </label>

          <div class="form-actions">
            <button class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : editingId ? '保存修改' : '新增套餐' }}
            </button>
            <button v-if="editingId" type="button" class="btn btn-ghost" @click="resetForm">
              取消
            </button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="card-header">
          <h2>套餐列表</h2>
          <span class="muted">{{ products.length }} 个</span>
        </div>

        <div v-if="products.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>售价</th>
                <th>到账</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>{{ product.name }}</td>
                <td>¥{{ money(product.price) }}</td>
                <td>{{ money(product.tokenAmount) }} token</td>
                <td>
                  <span class="status" :class="product.enabled ? 'paid' : 'disabled'">
                    {{ product.enabled ? '上架' : '停用' }}
                  </span>
                </td>
                <td class="row-actions">
                  <button class="btn btn-ghost btn-sm" @click="editProduct(product)">编辑</button>
                  <button
                    class="btn btn-sm"
                    :class="product.enabled ? 'btn-danger' : 'btn-ghost'"
                    @click="toggleProduct(product)"
                  >
                    {{ product.enabled ? '停用' : '上架' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">还没有套餐</div>
      </section>
    </div>

    <section class="card">
      <div class="card-header">
        <h2>全部订单</h2>
        <span class="muted">{{ orders.length }} 条</span>
      </div>

      <div v-if="orders.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>套餐</th>
              <th>支付</th>
              <th>到账</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ formatTime(order.createdAt) }}</td>
              <td>{{ order.username }}</td>
              <td>{{ order.productName }}</td>
              <td>¥{{ money(order.price) }}</td>
              <td>{{ money(order.tokenAmount) }} token</td>
              <td><span class="status paid">已支付</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">还没有购买订单</div>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>用户列表</h2>
        <span class="muted">{{ users.length }} 人</span>
      </div>

      <div v-if="users.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>角色</th>
              <th>现金余额</th>
              <th>Token 余额</th>
              <th>注册时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>
                <span class="status" :class="user.role === 'ADMIN' ? 'admin' : 'paid'">
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td>¥{{ money(user.cnyBalance) }}</td>
              <td>{{ money(user.tokenBalance) }}</td>
              <td>{{ formatTime(user.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">还没有注册用户</div>
    </section>
  </div>
</template>
