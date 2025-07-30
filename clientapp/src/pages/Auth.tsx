import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoginRequest, RegisterRequest, AuthError, AuthFieldError } from "@/types/api.types";
import { ErrorDisplay } from "./auth/components/ErrorDisplay";
import { FormField } from "./auth/components/FormField";
import { parseAuthError, validateAuthForm, formatPhoneNumber } from "@/utils/error.util";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'nailmaster'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    phone: ""
  });
  
  // Состояние для ошибок
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldError[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const { login, register } = useAuth();
  const { toast } = useToast();

  // Получаем путь, на который нужно перенаправить после входа
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("message");
    if (msg) setRedirectMessage(msg);
    else setRedirectMessage(null);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Очистка предыдущих ошибок
    setAuthError(null);
    setFieldErrors([]);
    
    // Валидация формы на клиенте
    const validationErrors = validateAuthForm(formData, isLogin);
    if (validationErrors.length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        // Авторизация
        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password
        };

        await login(loginData);

        toast({
          title: "Добро пожаловать!",
          description: "Вы успешно вошли в систему.",
        });

        // Перенаправляем на исходную страницу или на главную
        navigate(from, { replace: true });
      } else {
        // Регистрация
        const registerData: RegisterRequest = {
          email: formData.email,
          username: formData.username || formData.email,
          password: formData.password,
          role: userType,
          fullName: formData.fullName,
          phone: formData.phone
        };

        await register(registerData);

        toast({
          title: "Добро пожаловать!",
          description: `Вы успешно зарегистрировались как ${userType === 'client' ? 'клиент' : 'мастер'}.`,
        });

        // Перенаправляем в зависимости от роли
        if (userType === 'client') {
          navigate("/profile", { replace: true });
        } else {
          navigate("/master-dashboard", { replace: true });
        }
      }
    } catch (error: any) {
      // Парсим ошибку и отображаем в UI
      const parsedError = parseAuthError(error);
      setAuthError(parsedError);
      
      // Также показываем toast для важных ошибок
      if (parsedError.code === 'SERVER_ERROR' || parsedError.code === 'NETWORK_ERROR') {
        toast({
          title: "Ошибка",
          description: parsedError.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Очищаем ошибки для поля при изменении
    setFieldErrors(prev => prev.filter(error => error.field !== field));
    setAuthError(null);
    
    // Форматируем телефон при вводе
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Очистка ошибок при смене типа формы
  const handleFormTypeChange = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
    setFieldErrors([]);
    setFormData({
      email: "",
      password: "",
      username: "",
      fullName: "",
      phone: ""
    });
  };

  // Очистка всех ошибок
  const clearAllErrors = () => {
    setAuthError(null);
    setFieldErrors([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{isLogin ? "Вход" : "Регистрация"}</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-md mx-auto p-6">
        {redirectMessage && (
          <Alert className="mb-4 border-primary/20 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {redirectMessage}
            </AlertDescription>
          </Alert>
        )}
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">NailMasters</CardTitle>
            <CardDescription>
              {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Отображение ошибок */}
            <ErrorDisplay 
              error={authError}
              fieldErrors={fieldErrors}
              onDismiss={clearAllErrors}
              className="mb-4"
            />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label>Тип аккаунта</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === 'client' ? 'default' : 'outline'}
                        onClick={() => setUserType('client')}
                        className="w-full"
                        disabled={isLoading}
                      >
                        Клиент
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'nailmaster' ? 'default' : 'outline'}
                        onClick={() => setUserType('nailmaster')}
                        className="w-full"
                        disabled={isLoading}
                      >
                        Мастер
                      </Button>
                    </div>
                  </div>

                  <FormField
                    id="fullName"
                    label="Полное имя"
                    placeholder="Введите ваше полное имя"
                    value={formData.fullName}
                    onChange={(value) => handleInputChange("fullName", value)}
                    required={!isLogin}
                    disabled={isLoading}
                    fieldErrors={fieldErrors}
                  />

                  <FormField
                    id="username"
                    label="Имя пользователя"
                    placeholder="Введите имя пользователя (необязательно)"
                    value={formData.username}
                    onChange={(value) => handleInputChange("username", value)}
                    disabled={isLoading}
                    fieldErrors={fieldErrors}
                  />
                </>
              )}

              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="Введите email"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                required
                disabled={isLoading}
                fieldErrors={fieldErrors}
              />

              {!isLogin && (
                <FormField
                  id="phone"
                  label="Телефон"
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  disabled={isLoading}
                  fieldErrors={fieldErrors}
                />
              )}

              <FormField
                id="password"
                label="Пароль"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                required
                disabled={isLoading}
                fieldErrors={fieldErrors}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </FormField>

              <Button 
                type="submit" 
                className="w-full gradient-bg text-white"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLogin ? "Вход..." : "Регистрация...") 
                  : (isLogin ? "Войти" : "Зарегистрироваться")
                }
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                </p>
                <Button
                  variant="link"
                  onClick={handleFormTypeChange}
                  disabled={isLoading}
                >
                  {isLogin ? "Зарегистрироваться" : "Войти"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
