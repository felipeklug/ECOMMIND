/**
 * Login Page - Autenticação ECOMMIND
 */

import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Login - ECOMMIND',
  description: 'Acesse sua conta ECOMMIND',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container relative grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Back to site button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 md:left-8 md:top-8"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao site
          </Link>
        </Button>

        {/* Left side - Login Form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {/* Logo */}
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto mb-4">
                <Image
                  src="/logo.svg"
                  alt="ECOMMIND"
                  width={120}
                  height={40}
                  className="dark:invert"
                />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-muted-foreground">
                Entre na sua conta para acessar o dashboard
              </p>
            </div>

            {/* Login Form */}
            <Suspense fallback={<div>Carregando...</div>}>
              <LoginForm />
            </Suspense>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Não tem uma conta?{' '}
                <Link
                  href="/contato"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Entre em contato
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-l">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/logo-white.svg"
              alt="ECOMMIND"
              width={120}
              height={40}
              className="mr-2"
            />
          </div>
          
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "O ECOMMIND transformou completamente nossa operação. 
                Agora temos insights em tempo real e automações que nos 
                poupam horas de trabalho manual."
              </p>
              <footer className="text-sm opacity-80">
                Sofia Chen, CEO da TechStore
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
