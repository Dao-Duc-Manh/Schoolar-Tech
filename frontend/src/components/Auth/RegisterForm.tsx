import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Alert } from '@/components/Common';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SCHOOL_DOMAIN = '@truongdaihoc.edu.vn';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailLocalError, setEmailLocalError] = useState<string | null>(null);
  const password = watch('password');

  const validateSchoolEmail = (value: string) => {
    if (!value) return 'Email bắt buộc.';
    if (!value.endsWith(SCHOOL_DOMAIN)) {
      return `Chỉ chấp nhận email do Trường cấp (${SCHOOL_DOMAIN}).`;
    }
    return null;
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setEmailLocalError(validateSchoolEmail(e.target.value) || '');
  };

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    const emailErr = validateSchoolEmail(data.email);
    if (emailErr) {
      setEmailLocalError(emailErr);
      return;
    }
    try {
      await registerUser(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <Alert type="error">{submitError}</Alert>}

      <Input
        label="Họ và tên"
        type="text"
        placeholder="Nguyễn Văn An"
        error={errors.fullName?.message}
        {...register('fullName', {
          required: 'Họ tên bắt buộc.',
          minLength: {
            value: 2,
            message: 'Họ tên phải từ 2 ký tự trở lên.',
          },
        })}
      />

      <Input
        label="Email trường cấp"
        type="email"
        placeholder="ten@truongdaihoc.edu.vn"
        error={emailLocalError || errors.email?.message}
        {...register('email', {
          required: 'Email bắt buộc.',
          onBlur: handleEmailBlur,
        })}
      />
      {emailLocalError && (
        <p className="text-xs text-tertiary mt-1 ml-1">
          Liên hệ phòng đào tạo nếu chưa có tài khoản.
        </p>
      )}

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        error={errors.password?.message}
        {...register('password', {
          required: 'Mật khẩu bắt buộc.',
          minLength: {
            value: 6,
            message: 'Mật khẩu tối thiểu 6 ký tự.',
          },
        })}
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Xác nhận mật khẩu bắt buộc.',
          validate: (value) => value === password || 'Mật khẩu không khớp.',
        })}
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}