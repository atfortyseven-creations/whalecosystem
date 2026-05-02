"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Shield, Loader2, ArrowRight, Zap, Database, Lock, Globe, Building2, BarChart3, HelpCircle } from 'lucide-react';

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Standard',
    price: '$0',
    billing: 'Mensual / Facturación Anual Disponible',
    target: 'Para uso individual y académico',
    description: 'Acceso fundacional a la red Sovereign con telemetría básica y soporte comunitario.',
    features: [
      'Acceso al Terminal Base',
      'Actualización de red cada 5 min',
      'Acceso de lectura a datos históricos',
      'Soporte comunitario estándar',
      'Identidad soberana básica'
    ],
    buttonText: 'Empezar Gratis'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$59',
    billing: 'Usuario / Mes',
    target: 'Para analistas y operadores del mercado',
    description: 'Telemetría avanzada en tiempo real con herramientas de análisis de grado institucional.',
    highlight: true,
    features: [
      'Streaming de datos sin latencia',
      'Consultas avanzadas en la red',
      'Acceso de lectura y escritura',
      'Soporte técnico prioritario (24h)',
      'Analíticas de seguridad extendidas',
      'Hasta 15 alertas personalizadas'
    ],
    buttonText: 'Adquirir Licencia Pro'
  },
  {
    id: 'Elite',
    name: 'Enterprise',
    price: '$199',
    billing: 'Usuario / Mes',
    target: 'Para instituciones y fondos de cobertura',
    description: 'Rendimiento sin restricciones, límites expandidos y soporte Elite para alta frecuencia.',
    features: [
      'Firehose de datos ilimitado',
      'Consultas complejas ilimitadas',
      'Gestor de cuenta dedicado',
      'Integración total vía API / Webhook',
      'Alertas de mercado ilimitadas',
      'SLA garantizado del 99.99%'
    ],
    buttonText: 'Adquirir Licencia Enterprise'
  }
];

const PLATFORM_BENEFITS = [
  {
    title: 'Infraestructura de Alta Frecuencia',
    description: 'Procesamiento de datos sin latencia, respaldado por una arquitectura distribuida de última generación.',
    icon: <Zap size={22} className="text-[#00C076]" />
  },
  {
    title: 'Seguridad Criptográfica',
    description: 'Validación en cadena mediante firmas ECDSA. La red nunca custodia sus activos.',
    icon: <Lock size={22} className="text-[#00C076]" />
  },
  {
    title: 'Registro Inmutable',
    description: 'Todas las transacciones y anomalías del mercado se registran en un ledger permanente y auditable.',
    icon: <Database size={22} className="text-[#00C076]" />
  },
  {
    title: 'Consenso Global',
    description: 'Visualización tridimensional de datos a través de una esfera de Fibonacci de alta precisión.',
    icon: <Globe size={22} className="text-[#00C076]" />
  },
  {
    title: 'Grado Institucional',
    description: 'Diseñado específicamente para cubrir las estrictas normativas de fondos y corporaciones.',
    icon: <Building2 size={22} className="text-[#00C076]" />
  },
  {
    title: 'Análisis Multidimensional',
    description: 'Identificación de patrones mediante modelos matemáticos y telemetría algorítmica avanzada.',
    icon: <BarChart3 size={22} className="text-[#00C076]" />
  }
];

const FAQS = [
  {
    question: "¿Cómo se gestiona el cobro de la suscripción?",
    answer: "Los pagos se procesan de forma segura a través de Stripe, nuestra pasarela de pagos institucionales. Puede cancelar o modificar su plan en cualquier momento desde su panel de control soberano."
  },
  {
    question: "¿Es necesario conectar mi wallet para ver los planes?",
    answer: "Sí. Sovereign opera bajo un modelo de Identidad Soberana estricto. Su wallet (firma ECDSA) es su única forma de acceso y facturación; no requerimos correo electrónico ni contraseñas."
  },
  {
    question: "¿Puedo mejorar mi plan a mitad de mes?",
    answer: "Absolutamente. El sistema prorrateará automáticamente el costo restante del mes y activará inmediatamente sus nuevos límites de frecuencia y acceso API."
  },
  {
    question: "¿Existe una garantía de reembolso?",
    answer: "Dado que las licencias proporcionan acceso inmediato a datos propietarios y telemetría de alta frecuencia, no ofrecemos reembolsos. Le recomendamos iniciar con el plan Standard para evaluar la red."
  }
];

export default function PricingPage() {
  const { isConnected, isSovereignHandshake } = useSovereignAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Check for cancelation redirect
  useEffect(() => {
    if (searchParams.get('canceled')) {
      toast.error('Proceso cancelado', {
        description: 'La configuración de la licencia no ha sido completada.'
      });
      router.replace('/pricing');
    }
  }, [searchParams, router]);

  const handleSubscribe = async (planId: string) => {
    if (!isConnected || !isSovereignHandshake) {
      toast.error('Autenticación Requerida', {
        description: 'Debe conectar y firmar con su identidad soberana para acceder a la pasarela.',
      });
      router.push('/connect');
      return;
    }

    if (planId === 'starter') {
      toast.success('Acceso Verificado', {
        description: 'Usted ya cuenta con los permisos de la licencia Standard.',
      });
      router.push('/dashboard');
      return;
    }

    setLoadingTier(planId);
    const toastId = toast.loading('Inicializando pasarela corporativa cifrada...');

    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userEmail: '', // Stripe collect
          returnUrl: '/pricing'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo en la inicialización de la pasarela de pago');
      }

      toast.success('Conexión segura establecida. Redirigiendo...', { id: toastId });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Transacción Interrumpida', {
        id: toastId,
        description: error.message || 'Se produjo un problema al procesar su solicitud. Inténtelo de nuevo.',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans selection:bg-[#050505] selection:text-[#FDFCF8]">
      
      {/* ── Navbar Spacer ── */}
      <div className="h-24 w-full bg-[#FDFCF8] border-b border-black/5" />

      <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        
        {/* ── Encabezado Institucional ── */}
        <header className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C076]/10 border border-[#00C076]/20 mb-6 shadow-sm">
            <Shield size={14} className="text-[#00C076]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Licencias de Uso Soberano</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[#050505] mb-8 max-w-5xl leading-[1.1]">
            Inteligencia Corporativa.<br className="hidden md:block" />
            <span className="text-[#050505]/30">Calibrada para Escalar.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#050505]/60 max-w-3xl leading-relaxed font-medium">
            Seleccione la estructura de datos que mejor se adapte a sus requisitos operativos. Desde la investigación académica individual hasta el despliegue analítico de alta frecuencia para corporaciones.
          </p>
        </header>

        {/* ── Estructura de Precios ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-32 relative z-10">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.id}
              className={`relative flex flex-col rounded-[2rem] transition-all duration-500 ${
                tier.highlight 
                  ? 'bg-[#050505] text-[#FDFCF8] shadow-2xl md:-translate-y-4' 
                  : 'bg-white border border-[#050505]/10 text-[#050505] hover:shadow-lg'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00C076] text-[#050505] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-lg">
                  Estándar Corporativo
                </div>
              )}

              <div className="p-8 md:p-10 border-b border-black/5">
                <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${tier.highlight ? 'text-white/50' : 'text-black/40'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-6xl font-medium tracking-tighter ${tier.highlight ? 'text-white' : 'text-black'}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm font-bold ${tier.highlight ? 'text-white/40' : 'text-black/30'}`}>
                    /mes
                  </span>
                </div>
                <p className={`text-sm font-semibold mb-2 ${tier.highlight ? 'text-[#00C076]' : 'text-[#050505]'}`}>
                  {tier.target}
                </p>
                <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-white/60' : 'text-black/60'}`}>
                  {tier.description}
                </p>
              </div>

              <div className="p-8 md:p-10 flex-1 flex flex-col bg-white/[0.02]">
                <ul className="flex flex-col gap-5 flex-1 mb-10">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3.5">
                      <CheckCircle2 size={20} className={`shrink-0 ${tier.highlight ? 'text-[#00C076]' : 'text-[#050505]/30'}`} />
                      <span className={`text-[15px] font-medium leading-snug ${tier.highlight ? 'text-white/90' : 'text-[#050505]/80'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    tier.highlight
                      ? 'bg-[#00C076] text-[#050505] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,192,118,0.3)]'
                      : 'bg-[#050505] text-white hover:bg-black/80 hover:shadow-lg'
                  }`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {tier.buttonText}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Beneficios de la Arquitectura ── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#050505] mb-6">
              Arquitectura de Grado Institucional
            </h2>
            <p className="text-lg text-[#050505]/60 max-w-3xl mx-auto">
              Nuestra plataforma ha sido desarrollada desde sus cimientos para satisfacer las exigencias de latencia y fiabilidad requeridas por el sector empresarial de alto rendimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_BENEFITS.map((benefit, idx) => (
              <div key={idx} className="flex flex-col p-8 rounded-3xl bg-white border border-[#050505]/10 hover:border-[#050505]/20 transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-[#FDFCF8] border border-[#050505]/5 flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#050505] mb-3">{benefit.title}</h3>
                <p className="text-[15px] text-[#050505]/60 leading-relaxed font-medium">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Preguntas Frecuentes (FAQ) ── */}
        <section className="bg-[#050505] rounded-[3rem] p-10 md:p-20 text-[#FDFCF8] relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#00C076]/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                <HelpCircle size={14} className="text-[#00C076]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Soporte y Dudas</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Preguntas<br />Frecuentes
              </h2>
              <p className="text-white/50 text-lg">
                Resolvemos las cuestiones operativas y administrativas más comunes. Para soporte dedicado, acceda al terminal.
              </p>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="flex flex-col">
                  <h4 className="text-lg font-bold text-white mb-3 leading-snug">{faq.question}</h4>
                  <p className="text-[15px] text-white/50 leading-relaxed font-medium">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
