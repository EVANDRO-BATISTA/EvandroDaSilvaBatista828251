'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Tutor, Pet } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, PawPrint, Loader2 } from 'lucide-react'

export default function TutorDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [linkedPets, setLinkedPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTutor() {
      setIsLoading(true)
      setError(null)
      try {
        const tutorData = await api.getTutorById(Number(id))
        setTutor(tutorData)
        
        // Fetch linked pets
        try {
          const pets = await api.getTutorPets(Number(id))
          setLinkedPets(pets || [])
        } catch {
          setLinkedPets(tutorData.pets || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do tutor')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutor()
  }, [id])

  const handleDelete = async () => {
    if (!tutor) return
    
    setIsDeleting(true)
    try {
      await api.deleteTutor(tutor.id)
      toast({
        title: 'Tutor removido',
        description: 'O tutor foi removido com sucesso.',
      })
      router.push('/tutores')
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: err instanceof Error ? err.message : 'Nao foi possivel remover o tutor.',
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
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-48 w-48 rounded-full mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !tutor) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/tutores">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Tutor nao encontrado</h2>
            <p className="text-muted-foreground mt-2">{error || 'O tutor solicitado nao existe.'}</p>
            <Link href="/tutores">
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
      <Link href="/tutores">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Button>
      </Link>

      {/* Tutor Details */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="relative h-48 w-48 rounded-full overflow-hidden bg-muted mx-auto md:mx-0 flex-shrink-0">
              {tutor.foto ? (
                <Image
                  src={tutor.foto || "/placeholder.svg"}
                  alt={tutor.nomeCompleto}
                  fill
                  className="object-cover"
                  priority
                  sizes="192px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <User className="h-24 w-24 text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground">{tutor.nomeCompleto}</h1>
              <div className="mt-4 space-y-3 text-muted-foreground">
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="h-4 w-4" />
                  {tutor.telefone}
                </p>
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-4 w-4" />
                  {tutor.endereco}
                </p>
              </div>

              {/* Actions */}
              {isAuthenticated && (
                <div className="flex gap-3 mt-6 justify-center md:justify-start">
                  <Link href={`/tutores/${tutor.id}/editar`}>
                    <Button variant="outline" className="gap-2 bg-transparent">
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
                          Tem certeza que deseja excluir o tutor {tutor.nomeCompleto}? Esta acao nao pode ser desfeita.
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
        </CardContent>
      </Card>

      {/* Linked Pets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5" />
            Pets Vinculados
          </CardTitle>
          {isAuthenticated && (
            <Link href={`/tutores/${tutor.id}/vincular`}>
              <Button size="sm" variant="outline">
                Gerenciar Vinculos
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {linkedPets.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <PawPrint className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum pet vinculado a este tutor.</p>
              {isAuthenticated && (
                <Link href={`/tutores/${tutor.id}/vincular`}>
                  <Button className="mt-4" size="sm">
                    Vincular Pet
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedPets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {pet.foto ? (
                        <Image
                          src={pet.foto || "/placeholder.svg"}
                          alt={pet.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PawPrint className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{pet.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pet.especie} - {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
