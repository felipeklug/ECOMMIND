/**
 * Onboarding Wizard Component
 * Premium multi-step wizard with smooth animations and validation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Step components
import { ConnectionsStep } from './steps/connections-step';
import { PreferencesStep } from './steps/preferences-step';
import { ReviewStep } from './steps/review-step';

// Types and schemas
import type { 
  ConnectionsStep as ConnectionsData,
  PreferencesStep as PreferencesData,
  ReviewStep as ReviewData,
  CompleteOnboardingPayload
} from '@/features/onboarding/schemas';
import { 
  defaultConnections, 
  defaultPreferences, 
  defaultReview,
  validateStep
} from '@/features/onboarding/schemas';

interface OnboardingWizardProps {
  initialData?: {
    step?: number;
    connections?: ConnectionsData;
    preferences?: PreferencesData;
    review?: ReviewData;
  };
  onComplete?: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Conexões',
    description: 'Configure suas integrações',
    icon: '🔗',
  },
  {
    id: 2,
    title: 'Preferências',
    description: 'Defina suas configurações',
    icon: '⚙️',
  },
  {
    id: 3,
    title: 'Revisão',
    description: 'Confirme e finalize',
    icon: '✅',
  },
];

export function OnboardingWizard({ initialData, onComplete }: OnboardingWizardProps) {
  const { toast } = useToast();
  
  // State management
  const [currentStep, setCurrentStep] = useState(initialData?.step || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  // Form data
  const [connectionsData, setConnectionsData] = useState<ConnectionsData>(
    initialData?.connections || defaultConnections
  );
  const [preferencesData, setPreferencesData] = useState<PreferencesData>(
    initialData?.preferences || defaultPreferences
  );
  const [reviewData, setReviewData] = useState<ReviewData>(
    initialData?.review || defaultReview
  );

  // Calculate progress
  const progress = (currentStep / steps.length) * 100;

  // Validation
  const validateCurrentStep = () => {
    let data;
    switch (currentStep) {
      case 1:
        data = connectionsData;
        break;
      case 2:
        data = preferencesData;
        break;
      case 3:
        data = reviewData;
        break;
      default:
        return true;
    }

    const result = validateStep(currentStep, data);
    if (!result.success) {
      setErrors(result.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  };

  // Navigation
  const goToStep = (step: number) => {
    if (step < currentStep || validateCurrentStep()) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save progress
  const saveProgress = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save progress API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Progresso salvo',
        description: 'Suas configurações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o progresso. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      const payload: CompleteOnboardingPayload = {
        connections: connectionsData,
        preferences: preferencesData,
        review: reviewData,
        version: 1,
      };

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      const result = await response.json();

      toast({
        title: 'Onboarding concluído! 🎉',
        description: 'Bem-vindo ao ECOMMIND! Suas configurações foram salvas.',
      });

      onComplete?.();
    } catch (error) {
      toast({
        title: 'Erro ao finalizar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConnectionsStep
            data={connectionsData}
            onChange={setConnectionsData}
            errors={errors}
          />
        );
      case 2:
        return (
          <PreferencesStep
            data={preferencesData}
            onChange={setPreferencesData}
            errors={errors}
          />
        );
      case 3:
        return (
          <ReviewStep
            connectionsData={connectionsData}
            preferencesData={preferencesData}
            data={reviewData}
            onChange={setReviewData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Configuração Inicial
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure seu ECOMMIND em poucos passos
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg transition-all',
                  'hover:bg-white/50 dark:hover:bg-gray-800/50',
                  currentStep === step.id && 'bg-white dark:bg-gray-800 shadow-md',
                  currentStep > step.id && 'text-green-600 dark:text-green-400'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep > step.id 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : currentStep === step.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="text-4xl mb-2">{steps[currentStep - 1]?.icon}</div>
            <CardTitle className="text-2xl">
              {steps[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Corrija os erros abaixo:</span>
                </div>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {Array.isArray(error) ? error[0] : error}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar e sair
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isLoading}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep === steps.length ? (
                    'Concluir'
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
