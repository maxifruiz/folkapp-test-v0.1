// components/OnboardingTour.tsx
import { useEffect, useState } from 'react';
import Joyride from 'react-joyride';
import { useUser } from '@supabase/auth-helpers-react';

const OnboardingTour = () => {
  const user = useUser();
  const [run, setRun] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const storageKey = `folki_onboarding_done_${user.id}`;
    const alreadySeen = localStorage.getItem(storageKey);

    if (!alreadySeen) {
      setRun(true);
    }

    setChecked(true);
  }, [user]);

  const steps = [
    {
      target: '.icon-cartelera',
      content: 'Acá verás todos los eventos publicados por los usuarios.',
    },
    {
      target: '.icon-calendario',
      content: 'Desde aquí accedés al calendario con todos los eventos.',
    },
    {
      target: '.icon-perfil',
      content: 'Este es tu perfil, donde gestionás tus publicaciones.',
    },
    {
      target: '.icon-notificaciones',
      content: 'Aquí llegan los likes y asistencias a tus eventos.',
    },
    {
      target: 'body',
      content: '¡Listo! Ya podés disfrutar de Folki App 🎉',
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finished = status === 'finished' || status === 'skipped';

    if (finished && user) {
      setRun(false);
      localStorage.setItem(`folki_onboarding_done_${user.id}`, 'true');
    }
  };

  if (!checked) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      showProgress
      showSkipButton
      continuous
      styles={{
        options: {
          zIndex: 9999,
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default OnboardingTour;
