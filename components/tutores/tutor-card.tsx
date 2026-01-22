'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Tutor } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { User, Phone, MapPin } from 'lucide-react'

interface TutorCardProps {
  tutor: Tutor
}

export function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Link href={`/tutores/${tutor.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {tutor.foto ? (
                <Image
                  src={tutor.foto || "/placeholder.svg"}
                  alt={tutor.nomeCompleto}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {tutor.nomeCompleto}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{tutor.telefone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{tutor.endereco}</span>
                </p>
              </div>
              {tutor.pets && tutor.pets.length > 0 && (
                <p className="mt-2 text-xs text-primary font-medium">
                  {tutor.pets.length} {tutor.pets.length === 1 ? 'pet vinculado' : 'pets vinculados'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
