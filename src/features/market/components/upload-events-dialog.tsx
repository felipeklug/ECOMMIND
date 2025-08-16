/**
 * Upload Events Dialog Component
 * Upload CSV/JSON files for calendar events
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle,
  X,
} from 'lucide-react';
import { useUploadCalendarEvents } from '@/features/market/hooks/use-calendar-events';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface UploadEventsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  validation_errors?: Array<{ row: number; errors: string[] }>;
}

export function UploadEventsDialog({ open, onClose, onSuccess }: UploadEventsDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadEvents } = useUploadCalendarEvents();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/json', '.csv', '.json'];
      const isValidType = validTypes.some(type => 
        file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''))
      );

      if (!isValidType) {
        toast.error('Tipo de arquivo inválido. Use apenas CSV ou JSON.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (file.name.toLowerCase().endsWith('.json')) {
        // Parse JSON
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            resolve(Array.isArray(data) ? data : [data]);
          } catch (error) {
            reject(new Error('Arquivo JSON inválido'));
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
      } else {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error('Erro ao processar CSV: ' + results.errors[0].message));
            } else {
              resolve(results.data);
            }
          },
          error: (error) => {
            reject(new Error('Erro ao processar CSV: ' + error.message));
          },
        });
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Parse file
      setUploadProgress(25);
      const parsedData = await parseFile(selectedFile);

      if (!parsedData || parsedData.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }

      // Upload data
      setUploadProgress(50);
      const result = await uploadEvents({
        events: parsedData,
        file_name: selectedFile.name,
      });

      setUploadProgress(100);
      setUploadResult(result);

      if (result.success) {
        toast.success(`${result.valid_rows} eventos importados com sucesso!`);
        if (result.error_rows > 0) {
          toast.warning(`${result.error_rows} linhas com erro foram ignoradas`);
        }
        onSuccess();
      } else {
        toast.error('Falha no upload. Verifique os erros abaixo.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro no upload. Tente novamente.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = `date,title,channel,category,importance
2025-05-05,Shopee 5.5,shopee,Moda,high
2025-06-06,Shopee 6.6,shopee,Moda,high
2025-11-29,Black Friday,all,Todos,high
2025-05-12,Dia das Mães,all,Presentes,high`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-eventos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Eventos
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV ou JSON com eventos do calendário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Precisa de um template?</span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </Button>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: CSV, JSON (máximo 10MB)
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processando...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="space-y-3">
              <Alert className={uploadResult.success ? 'border-green-200' : 'border-red-200'}>
                <div className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {uploadResult.success ? 'Upload concluído!' : 'Upload com erros'}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{uploadResult.total_rows}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{uploadResult.valid_rows}</p>
                  <p className="text-xs text-muted-foreground">Válidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{uploadResult.error_rows}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>

              {/* Validation Errors */}
              {uploadResult.validation_errors && uploadResult.validation_errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">Erros encontrados:</p>
                  <div className="space-y-1">
                    {uploadResult.validation_errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-xs bg-red-50 p-2 rounded">
                        <span className="font-medium">Linha {error.row}:</span> {error.errors.join(', ')}
                      </div>
                    ))}
                    {uploadResult.validation_errors.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{uploadResult.validation_errors.length - 5} erros adicionais...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {uploadResult?.success ? 'Fechar' : 'Cancelar'}
          </Button>
          {!uploadResult?.success && (
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Enviar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
