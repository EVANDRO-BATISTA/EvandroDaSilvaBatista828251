'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Tutor } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { TutorForm } from '@/components/tutores/tutor-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function EditTutorPage() {
  const params = useParams()
  const id = params.id as string
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [isLoadingTutor, setIsLoadingTutor] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoadingAuth, router])

  useEffect(() => {
    async function fetchTutor() {
      setIsLoadingTutor(true)
      try {
        const tutorData = await api.getTutorById(Number(id))
        setTutor(tutorData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tutor')
      } finally {
        setIsLoadingTutor(false)
      }
    }

    if (isAuthenticated) {
      fetchTutor()
    }
  }, [id, isAuthenticated])

  if (isLoadingAuth || isLoadingTutor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-32 rounded-full" />
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

  if (error || !tutor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/tutores">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold text-foreground">Tutor nao encontrado</h2>
          <p className="text-muted-foreground mt-2">{error || 'O tutor solicitado nao existe.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href={`/tutores/${tutor.id}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para detalhes
        </Button>
      </Link>
      <TutorForm tutor={tutor} isEditing />
    </div>
  )
}
