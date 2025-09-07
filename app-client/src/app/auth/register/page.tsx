'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyId: '' as string | number,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // clear error on change for this field
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Informe seu nome'
    if (!formData.lastName.trim()) newErrors.lastName = 'Informe seu sobrenome'
    if (!formData.email.trim()) newErrors.email = 'Informe um e-mail válido'
    if (!formData.username.trim()) newErrors.username = 'Informe um nome de usuário'
    if (formData.username && (formData.username.length < 3 || formData.username.length > 50)) {
      newErrors.username = 'Usuário deve ter entre 3 e 50 caracteres'
    }
    if (!formData.password) newErrors.password = 'Informe uma senha'
    if (formData.password && formData.password.length < 6) newErrors.password = 'A senha deve ter no mínimo 6 caracteres'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirme sua senha'
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem'
    }
    if (formData.companyId !== '' && Number.isNaN(Number(formData.companyId))) {
      newErrors.companyId = 'Informe um número válido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      if (!validate()) return

      await api.auth.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        companyId: formData.companyId === '' ? undefined : Number(formData.companyId),
      })
      toast.success('Registro realizado com sucesso! Faça login para continuar.')
      router.push('/auth/login')
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao registrar'
        : 'Erro ao registrar'
      toast.error(message as string)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>Preencha seus dados para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="João"
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Silva"
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="seuusuario"
                required
                minLength={3}
                maxLength={50}
                disabled={isSubmitting}
                aria-invalid={!!errors.username}
              />
              <p className="text-xs text-gray-500">3–50 caracteres, sem espaços.</p>
              {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="companyId">ID da Empresa (opcional)</Label>
              <Input
                id="companyId"
                name="companyId"
                type="number"
                value={formData.companyId}
                onChange={handleChange}
                placeholder="1"
                disabled={isSubmitting}
                aria-invalid={!!errors.companyId}
              />
              {errors.companyId && <p className="text-sm text-red-600">{errors.companyId}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Voltar ao início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
