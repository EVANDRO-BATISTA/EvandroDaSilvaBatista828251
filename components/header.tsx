'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PawPrint, Users, LogOut, LogIn, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { AUTH_ENABLED } from '@/contexts/auth-context'
import { LoginModal } from '@/components/login-modal'

const navItems = [
  { href: '/', label: 'Pets', icon: PawPrint },
  { href: '/tutores', label: 'Tutores', icon: Users },
]

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <PawPrint className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">PetRegistry MT</h1>
            <p className="text-xs text-muted-foreground">Mato Grosso</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'gap-2',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {AUTH_ENABLED && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Alternar tema"
            >
              {mounted ? (
                resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 opacity-0" />
              )}
            </Button>

            {isAuthenticated ? (
              <Button variant="outline" onClick={logout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent"
                onClick={() => setLoginModalOpen(true)}
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            )}
          </div>
        )} 

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-2',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            {AUTH_ENABLED && (
              <div className="border-t border-border pt-2 mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                    setMobileMenuOpen(false)
                  }}
                >
                  {mounted ? (
                    resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4 opacity-0" />
                  )}
                  Alternar tema
                </Button>

                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }} 
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 bg-transparent"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setLoginModalOpen(true)
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                )}
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </header>
  )
}
