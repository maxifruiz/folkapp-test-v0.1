import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Cambié access_token por token (que es el que usa Supabase)
  const accessToken = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!accessToken) {
      setErrorMsg('Token inválido o expirado. Volvé a solicitar recuperar contraseña.');
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (!accessToken) {
      setErrorMsg('Token inválido. No se puede cambiar la contraseña.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.api.updateUser(accessToken, {
      password: newPassword,
    });

    if (error) {
      setErrorMsg('Error al actualizar la contraseña: ' + error.message);
      setIsSubmitting(false);
    } else {
      setSuccessMsg('Contraseña actualizada correctamente. Ahora podés iniciar sesión.');
      setIsSubmitting(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-folkiCream to-white px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="backdrop-blur-xl bg-white/80 p-6 rounded-xl shadow-2xl w-full max-w-md border border-folkiAmber"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-folkiRed">Restablecer contraseña</h2>

        {errorMsg && <p className="text-red-600 mb-4 text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 mb-4 text-center">{successMsg}</p>}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-folkiAmber rounded-lg focus:outline-none focus:ring-2 focus:ring-folkiAmber"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md bg-folkiRed hover:bg-red-800 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
