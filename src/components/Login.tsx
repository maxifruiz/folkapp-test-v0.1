import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

export const Login = ({ onLogin, onRegister }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [instagram, setInstagram] = useState('@');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        localStorage.setItem(
          'pendingProfile',
          JSON.stringify({ fullName, birthdate, instagram, email })
        );

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
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-folkiCream to-white px-4 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          // Elimino el key para que no se reinicien los inputs al cambiar estado interno
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="backdrop-blur-xl bg-white/80 p-6 rounded-xl shadow-2xl w-full max-w-md border border-folkiAmber"
        >
          {showConfirmation ? (
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
                      placeholder="Nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                    />
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
                    />
                    <input
                      type="text"
                      placeholder="@instagram"
                      value={instagram}
                      onChange={(e) =>
                        setInstagram(
                          e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`
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
