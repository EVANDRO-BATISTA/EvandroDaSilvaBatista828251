import React from "react"
import { render, screen } from '@testing-library/react'
import { TutorCard } from '@/components/tutores/tutor-card'
import type { Tutor } from '@/lib/types'

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

describe('TutorCard Component', () => {
  const mockTutor: Tutor = {
    id: 1,
    nomeCompleto: 'Joao Silva',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    foto: 'https://example.com/tutor.jpg',
  }

  it('should render tutor name', () => {
    render(<TutorCard tutor={mockTutor} />)
    expect(screen.getByText('Joao Silva')).toBeInTheDocument()
  })

  it('should render tutor phone', () => {
    render(<TutorCard tutor={mockTutor} />)
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
  })

  it('should render tutor address', () => {
    render(<TutorCard tutor={mockTutor} />)
    expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument()
  })

  it('should link to tutor detail page', () => {
    render(<TutorCard tutor={mockTutor} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/tutores/1')
  })

  it('should render pet count when tutor has pets', () => {
    const tutorWithPets: Tutor = {
      ...mockTutor,
      pets: [
        { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 },
        { id: 2, nome: 'Miau', especie: 'Gato', idade: 2 },
      ],
    }
    render(<TutorCard tutor={tutorWithPets} />)
    expect(screen.getByText('2 pets vinculados')).toBeInTheDocument()
  })

  it('should render singular pet count for one pet', () => {
    const tutorWithOnePet: Tutor = {
      ...mockTutor,
      pets: [{ id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 }],
    }
    render(<TutorCard tutor={tutorWithOnePet} />)
    expect(screen.getByText('1 pet vinculado')).toBeInTheDocument()
  })

  it('should not render pet count when tutor has no pets', () => {
    render(<TutorCard tutor={mockTutor} />)
    expect(screen.queryByText(/pet vinculado/)).not.toBeInTheDocument()
  })

  it('should render tutor photo when available', () => {
    render(<TutorCard tutor={mockTutor} />)
    const image = screen.getByAltText('Joao Silva')
    expect(image).toBeInTheDocument()
  })

  it('should render without photo gracefully', () => {
    const tutorWithoutPhoto: Tutor = {
      id: 2,
      nomeCompleto: 'Maria Oliveira',
      telefone: '(11) 88888-8888',
      endereco: 'Av. Principal, 456',
    }
    render(<TutorCard tutor={tutorWithoutPhoto} />)
    expect(screen.getByText('Maria Oliveira')).toBeInTheDocument()
    // Should show default icon instead of image
    expect(screen.queryByAltText('Maria Oliveira')).not.toBeInTheDocument()
  })
})
