'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        setSuccess(true)
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <Card className="w-full max-w-md shadow-pro" style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)'
        }}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-400))'
            }}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              Conta criada com sucesso!
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Verifique seu e-mail para confirmar sua conta.
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Redirecionando para o dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-start justify-center pt-8 pb-6 px-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link href="/" className="inline-flex items-center hover:opacity-80 mb-4 transition-colors"
                style={{ color: 'var(--muted)' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para home
          </Link>

          {/* Logo e Brand */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--brand-500), var(--brand-400))'
              }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              ECOMMIND
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Gestão Inteligente
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
              Crie sua conta grátis
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Comece a transformar seu e-commerce hoje mesmo
            </p>
          </div>

          {/* Register Form */}
          <Card className="shadow-pro" style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius)'
          }}>
            <CardHeader className="pb-2">
              <div className="text-center">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Criar nova conta</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg border" style={{
                  backgroundColor: 'rgba(255, 92, 92, 0.1)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Nome completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="h-10"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="companyName" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Empresa
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nome da empresa"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="h-10"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-10"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)'
                    }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-10 pr-12"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                      style={{ color: 'var(--muted)' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-10 pr-12"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                      style={{ color: 'var(--muted)' }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ borderRadius: 'var(--radius)' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Criando conta...
                    </div>
                  ) : (
                    'Criar conta grátis'
                  )}
                </button>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2" style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--muted)'
                  }}>ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full h-9 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 cursor-pointer bg-white text-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">Continuar com Google</span>
                </div>
              </button>

              <div className="text-center mt-4">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Já tem uma conta?{' '}
                  <Link href="/login" className="font-medium hover:opacity-80"
                        style={{ color: 'var(--brand-500)' }}>
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{
        background: `radial-gradient(600px 200px at 80% 10%, rgba(124,58,237,.35), transparent), linear-gradient(var(--bg), var(--bg))`
      }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10"
               style={{ backgroundColor: 'var(--brand-400)' }}></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-5"
               style={{ backgroundColor: 'var(--brand-400)' }}></div>
        </div>

        <div className="relative flex flex-col justify-center p-12" style={{ color: 'var(--text)' }}>
          <div className="max-w-md">
            <h2 className="text-h2 font-bold mb-6">
              Transforme seu e-commerce
              <span className="block">em uma máquina de lucro</span>
            </h2>

            <p className="text-body-lg mb-12" style={{ color: 'var(--muted)' }}>
              Junte-se a mais de 500 empresários que já aumentaram sua margem em 23%
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'rgba(124,58,237,0.2)' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--brand-400)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>Setup em 5 minutos</h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Conecte seu Bling e WhatsApp rapidamente e comece a usar hoje mesmo
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'rgba(124,58,237,0.2)' }}>
                  <Zap className="w-6 h-6" style={{ color: 'var(--brand-400)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>Resultados Imediatos</h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Veja sua margem de lucro real e receba alertas críticos no primeiro dia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
