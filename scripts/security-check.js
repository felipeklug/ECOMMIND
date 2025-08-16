#!/usr/bin/env node

/**
 * ECOMMIND Security Validation Script
 * Validates security configurations and environment setup
 */

const fs = require('fs')
const path = require('path')

console.log('🔒 ECOMMIND Security Validation\n')

let errors = 0
let warnings = 0

function error(message) {
  console.log(`❌ ERROR: ${message}`)
  errors++
}

function warning(message) {
  console.log(`⚠️  WARNING: ${message}`)
  warnings++
}

function success(message) {
  console.log(`✅ ${message}`)
}

function info(message) {
  console.log(`ℹ️  ${message}`)
}

// Check 1: Environment Variables
console.log('1. Checking Environment Variables...')

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ENCRYPTION_KEY',
  'NEXTAUTH_SECRET'
]

const envExamplePath = '.env.local.example'
const envLocalPath = '.env.local'

if (!fs.existsSync(envLocalPath)) {
  error('.env.local file not found')
  info(`Copy ${envExamplePath} to ${envLocalPath} and fill in the values`)
} else {
  success('.env.local file exists')
  
  // Read .env.local and check for required variables
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      success(`${varName} is configured`)
    } else {
      error(`${varName} is missing or not configured`)
    }
  })
  
  // Check encryption key strength
  const encryptionKeyMatch = envContent.match(/ENCRYPTION_KEY=(.+)/)
  if (encryptionKeyMatch) {
    const key = encryptionKeyMatch[1].trim()
    if (key.length < 32) {
      error('ENCRYPTION_KEY must be at least 32 characters')
    } else if (!/[A-Z]/.test(key) || !/[a-z]/.test(key) || !/\d/.test(key) || !/[!@#$%^&*(),.?":{}|<>]/.test(key)) {
      warning('ENCRYPTION_KEY should contain uppercase, lowercase, numbers, and special characters')
    } else {
      success('ENCRYPTION_KEY meets security requirements')
    }
  }
}

// Check 2: Security Files
console.log('\n2. Checking Security Implementation...')

const securityFiles = [
  'src/lib/security/encryption.ts',
  'src/lib/security/logger.ts',
  'docs/security-checklist.md'
]

securityFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success(`${file} exists`)
  } else {
    error(`${file} is missing`)
  }
})

// Check 3: Middleware Security
console.log('\n3. Checking Middleware Security...')

const middlewarePath = 'src/middleware.ts'
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
  
  if (middlewareContent.includes('isDevelopment') && middlewareContent.includes('!isDevelopment')) {
    error('Development bypass still present in middleware')
  } else {
    success('No development bypass found in middleware')
  }
  
  if (middlewareContent.includes('protectedPaths')) {
    success('Protected paths are configured')
  } else {
    warning('Protected paths configuration not found')
  }
} else {
  error('Middleware file not found')
}

// Check 4: Test Pages Security
console.log('\n4. Checking Test Pages Security...')

const testPages = [
  'src/app/api-test/page.tsx',
  'src/app/dashboard-demo/page.tsx'
]

testPages.forEach(page => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8')
    
    if (content.includes('isAuthorized') || content.includes('admin')) {
      success(`${page} has access control`)
    } else {
      warning(`${page} may need access control`)
    }
  }
})

// Check 5: Removed Vulnerable Files
console.log('\n5. Checking for Removed Vulnerable Files...')

const vulnerableFiles = [
  'src/app/debug-auth',
  'src/app/login-test',
  'src/hooks/useTheme.ts' // Duplicate file
]

vulnerableFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    success(`${file} has been removed`)
  } else {
    warning(`${file} still exists and should be removed`)
  }
})

// Check 6: Package Security
console.log('\n6. Checking Package Security...')

const packageJsonPath = 'package.json'
if (fs.existsSync(packageJsonPath)) {
  success('package.json exists')
  info('Run "npm audit" to check for known vulnerabilities')
} else {
  error('package.json not found')
}

// Check 7: Git Security
console.log('\n7. Checking Git Security...')

const gitignorePath = '.gitignore'
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  
  if (gitignoreContent.includes('.env.local')) {
    success('.env.local is in .gitignore')
  } else {
    error('.env.local is not in .gitignore - SECURITY RISK!')
  }
  
  if (gitignoreContent.includes('*.log')) {
    success('Log files are in .gitignore')
  } else {
    warning('Log files should be in .gitignore')
  }
} else {
  error('.gitignore not found')
}

// Check 8: Database Security
console.log('\n8. Checking Database Security...')

const supabaseSetupPath = 'supabase-setup.sql'
if (fs.existsSync(supabaseSetupPath)) {
  const sqlContent = fs.readFileSync(supabaseSetupPath, 'utf8')
  
  if (sqlContent.includes('RLS')) {
    success('Row Level Security (RLS) is configured')
  } else {
    warning('Row Level Security (RLS) configuration not found')
  }
  
  if (sqlContent.includes('bling_access_token') && sqlContent.includes('bling_refresh_token')) {
    success('Bling token fields are present in schema')
  } else {
    warning('Bling token fields may be missing from schema')
  }
} else {
  warning('supabase-setup.sql not found')
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('🔒 SECURITY VALIDATION SUMMARY')
console.log('='.repeat(50))

if (errors === 0 && warnings === 0) {
  console.log('🎉 ALL SECURITY CHECKS PASSED!')
  console.log('✅ Your application is ready for production deployment.')
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} CRITICAL SECURITY ISSUE(S) FOUND`)
    console.log('🚨 Fix these issues before deploying to production!')
  }
  
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} security warning(s) found`)
    console.log('💡 Consider addressing these for better security.')
  }
}

console.log('\n📚 For more information, see:')
console.log('   - docs/security-checklist.md')
console.log('   - docs/bling-integration.md')
console.log('   - .env.local.example')

process.exit(errors > 0 ? 1 : 0)
