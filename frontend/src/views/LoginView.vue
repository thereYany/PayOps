<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { homeFor, login } from '../auth'

const router = useRouter()
const mode = ref('login')
const loading = ref(false)
const error = ref('')
const notice = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

function switchMode(next) {
  mode.value = next
  error.value = ''
  notice.value = ''
  form.password = ''
  form.confirmPassword = ''
}

async function submit() {
  error.value = ''
  notice.value = ''

  const username = form.username.trim()
  if (username.length < 3 || username.length > 32) {
    error.value = '用户名长度需要 3 到 32 个字符'
    return
  }
  if (form.password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  if (mode.value === 'register' && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    if (mode.value === 'register') {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password: form.password })
      })
      mode.value = 'login'
      form.password = ''
      form.confirmPassword = ''
      notice.value = '注册成功，已送 ¥10.00，请登录。'
    } else {
      const user = await login(username, form.password, form.rememberMe)
      router.push(homeFor(user.role))
    }
  } catch (exception) {
    error.value = exception.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-hero">
      <div class="brand brand-on-dark">
        <div class="brand-mark">P</div>
        <span>PayOps</span>
      </div>

      <div class="hero-copy">
        <h1>把虚拟支付和订单系统跑起来。</h1>
        <p>
          注册即送 ¥10.00，选择 token 套餐，余额实时扣减，订单和 token 到账一目了然。
        </p>
        <div class="hero-list">
          <div class="hero-item"><span class="hero-dot"></span>JWT 登录与“记住我”</div>
          <div class="hero-item"><span class="hero-dot"></span>用户商城与管理员后台</div>
          <div class="hero-item"><span class="hero-dot"></span>余额、token、订单完整闭环</div>
        </div>
      </div>

      <div class="hero-foot">PayOps · 粗糙版</div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <div class="auth-card-head">
          <div class="brand">
            <div class="brand-mark">P</div>
            <span>PayOps</span>
          </div>
          <h2>{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h2>
          <p>{{ mode === 'login' ? '登录后继续购买 token 套餐。' : '注册成功即送 ¥10.00 余额。' }}</p>
        </div>

        <div class="tabs">
          <button type="button" class="tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">
            登录
          </button>
          <button type="button" class="tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">
            注册
          </button>
        </div>

        <form @submit.prevent="submit">
          <div v-if="error" class="banner error">{{ error }}</div>
          <div v-if="notice" class="banner success">{{ notice }}</div>

          <div class="field">
            <label>用户名</label>
            <input
              v-model.trim="form.username"
              autocomplete="username"
              placeholder="3-32 个字符"
            />
          </div>

          <div class="field">
            <label>密码</label>
            <input
              v-model="form.password"
              type="password"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              placeholder="至少 6 位"
            />
          </div>

          <div v-if="mode === 'register'" class="field">
            <label>确认密码</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="再次输入密码"
            />
          </div>

          <label v-if="mode === 'login'" class="checkbox">
            <input v-model="form.rememberMe" type="checkbox" />
            记住我（7 天免登录）
          </label>

          <button class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '处理中...' : mode === 'login' ? '登录' : '注册' }}
          </button>
        </form>

        <div class="auth-foot">
          <span v-if="mode === 'login'">
            还没有账号？
            <button type="button" class="link-btn" @click="switchMode('register')">注册一个</button>
          </span>
          <span v-else>
            已有账号？
            <button type="button" class="link-btn" @click="switchMode('login')">去登录</button>
          </span>
        </div>

        <div class="demo-hint">本地管理员：admin / admin123</div>
      </div>
    </section>
  </div>
</template>
