import { motion } from "framer-motion";
import { Shield, Search, Globe, Zap, FileText, Lock, Download, Terminal, Cloud, Github, Mail, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { useState } from "react";
import { ReconLogo } from "@/components/ReconLogo";

export default function Landing() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard", { state: { domain } });
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0c29] text-white overflow-x-hidden selection:bg-purple-500/30 font-sans">
      {/* Global Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar (Minimal) */}
        <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <ReconLogo size={48} withText />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-purple-200 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              v1.0 Live: Automated Reconnaissance
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">Reconnaissance</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">Made Effortless</span>
            </h1>

            <p className="text-xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed">
              Automated passive reconnaissance for bug bounty hunters. Instantly map subdomains, detect exposures, and export clean reports.
            </p>

            {/* Glass Search Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-12 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input 
                  placeholder="Enter domain (e.g., example.com)" 
                  className="h-14 pl-12 bg-transparent border-none text-lg text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartScan(e)}
                />
              </div>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 border-none transition-all hover:scale-[1.02]"
                onClick={handleStartScan}
              >
                Start Scan
              </Button>
            </motion.div>
            <p className="text-sm text-white/30 mt-4">No signup required. Passive scanning only.</p>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-4 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Asset Discovery",
                desc: "Uses SecurityTrails to map hidden subdomains and development surfaces.",
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                icon: Zap,
                title: "Passive Fingerprinting",
                desc: "Uses Shodan + HTTP checks to detect open ports, technologies, and exposed files without sending active traffic.",
                color: "text-purple-400",
                bg: "bg-purple-500/10"
              },
              {
                icon: FileText,
                title: "Risk Analysis",
                desc: "Automatically classifies findings and compiles them into PDF, Markdown, or JSON.",
                color: "text-pink-400",
                bg: "bg-pink-500/10"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group"
              >
                <div className={`h-14 w-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-white/50">Professional-grade tools available for free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Deep Subdomain Enumeration", icon: Search },
              { title: "Exposure Detection", icon: Lock },
              { title: "100% Passive & Safe", icon: Shield },
              { title: "Instant PDF/JSON Reporting", icon: Download },
              { title: "Developer-Friendly API Output", icon: Terminal },
              { title: "Cloud Powered Processing", icon: Cloud },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                    <feature.icon className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden p-12 text-center border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl -z-10" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Start Your Recon?</h2>
              <p className="text-xl text-white/60 mb-8">Free forever for the community.</p>
              <Button 
                size="lg" 
                className="h-14 px-10 text-lg rounded-full bg-white text-purple-900 hover:bg-white/90 shadow-xl shadow-white/10 transition-transform hover:scale-105"
                onClick={() => navigate("/dashboard")}
              >
                Start Scanning Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <ReconLogo size={40} />
              <div>
                <h4 className="font-bold text-lg">ReconFlow</h4>
                <p className="text-xs text-white/40">Automated Recon for Bug Bounty Hunters</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/in/nshul17/" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/LousyCake" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:nshul.shukla@gmail.com" className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}