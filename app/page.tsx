"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Shield, AlertTriangle, Bug, Cookie, Lock, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CryptoJS from "crypto-js"

interface HackerLog {
  timestamp: string
  action: string
  result: string
  status: "success" | "blocked" | "encrypted"
}

export default function CookieSecurityDemo() {
  const [cookieName, setCookieName] = useState("session_token")
  const [cookieValue, setCookieValue] = useState("admin12345")
  const [httpOnly, setHttpOnly] = useState(false)
  const [aesEncryption, setAesEncryption] = useState(false)
  const [xssCode, setXssCode] = useState('document.cookie')
  const [hackerLogs, setHackerLogs] = useState<HackerLog[]>([])
  const [xssProtection, setXssProtection] = useState(false)
  const [inputSanitization, setInputSanitization] = useState(false)
  const [cspEnabled, setCspEnabled] = useState(false)
  const { toast } = useToast()

  // Khóa bí mật cố định để mã hóa AES
  const SECRET_KEY = "MySecretKey12345"

  // Hàm mã hóa AES
  const encryptValue = (value: string): string => {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString()
    return `AES:${encrypted}`
  }

  // Hàm sanitize input để ngăn XSS
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/alert\s*\(/gi, 'BLOCKED_ALERT(')
      .replace(/script/gi, 'BLOCKED_SCRIPT')
      .replace(/javascript:/gi, 'BLOCKED_JS:')
      .replace(/eval\s*\(/gi, 'BLOCKED_EVAL(')
      .replace(/document\.cookie/gi, 'BLOCKED_COOKIE_ACCESS')
  }

  // Hàm kiểm tra XSS patterns
  const detectXSS = (input: string): boolean => {
    const xssPatterns = [
      /alert\s*\(/i,
      /<script/i,
      /javascript:/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /innerHTML/i,
      /outerHTML/i
    ]
    
    return xssPatterns.some(pattern => pattern.test(input))
  }

  // Hàm tạo cookie với các biện pháp bảo vệ
  const createCookie = () => {
    try {
      let finalValue = cookieValue
      
      // Mã hóa nếu được chọn
      if (aesEncryption) {
        finalValue = encryptValue(cookieValue)
      }

      // Tạo cookie với các thuộc tính bảo vệ
      let cookieString = `${cookieName}=${finalValue}; path=/; SameSite=Lax`
      
      if (httpOnly) {
        // Lưu ý: HttpOnly không thể được set từ JavaScript phía client
        // Chúng ta sẽ mô phỏng bằng cách không cho phép đọc cookie này
        cookieString += "; HttpOnly"
        // Lưu trữ thông tin HttpOnly trong sessionStorage để kiểm tra
        sessionStorage.setItem(`${cookieName}_httponly`, "true")
      } else {
        sessionStorage.removeItem(`${cookieName}_httponly`)
      }

      // Set cookie (không bao gồm HttpOnly vì JavaScript không thể set HttpOnly)
      document.cookie = `${cookieName}=${finalValue}; path=/; SameSite=Lax`

      toast({
        title: "✅ Cookie đã được tạo",
        description: `Cookie "${cookieName}" đã được tạo với các biện pháp bảo vệ${httpOnly ? " HttpOnly" : ""}${aesEncryption ? " và mã hóa AES" : ""}.`,
      })

      // Log việc tạo cookie
      const newLog: HackerLog = {
        timestamp: new Date().toLocaleTimeString(),
        action: `Tạo cookie: ${cookieName}`,
        result: `Giá trị: ${finalValue}${httpOnly ? " (HttpOnly)" : ""}`,
        status: "success"
      }
      setHackerLogs(prev => [newLog, ...prev])

    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể tạo cookie",
        variant: "destructive"
      })
    }
  }

  // Hàm mô phỏng thực thi XSS với bảo vệ
  const executeXSS = () => {
    try {
      const timestamp = new Date().toLocaleTimeString()
      let processedCode = xssCode

      // Kiểm tra XSS Protection
      if (xssProtection && detectXSS(xssCode)) {
        const newLog: HackerLog = {
          timestamp,
          action: "Cố gắng thực thi XSS",
          result: "🛡️ CHẶN - XSS Protection đã phát hiện mã độc hại!",
          status: "blocked"
        }
        setHackerLogs(prev => [newLog, ...prev])
        
        toast({
          title: "🛡️ XSS bị chặn!",
          description: "XSS Protection đã phát hiện và chặn mã độc hại",
        })
        return
      }

      // Áp dụng Input Sanitization nếu được bật
      if (inputSanitization) {
        processedCode = sanitizeInput(xssCode)
        
        if (processedCode !== xssCode) {
          const newLog: HackerLog = {
            timestamp,
            action: "Input được sanitize",
            result: `🧹 Đã làm sạch: ${processedCode}`,
            status: "blocked"
          }
          setHackerLogs(prev => [newLog, ...prev])
        }
      }

      // CSP Protection (mô phỏng)
      if (cspEnabled && (processedCode.toLowerCase().includes('alert') || processedCode.toLowerCase().includes('script'))) {
        const newLog: HackerLog = {
          timestamp,
          action: "CSP Protection",
          result: "🛡️ Content Security Policy đã chặn thực thi script",
          status: "blocked"
        }
        setHackerLogs(prev => [newLog, ...prev])
        
        toast({
          title: "🛡️ CSP Protection",
          description: "Content Security Policy đã chặn script độc hại",
        })
        return
      }
      
      // Kiểm tra xem có phải là lệnh đọc cookie không
      if (processedCode.toLowerCase().includes('document.cookie')) {
        const isHttpOnly = sessionStorage.getItem(`${cookieName}_httponly`) === "true"
        
        if (isHttpOnly) {
          // Mô phỏng HttpOnly - không thể đọc cookie
          const newLog: HackerLog = {
            timestamp,
            action: "Cố gắng đọc cookie với XSS",
            result: "⛔ Không lấy được - Cookie được bảo vệ bởi HttpOnly",
            status: "blocked"
          }
          setHackerLogs(prev => [newLog, ...prev])
          
          toast({
            title: "🛡️ Tấn công bị chặn",
            description: "HttpOnly đã ngăn chặn việc đọc cookie!",
          })
        } else {
          // Đọc cookie thành công
          const cookies = document.cookie
          const targetCookie = cookies.split(';').find(c => c.trim().startsWith(`${cookieName}=`))
          
          if (targetCookie) {
            const cookieVal = targetCookie.split('=')[1]
            let status: "success" | "encrypted" = "success"
            let result = `🚨 Lấy được cookie: ${cookieVal}`
            
            if (cookieVal.startsWith('AES:')) {
              status = "encrypted"
              result = `🔐 Lấy được cookie mã hóa: ${cookieVal}`
            }
            
            const newLog: HackerLog = {
              timestamp,
              action: "Thực thi XSS: " + processedCode,
              result,
              status
            }
            setHackerLogs(prev => [newLog, ...prev])
            
            toast({
              title: status === "encrypted" ? "⚠️ Cookie bị lộ (nhưng đã mã hóa)" : "🚨 Cookie bị lộ",
              description: status === "encrypted" ? "Hacker lấy được cookie nhưng không đọc được do mã hóa" : "Hacker đã lấy được cookie không bảo vệ!",
              variant: status === "encrypted" ? "default" : "destructive"
            })
          } else {
            const newLog: HackerLog = {
              timestamp,
              action: "Cố gắng đọc cookie",
              result: "Không tìm thấy cookie",
              status: "blocked"
            }
            setHackerLogs(prev => [newLog, ...prev])
          }
        }
      } else {
        // Thực thi code JavaScript khác
        try {
          const result = eval(processedCode)
          const newLog: HackerLog = {
            timestamp,
            action: "Thực thi XSS: " + processedCode,
            result: `Kết quả: ${result || "undefined"}`,
            status: "success"
          }
          setHackerLogs(prev => [newLog, ...prev])
          
          // Hiển thị cảnh báo nếu là alert
          if (processedCode.toLowerCase().includes('alert') && !xssProtection && !cspEnabled) {
            toast({
              title: "🚨 XSS Attack thành công!",
              description: "Alert đã được thực thi - trang web dễ bị tấn công XSS!",
              variant: "destructive"
            })
          }
        } catch (err) {
          const newLog: HackerLog = {
            timestamp,
            action: "Thực thi XSS: " + processedCode,
            result: `Lỗi: ${err}`,
            status: "blocked"
          }
          setHackerLogs(prev => [newLog, ...prev])
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi XSS",
        description: "Không thể thực thi code",
        variant: "destructive"
      })
    }
  }

  const clearLogs = () => {
    setHackerLogs([])
    toast({
      title: "📝 Đã xóa nhật ký",
      description: "Tất cả nhật ký hacker đã được xóa"
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8" />
          Cookie Security Demo
        </h1>
        <p className="text-muted-foreground">
          Mô phỏng tấn công XSS lấy cookie và các biện pháp bảo vệ
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Khu vực 1: Tạo Cookie (Phòng thủ) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Khu vực Phòng thủ
            </CardTitle>
            <CardDescription>
              Tạo cookie với các biện pháp bảo vệ khác nhau
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cookie-name">Tên Cookie</Label>
              <Input
                id="cookie-name"
                value={cookieName}
                onChange={(e) => setCookieName(e.target.value)}
                placeholder="session_token"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookie-value">Giá trị Cookie</Label>
              <Input
                id="cookie-value"
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
                placeholder="admin12345"
              />
            </div>

            <div className="space-y-3">
              <Label>Biện pháp bảo vệ:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="httponly"
                  checked={httpOnly}
                  onCheckedChange={(checked) => setHttpOnly(checked as boolean)}
                />
                <Label htmlFor="httponly" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Bảo vệ bằng HttpOnly
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aes"
                  checked={aesEncryption}
                  onCheckedChange={(checked) => setAesEncryption(checked as boolean)}
                />
                <Label htmlFor="aes" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Bảo vệ bằng Mã hóa AES
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="xss-protection"
                  checked={xssProtection}
                  onCheckedChange={(checked) => setXssProtection(checked as boolean)}
                />
                <Label htmlFor="xss-protection" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  XSS Protection
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="input-sanitization"
                  checked={inputSanitization}
                  onCheckedChange={(checked) => setInputSanitization(checked as boolean)}
                />
                <Label htmlFor="input-sanitization" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Input Sanitization
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="csp"
                  checked={cspEnabled}
                  onCheckedChange={(checked) => setCspEnabled(checked as boolean)}
                />
                <Label htmlFor="csp" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Content Security Policy
                </Label>
              </div>
            </div>

            <Button 
              onClick={createCookie} 
              className="w-full"
              variant="default"
            >
              <Cookie className="h-4 w-4 mr-2" />
              Tạo Cookie
            </Button>

            {(httpOnly || aesEncryption || xssProtection || inputSanitization || cspEnabled) && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {httpOnly && "HttpOnly: Ngăn JavaScript đọc cookie. "}
                  {aesEncryption && "AES: Mã hóa giá trị cookie. "}
                  {xssProtection && "XSS Protection: Phát hiện và chặn mã độc hại. "}
                  {inputSanitization && "Input Sanitization: Làm sạch input độc hại. "}
                  {cspEnabled && "CSP: Chặn thực thi script không được phép. "}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Khu vực 2: Mô phỏng Tấn công (Hacker) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Khu vực Tấn công
            </CardTitle>
            <CardDescription>
              Mô phỏng tấn công XSS để lấy cookie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xss-code">Ô bình luận (Giả lập XSS)</Label>
              <Textarea
                id="xss-code"
                value={xssCode}
                onChange={(e) => setXssCode(e.target.value)}
                placeholder="document.cookie"
                className="font-mono text-sm"
                rows={4}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Ví dụ tấn công:</strong></p>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setXssCode('alert("XSS Attack!")')}>
                    Alert Attack
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setXssCode('document.cookie')}>
                    Cookie Theft  
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setXssCode('<script>alert("XSS")</script>')}>
                    Script Tag
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={executeXSS} 
              variant="destructive" 
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Đăng bình luận (Thực thi XSS)
            </Button>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo:</strong> Khu vực này mô phỏng lỗ hổng XSS. 
                Code JavaScript sẽ được thực thi!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Ví dụ tấn công:</Label>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setXssCode('document.cookie')}
                  className="text-xs"
                >
                  Lấy cookie
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setXssCode('alert("XSS Attack!")')}
                  className="text-xs ml-2"
                >
                  Hiển thị popup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Khu vực 3: Nhật ký Hacker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Nhật ký của Hacker
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
            >
              Xóa nhật ký
            </Button>
          </CardTitle>
          <CardDescription>
            Theo dõi các hoạt động tấn công và kết quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hackerLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có hoạt động nào được ghi lại
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {hackerLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    log.status === 'success' 
                      ? 'border-red-500 bg-red-50' 
                      : log.status === 'encrypted'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        log.status === 'success' 
                          ? 'destructive' 
                          : log.status === 'encrypted'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {log.timestamp}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        log.status === 'success' 
                          ? 'border-red-500 text-red-700' 
                          : log.status === 'encrypted'
                          ? 'border-yellow-500 text-yellow-700'
                          : 'border-green-500 text-green-700'
                      }
                    >
                      {log.status === 'success' ? '🚨 Thành công' : 
                       log.status === 'encrypted' ? '🔐 Mã hóa' : '🛡️ Bị chặn'}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">{log.action}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {log.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
