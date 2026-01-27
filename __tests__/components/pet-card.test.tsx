import React from "react"
import { render, screen } from '@testing-library/react'
import { PetCard } from '@/components/pets/pet-card'
import type { Pet } from '@/lib/types'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    return <img src={src} alt={alt} {...props} />
  }
})

describe('PetCard Component', () => {
  const mockPet: Pet = {
    id: 1,
    nome: 'Rex',
    especie: 'Cachorro',
    idade: 3,
    raca: 'Labrador',
    foto: 'https://example.com/photo.jpg',
  }

  it('should render pet name', () => {
    render(<PetCard pet={mockPet} />)
    expect(screen.getByText('Rex')).toBeInTheDocument()
  })

  it('should render pet species as badge', () => {
    render(<PetCard pet={mockPet} />)
    expect(screen.getByText('Cachorro')).toBeInTheDocument()
  })

  it('should render pet age correctly', () => {
    render(<PetCard pet={mockPet} />)
    expect(screen.getByText('3 anos')).toBeInTheDocument()
  })

  it('should render singular year for age 1', () => {
    const youngPet: Pet = { ...mockPet, idade: 1 }
    render(<PetCard pet={youngPet} />)
    expect(screen.getByText('1 ano')).toBeInTheDocument()
  })

  it('should render pet breed when available', () => {
    render(<PetCard pet={mockPet} />)
    expect(screen.getByText('Labrador')).toBeInTheDocument()
  })

  it('should link to pet detail page', () => {
    render(<PetCard pet={mockPet} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/pets/1')
  })

  it('should render without breed when not provided', () => {
    const petWithoutBreed: Pet = {
      id: 2,
      nome: 'Miau',
      especie: 'Gato',
      idade: 2,
    }
    render(<PetCard pet={petWithoutBreed} />)
    expect(screen.getByText('Miau')).toBeInTheDocument()
    expect(screen.queryByText('|')).not.toBeInTheDocument()
  })

  it('should render pet photo when available', () => {
    render(<PetCard pet={mockPet} />)
    const image = screen.getByAltText('Rex')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('photo.jpg'))
  })
})
