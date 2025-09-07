'use client'

import React, { ReactNode, useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string | number; label: string }>
  rows?: number
}

// Nova interface para formulários automáticos
interface AutoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  title: string
  description?: string
  fields: FormField[]
  defaultValues?: Record<string, any>
  loading?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Interface antiga para compatibilidade
interface LegacyFormModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

type FormModalProps = AutoFormModalProps | LegacyFormModalProps

export function FormModal(props: FormModalProps) {
  // Detectar qual interface está sendo usada
  const isLegacyMode = 'open' in props && 'children' in props
  
  if (isLegacyMode) {
    // Modo legado - comportamento antigo
    const { open, onClose, title, description, children, size = 'md' } = props as LegacyFormModalProps
    
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    }

    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose()
        }}
      >
        <DialogContent className={sizeClasses[size]}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  // Modo novo - formulário automático
  const {
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    fields,
    defaultValues = {},
    loading = false,
    size = 'md'
  } = props as AutoFormModalProps
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues)
  const previousDefaultValues = useRef(defaultValues)
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  // Update form data when defaultValues change - using deep comparison to avoid infinite loops
  useEffect(() => {
    // Only update if defaultValues actually changed (not just reference)
    if (JSON.stringify(previousDefaultValues.current) !== JSON.stringify(defaultValues)) {
      setFormData(defaultValues)
      previousDefaultValues.current = defaultValues
    }
  }, [defaultValues])

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const requiredFields = fields.filter(field => field.required)
    for (const field of requiredFields) {
      if (!formData[field.name] && formData[field.name] !== 0) {
        alert(`O campo ${field.label} é obrigatório`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            required={field.required}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={(val) => handleInputChange(field.name, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!formData[field.name]}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
            />
          </div>
        )
      
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => {
              const val = field.type === 'number' ? Number(e.target.value) || 0 : e.target.value
              handleInputChange(field.name, val)
            }}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}