import React, { useEffect } from "react";

type LegalModalProps = {
  open: boolean;
  onClose: () => void;
  type: "privacidad" | "terminos";
};

const LegalModal: React.FC<LegalModalProps> = ({ open, onClose, type }) => {
  const isPrivacidad = type === "privacidad";

  // Cerrar con ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fef8e6] text-[#1f1f1f] border-2 border-[#7f1d1d] rounded-2xl shadow-2xl w-full max-w-xl max-h-[70vh] overflow-y-auto p-6 animate-slide-up relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#7f1d1d] hover:text-black text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-[#7f1d1d]">
          {isPrivacidad ? "POLÍTICA DE PRIVACIDAD" : "TÉRMINOS Y CONDICIONES DE USO"}
        </h2>

        <div className="space-y-4 text-[12px] text-left">
          {isPrivacidad ? (
            <>
              <p><strong>1. INTRODUCCIÓN</strong><br />
              En Folki App nos comprometemos a proteger la privacidad de nuestros usuarios conforme a la Ley 25.326 de Protección de los Datos Personales (Argentina).  
              La presente política describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos personales que nos son proporcionados.</p>

              <p><strong>2. DATOS RECOPILADOS</strong><br />
              Al registrarse y utilizar la aplicación, recopilamos los siguientes datos personales:<br />
              • Nombre completo<br />
              • Correo electrónico<br />
              • Fecha de nacimiento<br />
              • Usuario de Instagram (opcional)<br />
              • Foto de perfil (opcional)</p>

              <p><strong>3. FINALIDAD DEL TRATAMIENTO</strong><br />
              Los datos son utilizados para:<br />
              • Identificación y autenticación del usuario.<br />
              • Personalización de la experiencia dentro de la app.<br />
              • Comunicación relacionada con el uso de la plataforma.<br />
              Base legal: el tratamiento de los datos se basa en el consentimiento del usuario y en la necesidad de brindar los servicios ofrecidos por Folki App.</p>

              <p><strong>4. CONFIDENCIALIDAD Y SEGURIDAD</strong><br />
              Folki App no vende, alquila ni comparte datos personales con terceros sin consentimiento del usuario.<br />
              Los datos son almacenados en servidores seguros provistos por Supabase, que cumple con estándares internacionales de protección de datos.<br />
              Se implementan medidas de seguridad adecuadas para proteger los datos contra accesos no autorizados, alteraciones o destrucción.</p>

              <p><strong>5. CONSERVACIÓN DE LOS DATOS</strong><br />
              Los datos serán almacenados mientras el usuario mantenga su cuenta activa o mientras sean necesarios para el funcionamiento de la app.<br />
              Una vez que el usuario solicite la eliminación de su cuenta, sus datos serán eliminados en un plazo no mayor a 30 días, salvo que exista una obligación legal de conservarlos.</p>

              <p><strong>6. USO POR MENORES DE EDAD</strong><br />
              La aplicación no está dirigida a menores de 13 años. En caso de detectar una cuenta perteneciente a un menor sin autorización parental, será eliminada.</p>

              <p><strong>7. DERECHOS DEL USUARIO</strong><br />
              El usuario podrá ejercer sus derechos de acceso, rectificación, eliminación y oposición enviando un correo a: <a href="mailto:eventos.folki@gmail.com" className="text-blue-600 underline">eventos.folki@gmail.com</a></p>

              <p><strong>8. CAMBIOS EN LA POLÍTICA</strong><br />
              Esta política podrá ser modificada por Folki App, notificando a los usuarios a través de la propia aplicación.</p>

              <p><strong>9. CONTACTO</strong><br />
              Para dudas o reclamos sobre esta política, podés escribirnos a: <a href="mailto:eventos.folki@gmail.com" className="text-blue-600 underline">eventos.folki@gmail.com</a></p>
            </>
          ) : (
            <>
              <p><strong>1. ACEPTACIÓN DE LOS TÉRMINOS</strong><br />
              Al acceder y utilizar Folki App, el usuario acepta de forma plena y sin reservas los presentes Términos y Condiciones. En caso de no estar de acuerdo con alguno de los puntos aquí establecidos, deberá abstenerse de utilizar la aplicación.</p>

              <p><strong>2. OBJETO</strong><br />
              Folki App es una plataforma destinada a la difusión de eventos culturales, sociales y artísticos del Folklore Argentino, permitiendo a los usuarios visualizar, compartir y publicar información sobre los mismos.</p>

              <p><strong>3. USO DE LA APLICACIÓN</strong><br />
              El usuario se compromete a utilizar la aplicación de forma lícita y responsable, absteniéndose de publicar contenido ofensivo, falso, discriminatorio o que viole derechos de terceros.<br />
              Folki App se reserva el derecho de moderar, editar o eliminar contenido que considere inapropiado, sin previo aviso.</p>

              <p><strong>4. REGISTRO Y ACCESO</strong><br />
              El acceso a la plataforma puede realizarse mediante servicios de autenticación de terceros por correo electrónico, cada dominio está sujeto a sus propios términos y políticas de privacidad.</p>

              <p><strong>5. EDAD MÍNIMA</strong><br />
              El uso de la aplicación está destinado a personas mayores de 13 años. Los menores deben contar con autorización de sus tutores legales.</p>

              <p><strong>6. SUSPENSIÓN DE CUENTAS</strong><br />
              Folki App se reserva el derecho de suspender o eliminar cuentas que violen estos términos, sin necesidad de previo aviso.</p>

              <p><strong>7. LIMITACIÓN DE RESPONSABILIDAD</strong><br />
              Folki App no garantiza la veracidad, exactitud ni disponibilidad de los eventos publicados por los usuarios. La plataforma no se responsabiliza por cancelaciones, modificaciones o cualquier inconveniente que surja en relación con los eventos.<br />
              El uso de la aplicación es bajo responsabilidad exclusiva del usuario.</p>

              <p><strong>8. PROPIEDAD INTELECTUAL</strong><br />
              Todos los derechos sobre el diseño, marca, logo, funcionalidades y el código fuente de la aplicación pertenecen a Folki App.<br />
              Los contenidos publicados por los usuarios serán responsabilidad exclusiva de los mismos, quienes garantizan que poseen los derechos necesarios para su publicación.</p>

              <p><strong>9. MODIFICACIONES</strong><br />
              Folki App se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en la aplicación.</p>

              <p><strong>10. CONTACTO</strong><br />
              Ante cualquier consulta, sugerencia o reclamo, el usuario podrá contactarse a través del correo electrónico: <a href="mailto:eventos.folki@gmail.com" className="text-blue-600 underline">eventos.folki@gmail.com</a></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
