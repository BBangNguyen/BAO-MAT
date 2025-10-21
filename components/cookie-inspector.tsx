"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cookie, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CookieInfo {
  name: string
  value: string
  isHttpOnly: boolean
  isEncrypted: boolean
}

export default function CookieInspector() {
  const [cookies, setCookies] = useState<CookieInfo[]>([])

  const refreshCookies = () => {
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim())
    const cookiesInfo: CookieInfo[] = []
    
    allCookies.forEach(cookie => {
      if (cookie) {
        const [name, value] = cookie.split('=')
        const isEncrypted = value?.startsWith('AES:') || false
        const isHttpOnly = sessionStorage.getItem(`${name}_httponly`) === "true"
        
        cookiesInfo.push({
          name,
          value,
          isHttpOnly,
          isEncrypted
        })
      }
    })
    
    setCookies(cookiesInfo)
  }

  useEffect(() => {
    refreshCookies()
    
    // Định kỳ làm mới cookie mỗi 3 giây
    const interval = setInterval(refreshCookies, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-blue-600" />
          Cookie Inspector
        </CardTitle>
        <CardDescription>
          Theo dõi các cookie trong trình duyệt
        </CardDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshCookies}
          className="absolute top-4 right-4"
        >
          Làm mới
        </Button>
      </CardHeader>
      <CardContent>
        {cookies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có cookie nào được tìm thấy
          </div>
        ) : (
          <div className="space-y-3">
            {cookies.map((cookie, index) => (
              <div key={index} className="flex flex-col p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{cookie.name}</span>
                  <div className="space-x-2">
                    {cookie.isHttpOnly && (
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        HttpOnly
                      </Badge>
                    )}
                    {cookie.isEncrypted && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        Mã hóa
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 break-all">
                  {cookie.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}