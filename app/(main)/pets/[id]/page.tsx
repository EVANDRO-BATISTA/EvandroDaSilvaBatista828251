'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Pet, Tutor } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Edit, Trash2, PawPrint, User, Phone, MapPin, Loader2 } from 'lucide-react'

export default function PetDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [pet, setPet] = useState<Pet | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPet() {
      setIsLoading(true)
      setError(null)
      try {
        const petData = await api.getPetById(Number(id))
        setPet(petData)
        
        // Fetch tutor if pet has one
        if (petData.tutorId) {
          try {
            const tutorData = await api.getTutorById(petData.tutorId)
            setTutor(tutorData)
          } catch {
            // Tutor might not exist or be accessible
            console.log('Could not fetch tutor data')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do pet')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPet()
  }, [id])

  const handleDelete = async () => {
    if (!pet) return
    
    setIsDeleting(true)
    try {
      await api.deletePet(pet.id)
      toast({
        title: 'Pet removido',
        description: 'O pet foi removido com sucesso.',
      })
      router.push('/')
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: err instanceof Error ? err.message : 'Nao foi possivel remover o pet.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card className="text-center py-12">
          <CardContent>
            <PawPrint className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Pet nao encontrado</h2>
            <p className="text-muted-foreground mt-2">{error || 'O pet solicitado nao existe.'}</p>
            <Link href="/">
              <Button className="mt-4">Voltar para lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Button>
      </Link>

      {/* Pet Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Photo Section */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {pet.foto ? (
            <Image
              src={pet.foto || "/placeholder.svg"}
              alt={pet.nome}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <PawPrint className="h-24 w-24 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-foreground">{pet.nome}</h1>
              <Badge variant="secondary" className="text-sm">
                {pet.especie}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p><span className="font-medium text-foreground">Idade:</span> {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}</p>
              {pet.raca && (
                <p><span className="font-medium text-foreground">Raca:</span> {pet.raca}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated && (
            <div className="flex gap-3">
              <Link href={`/pets/${pet.id}/editar`} className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o pet {pet.nome}? Esta acao nao pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* Tutor Card */}
      {tutor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tutor Responsavel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/tutores/${tutor.id}`} className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {tutor.foto ? (
                    <Image
                      src={tutor.foto || "/placeholder.svg"}
                      alt={tutor.nomeCompleto}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{tutor.nomeCompleto}</h3>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {tutor.telefone}
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {tutor.endereco}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
