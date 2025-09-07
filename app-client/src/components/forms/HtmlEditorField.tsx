'use client'

import { useState, useEffect, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Eye, EyeOff, Check } from 'lucide-react'

interface HtmlEditorFieldProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showPreviewToggle?: boolean
}

export function HtmlEditorField({
  value = '',
  onChange,
  placeholder = '<h1>Título</h1>\n<p>Conteúdo do e-mail...</p>',
  label = 'HTML',
  description = 'Conteúdo HTML do e-mail. Você pode usar variáveis como {{username}}.',
  required = false,
  disabled = false,
  className = '',
  showPreviewToggle = true
}: HtmlEditorFieldProps) {
  const [textValue, setTextValue] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setTextValue(value || '')
  }, [value])

  const charCount = textValue.length

  // Opcional: validação simples (tamanho mínimo)
  const isValid = useMemo(() => charCount >= 3, [charCount])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    setTextValue(next)
    onChange(next)
  }

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <Label>
            {label}
            {required && <span className="text-red-500"> *</span>}
          </Label>
          <div className="text-xs text-muted-foreground">{charCount} chars</div>
        </div>
      )}

      {description && (
        <Alert variant="default" className="mb-3">
          <Info className="h-4 w-4" />
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={textValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[180px] font-mono"
        required={required}
        disabled={disabled}
      />

      <div className="mt-2 flex items-center gap-2">
        {showPreviewToggle && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowPreview(v => !v)} disabled={!isValid}>
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" /> Ocultar preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" /> Visualizar
              </>
            )}
          </Button>
        )}
        {isValid && (
          <span className="text-emerald-600 text-xs inline-flex items-center"><Check className="h-4 w-4 mr-1" /> Válido</span>
        )}
      </div>

      {showPreview && isValid && (
        <div className="mt-3 rounded-md border p-3 bg-background">
          {/* Preview inseguro: use somente em áreas internas/admin. Para maior segurança, renderize em iframe sandbox. */}
          <div dangerouslySetInnerHTML={{ __html: textValue }} />
        </div>
      )}
    </div>
  )
}
