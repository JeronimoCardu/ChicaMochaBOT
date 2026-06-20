import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eliminación de Datos | Chica Mocha",
  description:
    "Solicitá la eliminación de tus datos personales del sistema de pedidos de Chica Mocha.",
};

export default function DataDeletionPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

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
            Solicitud de Eliminación de Datos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            De conformidad con la Ley 25.326 de Protección de Datos Personales de la República
            Argentina y las políticas de Meta, usted tiene derecho a solicitar la eliminación de
            sus datos personales de nuestro sistema.
          </p>
        </div>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* Datos almacenados */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              ¿Qué datos almacenamos?
            </h2>
            <p className="mb-3">
              Al interactuar con nuestro chatbot de WhatsApp, almacenamos:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Número de teléfono de WhatsApp</li>
              <li>Nombre proporcionado en la conversación</li>
              <li>Historial de conversaciones con el asistente virtual</li>
              <li>Pedidos realizados y su historial de estados</li>
              <li>Dirección de entrega, cuando fue indicada</li>
              <li>Método de pago mencionado (efectivo, transferencia, etc.)</li>
              <li>Mensajes de voz e imágenes enviadas durante la conversación</li>
            </ul>
          </section>

          {/* Cómo solicitar */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              ¿Cómo solicitar la eliminación?
            </h2>
            {email ? (
              <>
                <p className="mb-4">
                  Enviá un correo electrónico a{" "}
                  <a
                    href={`mailto:${email}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20datos`}
                    className="text-amber-600 dark:text-amber-500 hover:underline font-medium"
                  >
                    {email}
                  </a>{" "}
                  con el asunto{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    &quot;Solicitud de eliminación de datos&quot;
                  </strong>{" "}
                  e incluí la siguiente información:
                </p>
              </>
            ) : (
              <p className="mb-4 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-4 py-3 text-gray-500 dark:text-zinc-500">
                Configure{" "}
                <code className="font-mono text-amber-600 dark:text-amber-500">NEXT_PUBLIC_CONTACT_EMAIL</code>{" "}
                para mostrar el correo de contacto.
              </p>
            )}
            <ol className="space-y-3 pl-5 list-decimal">
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Tu nombre completo</strong>
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">
                  Número de teléfono de WhatsApp
                </strong>{" "}
                asociado a tu cuenta (con código de país, ej: +54 9 XXXX XXXXXX)
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Motivo de la solicitud</strong>{" "}
                (opcional)
              </li>
            </ol>
          </section>

          {/* Qué se elimina */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              ¿Qué se eliminará?
            </h2>
            <p className="mb-3">
              Ante una solicitud válida de eliminación, procederemos a borrar de nuestros sistemas:
            </p>
            <ul className="space-y-2 pl-5">
              {[
                "Historial completo de conversaciones con el chatbot",
                "Pedidos realizados y su información asociada",
                "Nombre e información de contacto registrada",
                "Dirección de entrega registrada",
                "Archivos multimedia enviados durante las conversaciones",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 dark:text-green-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#1f1f1f] rounded-lg px-4 py-3">
              <strong className="text-gray-800 dark:text-gray-200">Nota:</strong> Ciertos datos
              pueden ser retenidos si así lo exige la legislación argentina vigente (Ley 25.326 y
              normativas fiscales aplicables). En ese caso, le informaremos cuáles datos no pueden
              ser eliminados y el motivo.
            </div>
          </section>

          {/* Tiempo estimado */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              Tiempo estimado de procesamiento
            </h2>
            <p>
              Una vez recibida su solicitud y verificada su identidad, procesaremos la eliminación
              de sus datos en un plazo máximo de{" "}
              <strong className="text-gray-800 dark:text-gray-200">30 días hábiles</strong>.
              Recibirá una confirmación por correo electrónico cuando el proceso se haya completado.
            </p>
          </section>

          {/* Contacto directo */}
          {email && (
            <section className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl px-6 py-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Contacto directo
              </h2>
              <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                Para enviar su solicitud de eliminación de datos:
              </p>
              <a
                href={`mailto:${email}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20datos`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
              >
                <span>📧</span>
                Enviar solicitud a {email}
              </a>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            © 2026 Chica Mocha. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-600">
            <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Términos
            </Link>
            <Link href="/data-deletion" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium text-amber-600 dark:text-amber-500">
              Eliminar datos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
