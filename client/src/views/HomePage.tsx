import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaKey, FaWallet, FaMobileAlt, FaSuitcase, FaUsers, FaCheckCircle, FaClipboardList, FaArrowRight, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaBolt, FaGem } from "react-icons/fa";

const exampleItems = [
  {
    image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=200&fit=crop",
    name: "iPhone 13",
    location: "Delhi Metro - Station 3",
    date: "2026-03-01",
    details: "Space Gray iPhone 13 Pro with AppleCare. Contains family photos.",
    recovered: true,
  },
  {
    image: "https://images.unsplash.com/photo-1539513172ce-8e48ae7580f9?w=300&h=200&fit=crop",
    name: "Leather Wallet",
    location: "Mumbai Mall - Food Court",
    date: "2026-02-25",
    details: "Brown leather RFID wallet with important documents.",
    recovered: true,
  },
  {
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop",
    name: "Car Keys Set",
    location: "Bangalore Park - Near Playground",
    date: "2026-03-03",
    details: "Silver Toyota car keys with blue keychain.",
    recovered: false,
  },
  {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
    name: "Blue Backpack",
    location: "Chennai Airport - Security",
    date: "2026-02-28",
    details: "Dell laptop backpack with travel documents.",
    recovered: true,
  }
];

const heroItems = [
  { icon: <FaMobileAlt size={64} />, label: "Phone", delay: 0 },
  { icon: <FaWallet size={64} />, label: "Wallet", delay: 0.2 },
  { icon: <FaKey size={64} />, label: "Keys", delay: 0.4 },
  { icon: <FaSuitcase size={64} />, label: "Bag", delay: 0.6 },
];

const features = [
  {
    icon: <FaClipboardList size={40} />,
    title: "Report Lost Items",
    desc: "Instantly report your lost items with photos and details.",
    color: "from-blue-400 to-blue-600",
    delay: 0,
  },
  {
    icon: <FaCheckCircle size={40} />,
    title: "Report Found Items",
    desc: "Help the community by reporting items you've found.",
    color: "from-green-400 to-green-600",
    delay: 0.1,
  },
  {
    icon: <FaUsers size={40} />,
    title: "Community Support",
    desc: "Connect with thousands of helpful community members.",
    color: "from-purple-400 to-purple-600",
    delay: 0.2,
  },
];

const stats = [
  { label: "Items Recovered", value: 1240, icon: "🎯" },
  { label: "Active Users", value: 3200, icon: "👥" },
  { label: "Items Reported", value: 5400, icon: "📦" },
];

const testimonials = [
  {
    name: "Ayesha Khan",
    role: "Delhi",
    story: "Lost my wallet at the metro and got it back the same day thanks to Khoj!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    name: "Rahul Sharma",
    role: "Mumbai",
    story: "Found a phone and used Khoj to connect with the owner. So rewarding!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Bangalore",
    story: "The community here is so supportive. Got my laptop bag back within 48 hours!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / 100;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-black" />
        
        {/* Massive blurry KHOJ background text - even bigger and more unique */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.04, 0.08, 0.04],
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div 
            className="font-black tracking-wider text-blue-600/30 select-none"
            style={{
              fontSize: 'clamp(200px, 40vw, 800px)',
              lineHeight: '1',
              textShadow: `
                0 0 40px rgba(59, 130, 246, 0.6),
                0 0 80px rgba(139, 92, 246, 0.4),
                0 0 120px rgba(59, 130, 246, 0.3),
                0 0 160px rgba(244, 63, 94, 0.2)
              `,
              filter: 'blur(2px)',
              transform: 'perspective(1000px) rotateX(0deg)',
            }}
          >
            KHOJ
          </div>
        </motion.div>

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"
        />
        
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-25"
        />

        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/4 w-80 h-80 bg-pink-600 rounded-full blur-3xl opacity-10"
        />

        {/* Floating animated shapes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-md"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, Math.random() * 200 - 100, 0],
              x: [0, Math.random() * 200 - 100, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/50 backdrop-blur-md hover:border-blue-300/80 transition-all"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              ⚡
            </motion.span>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Find Lost. Return Found. Build Community.</span>
          </motion.div>

          {/* MASSIVE KHOJ Title - Ultra Bold and Unique */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{
                textShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[120px] sm:text-[150px] md:text-[200px] lg:text-[280px] font-black tracking-wider leading-none"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 25%, #f472b6 50%, #06b6d4 75%, #60a5fa 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              K
              <span className="inline-block">H</span>
              <span className="inline-block">O</span>
              <span className="inline-block">J</span>
            </motion.div>
            
            {/* Glow effect behind title */}
            <div className="absolute inset-0 blur-3xl opacity-30 pointer-events-none" style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
            }} />
          </motion.div>

          {/* Subheading with unique styling */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 max-w-4xl leading-tight"
          >
            <span className="text-white">Find What </span>
            <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
              Matters Most
            </span>
          </motion.h1>

          {/* Description with enhanced styling */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed"
          >
            Reconnect lost items with their rightful owners through our revolutionary community platform. 
            <span className="block text-gray-400 mt-2">Every item has a story. Every item deserves to come home.</span>
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 mb-20"
          >
            <motion.button
              whileHover={{ 
                scale: 1.08,
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.8), 0 0 100px rgba(139, 92, 246, 0.4)',
              }}
              whileTap={{ scale: 0.92 }}
              className="group relative px-10 py-5 font-bold text-lg text-white overflow-hidden rounded-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white" />
              <span className="relative flex items-center gap-3 justify-center">
                <FaBolt size={20} className="group-hover:animate-spin" />
                Report Lost Item
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.08,
                boxShadow: '0 0 50px rgba(34, 197, 94, 0.8), 0 0 100px rgba(16, 185, 129, 0.4)',
              }}
              whileTap={{ scale: 0.92 }}
              className="group relative px-10 py-5 font-bold text-lg text-white overflow-hidden rounded-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white" />
              <span className="relative flex items-center gap-3 justify-center">
                <FaGem size={20} className="group-hover:animate-bounce" />
                Report Found Item
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
          </motion.div>

          {/* Hero Items Grid - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
          >
            {heroItems.map((item, idx) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 backdrop-blur-md hover:border-gray-500 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, delay: idx * 0.2, repeat: Infinity }}
                    className="text-4xl text-blue-400 group-hover:text-cyan-400 transition-colors"
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Section - Redesigned */}
        <section className="py-32 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-white">How </span>
                <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Khoj Works
                </span>
              </h2>
              <p className="text-gray-400 text-lg">Three simple steps to reconnect what matters</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -15, scale: 1.05 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="group relative overflow-hidden rounded-3xl backdrop-blur-xl border border-gray-700/50 p-10 hover:border-gray-500/80 transition-all bg-gray-900/40"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition duration-500`} />
                  
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute -right-16 -top-16 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition`}
                  />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 text-white`}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-20 px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Recent Items
            </h2>
            <p className="text-center text-gray-400 mb-16">Help reunite belongings with their owners</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {exampleItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur border border-gray-700/50 group-hover:border-gray-600 transition">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                      {item.recovered && (
                        <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <FaCheckCircle size={12} /> Recovered
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-white mb-2">{item.name}</h4>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <FaMapMarkerAlt size={12} /> {item.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                        <FaCalendarAlt size={10} /> {item.date}
                      </div>
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="text-sm text-gray-300 overflow-hidden transition"
                      >
                        {item.details}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-gray-700/50 p-8 hover:border-gray-600 transition"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition" />
                <div className="relative text-center">
                  <div className="text-5xl mb-3">{stat.icon}</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                  >
                    <AnimatedCounter value={stat.value} />
                    {stat.label === "Items Recovered" && "+"}
                  </motion.div>
                  <div className="text-gray-400 font-semibold">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-center text-gray-400 mb-16">Real stories from our community</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={t.name}
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-gray-700/50 p-8 hover:border-gray-600 transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                    />
                    <div>
                      <h4 className="text-white font-bold">{t.name}</h4>
                      <p className="text-gray-400 text-sm">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" size={16} />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{t.story}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur border border-blue-500/30 p-12">
              <h2 className="text-4xl font-bold mb-6 text-white">Join the Khoj Community</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Together, we're making sure no item stays lost. Start reconnecting what matters.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-white shadow-xl hover:shadow-purple-500/50 transition"
              >
                Get Started Now
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-700/50 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Khoj
                </h3>
                <p className="text-gray-400 text-sm">Reuniting lost items with their owners.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">About</a></li>
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700/50 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2026 Khoj. All rights reserved.</p>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-xl">𝕏</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-xl">f</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-xl">in</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
