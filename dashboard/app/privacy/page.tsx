import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | Chica Mocha",
  description:
    "Conocé cómo Chica Mocha recopila, almacena y protege tus datos personales al usar nuestro servicio de pedidos por WhatsApp.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-500 text-xs font-bold">CM</span>
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Chica Mocha</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            ← Inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10 pb-16">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            Última actualización: 19 de junio de 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              1. Responsable del Tratamiento
            </h2>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Chica Mocha</strong> es
              responsable del tratamiento de los datos personales que usted proporciona al utilizar
              nuestro servicio de pedidos a través de WhatsApp Business.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              2. Datos Personales que Recopilamos
            </h2>
            <p className="mb-3">
              Al interactuar con nuestro asistente virtual de WhatsApp, recopilamos la siguiente
              información:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Número de teléfono:</strong>{" "}
                número de WhatsApp desde el cual se realiza el contacto.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Nombre:</strong> nombre que
                usted proporciona durante la conversación.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Conversaciones:</strong>{" "}
                historial de mensajes intercambiados con nuestro asistente virtual.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Pedidos:</strong> productos
                solicitados, cantidades, precios y estados de cada pedido.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Dirección de entrega:</strong>{" "}
                domicilio indicado para la entrega del pedido, cuando aplica.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Método de pago informado:</strong>{" "}
                modalidad de pago indicada por el cliente (efectivo, transferencia, etc.). No
                almacenamos datos de tarjetas de crédito o débito.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Archivos multimedia:</strong>{" "}
                imágenes y mensajes de voz enviados a través de WhatsApp durante la conversación.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              3. Finalidad del Tratamiento
            </h2>
            <p className="mb-3">Sus datos personales son utilizados <strong className="text-gray-800 dark:text-gray-200">exclusivamente</strong> para:</p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Procesar y gestionar sus pedidos.</li>
              <li>Coordinar la entrega o el retiro de sus productos.</li>
              <li>Atender consultas y reclamos relacionados con su pedido.</li>
              <li>Mejorar la calidad de nuestro servicio de atención al cliente.</li>
            </ul>
            <p className="mt-3 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg px-4 py-3 text-amber-800 dark:text-amber-300">
              No utilizamos sus datos para publicidad, marketing masivo ni para ningún fin distinto a
              la gestión de su pedido.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              4. Almacenamiento y Seguridad
            </h2>
            <p>
              Todos sus datos son almacenados de forma segura en{" "}
              <strong className="text-gray-800 dark:text-gray-200">Supabase</strong> (PostgreSQL),
              una plataforma de base de datos con medidas de seguridad estándar de la industria,
              incluyendo cifrado en reposo y en tránsito (TLS). El acceso a sus datos está
              restringido exclusivamente al personal autorizado de Chica Mocha.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              5. Compartición de Datos con Terceros
            </h2>
            <p className="mb-3">
              <strong className="text-gray-800 dark:text-gray-200">
                Sus datos personales no son vendidos, alquilados ni compartidos con terceros
              </strong>{" "}
              bajo ninguna circunstancia, salvo en los siguientes casos excepcionales:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Cuando así lo exija la ley o una orden judicial.</li>
              <li>
                Para proteger los derechos, la propiedad o la seguridad de Chica Mocha o de
                terceros.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              6. Plataformas de Terceros
            </h2>
            <p>
              Este servicio opera a través de la{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                API de WhatsApp Business Cloud
              </strong>{" "}
              (Meta Platforms, Inc.). Al enviar mensajes por WhatsApp, sus datos también son
              procesados conforme a las políticas de privacidad de Meta. Le recomendamos revisar la
              política de privacidad de Meta para obtener más información.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              7. Derechos del Usuario
            </h2>
            <p className="mb-3">
              De conformidad con la{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                Ley 25.326 de Protección de Datos Personales
              </strong>{" "}
              de la República Argentina, usted tiene derecho a:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Acceder</strong> a sus datos
                personales almacenados.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Rectificar</strong> datos
                inexactos o incompletos.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Solicitar la eliminación</strong>{" "}
                de sus datos personales.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Oponerse</strong> al
                tratamiento de sus datos.
              </li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, consulte nuestra{" "}
              <Link
                href="/data-deletion"
                className="text-amber-600 dark:text-amber-500 hover:underline"
              >
                página de eliminación de datos
              </Link>
              .
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              8. Retención de Datos
            </h2>
            <p>
              Sus datos son conservados durante el tiempo necesario para cumplir con las finalidades
              descritas en esta política, o durante el tiempo que lo requieran las obligaciones
              legales aplicables bajo la legislación argentina.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              9. Cambios en esta Política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier
              momento. Cualquier modificación será publicada en esta página con la fecha de última
              actualización correspondiente.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              10. Contacto
            </h2>
            <p className="mb-3">
              Para ejercer sus derechos o realizar consultas sobre el tratamiento de sus datos
              personales, puede contactarnos:
            </p>
            <ContactInfo />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            © 2026 Chica Mocha. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-600">
            <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium text-amber-600 dark:text-amber-500">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Términos
            </Link>
            <Link href="/data-deletion" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Eliminar datos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactInfo() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!email) {
    return (
      <p className="text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-4 py-3 text-gray-500 dark:text-zinc-500">
        Configure la variable de entorno{" "}
        <code className="font-mono text-amber-600 dark:text-amber-500">NEXT_PUBLIC_CONTACT_EMAIL</code>{" "}
        para mostrar el correo de contacto.
      </p>
    );
  }
  return (
    <p className="text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-4 py-3">
      📧{" "}
      <a
        href={`mailto:${email}`}
        className="text-amber-600 dark:text-amber-500 hover:underline font-medium"
      >
        {email}
      </a>
    </p>
  );
}
