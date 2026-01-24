'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Pet } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { PetForm } from '@/components/pets/pet-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function EditPetPage() {
  const params = useParams()
  const id = params.id as string
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoadingPet, setIsLoadingPet] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoadingAuth, router])

  useEffect(() => {
    async function fetchPet() {
      setIsLoadingPet(true)
      try {
        const petData = await api.getPetById(Number(id))
        setPet(petData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pet')
      } finally {
        setIsLoadingPet(false)
      }
    }

    if (isAuthenticated) {
      fetchPet()
    }
  }, [id, isAuthenticated])

  if (isLoadingAuth || isLoadingPet) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !pet) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold text-foreground">Pet nao encontrado</h2>
          <p className="text-muted-foreground mt-2">{error || 'O pet solicitado nao existe.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href={`/pets/${pet.id}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para detalhes
        </Button>
      </Link>
      <PetForm pet={pet} isEditing />
    </div>
  )
}
