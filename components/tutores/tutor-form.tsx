'use client'

import React from "react"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import type { Tutor, TutorCreateInput } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Upload, X, User } from 'lucide-react'

interface TutorFormProps {
  tutor?: Tutor
  isEditing?: boolean
}

// Phone mask helper
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

export function TutorForm({ tutor, isEditing = false }: TutorFormProps) {
  const [formData, setFormData] = useState<TutorCreateInput>({
    nomeCompleto: tutor?.nomeCompleto || '',
    telefone: tutor?.telefone || '',
    endereco: tutor?.endereco || '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(tutor?.foto || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: keyof TutorCreateInput, value: string) => {
    if (field === 'telefone') {
      value = formatPhone(value)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A foto deve ter no maximo 5MB.',
          variant: 'destructive',
        })
        return
      }
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nomeCompleto || !formData.telefone || !formData.endereco) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      let savedTutor: Tutor

      if (isEditing && tutor) {
        savedTutor = await api.updateTutor(tutor.id, { ...formData, id: tutor.id })
        toast({
          title: 'Tutor atualizado!',
          description: 'As informacoes do tutor foram atualizadas com sucesso.',
        })
      } else {
        savedTutor = await api.createTutor(formData)
        toast({
          title: 'Tutor cadastrado!',
          description: 'O tutor foi cadastrado com sucesso.',
        })
      }

      // Upload photo if selected
      if (photoFile && savedTutor.id) {
        setIsUploadingPhoto(true)
        try {
          await api.uploadTutorPhoto(savedTutor.id, photoFile)
        } catch {
          toast({
            title: 'Aviso',
            description: 'Tutor salvo, mas houve um erro ao enviar a foto.',
            variant: 'destructive',
          })
        }
        setIsUploadingPhoto(false)
      }

      router.push(`/tutores/${savedTutor.id}`)
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Nao foi possivel salvar o tutor.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEditing ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informacoes do tutor abaixo.' 
            : 'Preencha as informacoes do tutor para cadastra-lo no sistema.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Foto do Tutor</Label>
            <div className="flex items-start gap-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {photoPreview ? (
                  <>
                    <Image
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-5 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" className="gap-2 bg-transparent" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      Escolher foto
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG ou GIF. Maximo 5MB.
                </p>
              </div>
              
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">Nome Completo *</Label>
            <Input
              id="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              placeholder="Nome completo do tutor"
              disabled={isLoading}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={isLoading}
              required
              maxLength={15}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereco *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Endereco completo"
              disabled={isLoading}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading || isUploadingPhoto ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingPhoto ? 'Enviando foto...' : 'Salvando...'}
                </>
              ) : (
                isEditing ? 'Salvar Alteracoes' : 'Cadastrar Tutor'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
