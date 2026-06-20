import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Chica Mocha",
  description:
    "Leé los términos y condiciones de uso del servicio de pedidos por WhatsApp de Chica Mocha.",
};

export default function TermsPage() {
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
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            Última actualización: 19 de junio de 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al utilizar el servicio de pedidos por WhatsApp de{" "}
              <strong className="text-gray-800 dark:text-gray-200">Chica Mocha</strong>, usted acepta
              los presentes Términos y Condiciones en su totalidad. Si no está de acuerdo con
              alguna de las disposiciones aquí establecidas, le rogamos que se abstenga de utilizar
              el servicio.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              2. Descripción del Servicio
            </h2>
            <p className="mb-3">
              Chica Mocha ofrece un sistema de pedidos automatizado a través de{" "}
              <strong className="text-gray-800 dark:text-gray-200">WhatsApp Business</strong> que
              permite a nuestros clientes:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Consultar el menú y la disponibilidad de productos.</li>
              <li>Realizar pedidos de forma conversacional y guiada.</li>
              <li>Realizar el seguimiento del estado de su pedido.</li>
              <li>Comunicarse con nuestro equipo de atención al cliente.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              3. Uso del Asistente Virtual (Chatbot)
            </h2>
            <p className="mb-3">
              El sistema de pedidos opera mediante un asistente virtual con inteligencia artificial.
              Al utilizar este servicio, usted reconoce y acepta que:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                El asistente puede no comprender solicitudes ambiguas, fuera de contexto o con
                errores ortográficos significativos.
              </li>
              <li>
                Las respuestas son generadas de forma automática y pueden, en casos excepcionales,
                contener imprecisiones.
              </li>
              <li>
                En caso de duda sobre un pedido, nuestro equipo se pondrá en contacto con usted
                para confirmar los detalles.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              4. Horarios de Atención y Tiempos de Respuesta
            </h2>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                El <strong className="text-gray-800 dark:text-gray-200">asistente virtual</strong>{" "}
                está disponible para recibir mensajes las 24 horas del día, los 7 días de la
                semana.
              </li>
              <li>
                Los <strong className="text-gray-800 dark:text-gray-200">pedidos son procesados</strong>{" "}
                exclusivamente durante el horario comercial de Chica Mocha.
              </li>
              <li>
                Los tiempos de entrega son <strong className="text-gray-800 dark:text-gray-200">estimativos</strong> y
                pueden variar según la demanda, disponibilidad y condiciones externas.
              </li>
              <li>
                La <strong className="text-gray-800 dark:text-gray-200">atención humana</strong> puede
                no estar disponible fuera del horario de operación del local.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              5. Intervención Humana
            </h2>
            <p>
              Un operador humano de Chica Mocha puede intervenir en la conversación en cualquier
              momento para aclarar consultas que el asistente no pueda resolver, gestionar
              situaciones especiales o confirmar pedidos en casos de ambigüedad. Cuando esto ocurra,
              usted podrá distinguir claramente entre las respuestas automatizadas y las de un
              operador.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              6. Disponibilidad de Productos
            </h2>
            <p>
              Los productos mostrados están sujetos a disponibilidad. En caso de que un artículo
              solicitado no esté disponible al momento de procesar el pedido, nos comunicaremos con
              usted para ofrecerle alternativas o procesar un reembolso según corresponda.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              7. Cancelaciones y Modificaciones
            </h2>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                Los pedidos pueden ser cancelados o modificados{" "}
                <strong className="text-gray-800 dark:text-gray-200">
                  antes de ser confirmados
                </strong>{" "}
                por el local.
              </li>
              <li>
                Una vez que el pedido se encuentre en preparación, no se garantiza la posibilidad
                de cancelación o modificación.
              </li>
              <li>
                Las condiciones de reembolso se analizan y aplican caso por caso.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              8. Uso Correcto del Servicio
            </h2>
            <p className="mb-3">Al utilizar este servicio, usted se compromete a:</p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Proporcionar información verídica para la correcta realización de su pedido.</li>
              <li>
                Utilizar el servicio únicamente para realizar pedidos de productos ofrecidos por
                Chica Mocha.
              </li>
              <li>
                No utilizar el sistema para enviar mensajes spam, con contenido ofensivo,
                discriminatorio o inapropiado.
              </li>
              <li>
                No intentar vulnerar la seguridad, integridad o funcionamiento normal del sistema.
              </li>
            </ul>
            <p className="mt-3">
              Chica Mocha se reserva el derecho de restringir o bloquear el acceso al servicio a
              usuarios que incumplan estas condiciones.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              9. Limitación de Responsabilidad
            </h2>
            <p className="mb-3">
              En la máxima medida permitida por la ley aplicable, Chica Mocha no será responsable
              por:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                Demoras o interrupciones del servicio por causas ajenas a su control (fuerza mayor,
                problemas de red, interrupciones de WhatsApp o de los servicios de terceros).
              </li>
              <li>
                Errores en el procesamiento de pedidos causados por información incorrecta o
                incompleta proporcionada por el usuario.
              </li>
              <li>
                Pérdidas indirectas, incidentales o consecuentes derivadas del uso o la
                imposibilidad de usar el servicio.
              </li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              10. Modificaciones a los Términos
            </h2>
            <p>
              Chica Mocha se reserva el derecho de modificar estos Términos y Condiciones en
              cualquier momento. Las modificaciones entrarán en vigor desde su publicación en esta
              página. El uso continuado del servicio con posterioridad a la publicación de cambios
              implica la aceptación de los nuevos términos.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              11. Legislación Aplicable
            </h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la{" "}
              <strong className="text-gray-800 dark:text-gray-200">República Argentina</strong>.
              Cualquier controversia que surja en relación con estos términos será sometida a la
              jurisdicción de los tribunales competentes de la República Argentina.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-[#1f1f1f]">
              12. Contacto
            </h2>
            <p className="mb-3">
              Para consultas o reclamos relacionados con estos Términos y Condiciones:
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
            <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium text-amber-600 dark:text-amber-500">
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
