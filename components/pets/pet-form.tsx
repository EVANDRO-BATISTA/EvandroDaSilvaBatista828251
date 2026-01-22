'use client'

import React from "react"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import type { Pet, PetCreateInput } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X, PawPrint } from 'lucide-react'

interface PetFormProps {
  pet?: Pet
  isEditing?: boolean
}

const ESPECIES = ['Cachorro', 'Gato', 'Passaro', 'Peixe', 'Hamster', 'Coelho', 'Tartaruga', 'Outro']

export function PetForm({ pet, isEditing = false }: PetFormProps) {
  const [formData, setFormData] = useState<PetCreateInput>({
    nome: pet?.nome || '',
    especie: pet?.especie || '',
    idade: pet?.idade || 0,
    raca: pet?.raca || '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.foto || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: keyof PetCreateInput, value: string | number) => {
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
    
    if (!formData.nome || !formData.especie || formData.idade < 0) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Por favor, preencha nome, especie e idade.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      let savedPet: Pet

      if (isEditing && pet) {
        savedPet = await api.updatePet(pet.id, { ...formData, id: pet.id })
        toast({
          title: 'Pet atualizado!',
          description: 'As informacoes do pet foram atualizadas com sucesso.',
        })
      } else {
        savedPet = await api.createPet(formData)
        toast({
          title: 'Pet cadastrado!',
          description: 'O pet foi cadastrado com sucesso.',
        })
      }

      // Upload photo if selected
      if (photoFile && savedPet.id) {
        setIsUploadingPhoto(true)
        try {
          await api.uploadPetPhoto(savedPet.id, photoFile)
        } catch {
          toast({
            title: 'Aviso',
            description: 'Pet salvo, mas houve um erro ao enviar a foto.',
            variant: 'destructive',
          })
        }
        setIsUploadingPhoto(false)
      }

      router.push(`/pets/${savedPet.id}`)
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Nao foi possivel salvar o pet.',
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
          <PawPrint className="h-5 w-5" />
          {isEditing ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informacoes do pet abaixo.' 
            : 'Preencha as informacoes do pet para cadastra-lo no sistema.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Foto do Pet</Label>
            <div className="flex items-start gap-4">
              <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {photoPreview ? (
                  <>
                    <Image
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PawPrint className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome do pet"
              disabled={isLoading}
              required
            />
          </div>

          {/* Species */}
          <div className="space-y-2">
            <Label htmlFor="especie">Especie *</Label>
            <Select
              value={formData.especie}
              onValueChange={(value) => handleInputChange('especie', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="especie">
                <SelectValue placeholder="Selecione a especie" />
              </SelectTrigger>
              <SelectContent>
                {ESPECIES.map((especie) => (
                  <SelectItem key={especie} value={especie}>
                    {especie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="idade">Idade (anos) *</Label>
            <Input
              id="idade"
              type="number"
              min="0"
              max="100"
              value={formData.idade}
              onChange={(e) => handleInputChange('idade', parseInt(e.target.value) || 0)}
              placeholder="Idade em anos"
              disabled={isLoading}
              required
            />
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="raca">Raca</Label>
            <Input
              id="raca"
              value={formData.raca}
              onChange={(e) => handleInputChange('raca', e.target.value)}
              placeholder="Raca do pet (opcional)"
              disabled={isLoading}
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
                isEditing ? 'Salvar Alteracoes' : 'Cadastrar Pet'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
