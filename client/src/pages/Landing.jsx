import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight, Database, Cpu, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NoiseOverlay = () => (
  <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: navRef.current },
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-[2rem] transition-all duration-500 flex items-center gap-8 text-sm font-medium w-[90%] max-w-4xl justify-between border border-transparent [&.scrolled]:bg-[#0f1117]/80 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-white/10"
    >
      <div
        className="flex items-center gap-3 group cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 group-hover:border-white/40 transition-colors">
          <span style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 40%, #e879f9 70%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'sans-serif',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
              paddingRight: '1px',
              marginTop: '1px',
            }}>
            Fs.
          </span>
        </div>
        <span className="font-sans font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
          Flowstate.
        </span>
      </div>
      <div className="hidden md:flex gap-8 text-white/80">
        <a href="#features"   className="hover:text-primary hover:[text-shadow:_0_0_15px_rgba(56,189,248,0.5)] transition-all hover:-translate-y-[1px]">Features</a>
        <a href="#philosophy" className="hover:text-primary hover:[text-shadow:_0_0_15px_rgba(56,189,248,0.5)] transition-all hover:-translate-y-[1px]">About</a>
        <a href="#protocol"   className="hover:text-primary hover:[text-shadow:_0_0_15px_rgba(56,189,248,0.5)] transition-all hover:-translate-y-[1px]">How It Works</a>
      </div>
      <Link to="/auth" className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold">
        Sign In
      </Link>
    </nav>
  );
};

const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100dvh] flex items-end pb-32 pt-24 px-6 md:px-12 overflow-hidden">
      {/* Background Image / Gradient */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/80 to-transparent" />
      
      <div className="relative z-10 max-w-5xl w-full mx-auto">
        <h1 className="flex flex-col gap-2">
          <span className="hero-elem font-sans font-bold text-3xl md:text-5xl text-white/90 tracking-tight">
            Complete life management meets
          </span>
          <span className="hero-elem font-serif italic text-6xl md:text-8xl text-primary tracking-tighter leading-none mt-2">
            Absolute Control.
          </span>
        </h1>
        <p className="hero-elem mt-8 text-lg md:text-xl text-secondary max-w-xl leading-relaxed">
          The ultimate app to track, improve, and master every part of your life. Sleep, workouts, nutrition, and finances—all in one place.
        </p>
        <div className="hero-elem mt-10 flex gap-4">
          <Link to="/auth" className="btn-primary px-8 py-4 rounded-[1.25rem] text-lg flex items-center gap-2">
            Get Started <ChevronRight size={20} />
          </Link>
          <a href="#features" className="btn-magnetic px-8 py-4 rounded-[1.25rem] text-lg">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const typewriterRef = useRef(null);
  const [text, setText] = useState('');
  const fullText = "Analyzing health data... Sleep quality is poor. Try a relaxing routine before bed to sleep deeper.";

  useEffect(() => {
    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Diagnostic Shuffler State
  const [cards, setCards] = useState([
    { id: 1, label: 'Sleep Quality', value: '7.2 hrs', color: '#38bdf8' },
    { id: 2, label: 'Calories Burned', value: '2,450 kcal', color: '#818cf8' },
    { id: 3, label: 'Focus Level', value: 'Great', color: '#34d399' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-[#0f1117] relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <h2 className="font-sans font-bold text-3xl text-white mb-4">Interactive Daily Insights</h2>
          <p className="text-secondary max-w-xl text-lg">Not just charts. Smart widgets that turn your daily habits into clear, easy-to-understand insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Diagnostic Shuffler */}
          <div className="liquid-glass rounded-[2rem] p-8 h-[400px] flex flex-col relative overflow-hidden group">
            <h3 className="font-sans font-bold text-xl text-white mb-2">Health Dashboard</h3>
            <p className="text-sm text-secondary mb-8">A live view of your daily stats.</p>
            
            <div className="relative flex-1 w-full flex items-center justify-center perspective-[1000px]">
              {cards.map((c, i) => {
                const zIndex = 3 - i;
                const scale = 1 - (i * 0.05);
                const translateY = i * 20;
                const opacity = 1 - (i * 0.2);
                
                return (
                  <div 
                    key={c.id}
                    className="absolute w-full max-w-[240px] liquid-glass p-4 rounded-2xl flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{ 
                      zIndex, 
                      transform: `translateY(${translateY}px) scale(${scale})`,
                      opacity,
                      borderLeft: `4px solid ${c.color}`
                    }}
                  >
                    <span className="text-sm font-medium text-white/80">{c.label}</span>
                    <span className="font-mono text-sm" style={{color: c.color}}>{c.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Telemetry Typewriter */}
          <div className="liquid-glass rounded-[2rem] p-8 h-[400px] flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-sans font-bold text-xl text-white mb-1">AI Assistant</h3>
                  <p className="text-sm text-secondary">Smart insights powered by AI.</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-xs text-primary font-mono uppercase tracking-wider">Live Updates</span>
               </div>
             </div>
             
             <div className="flex-1 bg-[#0a0c10] rounded-xl p-6 border border-white/5 font-mono text-sm leading-relaxed text-white/70">
                <span className="text-primary mr-2">&gt;</span>
                {text}
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
             </div>
          </div>

          {/* Card 3: Cursor Protocol Scheduler */}
          <div className="liquid-glass rounded-[2rem] p-8 h-[400px] flex flex-col relative overflow-hidden">
             <h3 className="font-sans font-bold text-xl text-white mb-2">Habit Planner</h3>
             <p className="text-sm text-secondary mb-8">Schedule your habits to fit your real life.</p>
             
             <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-secondary">
                      {d}
                    </div>
                  ))}
                  {Array.from({length: 14}).map((_, i) => (
                    <div key={`cell-${i}`} className={`aspect-square rounded-lg border border-white/5 transition-colors duration-500 ${i === 4 ? 'bg-primary/20 border-primary/40' : 'bg-transparent'}`} />
                  ))}
                </div>
                <button className="btn-magnetic w-full py-3 rounded-xl text-sm mt-auto">
                  Save Routine
                </button>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Philosophy = () => {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.phil-line', {
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 60%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="philosophy" ref={ref} className="py-40 px-6 md:px-12 bg-[#050608] relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-fixed bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-12">
        <h2 className="phil-line text-2xl md:text-3xl text-secondary font-medium tracking-tight">
          Most trackers focus on: collecting random data.
        </h2>
        <h2 className="phil-line text-4xl md:text-6xl text-white font-serif italic tracking-tighter leading-tight">
          We focus on: <span className="text-primary">clear, useful insights</span>.
        </h2>
      </div>
    </section>
  );
};

const Protocol = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.stack-card');
      
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          pin: true,
          pinSpacing: false,
          animation: gsap.to(card, {
            scale: 0.9,
            opacity: 0.5,
            filter: 'blur(10px)',
            ease: 'none'
          }),
          endTrigger: '.stack-container',
          end: 'bottom bottom',
          scrub: true,
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const protocols = [
    { num: '01', title: 'Easy Tracking',         desc: 'Easily log your sleep, meals, and daily tasks.',          icon: Database },
    { num: '02', title: 'Smart Analysis',   desc: 'Our app looks at your habits to find what works best for you.',                icon: Cpu },
    { num: '03', title: 'Clear Action Steps',        desc: 'Get simple, daily steps to reach your goals faster.',               icon: Rocket },
  ];

  return (
    <section id="protocol" ref={containerRef} className="stack-container bg-[#0f1117]">
      {protocols.map((p, i) => (
        <div key={i} className="stack-card h-[100dvh] flex items-center justify-center px-6 sticky top-0 bg-[#0f1117] border-t border-white/5">
          <div className="liquid-glass rounded-[3rem] p-12 md:p-20 max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
            {/* Abstract Graphic */}
            <div className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center relative bg-primary/5">
              <p.icon size={64} className="text-primary absolute z-10" />
              <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_10s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
              <div className="absolute inset-4 rounded-full border border-primary/30 animate-[spin_15s_linear_infinite_reverse]" style={{ borderBottomColor: 'transparent', borderRightColor: 'transparent' }} />
            </div>
            
            <div className="flex-1">
              <span className="font-mono text-primary text-xl mb-4 block">[{p.num}]</span>
              <h2 className="font-sans font-bold text-4xl md:text-5xl text-white mb-6 tracking-tight">{p.title}</h2>
              <p className="text-xl text-secondary leading-relaxed">{p.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#050608] rounded-t-[4rem] pt-24 pb-12 px-6 md:px-12 mt-[-2rem] relative z-20 border-t border-white/10">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/20">
            <span className="font-sans font-bold text-white text-sm tracking-tight pr-[1px] mt-[1px]">
              Fs.
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl text-white tracking-tight">Flowstate.</h2>
        </div>
        <p className="text-secondary max-w-sm mb-8">The ultimate digital instrument for complete life management.</p>
        <Link to="/auth" className="btn-primary px-6 py-3 rounded-xl font-medium inline-block">Sign Up Free</Link>
      </div>
      <div>
        <h4 className="text-white font-medium mb-6">Product</h4>
        <ul className="flex flex-col gap-3 text-sm text-secondary">
          <li><a href="#" className="hover:text-primary transition-colors">Dashboard</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">AI Insights</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-medium mb-6">Legal</h4>
        <ul className="flex flex-col gap-3 text-sm text-secondary">
          <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    
    <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3 liquid-glass px-4 py-2 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-mono text-xs text-green-500/80 uppercase tracking-wider">System Operational</span>
      </div>
      <p className="text-secondary text-sm">© 2026 Flowstate. Protocol</p>
    </div>
  </footer>
);

export default function Landing() {
  return (
    <main className="bg-background min-h-screen selection:bg-primary/30 selection:text-white">
      <NoiseOverlay />
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <Footer />
    </main>
  );
}
