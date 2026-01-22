'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Pet } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PawPrint } from 'lucide-react'

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Link href={`/pets/${pet.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <div className="relative aspect-square bg-muted">
          {pet.foto ? (
            <Image
              src={pet.foto || "/placeholder.svg"}
              alt={pet.nome}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <PawPrint className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground">
            {pet.especie}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {pet.nome}
          </h3>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}</span>
            {pet.raca && (
              <>
                <span className="text-border">|</span>
                <span className="truncate">{pet.raca}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
