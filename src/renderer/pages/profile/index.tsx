import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { Button } from '@/renderer/components/ui/button'
import { Input } from '@/renderer/components/ui/input'
import { Label } from '@/renderer/components/ui/label'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { User, Lock, History, Wallet, Coffee, Bell } from 'lucide-react'
import { format, isValid } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ExpandableTabs } from '@/renderer/components/ui/expandable-tabs'

const tabs = [
  { title: "Genel", icon: User },
  { title: "Güvenlik", icon: Lock },
  { type: "separator" as const },
  { title: "Kullanım", icon: History },
  { title: "Ödemeler", icon: Wallet },
  { title: "Hizmetler", icon: Coffee },
  { title: "Bildirimler", icon: Bell },
]

export function ProfilePage() {
  const { customer } = useCustomerAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<number | null>(0)

  // Şifre değiştirme state'leri
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Şifre değiştirme mantığı buraya gelecek
    setLoading(false)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return isValid(date) ? format(date, 'PP', { locale: tr }) : '-'
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Genel
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Hesap bilgilerinizi görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ad Soyad</Label>
                  <Input value={customer?.full_name || '-'} disabled />
                </div>
                <div>
                  <Label>E-posta</Label>
                  <Input value={customer?.email || '-'} disabled />
                </div>
                <div>
                  <Label>Kayıt Tarihi</Label>
                  <Input 
                    value={formatDate(customer?.created_at)} 
                    disabled 
                  />
                </div>
                <div>
                  <Label>Üyelik Tipi</Label>
                  <Input value="Standart Üye" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 1: // Güvenlik
        return (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Mevcut Şifre</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Yeni Şifre</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Yeni Şifre Tekrar</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oturum Açık Cihazlar</CardTitle>
                <CardDescription>
                  Aktif oturumlarınızı yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Windows PC - Chrome</p>
                      <p className="text-sm text-muted-foreground">Son giriş: 2 saat önce</p>
                    </div>
                    <Button variant="outline" size="sm">Oturumu Kapat</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2: // Kullanım
        return (
          <Card>
            <CardHeader>
              <CardTitle>Kullanım İstatistikleri</CardTitle>
              <CardDescription>
                Cafe kullanım geçmişiniz ve istatistikleriniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Toplam Kullanım</p>
                  <p className="text-2xl font-bold">124 Saat</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Bu Ay</p>
                  <p className="text-2xl font-bold">24 Saat</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Bu Hafta</p>
                  <p className="text-2xl font-bold">8 Saat</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Favori PC</p>
                  <p className="text-2xl font-bold">PC #12</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Son Oturumlar</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">PC #12</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(), 'PP - HH:mm', { locale: tr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">2 Saat 30 Dakika</p>
                      <p className="text-sm text-muted-foreground">₺25.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3: // Ödemeler
        return (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bakiye Geçmişi</CardTitle>
                <CardDescription>
                  Tüm bakiye yükleme işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Bakiye Yükleme</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(), 'PP - HH:mm', { locale: tr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₺100.00</p>
                      <p className="text-sm text-muted-foreground">Nakit</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harcama Geçmişi</CardTitle>
                <CardDescription>
                  Tüm harcama işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">PC Kullanımı - PC #12</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(), 'PP - HH:mm', { locale: tr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-₺25.00</p>
                      <p className="text-sm text-muted-foreground">2.5 Saat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4: // Hizmetler
        return (
          <Card>
            <CardHeader>
              <CardTitle>Satın Alınan Hizmetler</CardTitle>
              <CardDescription>
                Cafe'de kullandığınız ek hizmetler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Cola (330ml)</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(), 'PP - HH:mm', { locale: tr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-₺15.00</p>
                    <p className="text-sm text-muted-foreground">Nakit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 5: // Bildirimler
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>
                Bildirim ve duyuru tercihlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Düşük Bakiye Uyarısı</p>
                    <p className="text-sm text-muted-foreground">
                      Bakiyeniz 20₺'nin altına düştüğünde bildirim alın
                    </p>
                  </div>
                  <Button variant="outline">Aktif</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Kampanya Bildirimleri</p>
                    <p className="text-sm text-muted-foreground">
                      Yeni kampanya ve indirimlerden haberdar olun
                    </p>
                  </div>
                  <Button variant="outline">Aktif</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Turnuva Duyuruları</p>
                    <p className="text-sm text-muted-foreground">
                      Düzenlenen turnuvalardan haberdar olun
                    </p>
                  </div>
                  <Button variant="outline">Aktif</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil Ayarları</h1>
          <p className="text-muted-foreground">Hesap bilgilerinizi yönetin</p>
        </div>
      </div>

      <ExpandableTabs 
        tabs={tabs} 
        onChange={setActiveTab}
        activeColor="text-primary"
      />

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  )
}
