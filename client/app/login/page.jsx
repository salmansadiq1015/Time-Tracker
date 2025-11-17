'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
  const [forgotOpen, setForgotOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"
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

        <Card className="border border-gray-700/50 shadow-2xl backdrop-blur-sm bg-[#1e2339]">
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
              <CardTitle className="text-3xl font-bold text-balance text-center text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2 text-center text-gray-400">
                Sign in with your phone number to continue tracking your time
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-500/10"
                >
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white">Phone Number</label>
                <div className="relative group">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-[#0f1419] border border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 pl-4 h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#0f1419] border border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 pl-4 pr-12 h-11 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
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
                  className="w-4 h-4 rounded border-gray-600 bg-[#0f1419] cursor-pointer accent-gray-500"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 font-semibold h-11 text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
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

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>

      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        initialPhone={phone}
      />
    </div>
  );
}

function ForgotPasswordDialog({ open, onOpenChange, initialPhone }) {
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [step, setStep] = useState('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    if (open) {
      setPhone(initialPhone ?? '');
      setStep('request');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setResendCooldown(0);
    }
  }, [open, initialPhone]);

  useEffect(() => {
    if (!open || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown, open]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!serverUrl) {
      setError('Server URL is not configured.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your registered phone number.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/auth/forgot-password`, {
        phone: phone.trim(),
      });
      toast.success('Reset code sent. Check your SMS messages.');
      setStep('verify');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset code. Please try again.');
      toast.error(err?.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');

    if (!serverUrl) {
      setError('Server URL is not configured.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your registered phone number.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/auth/forgot-password`, {
        phone: phone.trim(),
      });
      toast.success('A new reset code has been sent.');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend code. Please try again.');
      toast.error(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!serverUrl) {
      setError('Server URL is not configured.');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your phone.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/auth/reset-password`, {
        token: code.trim(),
        newPassword,
      });
      toast.success('Password updated successfully. You can now sign in.');
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
      toast.error(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1e2339] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Reset your password</DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 'request'
              ? 'Enter your registered phone number to receive a reset code via SMS.'
              : 'Enter the code sent to your phone and choose a new password.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Phone number</label>
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  'Send code'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Verification code
              </label>
              <InputOTP
                value={code}
                onChange={(value) => setCode(value)}
                maxLength={6}
                containerClassName="justify-start"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="text-xs text-gray-400">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || resendCooldown > 0}
                  className="text-gray-400 hover:text-gray-300 font-medium disabled:opacity-60"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">New password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Confirm password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
