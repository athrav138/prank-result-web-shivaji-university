import { useState, useEffect, useRef, FormEvent } from "react";
import { 
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export default function App() {
  // Hash Routing Logic to match live URL representation
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      try {
        const msg = event?.message || "";
        const filename = event?.filename || "";
        if (!msg || msg.includes("Script error") || msg.includes("youtube") || msg.includes("ytimg") || filename.includes("youtube") || filename.includes("ytimg")) {
          event?.preventDefault?.();
          return true;
        }
      } catch (e) {
        // ignore
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        event?.preventDefault?.();
      } catch (e) {
        // ignore
      }
      return true;
    };

    try {
      window.onerror = (message, source, lineno, colno, error) => {
        const msg = String(message || "");
        const src = String(source || "");
        if (
          !msg || 
          msg.includes("Script error") || 
          msg.includes("youtube") || 
          msg.includes("ytimg") || 
          src.includes("youtube") || 
          src.includes("ytimg")
        ) {
          return true; // prevent error propagation
        }
      };
    } catch (e) {
      // safe fallback
    }

    try {
      window.addEventListener("error", handleGlobalError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
    } catch (e) {
      // safe fallback
    }

    try {
      // Dynamic page title to match real portal
      document.title = "Online Result - Shivaji University, Kolhapur";
    } catch (e) {
      // Ignore if document.title is sandboxed
    }
    
    const enforcePathname = () => {
      try {
        if (typeof window !== "undefined" && window.location && window.history && window.history.replaceState && window.location.pathname !== "/student_marksheet") {
          window.history.replaceState(null, "", "/student_marksheet");
        }
      } catch (e) {
        // Safe fallback if history.replaceState is blocked by iframe sandbox restrictions
      }
    };
    
    enforcePathname();
    try {
      window.addEventListener("popstate", enforcePathname);
    } catch (e) {
      // Safe fallback if addEventListener is restricted
    }
    return () => {
      try {
        window.removeEventListener("error", handleGlobalError);
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      } catch (e) {
        // safe fallback
      }
      try {
        window.removeEventListener("popstate", enforcePathname);
      } catch (e) {
        // Safe fallback
      }
    };
  }, []);

  // Form State
  const [prn, setPrn] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [pranked, setPranked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [validationError, setValidationError] = useState("");

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play button click synth audio feedback
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Audio is blocked by browser interaction or frame security constraints
    }
  };

  // Play celebratory prank victory sound
  const playPrankSound = () => {
    if (!soundEnabled) return;
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Happy melody cascade
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + (idx * 0.1));
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + (idx * 0.1) + 0.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.12, now + (idx * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.1) + 0.25);
        
        osc.start(now + (idx * 0.1));
        osc.stop(now + (idx * 0.1) + 0.25);
      });
    } catch (e) {
      // Autoplay or frame constraints blocked
    }
  };

  // 2-seconds timer loading progression state machine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      const messages = [
        "Sending secure request to university registration database...",
        "Validating student record matching signatures...",
        "Synchronizing encrypted data package stream...",
        "Resolving transcript ledger grades..."
      ];
      
      let step = 0;
      setLoadingProgress(0);
      setLoadingMessage(messages[0]);

      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 5, 100));
      }, 100);

      const messageInterval = setInterval(() => {
        step++;
        if (step < messages.length) {
          setLoadingMessage(messages[step]);
        }
      }, 500);

      timer = setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setLoading(false);
        setPranked(true);
        playPrankSound();
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearTimeout(timer);
      };
    }
  }, [loading]);

  // Particle explosion implementation on success trigger
  useEffect(() => {
    if (!pranked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let items: Particle[] = [];
    const colors = ["#f26522", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#eab308", "#ec4899"];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const createItem = (side: "left" | "right" | "top"): Particle => {
      return {
        x: side === "left" ? 0 : side === "right" ? canvas.width : Math.random() * canvas.width,
        y: side === "top" ? -15 : canvas.height * 0.7,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: side === "left" 
          ? (Math.random() * 12 + 6) 
          : side === "right" 
            ? -(Math.random() * 12 + 6) 
            : (Math.random() * 6 - 3),
        speedY: side === "top" ? (Math.random() * 4 + 2) : -(Math.random() * 16 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4
      };
    };

    for (let i = 0; i < 160; i++) {
      items.push(createItem(Math.random() > 0.5 ? "left" : "right"));
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      items.forEach((p, index) => {
        p.speedY += 0.35; // simulated gravity factor
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();

        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          items[index] = createItem("top");
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [pranked]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    playClickSound();

    if (!prn.trim()) {
      setValidationError("Please Enter PRN Number.");
      return;
    }

    setValidationError("");
    setLoading(true);
  };

  const handleReset = () => {
    playClickSound();
    setPrn("");
    setPranked(false);
    setLoading(false);
    setLoadingProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#dedede] text-slate-800">
      
      {/* Main Container Layout */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex-grow flex flex-col justify-between">
        
        {/* Core Shivaji University Portal Body */}
        <div className="flex-grow flex flex-col justify-center py-4">
          <div className="w-full bg-white rounded-md shadow-md p-6 sm:p-10 border border-slate-200">
            
            {/* Header Layout Section matching Shivaji screenshot */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 pb-5 border-b border-slate-200">
              
              {/* Left Side: Circular University Icon Emblem */}
              <div className="shrink-0">
                <svg className="w-24 h-24 text-[#000d2b]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Definition of text curves for perfectly arched text */}
                  <defs>
                    {/* Top semi-circle clockwise (from left to right) for 'शिवाजी विद्यापीठ कोल्हापूर' */}
                    <path id="topTextCurve" d="M 28,100 A 72,72 0 0,1 172,100" fill="none" />
                    {/* Bottom semi-circle counter-clockwise (from left to right) for 'ज्ञानमेवामृतम्' */}
                    <path id="bottomTextCurve" d="M 30,105 A 70,70 0 0,0 170,105" fill="none" />
                  </defs>

                  {/* Outer concentric circular rings mimicking the original metallic seal stamp */}
                  <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="87" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="83" stroke="currentColor" strokeWidth="1.2" />
                  
                  {/* Seal Star/Disk Dividers on Left and Right borders inside the track */}
                  <circle cx="21" cy="100" r="2" fill="currentColor" />
                  <circle cx="179" cy="100" r="2" fill="currentColor" />
                  
                  {/* Curved Top Text: Shivaji Vidyapeeth Kolhapur */}
                  <text className="fill-current text-[#000d2b]" style={{ fontFamily: '"Mukta", "Noto Sans Devanagari", sans-serif', fontSize: '12.5px', fontWeight: 800 }}>
                    <textPath href="#topTextCurve" startOffset="50%" textAnchor="middle">
                      शिवाजी विद्यापीठ कोल्हापूर
                    </textPath>
                  </text>

                  {/* Curved Bottom Motto: Jnanam-eva-amritam */}
                  <text className="fill-current text-[#000d2b]" style={{ fontFamily: '"Mukta", "Noto Sans Devanagari", sans-serif', fontSize: '12px', fontWeight: 800, letterSpacing: '0.02em' }}>
                    <textPath href="#bottomTextCurve" startOffset="50%" textAnchor="middle">
                      ज्ञानमेवामृतम्
                    </textPath>
                  </text>

                  {/* Double Outlined Sacred Trefoil Frame / Three-lobed Royal Shield */}
                  {/* Outer Trefoil Path */}
                  <path 
                    d="M 100 48 C 114 48, 122 70, 118 85 C 132 85, 148 94, 148 108 C 148 122, 130 126, 118 126 C 108 126, 100 122, 100 122 C 100 122, 92 126, 82 126 C 70 126, 52 122, 52 108 C 52 94, 68 85, 82 85 C 78 70, 86 48, 100 48 Z" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    fill="#fcfcfc" 
                  />
                  {/* Inner Concentric Trefoil Path to match original logo's double boundary */}
                  <path 
                    d="M 100 48 C 114 48, 122 70, 118 85 C 132 85, 148 94, 148 108 C 148 122, 130 126, 118 126 C 108 126, 100 122, 100 122 C 100 122, 92 126, 82 126 C 70 126, 52 122, 52 108 C 52 94, 68 85, 82 85 C 78 70, 86 48, 100 48 Z" 
                    stroke="currentColor" 
                    strokeWidth="1.0" 
                    fill="none" 
                    transform="translate(100, 96) scale(0.93) translate(-100, -96)"
                  />

                  {/* 1. UPPER LOBE: Chhatrapati Shivaji Maharaj Silhouette & Royal Oval Backdrop */}
                  <ellipse cx="100" cy="71.5" rx="17" ry="18" fill="currentColor" />
                  <g transform="translate(100, 71.5) scale(0.62)">
                    <path 
                      d="M -16 18 C -15 9, -12 1, -8 -4 C -8 -10, -3 -15, 5 -14 C 11 -14, 13 -10, 14 -6 C 11 -6, 9 -5, 7 -3 C 9 -3, 13 2, 15 4 C 10 6.5, 11 8.5, 12 9.5 C 9 10.5, 11 12.5, 13 15.5 C 9 17.5, 4 20.5, -2 18.5 Z" 
                      fill="#ffffff" 
                    />
                    {/* Royal Turban feather / jura */}
                    <path d="M 4 -15 L 6 -20 L 9 -15 Z" fill="#ffffff" />
                  </g>

                  {/* 2. LOWER-LEFT LOBE: Ancient Branching Holy Lamp (Samai / Pancharati) */}
                  <g transform="translate(73, 108)" className="text-current pt-1">
                    {/* Metal Stand Base */}
                    <path d="M -9 14 L 9 14 L 6 10 L -6 10 Z" fill="currentColor" />
                    {/* Standing Pillar Stem */}
                    <line x1="0" y1="10" x2="0" y2="-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    {/* Oil Reservoir Pan */}
                    <path d="M -13 -4 C -8 2, 8 2, 13 -4 C 10 -1, -10 -1, -13 -4 Z" fill="currentColor" />
                    {/* Five Wick Flames */}
                    <path d="M 0 -7 C 1.2 -10, 0 -13, 0 -13 C 0 -13, -1.2 -10, 0 -7 Z" fill="currentColor" />
                    <path d="M -5.5 -6 C -4.3 -9, -5.5 -12, -5.5 -12 C -5.5 -12, -6.7 -9, -5.5 -6 Z" fill="currentColor" />
                    <path d="M 5.5 -6 C 6.7 -9, 5.5 -12, 5.5 -12 C 5.5 -12, 4.3 -9, 5.5 -6 Z" fill="currentColor" />
                    <path d="M -10.5 -4 C -9.3 -7, -10.5 -10, -10.5 -10 C -10.5 -10, -11.7 -7, -10.5 -4 Z" fill="currentColor" />
                    <path d="M 10.5 -4 C 11.7 -7, 10.5 -10, 10.5 -10 C 10.5 -10, 9.3 -7, 10.5 -4 Z" fill="currentColor" />
                  </g>

                  {/* 3. LOWER-RIGHT LOBE: Open Holy Book (Saraswati Granth - Sacred Ledger of Knowledge) */}
                  <g transform="translate(127, 108)">
                    {/* Book Outer Profile Page Frame */}
                    <path 
                      d="M -13 -6 C -6.5 -7.5, 0 -5.5, 0 -5.5 C 0 -5.5, 6.5 -7.5, 13 -6 L 13 6 C 6.5 4.5, 0 6.5, 0 6.5 C 0 6.5, -6.5 4.5, -13 6 Z" 
                      fill="#ffffff" 
                      stroke="currentColor" 
                      strokeWidth="1.4" 
                      strokeLinejoin="round"
                    />
                    {/* Centered creased spine line */}
                    <line x1="0" y1="-5.5" x2="0" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
                    {/* Embedded Devanagari lines representation on left page */}
                    <line x1="-10" y1="-2" x2="-3" y2="-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="-10.5" y1="1" x2="-3" y2="1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="-10" y1="4" x2="-3.5" y2="4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    {/* Lines representation on right page */}
                    <line x1="3" y1="-2" x2="10" y2="-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="3" y1="1" x2="10.5" y2="1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="3.5" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                  </g>

                  {/* 4. BASE INTERACTION: Maratha Crossed Talwars (Swords) and Shield Emblem */}
                  <g transform="translate(100, 137)">
                    {/* Crossed Sword 1 (backslash sweep) */}
                    <line x1="-11" y1="-7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="-12" cy="-8" r="1.2" fill="currentColor" />
                    <line x1="-13" y1="-6.5" x2="-9.5" y2="-10" stroke="currentColor" strokeWidth="1.6" />
                    
                    {/* Crossed Sword 2 (slash sweep) */}
                    <line x1="11" y1="-7" x2="-11" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="-8" r="1.2" fill="currentColor" />
                    <line x1="9.5" y1="-10" x2="13" y2="-6.5" stroke="currentColor" strokeWidth="1.6" />
                    
                    {/* Central Protective Shield (Dhal) */}
                    <circle cx="0" cy="0" r="5.5" fill="#ffffff" stroke="currentColor" strokeWidth="1.6" />
                    {/* 4 authentic Maratha metal defense bosses inside the Shield ring */}
                    <circle cx="-1.8" cy="-1.8" r="0.8" fill="currentColor" />
                    <circle cx="1.8" cy="-1.8" r="0.8" fill="currentColor" />
                    <circle cx="-1.8" cy="1.8" r="0.8" fill="currentColor" />
                    <circle cx="1.8" cy="1.8" r="0.8" fill="currentColor" />
                  </g>
                </svg>
              </div>

              {/* Right Side: University Text Credentials matching screenshot colors perfectly */}
              <div className="flex-grow space-y-0.5 text-center md:text-left">
                <h1 className="text-[#09357a] font-bold text-2xl sm:text-[27px] font-serif leading-none tracking-tight">
                  शिवाजी विद्यापीठ, कोल्हापूर
                </h1>
                <h2 className="text-[#07245c] font-black text-2xl sm:text-[30px] font-sans tracking-tight leading-none pt-1">
                  SHIVAJI UNIVERSITY, KOLHAPUR
                </h2>
                <p className="text-slate-650 font-semibold text-xs sm:text-[13px] tracking-wide text-slate-600">
                  Estd-1962 - recognized by UGC U/s 2(f) and 12 (B)
                </p>
                <p className="text-[#09357a] font-bold text-xs sm:text-[13px] uppercase tracking-wider">
                  NAAC &quot;A++&quot; Grade with CGPA 3.52
                </p>
              </div>

            </div>

            {/* Centered Online Result Header */}
            <div className="py-6 border-b border-slate-100 text-center">
              <h2 className="text-[#f26522] font-display font-bold text-3xl sm:text-[38px] tracking-wider uppercase select-none">
                ONLINE RESULT
              </h2>
            </div>

            {/* Main Form/Progress Stage */}
            <div className="py-8">
              {!loading ? (
                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
                  <div className="p-6 sm:p-10 rounded bg-[#fcfcfc] border border-slate-200/80">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                      
                      {/* Label block matches image typography styling */}
                      <div className="shrink-0 pr-2">
                        <label className="font-semibold text-sm sm:text-base text-slate-800 flex items-center">
                          University PRN<span className="text-red-500 font-extrabold ml-1">*</span>
                        </label>
                      </div>

                      {/* Precise Form Control Input */}
                      <div className="flex-grow w-full sm:max-w-xs relative">
                        <input
                          type="text"
                          value={prn}
                          onChange={(e) => setPrn(e.target.value)}
                          placeholder="Enter PRN"
                          className={`w-full p-2 px-3 rounded border text-sm font-semibold tracking-wide outline-none transition-all placeholder:text-slate-400 placeholder:font-normal ${
                            validationError 
                              ? "border-red-500 bg-red-50/5" 
                              : "border-slate-300 text-slate-800 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50"
                          }`}
                        />
                        {validationError && (
                          <div className="absolute left-0 -bottom-5 flex items-center space-x-1.5 text-xs text-red-500 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{validationError}</span>
                          </div>
                        )}
                      </div>

                      {/* Perfect Light Blue Button matching image view button */}
                      <div className="shrink-0 w-full sm:w-auto">
                        <button
                          type="submit"
                          className="w-full sm:w-auto py-2 px-6 rounded bg-[#23a5dc] hover:bg-[#1a8ebf] text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          View
                        </button>
                      </div>

                    </div>
                  </div>
                </form>
              ) : (
                
                /* Realtime Query Progress Panel visual feedback loop */
                <div className="w-full max-w-md mx-auto py-8 flex flex-col items-center justify-center text-center space-y-4 fade-in">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#23a5dc] animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-700">Accessing University Academic Registry Node</h3>
                    <p className="text-xs font-mono opacity-70 h-8 flex items-center justify-center py-2">
                      {loadingMessage}
                    </p>
                  </div>
                  <div className="w-52 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#23a5dc] transition-all duration-100 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold opacity-60">{loadingProgress}% Synchronized</span>
                </div>
              )}
            </div>

          </div>
        </div>



      </div>

      {/* FULL-SCREEN SUCCESS PRANK OVERLAY MODAL */}
      {pranked && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/98 flex flex-col items-center justify-start py-6 sm:py-12 px-4 backdrop-blur-md fade-in">
          
          {/* Active Confetti Animation Canvas layer overlay */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

          {/* Verification Modal Content Card */}
          <div className="relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8 text-center border-4 border-orange-500/80 shadow-[0_0_50px_rgba(244,115,22,0.3)] bg-slate-900 text-slate-100 transform scale-100 transition-all overflow-hidden my-auto">
            
            {/* Success sparkles badge indicator */}
            <div className="flex justify-center space-x-2 text-orange-500 animate-bounce mb-3">
              <Sparkles className="w-7 h-7 text-yellow-500" />
              <span className="p-1 px-3 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                AUTHENTICATION VERIFIED
              </span>
              <Sparkles className="w-7 h-7 text-yellow-500" />
            </div>

            {/* Prank Catch successful response message header */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Result Found Successfully!
            </h2>
            
            {/* Prank Announcement Label */}
            <div className="mt-3.5 mb-5 py-2.5 px-4 bg-orange-500 text-slate-950 font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center space-x-2">
              <span>You have been pranked 😄</span>
            </div>

            {/* Embedded Smartphone Frame displaying YouTube Shorts */}
            <div className="relative mx-auto max-w-[270px] sm:max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 mb-6">
              
              {/* Device status info bar over feed */}
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-950/80 flex items-center justify-between px-3 text-[8px] font-mono text-slate-400 z-10 pointer-events-none">
                <span>SUK Live Feed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              {/* YouTube Shorts autoplay video iframe player */}
              <iframe 
                src="https://www.youtube.com/embed/oCHkhZ4U9z0?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0" 
                title="SUK Verified Candidate Feed"
                className="w-full h-full pt-4"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </div>

            {/* Audio configurations note helper */}
            <p className="text-[11px] font-medium text-slate-400 bg-slate-950/60 p-3 rounded-xl mb-6 leading-relaxed border border-slate-800">
              🔊 Ensure your volume is up to experience the verified audio playback!
            </p>

            {/* Return Reset Button controller parameter */}
            <button
              onClick={handleReset}
              className="w-full cursor-pointer py-3 px-5 rounded-lg bg-orange-650 bg-orange-600 hover:bg-orange-500 font-bold uppercase tracking-wider text-xs text-white transition-all transform hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-orange-200" />
              <span>Reset Portal Query</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
