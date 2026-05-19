import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Alert } from '@/components/Common';


interface LoginFormData {
  identifier: string;
  password: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data.identifier, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <Alert type="error">{submitError}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Email hoặc mã tài khoản"
        type="text"
        placeholder="sv001@truongdaihoc.edu.vn hoặc sv001"
        error={errors.identifier?.message}
        {...register('identifier', {
          required: 'Identifier is required',
          validate: (value) => (value?.trim().length ? true : 'Identifier is required'),
        })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign up
        </Link>
      </div>
    </form>
  );
}
