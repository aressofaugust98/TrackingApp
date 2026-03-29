import React, { useState } from 'react';
import { logIn } from '../services/authService';

const LoginPage = ({ onRegister, onForgot, onSignIn, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      const response = await logIn({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log('LOGIN RESPONSE:', response);
      if (response?.token) {
        localStorage.setItem('accessToken', response.token);
      }

      if (onLoginSuccess) onLoginSuccess(response);
      if (onSignIn) onSignIn(response);
    } catch (submitError) {
      setError(submitError.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            F
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-600">Đăng nhập để tiếp tục quản lý tài chính</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="peer w-full rounded-lg border border-gray-200 bg-white px-4 pt-4 pb-2 text-gray-900 placeholder-transparent shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="peer w-full rounded-lg border border-gray-200 bg-white px-4 pt-4 pb-2 text-gray-900 placeholder-transparent shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Mật khẩu"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
              >
                Mật khẩu
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onRegister}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Đăng ký
            </button>
            <button
              type="button"
              onClick={onForgot}
              className="text-gray-600 hover:text-indigo-600"
            >
              Quên mật khẩu?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
