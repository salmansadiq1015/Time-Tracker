'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthContent } from '../context/authContext';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthContent();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/login`, {
        phone: phone.trim(),
        password,
      });

      if (data.success) {
        localStorage.setItem('Ttoken', data.token);
        localStorage.setItem('Tuser', JSON.stringify(data.user));
        setAuth((prev) => ({ ...prev, token: data.token, user: data.user }));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        router.push(
          data.user.role === 'admin' || data.user.role === 'dispatcher'
            ? '/dashboard/users'
            : data.user.role === 'client'
            ? '/dashboard/projects'
            : '/dashboard/time-tracker'
        );
        toast.success('Login Successful');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred. Please try again.');
      console.log(err);
      toast.error(err?.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-t-br from-background via-background to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 group cursor-pointer transition-transform duration-300 hover:scale-105">
            <div className="p-2.5 bg-gradient-t-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-600/70 bg-clip-text text-transparent">
                TimeTrack
              </span>
              <p className="text-xs text-muted-foreground font-medium">
                Professional Time Management
              </p>
            </div>
          </div>
        </div> */}

        <Card className="border border-[#C16840] shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-3 pb-6 w-full">
            <div className="flex items-center justify-center w-full">
              <Image
                src="/s_notext.png"
                alt="logo"
                width={70}
                height={70}
                className="object-contain  drop-shadow-lg hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-balance text-center text-black">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2 text-center text-gray-600">
                Sign in with your phone number to continue tracking your time
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                <div className="relative group">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-input border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pl-4 h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                  {/* <a
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </a> */}
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pl-4 pr-12 h-11 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border/50 bg-input cursor-pointer accent-primary"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C16840] from-[#C16840] to-[#C16840]/90 hover:from-[#C16840]/90 hover:to-[#C16840]/80 text-white font-semibold h-11 text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    className="text-[#C16840] hover:text-primary/80 font-semibold transition-colors"
                  >
                    Sign up
                  </a>
                </p>
              </div> */}
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
