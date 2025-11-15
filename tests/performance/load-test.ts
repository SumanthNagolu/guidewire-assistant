import { check, sleep } from 'k6'
import http from 'k6/http'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const apiLatency = new Trend('api_latency')
const pageLoadTime = new Trend('page_load_time')

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
    api_latency: ['p(95)<300'],       // API latency below 300ms for 95%
    page_load_time: ['p(95)<2000'],   // Page load below 2s for 95%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Helper function to get auth token
function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  })

  return loginRes.json('token')
}

export function setup() {
  // Setup code - create test data if needed
  return {
    token: getAuthToken(),
  }
}

export default function (data: { token: string }) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  }

  // Test 1: Load dashboard
  const dashboardStart = Date.now()
  const dashboardRes = http.get(`${BASE_URL}/api/learning/dashboard`, { headers })
  pageLoadTime.add(Date.now() - dashboardStart)
  
  check(dashboardRes, {
    'dashboard loaded': (r) => r.status === 200,
    'has stats': (r) => r.json('stats') !== null,
  }) || errorRate.add(1)

  sleep(1)

  // Test 2: Fetch topics
  const topicsStart = Date.now()
  const topicsRes = http.get(`${BASE_URL}/api/learning/topics?productId=policycenter`, { headers })
  apiLatency.add(Date.now() - topicsStart)
  
  check(topicsRes, {
    'topics loaded': (r) => r.status === 200,
    'has topics': (r) => r.json('length') > 0,
  }) || errorRate.add(1)

  sleep(2)

  // Test 3: Start a topic
  const startTopicRes = http.post(
    `${BASE_URL}/api/learning/topics/start`,
    JSON.stringify({ topicId: 'test-topic-1' }),
    { headers }
  )
  
  check(startTopicRes, {
    'topic started': (r) => r.status === 200 || r.status === 409, // 409 if already started
  }) || errorRate.add(1)

  sleep(1)

  // Test 4: Complete a learning block
  const completeBlockStart = Date.now()
  const completeBlockRes = http.post(
    `${BASE_URL}/api/learning/blocks/complete`,
    JSON.stringify({
      blockId: 'test-block-1',
      timeSpent: 300,
    }),
    { headers }
  )
  apiLatency.add(Date.now() - completeBlockStart)
  
  check(completeBlockRes, {
    'block completed': (r) => r.status === 200,
    'xp awarded': (r) => r.json('xpAwarded') > 0,
  }) || errorRate.add(1)

  sleep(2)

  // Test 5: AI Mentor chat
  const aiChatStart = Date.now()
  const aiChatRes = http.post(
    `${BASE_URL}/api/ai/mentor/chat`,
    JSON.stringify({
      message: 'How do I configure a custom field?',
      sessionId: 'test-session',
    }),
    { headers }
  )
  apiLatency.add(Date.now() - aiChatStart)
  
  check(aiChatRes, {
    'ai response received': (r) => r.status === 200,
    'has response': (r) => r.json('response') !== null,
  }) || errorRate.add(1)

  sleep(3)

  // Test 6: Get achievements
  const achievementsRes = http.get(`${BASE_URL}/api/gamification/achievements`, { headers })
  
  check(achievementsRes, {
    'achievements loaded': (r) => r.status === 200,
    'has achievements': (r) => r.json('length') >= 0,
  }) || errorRate.add(1)

  sleep(1)

  // Test 7: Get leaderboard
  const leaderboardRes = http.get(`${BASE_URL}/api/gamification/leaderboard?timeframe=weekly`, { headers })
  
  check(leaderboardRes, {
    'leaderboard loaded': (r) => r.status === 200,
    'has entries': (r) => r.json('entries') !== null,
  }) || errorRate.add(1)

  sleep(2)
}

export function teardown(data: any) {
  // Cleanup code if needed
  console.log('Load test completed')
}


