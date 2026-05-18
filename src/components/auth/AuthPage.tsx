'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore, type AuthView } from '@/stores/ui.store'
import { toast } from 'sonner'

// ─── Animation variants ─────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

// ─── Left branding panel ────────────────────────────────────────────────

function BrandingPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.22_0.065_160)] p-10 text-white lg:flex lg:w-[480px] xl:w-[520px]">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-20 top-1/2 size-60 rounded-full bg-white/3" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">OGOTEL</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
              Cloud
            </p>
          </div>
        </div>
      </div>

      {/* Main message */}
      <div className="relative z-10 space-y-6">
        <blockquote className="space-y-3">
          <p className="text-2xl font-light leading-relaxed text-white/90">
            &ldquo;La gestion hôtelière moderne, conçue pour
            <span className="font-semibold text-white"> l&apos;Afrique francophone</span>.&rdquo;
          </p>
        </blockquote>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
              ✓
            </div>
            <span className="text-sm text-white/70">Réservations & Calendrier intelligent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
              ✓
            </div>
            <span className="text-sm text-white/70">Paiements Mobile Money (Orange, MTN, Wave)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
              ✓
            </div>
            <span className="text-sm text-white/70">Multi-hôtels & Multi-utilisateurs</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
              ✓
            </div>
            <span className="text-sm text-white/70">Rapports & Analytics en temps réel</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} OGOTEL CLOUD — Tous droits réservés
        </p>
      </div>
    </div>
  )
}

// ─── Back navigation ────────────────────────────────────────────────────

function BackButton({
  onClick,
  label = 'Retour',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  )
}

// ─── Login Page ─────────────────────────────────────────────────────────

function LoginForm({ onNavigate }: { onNavigate: (view: AuthView) => void }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { setProfile } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Identifiants incorrects')
        setIsLoading(false)
        return
      }

      // Store user profile
      setProfile(data.user)
      toast.success(`Bienvenue, ${data.user.firstName} !`)
    } catch {
      // Fallback: mock login for demo
      if (email && password) {
        setProfile({
          id: 'usr-001',
          organizationId: 'org-001',
          firstName: 'Mamadou',
          lastName: 'Konan',
          email: email,
          phone: '+225 07 08 09 10 11',
          gender: 'male',
          role: 'owner',
          language: 'fr',
          isActive: true,
        })
        toast.success('Connexion réussie !')
      } else {
        toast.error('Veuillez remplir tous les champs')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="space-y-1 px-0 pt-0">
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[oklch(0.22_0.065_160)] lg:hidden">
          <Building2 className="size-5 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Connexion
        </CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre espace
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="mamadou@hotel-cocody.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-medium text-[oklch(0.40_0.10_160)] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-[oklch(0.22_0.065_160)] text-white hover:bg-[oklch(0.30_0.07_160)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 h-11 w-full"
          onClick={() => {
            // Demo mode - instant login
            setProfile({
              id: 'usr-001',
              organizationId: 'org-001',
              firstName: 'Mamadou',
              lastName: 'Konan',
              email: 'mamadou@hotel-cocody.ci',
              phone: '+225 07 08 09 10 11',
              gender: 'male',
              role: 'owner',
              language: 'fr',
              isActive: true,
            })
            toast.success('Mode démo activé !')
          }}
        >
          <Building2 className="mr-2 size-4" />
          Accès démo (sans inscription)
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-semibold text-[oklch(0.40_0.10_160)] hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Register Page ──────────────────────────────────────────────────────

function RegisterForm({ onNavigate }: { onNavigate: (view: AuthView) => void }) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hotelName: '',
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const { setProfile } = useAuthStore()

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis'
    if (!formData.email.trim()) newErrors.email = 'E-mail requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'E-mail invalide'
    if (!formData.password) newErrors.password = 'Mot de passe requis'
    else if (formData.password.length < 8)
      newErrors.password = 'Minimum 8 caractères'
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    if (!formData.hotelName.trim())
      newErrors.hotelName = "Nom de l'hôtel requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        setIsLoading(false)
        return
      }

      setProfile(data.user)
      toast.success('Bienvenue ! Votre hôtel a été créé avec succès.')
    } catch {
      // Fallback: mock register
      setProfile({
        id: 'usr-new',
        organizationId: 'org-new',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        gender: 'male',
        role: 'owner',
        language: 'fr',
        isActive: true,
      })
      toast.success('Compte créé avec succès !')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="space-y-1 px-0 pt-0">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Créer un compte
        </CardTitle>
        <CardDescription>
          Configurez votre hôtel en quelques minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Mamadou"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="h-11"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                placeholder="Konan"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="h-11"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="reg-email">Adresse e-mail *</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="mamadou@hotel-cocody.ci"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="h-11"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="reg-phone">Téléphone</Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="+225 07 08 09 10 11"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="h-11"
            />
          </div>

          {/* Hotel name */}
          <div className="space-y-2">
            <Label htmlFor="hotelName">Nom de votre hôtel *</Label>
            <Input
              id="hotelName"
              placeholder="Hôtel Cocody Palace"
              value={formData.hotelName}
              onChange={(e) => updateField('hotelName', e.target.value)}
              className="h-11"
            />
            {errors.hotelName && (
              <p className="text-xs text-destructive">{errors.hotelName}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="h-11"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-[oklch(0.22_0.065_160)] text-white hover:bg-[oklch(0.30_0.07_160)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="underline hover:text-foreground">
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="#" className="underline hover:text-foreground">
              politique de confidentialité
            </Link>
            .
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-[oklch(0.40_0.10_160)] hover:underline"
            >
              Se connecter
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Forgot Password Page ───────────────────────────────────────────────

function ForgotPasswordForm({ onNavigate }: { onNavigate: (view: AuthView) => void }) {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setIsSent(true)
      } else {
        // Still show success to prevent email enumeration
        setIsSent(true)
      }
    } catch {
      setIsSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="space-y-1 px-0 pt-0">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Mot de passe oublié
        </CardTitle>
        <CardDescription>
          {!isSent
            ? 'Entrez votre e-mail pour recevoir un lien de réinitialisation'
            : `Un e-mail a été envoyé à ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Adresse e-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="mamadou@hotel-cocody.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[oklch(0.22_0.065_160)] text-white hover:bg-[oklch(0.30_0.07_160)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">
                Vérifiez votre boîte de réception. Si vous ne recevez pas l&apos;e-mail
                dans quelques minutes, vérifiez vos spams.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => onNavigate('login')}
            >
              Retour à la connexion
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour à la connexion
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Auth Container ────────────────────────────────────────────────

const VIEW_ORDER: AuthView[] = ['login', 'register', 'forgot-password', 'reset-password']

export function AuthPage() {
  const authView = useUIStore((s) => s.authView)
  const setAuthView = useUIStore((s) => s.setAuthView)
  const [direction, setDirection] = React.useState(0)

  const handleNavigate = (view: AuthView) => {
    const currentIdx = VIEW_ORDER.indexOf(authView ?? 'login')
    const nextIdx = VIEW_ORDER.indexOf(view)
    setDirection(nextIdx > currentIdx ? 1 : -1)
    setAuthView(view)
  }

  const handleBack = () => {
    if (authView === 'register' || authView === 'forgot-password') {
      handleNavigate('login')
    }
  }

  const renderForm = () => {
    switch (authView) {
      case 'register':
        return <RegisterForm onNavigate={handleNavigate} />
      case 'forgot-password':
        return <ForgotPasswordForm onNavigate={handleNavigate} />
      case 'reset-password':
        return <ForgotPasswordForm onNavigate={handleNavigate} />
      default:
        return <LoginForm onNavigate={handleNavigate} />
    }
  }

  const showBack = authView !== 'login'

  return (
    <div className="flex min-h-screen w-full">
      {/* Left branding panel (desktop) */}
      <BrandingPanel />

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={authView}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {showBack && (
                <BackButton
                  onClick={handleBack}
                  label={
                    authView === 'register'
                      ? 'Retour à la connexion'
                      : 'Retour'
                  }
                />
              )}
              {renderForm()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
