'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, AlertTriangle, Check } from 'lucide-react'

interface MetadataFieldProps {
  value?: Record<string, any> | null
  onChange: (value: Record<string, any> | null) => void
  placeholder?: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function MetadataField({
  value = null,
  onChange,
  placeholder = '{"chave": "valor"}',
  label = "Metadata",
  description = "Dados adicionais em formato JSON",
  required = false,
  disabled = false,
  className = ''
}: MetadataFieldProps) {
  const [textValue, setTextValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (value) {
      setTextValue(JSON.stringify(value, null, 2))
    } else {
      setTextValue('')
    }
  }, [value])

  const validateAndParseJSON = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValid(true)
      setError(null)
      onChange(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonString)
      setIsValid(true)
      setError(null)
      onChange(parsed)
    } catch (err) {
      setIsValid(false)
      setError('JSON inválido. Verifique a sintaxe.')
    }
  }

  const handleChange = (newValue: string) => {
    setTextValue(newValue)
    validateAndParseJSON(newValue)
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(textValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setTextValue(formatted)
    } catch (err) {
      // Ignora se não conseguir formatar
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(textValue)
      const minified = JSON.stringify(parsed)
      setTextValue(minified)
    } catch (err) {
      // Ignora se não conseguir minificar
    }
  }

  const renderPreview = () => {
    if (!value || typeof value !== 'object') return null

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Preview dos campos:</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(value).map(([key, val]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {key}: {String(val)}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="metadata">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {textValue && isValid && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Ocultar' : 'Preview'}
            </Button>
          )}
          {textValue && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFormat}
                disabled={!isValid}
              >
                Formatar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMinify}
                disabled={!isValid}
              >
                Minificar
              </Button>
            </>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      <div className="relative">
        <Textarea
          id="metadata"
          value={textValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`font-mono text-sm min-h-[100px] ${
            !isValid ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {isValid && textValue && (
          <div className="absolute top-2 right-2">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && textValue && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            JSON válido com {Object.keys(value || {}).length} campo(s)
          </AlertDescription>
        </Alert>
      )}

      {showPreview && isValid && renderPreview()}

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Dicas:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Use aspas duplas para strings: {`{"campo": "valor"}`}</li>
          <li>Números não precisam de aspas: {`{"idade": 25}`}</li>
          <li>Booleans: {`{"ativo": true}`} ou {`{"ativo": false}`}</li>
          <li>Arrays: {`{"tags": ["tag1", "tag2"]}`}</li>
        </ul>
      </div>
    </div>
  )
}