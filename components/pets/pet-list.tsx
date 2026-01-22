'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Pet, PaginatedResponse } from '@/lib/types'
import { PetCard } from './pet-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useDebounce } from '@/hooks/use-debounce'

const PAGE_SIZE = 10

export function PetList() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const { isAuthenticated } = useAuth()

  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchPets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Pet> = await api.getPets(
        currentPage, 
        PAGE_SIZE, 
        debouncedSearch || undefined
      )
      setPets(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pets')
      setPets([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearch])

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pets Registrados</h1>
          <p className="text-muted-foreground mt-1">
            {totalElements} {totalElements === 1 ? 'pet encontrado' : 'pets encontrados'}
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/pets/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Pet
            </Button>
          </Link>
        )}
      </div>

      {/* Search Section */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPets} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && pets.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum pet encontrado</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm 
              ? 'Tente ajustar sua busca ou limpar o filtro.'
              : 'Nao ha pets cadastrados no momento.'}
          </p>
          {isAuthenticated && !searchTerm && (
            <Link href="/pets/novo">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar primeiro pet
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Pet Grid */}
      {!isLoading && !error && pets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {currentPage + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="gap-2"
          >
            Proxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
