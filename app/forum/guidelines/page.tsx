import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, BookOpen, Users, Zap, Flag, Scale, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Normas de la Comunidad | Whale Alert Network Forum',
  description: 'Las normas y estándares de participación en el foro de inteligencia soberana de Whale Alert Network.',
};

const RULES = [
  {
    n: '01',
    icon: BookOpen,
    title: 'Publicar contenido de valor y con datos de respaldo',
    body: 'Comparte análisis, investigaciones o preguntas técnicas que aporten valor real a los miembros. Cualquier afirmación sobre la actividad en la blockchain debe estar respaldada por evidencia verificable: hashes de transacciones, exploradores de bloques o fuentes de datos auténticas. Se eliminarán los mensajes sin contenido útil o especulaciones sin fundamento.',
    dos: [
      'Compartir hashes de transacciones al citar eventos on-chain',
      'Incluir metodologías y fuentes en posts de investigación',
      'Hacer preguntas técnicas claras y específicas'
    ],
    donts: [
      'Publicar mensajes sin contenido útil o repetitivos',
      'Compartir rumores no verificados como hechos reales',
      'Copiar contenido de otras fuentes sin dar crédito'
    ],
  },
  {
    n: '02',
    icon: Shield,
    title: 'Cero tolerancia a la manipulación del mercado',
    body: 'Está estrictamente prohibido coordinar compras o ventas masivas, publicar señales engañosas de compra/venta, crear cuentas falsas para inflar opiniones o cualquier otra forma de manipulación de mercado. Este foro existe para mejorar la transparencia, no para explotar el mercado.',
    dos: [
      'Compartir análisis independientes y honestos',
      'Declarar si tienes posiciones en los activos que comentas',
      'Reportar cualquier actividad coordinada sospechosa'
    ],
    donts: [
      'Coordinar compras o ventas colectivas en hilos públicos o privados',
      'Publicar señales que sabes que son engañosas',
      'Crear múltiples cuentas para votar a favor de tu propio contenido'
    ],
  },
  {
    n: '03',
    icon: Scale,
    title: 'Respeto mutuo entre todos los participantes',
    body: 'Debate las ideas con argumentos sólidos, pero nunca ataques a la persona. Los insultos, el acoso o revelar datos personales resultarán en una suspensión. Se fomenta el desacuerdo constructivo, pero siempre con respeto y educación.',
    dos: [
      'Cuestionar los argumentos con pruebas y respeto',
      'Aceptar de buena manera las correcciones y argumentos válidos de otros',
      'Usar un lenguaje neutro y preciso en debates técnicos'
    ],
    donts: [
      'Usar lenguaje ofensivo o despectivo contra otros miembros',
      'Intentar revelar la identidad del mundo real de usuarios seudónimos',
      'Atacar a usuarios por cometer errores'
    ],
  },
  {
    n: '04',
    icon: Zap,
    title: 'Mantenerse en el tema del foro',
    body: 'Este foro está dedicado al análisis de la blockchain, finanzas descentralizadas (DeFi), comportamiento de grandes billeteras (whales) y la plataforma Whale Alert. Las conversaciones fuera de tema o la promoción no autorizada no están permitidas.',
    dos: [
      'Abrir hilos en la categoría correcta (Análisis, Plataforma, Investigación, etc.)',
      'Usar títulos descriptivos que faciliten la lectura de los temas',
      'Enlazar a debates previos relacionados para dar contexto'
    ],
    donts: [
      'Promocionar proyectos propios, tokens o NFTs sin autorización previa',
      'Publicar noticias generales de criptomonedas que ya están en otros sitios',
      'Enviar spam con el mismo contenido en varias categorías'
    ],
  },
  {
    n: '05',
    icon: Flag,
    title: 'Reportar en lugar de responder con agresividad',
    body: 'Si encuentras contenido que infringe las normas, usa la función de reporte. No respondas con agresividad ni intentes avergonzar públicamente al usuario. El equipo de moderación revisará el caso y tomará las medidas oportunas.',
    dos: [
      'Usar la función de reporte para cualquier infracción',
      'Contactar a los moderadores para asuntos urgentes o delicados',
      'Confiar en el proceso de moderación establecido'
    ],
    donts: [
      'Responder a publicaciones de mala fe con más agresividad',
      'Exponer o culpar públicamente a usuarios específicos',
      'Organizar grupos de usuarios para votar en contra de alguien'
    ],
  },
  {
    n: '06',
    icon: Users,
    title: 'Proteger la privacidad de todos',
    body: 'Nunca compartas tus claves privadas, frases semilla o credenciales en el foro. Respeta el anonimato de los demás usuarios y no intentes revelar la identidad de miembros que prefieren usar seudónimos.',
    dos: [
      'Acortar las direcciones de billetera al hacer referencia a ellas',
      'Respetar el seudónimo de los demás miembros',
      'Usar canales cifrados y seguros para coordinaciones delicadas'
    ],
    donts: [
      'Compartir claves privadas, frases semilla o credenciales bajo ningún concepto',
      'Intentar vincular un seudónimo con una persona real',
      'Publicar capturas de pantalla que muestren datos privados de otros usuarios'
    ],
  },
];

export default function ForumGuidelinesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans antialiased">

      {/* Top nav breadcrumb */}
      <div className="w-full border-b border-black/10 dark:border-white/10 bg-white dark:bg-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/forum" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={13} />
            Foro
          </Link>
          <span className="text-black/20 dark:text-white/20">/</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-black dark:text-white">Normas de la Comunidad</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">

        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40">Foro / Normas</span>
          </div>
          <h1 className="text-[42px] md:text-[54px] font-black tracking-tighter leading-[0.95] text-black dark:text-white mb-5 uppercase">
            Normas de la<br />
            <span>Comunidad</span>
          </h1>
          <p className="text-[15px] text-black/60 dark:text-white/60 font-medium leading-relaxed max-w-2xl">
            El foro de Whale Alert Network es un espacio de alta calidad para el análisis de blockchain, DeFi e inteligencia financiera. Estas normas existen para proteger la calidad del contenido y asegurar una convivencia sana.
          </p>
        </div>

        {/* Quote banner */}
        <div className="mb-14 p-6 bg-white dark:bg-black border border-black dark:border-white rounded-2xl flex items-start gap-4">
          <MessageSquare size={18} className="text-black dark:text-white mt-0.5 shrink-0" />
          <p className="text-[14px] italic text-black dark:text-white leading-relaxed font-medium">
            "Una comunidad se define por el comportamiento más bajo que está dispuesta a tolerar. Mantenemos el nivel muy alto porque quienes confían en esta información merecen excelencia."
          </p>
        </div>

        {/* Rules */}
        <div className="flex flex-col gap-6">
          {RULES.map(rule => (
            <div key={rule.n} className="bg-white dark:bg-black rounded-2xl border border-black dark:border-white overflow-hidden">
              
              {/* Rule header */}
              <div className="flex items-start gap-5 px-8 pt-7 pb-6">
                <div className="flex items-center gap-4 shrink-0 pt-0.5">
                  <span className="text-[11px] font-mono font-bold text-black/40 dark:text-white/40">{rule.n}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-black dark:border-white bg-black/5 dark:bg-white/5">
                    <rule.icon size={16} className="text-black dark:text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-black tracking-tight text-black dark:text-white mb-2 uppercase">{rule.title}</h2>
                  <p className="text-[14px] text-black/60 dark:text-white/60 leading-relaxed font-medium">{rule.body}</p>
                </div>
              </div>

              {/* Do / Don't */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black dark:bg-white border-t border-black dark:border-white">
                <div className="bg-white dark:bg-black px-7 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={12} className="text-black dark:text-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Hacer (Do)</span>
                  </div>
                  <ul className="space-y-2">
                    {rule.dos.map((d, i) => (
                      <li key={i} className="text-[12px] text-black/75 dark:text-white/75 font-medium leading-snug pl-3 border-l-2 border-black dark:border-white">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white dark:bg-black px-7 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={12} className="text-black dark:text-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Evitar (Don't)</span>
                  </div>
                  <ul className="space-y-2">
                    {rule.donts.map((d, i) => (
                      <li key={i} className="text-[12px] text-black/75 dark:text-white/75 font-medium leading-snug pl-3 border-l-2 border-black dark:border-white">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enforcement */}
        <div className="mt-10 bg-white dark:bg-black rounded-2xl border border-black dark:border-white p-8">
          <h3 className="text-[16px] font-black tracking-tight text-black dark:text-white mb-3 uppercase">Aplicación de Normas y Apelaciones</h3>
          <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed font-medium mb-5">
            Las infracciones se tratarán según su gravedad: advertencia inicial para faltas menores, suspensión temporal de 3 a 30 días para reincidencias, y expulsión permanente del foro en casos graves de manipulación de mercado, acoso o exposición de datos privados. Las apelaciones pueden enviarse a <span className="font-bold border-b border-black dark:border-white">moderation@humanidfi.com</span> en un plazo máximo de 14 días. Las decisiones serán resueltas por el equipo en un plazo de 5 días hábiles.
          </p>
          <div className="flex items-center gap-2 pt-4 border-t border-black/10 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40 dark:text-white/40">Última actualización — Mayo 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}
