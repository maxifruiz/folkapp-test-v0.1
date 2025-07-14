import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

export const Login = ({ onLogin, onRegister }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [instagram, setInstagram] = useState('@');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setBirthdate('');
    setInstagram('@');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isRegistering) {
      const success = await onRegister({ email, password, fullName, birthdate, instagram });
      if (success) {
        resetForm();
        setTimeout(() => {
          setShowConfirmation(true);
          setIsSubmitting(false);
        }, 300);
      } else {
        setIsSubmitting(false);
        alert('Error al registrarse. Verificá los datos.');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        alert('Completá email y contraseña antes de ingresar.');
        setIsSubmitting(false);
        return;
      }

      const success = await onLogin(email, password);
      setIsSubmitting(false);
      if (!success) {
        alert('Error al ingresar. Verificá tus credenciales.');
      }
    }
  };

  const handleBackToLogin = () => {
    setShowConfirmation(false);
    setIsRegistering(false);
    setShowResetForm(false);
    setResetSent(false);
    setResetError('');
    setResetEmail('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/?resetpassword=1',
      });
      if (error) throw error;
      setResetSent(true);
    } catch (error: any) {
      setResetError(error.message || 'Error al enviar el correo.');
    }
    setResetLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-folkiCream to-white px-4 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="backdrop-blur-xl bg-white/80 p-6 rounded-xl shadow-2xl w-full max-w-md border border-folkiAmber relative"
        >
          {showResetForm ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-folkiRed text-center">Recuperar contraseña</h2>

              {resetSent ? (
                <div className="space-y-4 text-center">
                  <p className="text-green-600">
                    Te enviamos un correo con las instrucciones para recuperar tu contraseña.
                    Revisá tu bandeja de entrada (y spam).
                  </p>
                  <button
                    onClick={handleBackToLogin}
                    className="bg-folkiRed text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Aceptar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Tu email registrado"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                  />
                  {resetError && <p className="text-red-600">{resetError}</p>}
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-folkiRed hover:underline"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className={`bg-folkiRed text-white px-4 py-2 rounded-lg hover:bg-red-700 transition ${
                        resetLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {resetLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : showConfirmation ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex justify-center"
              >
                <FaCheckCircle className="text-green-500 text-6xl" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-600">¡Gracias por registrarte!</h2>
              <p className="text-gray-700">
                Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja de entrada.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToLogin}
                className="bg-folkiRed text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Aceptar
              </motion.button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 text-folkiRed">
                {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <>
                    <input
                      type="text"
                      placeholder="Nombre y apellido (visible en la app)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                    />
                    <input
                      type="date"
                      placeholder="Fecha de nacimiento "
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                    />
                    <input
                      type="text"
                      placeholder="usuario @instagram (sin arroba)"
                      value={instagram.replace('@', '')}
                      onChange={(e) => setInstagram(`@${e.target.value}`
                        )
                      }
                      required
                      className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                />
                <input
                  type="password"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                />

                {!isRegistering && (
                  <p
                    className="text-right text-sm text-folkiRed underline cursor-pointer select-none"
                    onClick={() => setShowResetForm(true)}
                  >
                    ¿Olvidaste tu contraseña? Recuperá contraseña
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md ${
                    isRegistering
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-folkiRed hover:bg-red-800'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRegistering
                    ? isSubmitting
                      ? 'Registrando...'
                      : 'Registrarse'
                    : isSubmitting
                    ? 'Ingresando...'
                    : 'Ingresar'}
                </motion.button>
              </form>

              <p className="mt-4 text-sm text-center">
                {isRegistering ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
                <button
                  className="text-folkiRed hover:underline"
                  onClick={() => setIsRegistering(!isRegistering)}
                  type="button"
                >
                  {isRegistering ? 'Iniciar sesión' : 'Registrarse'}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
