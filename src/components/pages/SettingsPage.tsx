'use client'

import * as React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { MOCK_HOTELS } from '@/lib/mock-data'
import {
  Check,
  Star,
  Building2,
  CreditCard,
  User,
  Camera,
  Shield,
  Trash2,
} from 'lucide-react'

// ==========================================
// MOCK DATA
// ==========================================

const HOTEL = MOCK_HOTELS[0]

const MOCK_USER = {
  firstName: 'Yao',
  lastName: 'Kouamé',
  email: 'yao.kouame@hotel-cocody.ci',
  phone: '+225 07 55 66 77',
}

// ==========================================
// TAB 1: MON HÔTEL
// ==========================================

function HotelSettings() {
  const [name, setName] = useState(HOTEL.name)
  const [email, setEmail] = useState(HOTEL.email)
  const [phone, setPhone] = useState(HOTEL.phone)
  const [city, setCity] = useState(HOTEL.city)
  const [district, setDistrict] = useState(HOTEL.district)
  const [address, setAddress] = useState(HOTEL.address ?? '')
  const [checkIn, setCheckIn] = useState(HOTEL.checkInTime)
  const [checkOut, setCheckOut] = useState(HOTEL.checkOutTime)
  const [currency, setCurrency] = useState(HOTEL.defaultCurrency)
  const [taxRate, setTaxRate] = useState(String(HOTEL.taxRate))
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [invoiceFooter, setInvoiceFooter] = useState(
    'Merci de votre confiance. Retrouvez-nous sur notre site web.'
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
          <CardDescription>
            Les informations principales de votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel-name">Nom de l&apos;hôtel</Label>
              <Input
                id="hotel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel-email">Email</Label>
              <Input
                id="hotel-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel-phone">Téléphone</Label>
              <Input
                id="hotel-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel-city">Ville</Label>
              <Input
                id="hotel-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel-district">Quartier</Label>
              <Input
                id="hotel-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hotel-address">Adresse</Label>
            <Textarea
              id="hotel-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horaires</CardTitle>
          <CardDescription>
            Heures d&apos;arrivée et de départ par défaut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkin-time">Heure check-in</Label>
              <Input
                id="checkin-time"
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-time">Heure check-out</Label>
              <Input
                id="checkout-time"
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facturation</CardTitle>
          <CardDescription>
            Paramètres de facturation et de TVA
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Devise</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCFA">FCFA</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tax-rate">Taux TVA (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoice-prefix">Préfixe facture</Label>
            <Input
              id="invoice-prefix"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoice-footer">Pied de page facture</Label>
            <Textarea
              id="invoice-footer"
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline">Annuler</Button>
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  )
}

// ==========================================
// TAB 2: ABONNEMENT
// ==========================================

function SubscriptionSettings() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <div className="flex flex-col gap-6">
      {/* Plan actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              Pro
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Actif
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Date d&apos;expiration :{' '}
            <span className="font-medium text-foreground">
              15 novembre 2024
            </span>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilisateurs</span>
                <span className="font-medium">6/10</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hôtels</span>
                <span className="font-medium">1/1</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cycle selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cycle de facturation</CardTitle>
          <CardDescription>
            Choisissez la durée de votre engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'monthly', label: 'Mensuel', discount: null },
              { value: 'yearly', label: 'Annuel', discount: '-16%' },
              { value: '5years', label: '5 ans', discount: '-30%' },
            ].map((cycle) => (
              <button
                key={cycle.value}
                type="button"
                onClick={() => setBillingCycle(cycle.value)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  billingCycle === cycle.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-accent'
                }`}
              >
                {cycle.label}
                {cycle.discount && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                      billingCycle === cycle.value
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {cycle.discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans disponibles */}
      <div>
        <h3 className="mb-4 text-base font-semibold">Plans disponibles</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* STARTER */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Starter</CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold">15 000</span>
                <span className="text-sm text-muted-foreground">
                  {' '}
                  FCFA/mois
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  '1 hôtel',
                  '10 utilisateurs',
                  'Toutes les fonctions de base',
                  'Support WhatsApp',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button variant="outline" className="w-full">
                  Changer de plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PRO (Highlighted) */}
          <Card className="flex flex-col ring-2 ring-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pro</CardTitle>
                <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Star className="h-3 w-3" />
                  POPULAIRE
                </Badge>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-bold">35 000</span>
                <span className="text-sm text-muted-foreground">
                  {' '}
                  FCFA/mois
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  'Hôtels illimités',
                  '50 utilisateurs',
                  'Rapports avancés',
                  'API access',
                  'Support prioritaire',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button className="w-full" disabled>
                  Plan actuel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ENTERPRISE */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Enterprise</CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold">Sur devis</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  'Tout illimité',
                  'Personnalisation',
                  'Formation sur site',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button variant="outline" className="w-full">
                  Nous contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// TAB 3: MON COMPTE
// ==========================================

function AccountSettings() {
  const [firstName, setFirstName] = useState(MOCK_USER.firstName)
  const [lastName, setLastName] = useState(MOCK_USER.lastName)
  const [phone, setPhone] = useState(MOCK_USER.phone)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className="flex flex-col gap-6">
      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
          <CardDescription>
            Mettez à jour vos informations de profil
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-emerald-600 text-xl font-semibold text-white">
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="sr-only">Changer la photo</span>
              </button>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Camera className="mr-2 h-3.5 w-3.5" />
                Changer la photo
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-firstname">Prénom</Label>
              <Input
                id="user-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-lastname">Nom</Label>
              <Input
                id="user-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={MOCK_USER.email}
                disabled
                className="cursor-not-allowed bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-phone">Téléphone</Label>
              <Input
                id="user-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button>Enregistrer les modifications</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline">Changer le mot de passe</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
            <Trash2 className="h-4 w-4" />
            Zone dangereuse
          </CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Supprimer mon compte</p>
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible. Toutes vos données seront
                supprimées définitivement.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les paramètres de votre hôtel et de votre compte
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hotel" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="hotel" className="flex-1 sm:flex-initial gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mon hôtel</span>
            <span className="sm:hidden">Hôtel</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex-1 sm:flex-initial gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Abonnement</span>
            <span className="sm:hidden">Abo.</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 sm:flex-initial gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Mon compte</span>
            <span className="sm:hidden">Compte</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="mt-6">
          <HotelSettings />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionSettings />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
