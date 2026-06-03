import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  ChevronDown,
  BarChart3,
  Lock,
  Users,
  Zap,
  Globe,
  Shield,
  Database,
  Clock,
  Share2,
  Mail,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Create short links instantly with our optimized infrastructure"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Track clicks, visitors, devices, browsers, and geographic data in real-time"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Password Protected",
      description: "Secure your links with optional password protection"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Work together with team members in shared workspaces"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description: "Serve your links worldwide with our global CDN infrastructure"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with SSL, encryption, and compliance standards"
    },
  ];

  const faqItems = [
    {
      q: "How many links can I create?",
      a: "With SHRINK, you can create unlimited short links. Scale as you grow!"
    },
    {
      q: "Do you provide API access?",
      a: "Yes! Developers can use our REST API with full documentation and SDKs"
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use enterprise-grade encryption and comply with GDPR, CCPA, and SOC 2"
    },
    {
      q: "Can I export my data?",
      a: "Yes, export analytics data in CSV or PDF format anytime you want"
    },
    {
      q: "What if I want a custom domain?",
      a: "Custom domains are supported on our Pro and Enterprise plans"
    },
    {
      q: "Is there a free plan?",
      a: "Yes! Start with our free plan and upgrade anytime as your needs grow"
    },
  ];

  const testimonials = [
    {
      text: "SHRINK transformed how we track marketing campaigns. The analytics are incredibly detailed!",
      author: "Sarah Chen",
      role: "Marketing Manager",
      company: "TechCorp"
    },
    {
      text: "Best link shortener for developers. The API is clean and the documentation is excellent.",
      author: "Alex Kumar",
      role: "Developer Advocate",
      company: "DevStudio"
    },
    {
      text: "We switched from our old solution and saved 60% on costs. Highly recommend!",
      author: "James Wilson",
      role: "Operations Director",
      company: "GrowthCo"
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "100 links per month",
        "Basic analytics",
        "7 days data retention",
        "Community support",
      ]
    },
    {
      name: "Pro",
      price: "$29",
      description: "For growing businesses",
      period: "/month",
      features: [
        "Unlimited links",
        "Advanced analytics",
        "90 days data retention",
        "Custom domain",
        "API access",
        "Priority support",
      ],
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom integrations",
        "Advanced security",
        "On-premise option",
      ]
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <Navbar />

        {/* Hero Section */}
        <motion.section 
          className="relative overflow-hidden py-20 px-6 md:py-32 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-r from-teal-500/10 to-lime-500/10 dark:from-teal-500/5 dark:to-lime-500/5 blur-3xl rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div 
              className="inline-flex items-center space-x-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/30 px-4 py-2 rounded-full text-sm font-semibold text-teal-700 dark:text-teal-400"
              {...fadeInUp}
            >
              <Zap className="h-4 w-4" />
              <span>Next Generation URL Shortener</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
              variants={fadeInUp}
              {...fadeInUp}
            >
              Transform Long Links<br/>
              <span className="bg-linear-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
                Into Powerful Insights
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
              {...fadeInUp}
            >
              Create short links, track clicks, analyze traffic, and manage everything from one beautiful dashboard. SHRINK powers marketing campaigns for thousands of companies worldwide.
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-4 pt-4"
              {...fadeInUp}
            >
              <Link
                to="/register"
                className="bg-linear-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/login"
                className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition"
              >
                Sign In
              </Link>

              <button className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-20 px-6 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features built for modern teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 transition group"
                variants={staggerItem}
              >
                <div className="text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              {[
                { step: 1, title: "Paste Your Link", desc: "Enter any long URL" },
                { step: 2, title: "Get Short Code", desc: "Instant short link creation" },
                { step: 3, title: "Share & Track", desc: "Monitor clicks and analytics" },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <motion.section 
          className="py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                Loved by Teams Worldwide
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800"
                  variants={staggerItem}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                    <ChevronDown 
                      className={`h-5 w-5 transition ${openFaq === idx ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <motion.section 
          className="py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Choose the plan that's right for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  className={`rounded-2xl p-8 relative ${
                    plan.highlight
                      ? 'bg-linear-to-br from-teal-500 to-lime-500 text-white border-0'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                  variants={staggerItem}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? '' : 'text-slate-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={plan.highlight ? 'opacity-90' : 'text-slate-600 dark:text-slate-400'}>
                    {plan.description}
                  </p>
                  
                  <div className="my-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-sm opacity-90">{plan.period}</span>}
                  </div>

                  <button className={`w-full py-3 rounded-xl font-semibold mb-6 transition ${
                    plan.highlight
                      ? 'bg-white text-teal-600 hover:bg-slate-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}>
                    Get Started
                  </button>

                  <ul className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className={plan.highlight ? '' : 'text-slate-700 dark:text-slate-300'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Ready to Shrink Your Links?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Join thousands of teams who are already tracking their links with SHRINK
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="bg-linear-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition"
              >
                <span>Start Free Today</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 dark:bg-black text-slate-400 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-bold text-white text-lg mb-4">SHRINK</div>
                <p className="text-sm">Transform long links into powerful insights.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="hover:text-white">Features</Link></li>
                  <li><Link to="/" className="hover:text-white">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-white">API</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="hover:text-white">About</Link></li>
                  <li><Link to="/" className="hover:text-white">Blog</Link></li>
                  <li><Link to="/" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="hover:text-white">Privacy</Link></li>
                  <li><Link to="/" className="hover:text-white">Terms</Link></li>
                  <li><Link to="/" className="hover:text-white">Security</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm">&copy; 2024 SHRINK. All rights reserved.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-white"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="hover:text-white"><Github className="h-5 w-5" /></a>
                <a href="#" className="hover:text-white"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
