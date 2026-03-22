"use client";

import { useState } from "react";
import { SignIn, useSignUp, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ImmersiveBackground } from "@/components/premium/ImmersiveBackground";
import { Mail, Smartphone, CheckCircle2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";

type AuthStep = "CHOICE" | "GOOGLE" | "REG_EMAIL" | "REG_EMAIL_CODE" | "REG_SMS" | "REG_SMS_CODE" | "WELCOME";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("CHOICE");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [authMode, setAuthMode] = useState<"signUp" | "signIn">("signUp");
  
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const isLoaded = isSignUpLoaded && isSignInLoaded;

  const nextStep = (s: AuthStep) => setStep(s);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black selection:bg-indigo-500/30">
      
      {/* LEGENARY 3D BACKGROUND (WHITE REVERSE) */}
      <ImmersiveBackground theme="light" />

      {/* AUTH CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative group mx-auto"
        >
          {/* Neon Glow Outer */}
          <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/10 to-purple-600/10 rounded-[2.5rem] blur-3xl opacity-40" />
          
          {/* Main Card (WHITE THEME) */}
          <div className="relative bg-white/80 backdrop-blur-3xl border border-gray-200/50 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden min-h-[460px] flex flex-col items-center justify-center">
            
            <AnimatePresence mode="wait">
              {step === "CHOICE" && (
                <motion.div 
                  key="choice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full space-y-6 text-center"
                >
                    <div className="mb-12">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-sm relative group-hover:scale-110 transition-transform duration-700">
                        <img src="/models/aave-brand-assets/Logo/Logomark-purple.svg" className="w-10 h-10 drop-shadow-md" alt="Aave" />
                      </div>
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.5em] mb-3">Corporate Hub</h2>
                      <h1 className="text-2xl font-black text-slate-950 tracking-tight">Welcome to the Family.</h1>
                    </div>

                  {/* CLERK GOOGLE & METAMASK BUTTONS ONLY */}
                  <div className="auth-wrapper-legendary w-full flex justify-center">
                    <SignIn 
                      appearance={{
                        layout: {
                          socialButtonsVariant: "blockButton",
                          socialButtonsPlacement: "bottom"
                        },
                        elements: {
                          rootBox: "w-full flex justify-center",
                          card: "bg-transparent shadow-none border-none p-0 m-0 w-full",
                          header: "hidden",
                          dividerRow: "hidden",
                          socialButtonsBlockButton: "bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 h-14 rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] w-full",
                          socialButtonsBlockButtonText: "font-black uppercase tracking-[0.1em] text-xs text-gray-700",
                          footer: "hidden",
                          form: "hidden",
                          identityPreview: "hidden",
                        }
                      }}
                      routing="hash"
                      fallbackRedirectUrl="/"
                      signUpFallbackRedirectUrl="/"
                    />
                  </div>

                  <button 
                    onClick={() => nextStep("REG_EMAIL")}
                    className="w-full h-16 bg-slate-950 hover:bg-black text-white rounded-[1.5rem] flex items-center justify-center gap-4 transition-all group shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5 text-white/80 group-hover:text-white" />
                    <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Corporate Access</span>
                  </button>
                </motion.div>
              )}

              {step === "REG_EMAIL" && (
                <motion.div 
                   key="email"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="w-full space-y-6"
                >
                   <div className="text-center mb-8">
                     <Mail className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                     <h2 className="text-xl font-black text-white uppercase tracking-wider">Clearance Email</h2>
                     <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Enter your secure Gmail node</p>
                   </div>
                   <input 
                      type="email" 
                      placeholder="address@example.com"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                   />
                   <button 
                      onClick={async () => {
                         if (!isLoaded) return;
                         try {
                           setIsPending(true);
                           await signUp.create({ emailAddress: email });
                           await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                           setAuthMode("signUp");
                           nextStep("REG_EMAIL_CODE");
                         } catch (err: any) {
                           if (err.errors?.[0]?.code === "form_identifier_exists") {
                             try {
                               const { supportedFirstFactors } = await signIn.create({ identifier: email });
                               
                               const emailCodeFactor = supportedFirstFactors?.find(
                                 (factor: any) => factor.strategy === "email_code"
                               ) as any;

                               if (emailCodeFactor) {
                                 await signIn.prepareFirstFactor({
                                   strategy: "email_code",
                                   emailAddressId: emailCodeFactor.emailAddressId,
                                 });
                                 setAuthMode("signIn");
                                 nextStep("REG_EMAIL_CODE");
                               } else {
                                 toast.error("Email code login not supported for this account.");
                               }
                             } catch (signInErr: any) {
                               console.error("SignIn Error:", signInErr);
                               toast.error(signInErr.errors?.[0]?.message || "Failed to initiate login");
                             }
                           } else {
                             console.error("SignUp Error:", err);
                             toast.error(err.errors?.[0]?.message || "Failed to send code");
                           }
                         } finally {
                           setIsPending(false);
                         }
                      }}
                      disabled={!email || isPending}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all disabled:opacity-30"
                   >
                      {isPending ? "Dispatching..." : "Dispatch Code"} <ArrowRight className="w-4 h-4" />
                   </button>
                </motion.div>
              )}

              {step === "REG_EMAIL_CODE" && (
                <motion.div 
                   key="email_code"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="w-full space-y-6"
                >
                   <div className="text-center mb-8">
                     <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
                     <h2 className="text-xl font-black text-white uppercase tracking-wider">Verify Node</h2>
                     <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Code transmitted to {email}</p>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      <input 
                        type="text" 
                        maxLength={6} 
                        placeholder="123456"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl tracking-[0.5em] font-black text-white focus:outline-none focus:border-indigo-500/50" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                   </div>
                   <button 
                       onClick={async () => {
                        if (!isLoaded) return;
                        try {
                          setIsPending(true);
                          
                          if (authMode === "signUp") {
                            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
                            if (completeSignUp.status === "complete") {
                              await setSignUpActive({ session: completeSignUp.createdSessionId });
                              nextStep("WELCOME");
                            } else {
                              console.error(completeSignUp);
                              toast.error("Verification not complete");
                            }
                          } else {
                            const completeSignIn = await signIn.attemptFirstFactor({ strategy: "email_code", code });
                            if (completeSignIn.status === "complete") {
                              await setSignInActive({ session: completeSignIn.createdSessionId });
                              nextStep("WELCOME");
                            } else {
                              console.error(completeSignIn);
                              toast.error("Verification not complete");
                            }
                          }
                        } catch (err: any) {
                          console.error(err);
                          toast.error(err.errors?.[0]?.message || "Invalid Code");
                        } finally {
                          setIsPending(false);
                        }
                      }}
                      disabled={code.length !== 6 || isPending}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex justify-center items-center gap-2 font-black uppercase text-xs tracking-widest transition-all disabled:opacity-30"
                   >
                      {isPending ? "Verifying..." : "Confirm Identity"}
                   </button>
                </motion.div>
              )}





              {step === "WELCOME" && (
                <motion.div 
                   key="welcome"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-10"
                >
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-inner">
                       <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter mb-4 italic">Node Sync Success</h2>
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.4em] font-black mb-12">Authorized Account active. Enter the matrix.</p>
                   <button 
                      onClick={() => window.location.href = "/"}
                      className="px-10 py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-xl"
                   >
                      Enter System →
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div id="clerk-captcha" />
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .auth-wrapper-legendary .cl-internal-ph6787,
        .auth-wrapper-legendary .cl-dividerRow {
          display: none !important;
        }
        .auth-wrapper-legendary .cl-socialButtons {
          flex-direction: column !important;
          gap: 12px !important;
          display: flex !important;
          width: 100% !important;
        }
        /* Hide everything except Google and Metamask - for both block and icon buttons */
        .auth-wrapper-legendary .cl-socialButtonsBlockButton:not(:has(.cl-socialButtonsProviderIcon__google)):not(:has(.cl-socialButtonsProviderIcon__metamask)),
        .auth-wrapper-legendary .cl-socialButtonsIconButton:not(:has(.cl-socialButtonsProviderIcon__google)):not(:has(.cl-socialButtonsProviderIcon__metamask)) {
          display: none !important;
        }
      `}</style>
    </main>
  );
}


