#!/usr/bin/env node

/**
 * Test script to verify server can start
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 ECOMMIND Server Test\n')

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found')
  process.exit(1)
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...')
  const install = spawn('npm', ['install'], { stdio: 'inherit' })
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed')
      startServer()
    } else {
      console.error('❌ Failed to install dependencies')
      process.exit(1)
    }
  })
} else {
  console.log('✅ Dependencies found')
  startServer()
}

function startServer() {
  console.log('🔄 Starting Next.js server...')
  
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' }
  })
  
  let serverReady = false
  
  server.stdout.on('data', (data) => {
    const output = data.toString()
    console.log(output)
    
    if (output.includes('Ready') || output.includes('localhost:3000')) {
      serverReady = true
      console.log('\n🎉 Server is ready!')
      console.log('📱 Test URLs:')
      console.log('   - Onboarding: http://localhost:3000/onboarding')
      console.log('   - Bling Config: http://localhost:3000/dashboard/configuracoes/bling')
      console.log('   - API Test: http://localhost:3000/api-test')
      console.log('\n⚡ Press Ctrl+C to stop the server')
    }
  })
  
  server.stderr.on('data', (data) => {
    const error = data.toString()
    console.error('❌ Error:', error)
    
    if (error.includes('EADDRINUSE')) {
      console.log('💡 Port 3000 is already in use. Try:')
      console.log('   - Kill existing process: lsof -ti:3000 | xargs kill')
      console.log('   - Or use different port: npm run dev -- -p 3001')
    }
  })
  
  server.on('close', (code) => {
    if (code !== 0 && !serverReady) {
      console.error(`❌ Server failed to start (exit code: ${code})`)
      
      console.log('\n🔧 Troubleshooting:')
      console.log('1. Check if port 3000 is available')
      console.log('2. Verify all dependencies are installed')
      console.log('3. Check for TypeScript errors')
      console.log('4. Ensure .env.local is configured')
      
      process.exit(1)
    }
  })
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...')
    server.kill('SIGINT')
    process.exit(0)
  })
}
