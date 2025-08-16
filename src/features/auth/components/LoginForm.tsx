/**
 * Login Form - Formulário de autenticação
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Loader2, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const EmailSchema = z.object({
  email: z.string().email('Email inválido'),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/app';

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const supabase = createSupabaseClient();

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }

      logSecure('Google login initiated', {
        provider: 'google',
        redirectTo,
      });

    } catch (error) {
      logSecure('Google login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      setMessage({
        type: 'error',
        text: 'Erro ao fazer login com Google. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setMessage(null);

      // Validar email
      const result = EmailSchema.safeParse({ email });
      if (!result.success) {
        setMessage({
          type: 'error',
          text: 'Por favor, insira um email válido.',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: result.data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }

      logSecure('Magic link sent', {
        email: result.data.email,
        redirectTo,
      });

      setMessage({
        type: 'success',
        text: 'Link de acesso enviado! Verifique seu email.',
      });

    } catch (error) {
      logSecure('Magic link error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      setMessage({
        type: 'error',
        text: 'Erro ao enviar link de acesso. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            Entrar com Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Acesso rápido e seguro com sua conta Google</p>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Enviar Link de Acesso
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Enviaremos um link seguro para seu email</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <p>
          🔒 Seus dados estão protegidos com criptografia AES-256 e 
          conformidade LGPD
        </p>
      </div>
    </motion.div>
  );
}
