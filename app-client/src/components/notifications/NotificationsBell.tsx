'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationStore } from '@/store/notification'

export function NotificationsBell() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore()

  const [isOpen, setIsOpen] = useState(false)

  // Buscar notificações na inicialização e a cada 30 segundos
  useEffect(() => {
    fetchNotifications()
    
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    // Assumindo que temos acesso ao usuário atual, por enquanto vou usar um ID fixo
    // Em uma implementação real, isso viria de um contexto de autenticação
    await markAllAsRead(1) // TODO: Obter ID do usuário atual
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMin = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMin < 1) return 'Agora'
    if (diffInMin < 60) return `${diffInMin}min`
    if (diffInMin < 1440) return `${Math.floor(diffInMin / 60)}h`
    return `${Math.floor(diffInMin / 1440)}d`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          disabled={loading}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notificações</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-auto p-1"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                {unreadCount} nova{unreadCount !== 1 ? 's' : ''} notificaç{unreadCount !== 1 ? 'ões' : 'ão'}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificação encontrada
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg mt-1">
                          {getNotificationIcon(notification.type || 'info')}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-auto p-1 opacity-60 hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {notification.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(notification.created_at || new Date().toISOString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}