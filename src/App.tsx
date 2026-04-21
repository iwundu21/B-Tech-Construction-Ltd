/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardHat, 
  Ruler, 
  Home, 
  Construction, 
  ChevronRight, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Award,
  Zap,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Box,
  Layers
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Blueprint3D } from './components/Blueprint3D';

// Initialize Gemini lazily to avoid startup crashes on external hosts
const getAiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAi = new GoogleGenAI({ apiKey });
  return genAi.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // Using a more stable model name for standard deployments
};

const aiModel = getAiModel();

const SERVICES = [
  {
    id: 'engineering',
    title: 'Structural Engineering',
    description: 'Precision engineering for modern architectural marvels. We ensure structural integrity and efficiency.',
    icon: <Ruler className="w-8 h-8" />,
    features: ['Structural Design', 'Site Surveys', 'Load Analysis']
  },
  {
    id: 'building',
    title: 'Home Construction',
    description: 'Turn-key home building solutions from foundation to finishing touches with premium craftsmanship.',
    icon: <Home className="w-8 h-8" />,
    features: ['Residential Builds', 'Smart Homes', 'Sustainable Design']
  },
  {
    id: 'reno',
    title: 'Modern Renovations',
    description: 'Breathe new life into existing structures with contemporary designs and high-quality materials.',
    icon: <Construction className="w-8 h-8" />,
    features: ['Kitchen & Bath', 'Extensions', 'Interior Remodeling']
  },
  {
    id: 'management',
    title: 'Project Management',
    description: 'End-to-end management of construction sites, scheduling, and subcontractor coordination.',
    icon: <HardHat className="w-8 h-8" />,
    features: ['Timeline Control', 'Budgeting', 'Safety Audits']
  }
];

interface ProjectDetail {
  title: string;
  location: string;
  category: string;
  image: string;
  description: string;
  additionalImages: string[];
  specs: { label: string; value: string }[];
}

const PROJECTS: ProjectDetail[] = [
  {
    title: 'Lekki Waterfront Manor',
    location: 'Plot 15, Admiralty Way, Lekki Phase 1, Lagos',
    category: 'Luxury Residential',
    image: 'https://picsum.photos/seed/nigeria-house-1/1200/800',
    description: 'A masterpiece of contemporary coastal architecture. This 6-bedroom smart manor features state-of-the-art structural reinforcements to withstand marine environments while maintaining a seamless glass-to-concrete aesthetic.',
    additionalImages: [
      'https://picsum.photos/seed/waterfront-int-1/800/600',
      'https://picsum.photos/seed/waterfront-ext-2/800/600'
    ],
    specs: [
      { label: 'Total Area', value: '850 m²' },
      { label: 'Completion', value: 'Dec 2024' },
      { label: 'Engineers', value: 'Bigson & Team' }
    ]
  },
  {
    title: 'Maitama Diplomatic Villa',
    location: 'No. 42 Gana Street, Maitama, Abuja',
    category: 'Elite Estate',
    image: 'https://picsum.photos/seed/nigeria-house-2/1200/800',
    description: 'Designed for high-profile residents in the heart of Abuja. This villa combines neo-classical proportions with modern structural efficiency, featuring advanced HVAC systems and customized biometric security hollowing.',
    additionalImages: [
      'https://picsum.photos/seed/maitama-int-1/800/600',
      'https://picsum.photos/seed/maitama-ext-2/800/600'
    ],
    specs: [
      { label: 'Total Area', value: '1,200 m²' },
      { label: 'Completion', value: 'March 2025' },
      { label: 'Style', value: 'Neo-Classical' }
    ]
  },
  {
    title: 'Ikeja Heritage Heights',
    location: '24 Oba Akinjobi Way, GRA Ikeja, Lagos',
    category: 'Premium Modern',
    image: 'https://picsum.photos/seed/nigeria-house-3/1200/800',
    description: 'A modular living project that prioritizes natural light and vertical ventilation. This structure utilizes high-tensile steel framing to produce expansive open-plan interiors without compromising load-bearing integrity.',
    additionalImages: [
      'https://picsum.photos/seed/ikeja-int-1/800/600',
      'https://picsum.photos/seed/ikeja-ext-2/800/600'
    ],
    specs: [
      { label: 'Total Area', value: '620 m²' },
      { label: 'Duration', value: '14 Months' },
      { label: 'System', value: 'Steel Frame' }
    ]
  },
  {
    title: 'Amen Eco-Estates',
    location: 'Lekki-Epe Expressway, Ibeju-Lekki, Lagos',
    category: 'Sustainable Living',
    image: 'https://picsum.photos/seed/nigeria-house-4/1200/800',
    description: 'Leading the way in Nigerian green construction. These estates incorporate solar-integrated roofing and greywater recycling systems, all supported by B Tech’s proprietary eco-structural foundations.',
    additionalImages: [
      'https://picsum.photos/seed/eco-int-1/800/600',
      'https://picsum.photos/seed/eco-ext-2/800/600'
    ],
    specs: [
      { label: 'Energy', value: '70% Solar' },
      { label: 'Materials', value: 'Bio-Brick' },
      { label: 'Status', value: 'Phase 2' }
    ]
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // AI Consultant State
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!aiModel) {
        throw new Error("API Key missing");
      }

      const prompt = `You are the AI Consultant for "B Tech Construction Ltd", led by the renowned Lead Engineer Bigson. 
      You help potential clients with:
      1. Explaining engineering concepts (structural integrity, soil testing, etc.)
      2. Giving rough cost estimates for construction in Nigeria (keep it professional and emphasize it's only an estimate).
      3. Answering questions about our services: Structural Engineering, Home Building, Renovations, and Project Management.
      4. Guiding them to contact Engineer Bigson directly for consultations or site visits.
      
      Business Contact: +234 707 046 2347
      Lead Engineer: Engineer Bigson
      
      Keep responses professional, helpful, and concise.
      
      User Query: ${userMessage}`;

      const response = await aiModel.generateContent(prompt);
      const aiResponse = response.response.text() || "I apologize, but I'm having trouble connecting right now. Please contact Engineer Bigson directly at +234 707 046 2347.";
      setChatHistory(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "I encountered an error. This might be due to a missing configuration. Please contact Engineer Bigson directly at +234 707 046 2347 for your inquiry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-sm">
              <div className="w-6 h-6 border-2 border-brand rotate-45 flex items-center justify-center">
                <span className="text-white text-[8px] -rotate-45 font-bold">BT</span>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">B TECH <span className="text-brand">CONSTRUCTION</span> LTD</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wider">
            <a href="#" className="text-brand">Home</a>
            <a href="#services" className="text-slate-600 hover:text-slate-900 transition-colors">Engineering</a>
            <a href="#projects" className="text-slate-600 hover:text-slate-900 transition-colors">Portfolio</a>
            <a href="#contact" className="btn-primary">Consult Now</a>
          </div>

          <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="text-slate-900" /> : <Menu className="text-slate-900" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 font-semibold uppercase tracking-wider text-sm">
                <a href="#" onClick={() => setIsMenuOpen(false)} className="py-2 text-brand transition-colors">Home</a>
                <a href="#services" onClick={() => setIsMenuOpen(false)} className="py-2 text-slate-600 hover:text-slate-900 transition-colors">Services</a>
                <a href="#projects" onClick={() => setIsMenuOpen(false)} className="py-2 text-slate-600 hover:text-slate-900 transition-colors">Projects</a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="btn-primary justify-center">Consult Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-50">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-bg text-brand-text text-[10px] font-bold uppercase tracking-[0.2em] rounded mb-8">
              <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
              Licensed Structural Engineers
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8">
              ENGINEERING <br/>
              <span className="text-brand">MODERN LIFE</span>
            </h1>
            <p className="text-slate-600 text-lg mb-10 max-w-lg leading-relaxed">
              B Tech Construction Ltd delivers precision-driven home building and structural engineering solutions. We bridge the gap between architectural vision and structural integrity.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">
                View Portfolio <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button className="btn-secondary">
                Our Services
              </button>
            </div>
            
            <div className="mt-16 flex items-center gap-12">
              <div className="flex flex-col border-l-4 border-slate-900 pl-4">
                <span className="text-3xl font-black text-slate-900">450+</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Projects Completed</span>
              </div>
              <div className="flex flex-col border-l-4 border-brand pl-4">
                <span className="text-3xl font-black text-slate-900">12</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Excellence Awards</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xl bg-slate-100">
               {/* Grid Pattern Backdrop */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}></div>
              
              <img 
                src="https://picsum.photos/seed/construction-plan-1/1200/1500" 
                alt="Engineering Visual" 
                className="w-full h-full object-cover opacity-60 mix-blend-multiply transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-2xl border border-slate-200 w-72 rounded-sm">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Active Site Report</h4>
                 <p className="text-lg font-bold text-slate-800 leading-tight mb-1">Maitama Diplomatic Villa</p>
                 <p className="text-[10px] text-slate-500 mb-4 font-mono uppercase tracking-tighter">Structural Integrity: Verified</p>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-brand h-full w-[85%]"></div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Digital Engineering Section */}
      <section className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-bg text-brand-text text-[10px] font-bold uppercase tracking-[0.2em] rounded mb-8">
                <Box className="w-3 h-3" />
                V-Alpha Preview
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                DIGITAL <br />
                <span className="text-brand">ARCHITECTURAL</span> <br />
                LAB
              </h2>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Before the first brick is laid, we simulate every structural element in high-fidelity 3D. Our digital twin technology allows you to explore your future home in real-time.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-sm">
                  <Layers className="w-6 h-6 text-brand mb-4" />
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-2">Layered Specs</h4>
                  <p className="text-xs text-slate-500">Analyze foundations, electrical, and plumbing separately.</p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-brand mb-4" />
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-2">Stress Tests</h4>
                  <p className="text-xs text-slate-500">Virtual stress testing for maximum seismic resilience.</p>
                </div>
              </div>

              <button className="btn-primary">
                Explore Lab Features
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="h-[600px] shadow-2xl relative"
            >
              <Blueprint3D />
              
              {/* Floating UI Indicator */}
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden xl:block">
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-24 h-px bg-slate-300 relative">
                       <div className="absolute -right-2 -top-1 w-2 h-2 bg-brand rounded-full"></div>
                       <div className="absolute right-4 -top-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Node #{i}0X</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
            <div className="max-w-2xl">
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Core Competencies</div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">PRECISION <br /><span className="text-brand">ENGINEERING</span></h2>
            </div>
            <p className="text-slate-500 max-w-sm mb-2 text-lg">
              From rigorous load analysis to final project handover, we bridge the gap between vision and reality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-10 border border-slate-100 rounded-sm bg-slate-50/50 hover:bg-white hover:border-brand hover:shadow-xl transition-all duration-500"
              >
                <div className="w-14 h-14 bg-slate-900 text-brand rounded-sm flex items-center justify-center mb-10 shadow-lg">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-10">
                  {service.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="flex items-center gap-2 text-slate-900 text-xs font-black uppercase tracking-widest hover:text-brand transition-colors">
                  Details <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Feature Bar */}
      <section className="w-full bg-slate-900 px-6 md:px-12 py-16 grid md:grid-cols-3 gap-12 shrink-0">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
            <div className="w-5 h-5 border-2 border-brand rotate-45 shadow-[0_0_15px_rgba(217,119,6,0.3)]"></div>
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Structural Integrity</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">Rigorous load analysis and material testing for generational safety.</p>
          </div>
        </div>
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
            <div className="w-6 h-[2px] bg-brand shadow-[0_0_15px_rgba(217,119,6,0.5)]"></div>
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Sustainable Design</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">Energy-efficient modular systems that minimize environmental impact.</p>
          </div>
        </div>
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
            <div className="w-5 h-5 border-2 border-brand rounded-full shadow-[0_0_15px_rgba(217,119,6,0.3)]"></div>
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Project Management</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">End-to-end execution from schematic blueprints to final handover.</p>
          </div>
        </div>
      </section>

      {/* Projects Grid with Theme */}
      <section id="projects" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 mb-24 items-end">
            <div>
              <h2 className="text-6xl font-black text-slate-900 leading-[0.85] tracking-tighter">PROJECT <br /><span className="text-brand">ARCHIVES</span></h2>
            </div>
            <p className="text-slate-500 text-lg border-l-4 border-slate-900 pl-8 leading-relaxed italic">
              A synthesis of structural mastery and architectural vision. Explore our recently commissioned developments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white border border-slate-200 rounded-sm shadow-sm hover:shadow-2xl transition-all duration-700"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-brand-bg text-brand-text text-[8px] font-black uppercase tracking-widest rounded-sm mb-3">
                        {project.category}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="w-12 h-12 bg-slate-900 text-brand flex items-center justify-center rounded-sm transition-transform hover:rotate-45"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-brand" /> {project.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white z-[110] shadow-2xl rounded-sm overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-64 md:h-full relative bg-slate-100">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 left-4 bg-white/90 text-slate-900 p-2 rounded-sm md:hidden"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 h-full overflow-y-auto p-8 md:p-16 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-2 block">{selectedProject.category}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">{selectedProject.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="hidden md:flex p-3 hover:bg-slate-100 rounded-sm transition-colors text-slate-400"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-12 border-b border-slate-100 pb-8">
                    <MapPin className="w-5 h-5 text-brand" /> {selectedProject.location}
                </div>

                <div className="bg-slate-50 p-8 rounded-sm mb-12 border-l-4 border-brand">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Narrative</h4>
                    <p className="text-slate-600 leading-relaxed text-lg italic">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-16">
                  {selectedProject.specs.map((spec, i) => (
                    <div key={i} className="p-4 border border-slate-100 bg-white">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</div>
                      <div className="text-sm font-black text-slate-900 uppercase">{spec.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Internal Specifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProject.additionalImages.map((img, i) => (
                        <div key={i} className="aspect-video rounded-sm overflow-hidden border border-slate-200">
                          <img 
                            src={img} 
                            alt={`Detail ${i}`} 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                </div>
                
                <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                   <button className="btn-primary">Request Similar Specs</button>
                   <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ref: BT-ARCH-{selectedProject.title.substring(0,3).toUpperCase()}</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Consultant Trigger */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAiOpen(true)}
          className="w-16 h-16 bg-slate-900 text-brand rounded-full flex items-center justify-center shadow-2xl relative border-2 border-white/10"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full animate-ping opacity-75" />
          <MessageSquare className="w-8 h-8" />
        </motion.button>
      </div>

      {/* AI Assistant UI Adjustments */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-white border-l border-slate-200 z-[80] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-brand flex items-center justify-center rounded-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">AI ENGINEER</h3>
                    <p className="text-[10px] text-brand font-bold uppercase tracking-widest animate-pulse">Structural Consultant Online</p>
                  </div>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="hover:bg-slate-200 p-2 rounded-sm transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                {chatHistory.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <MessageSquare className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-sm">Consultation Hub</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">Ask about structural analysis, load testing, or coordinate site surveys.</p>
                  </div>
                )}
                {chatHistory.map((chat, i) => (
                  <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 text-sm leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-sm italic' 
                        : 'bg-white border border-slate-200 text-slate-600 rounded-sm shadow-sm'
                    }`}>
                      {chat.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center gap-3 shadow-sm">
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-brand rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand rounded-full" />
                      </div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Processing Specs</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 border-t border-slate-100 bg-white">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="ENTER SPECIFICATION QUERY..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-6 py-5 focus:outline-none focus:border-slate-900 transition-colors text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 pr-16"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 p-3 bg-slate-900 text-brand disabled:bg-slate-100 disabled:text-slate-300 rounded-sm transition-all hover:bg-slate-800 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer / Contact with Theme */}
      <footer id="contact" className="bg-white border-t border-slate-200 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-24 mb-32">
            <div className="lg:col-span-2">
              <h2 className="text-5xl font-black text-slate-900 mb-12 tracking-tighter">INITIATE <span className="text-brand italic font-light">CONSULTATION</span></h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <p className="text-slate-500 leading-loose text-lg">
                    Ready to bridge the gap between vision and structural reality? Our expert engineers are available for technical assessments and site evaluations.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 rounded-sm border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><Mail className="w-5 h-5" /></a>
                    <a href="#" className="w-12 h-12 rounded-sm border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><Phone className="w-5 h-5" /></a>
                    <a href="#" className="w-12 h-12 rounded-sm border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><MapPin className="w-5 h-5" /></a>
                  </div>
                </div>
                <div className="space-y-6">
                  <input type="text" placeholder="FULL NAME" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 focus:border-slate-900 outline-none transition-colors text-[10px] font-bold tracking-widest" />
                  <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 focus:border-slate-900 outline-none transition-colors text-[10px] font-bold tracking-widest" />
                  <textarea placeholder="PROJECT SPECIFICATIONS" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 focus:border-slate-900 outline-none transition-colors text-[10px] font-bold tracking-widest" />
                  <button className="btn-primary w-full justify-center">Submit Inquiry</button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-12 rounded-sm shadow-2xl relative overflow-hidden">
              {/* Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" />
              
              <h3 className="text-2xl font-black text-white mb-10 tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-8 bg-brand" />
                TECHNICAL HQ
              </h3>
              <div className="space-y-10">
                <div className="flex gap-5">
                  <HardHat className="text-brand shrink-0 w-6 h-6" />
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">Lead Engineer</h4>
                    <p className="text-sm text-slate-400 font-medium tracking-tight">Engineer Bigson</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <Phone className="text-brand shrink-0 w-6 h-6" />
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">Technical Line</h4>
                    <p className="text-sm text-slate-400 font-medium tracking-tight">+234 707 046 2347</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <MapPin className="text-brand shrink-0 w-6 h-6" />
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-2">Main Office</h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed tracking-tight">12 Admiral Manor, <br />Lekki Phase 1, Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-sm">
                <div className="w-6 h-6 border-2 border-brand rotate-45 flex items-center justify-center">
                  <span className="text-white text-[8px] -rotate-45 font-bold">BT</span>
                </div>
              </div>
              <span className="font-display font-black text-slate-900 tracking-tight uppercase">B TECH CONSTRUCTION LTD</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} B Tech Construction. Engineer Reg MT-449102-S
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Integrity Code</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

