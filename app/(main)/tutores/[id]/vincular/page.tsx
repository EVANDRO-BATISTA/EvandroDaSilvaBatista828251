'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Tutor, Pet, PaginatedResponse } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
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
import { ArrowLeft, PawPrint, Link2, Unlink, Search, Loader2, Check, User } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export default function LinkPetsPage() {
  const params = useParams()
  const id = params.id as string
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [linkedPets, setLinkedPets] = useState<Pet[]>([])
  const [availablePets, setAvailablePets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPets, setIsLoadingPets] = useState(false)
  const [linkingPetId, setLinkingPetId] = useState<number | null>(null)
  const [unlinkingPetId, setUnlinkingPetId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoadingAuth, router])

  // Fetch tutor and linked pets
  useEffect(() => {
    async function fetchTutorData() {
      if (!isAuthenticated) return
      
      setIsLoading(true)
      setError(null)
      try {
        const tutorData = await api.getTutorById(Number(id))
        setTutor(tutorData)
        
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

    fetchTutorData()
  }, [id, isAuthenticated])

  // Fetch available pets
  const fetchAvailablePets = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoadingPets(true)
    try {
      const response: PaginatedResponse<Pet> = await api.getPets(0, 50, debouncedSearch || undefined)
      // Filter out already linked pets
      const linkedIds = new Set(linkedPets.map(p => p.id))
      setAvailablePets((response.content || []).filter(p => !linkedIds.has(p.id)))
    } catch (err) {
      console.error('Error fetching available pets:', err)
    } finally {
      setIsLoadingPets(false)
    }
  }, [debouncedSearch, linkedPets, isAuthenticated])

  useEffect(() => {
    fetchAvailablePets()
  }, [fetchAvailablePets])

  const handleLinkPet = async (petId: number) => {
    if (!tutor) return
    
    setLinkingPetId(petId)
    try {
      await api.linkPetToTutor(tutor.id, petId)
      
      // Move pet from available to linked
      const petToLink = availablePets.find(p => p.id === petId)
      if (petToLink) {
        setLinkedPets(prev => [...prev, petToLink])
        setAvailablePets(prev => prev.filter(p => p.id !== petId))
      }
      
      toast({
        title: 'Pet vinculado!',
        description: 'O pet foi vinculado ao tutor com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao vincular',
        description: err instanceof Error ? err.message : 'Nao foi possivel vincular o pet.',
        variant: 'destructive',
      })
    } finally {
      setLinkingPetId(null)
    }
  }

  const handleUnlinkPet = async (petId: number) => {
    if (!tutor) return
    
    setUnlinkingPetId(petId)
    try {
      await api.unlinkPetFromTutor(tutor.id, petId)
      
      // Move pet from linked to available
      const petToUnlink = linkedPets.find(p => p.id === petId)
      if (petToUnlink) {
        setAvailablePets(prev => [...prev, petToUnlink])
        setLinkedPets(prev => prev.filter(p => p.id !== petId))
      }
      
      toast({
        title: 'Vinculo removido!',
        description: 'O pet foi desvinculado do tutor.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao desvincular',
        description: err instanceof Error ? err.message : 'Nao foi possivel desvincular o pet.',
        variant: 'destructive',
      })
    } finally {
      setUnlinkingPetId(null)
    }
  }

  if (isLoadingAuth || isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href={`/tutores/${tutor.id}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para detalhes
        </Button>
      </Link>

      {/* Tutor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Gerenciar Vinculos de Pets
          </CardTitle>
          <CardDescription>
            Vincule ou desvincule pets ao tutor {tutor.nomeCompleto}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Linked Pets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Pets Vinculados ({linkedPets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedPets.length === 0 ? (
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <PawPrint className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum pet vinculado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedPets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {pet.foto ? (
                        <Image
                          src={pet.foto || "/placeholder.svg"}
                          alt={pet.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PawPrint className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{pet.nome}</h4>
                      <p className="text-xs text-muted-foreground">
                        {pet.especie} - {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10 bg-transparent"
                        disabled={unlinkingPetId === pet.id}
                      >
                        {unlinkingPetId === pet.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Unlink className="h-3 w-3" />
                        )}
                        Desvincular
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Desvincular pet?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deseja remover o vinculo do pet {pet.nome} com este tutor?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleUnlinkPet(pet.id)}>
                          Desvincular
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Pets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PawPrint className="h-5 w-5" />
            Pets Disponiveis
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pets por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPets ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : availablePets.length === 0 ? (
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                {searchTerm 
                  ? 'Nenhum pet encontrado com esse nome.'
                  : 'Todos os pets ja estao vinculados ou nao ha pets disponiveis.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availablePets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {pet.foto ? (
                        <Image
                          src={pet.foto || "/placeholder.svg"}
                          alt={pet.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PawPrint className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{pet.nome}</h4>
                      <p className="text-xs text-muted-foreground">
                        {pet.especie} - {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 bg-transparent"
                    onClick={() => handleLinkPet(pet.id)}
                    disabled={linkingPetId === pet.id}
                  >
                    {linkingPetId === pet.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                    Vincular
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
