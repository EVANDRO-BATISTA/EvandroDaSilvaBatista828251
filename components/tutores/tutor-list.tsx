'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Tutor, PaginatedResponse } from '@/lib/types'
import { TutorCard } from './tutor-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

const PAGE_SIZE = 10

export function TutorList() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const { isAuthenticated } = useAuth()

  const fetchTutors = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Tutor> = await api.getTutors(currentPage, PAGE_SIZE)
      setTutors(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tutores')
      setTutors([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchTutors()
  }, [fetchTutors])

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tutores</h1>
          <p className="text-muted-foreground mt-1">
            {totalElements} {totalElements === 1 ? 'tutor cadastrado' : 'tutores cadastrados'}
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/tutores/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Tutor
            </Button>
          </Link>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTutors} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && tutors.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum tutor cadastrado</h3>
          <p className="text-muted-foreground mt-1">
            Nao ha tutores registrados no sistema.
          </p>
          {isAuthenticated && (
            <Link href="/tutores/novo">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar primeiro tutor
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Tutor Grid */}
      {!isLoading && !error && tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
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
