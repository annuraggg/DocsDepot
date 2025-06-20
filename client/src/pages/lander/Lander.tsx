import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  Trophy,
  Award,
  Users,
  Upload,
  Star,
  Target,
  ChevronRight,
  Shield,
  Crown,
  Medal,
  Sparkles,
  ArrowRight,
  Check,
  Globe,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20" />
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

type BlurTextProps = {
  text: string;
  delay?: number;
  className?: string;
};

const BlurText = ({ text, delay = 150, className = "" }: BlurTextProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.h1
      className={`${className} transition-all duration-1000 ${isVisible ? 'blur-none opacity-100' : 'blur-sm opacity-0'
        }`}
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {text}
    </motion.h1>
  );
};

type StarBorderProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const StarBorder = ({ children, className = "", onClick }: StarBorderProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold overflow-hidden group ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-2">
        {children}
        <ArrowRight size={20} />
      </div>
      <motion.div
        className="absolute inset-0 border-2 border-yellow-400 rounded-xl opacity-0 group-hover:opacity-100"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(251, 191, 36, 0.4)",
            "0 0 0 10px rgba(251, 191, 36, 0)",
          ],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.button>
  );
};

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
};

const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: delay * 0.2 }
        }
      }}
      className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className={`w-16 h-16 ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

type HouseCardProps = {
  name: string;
  color: string;
  points: number;
  rank: number;
  students: number;
};

const HouseCard = ({ name, color, points, rank, students }: HouseCardProps) => {
  return (
    <motion.div
      className={`relative p-6 rounded-xl bg-gradient-to-br ${color} text-white overflow-hidden group cursor-pointer`}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-2 right-2">
        <Crown className="text-yellow-400" size={24} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} />
          <span className="text-sm opacity-90">Rank #{rank}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Star size={16} />
          <span className="font-semibold">{points.toLocaleString()} points</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span className="text-sm opacity-90">{students} students</span>
        </div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

type StatsCounterProps = {
  end: number;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
};

const StatsCounter = ({ end, label, icon: Icon }: StatsCounterProps) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      const timer = setInterval(() => {
        setCount(prev => {
          if (prev < end) {
            return prev + Math.ceil(end / 50);
          }
          return end;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [inView, end, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
      }}
      className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="text-white" size={24} />
      </div>
      <div className="text-3xl font-bold text-white mb-2">{count.toLocaleString()}+</div>
      <div className="text-gray-300 text-sm">{label}</div>
    </motion.div>
  );
};

const Lander = () => {

  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Certificate Upload",
      description: "Upload internal college certifications, external certifications like AWS Solutions Architect, and event participation certificates all in one place.",
      gradient: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Smart Point System",
      description: "Earn points for every certificate uploaded. Different certificates have different point values based on their significance and difficulty.",
      gradient: "bg-gradient-to-br from-green-500 to-teal-600"
    },
    {
      icon: Trophy,
      title: "House Competition",
      description: "Your points contribute to your house total. Compete with other houses in a friendly rivalry to reach the top of the leaderboard.",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600"
    },
    {
      icon: Target,
      title: "Achievement Tracking",
      description: "Keep track of all your achievements and certifications in an organized, beautiful interface. Never lose track of your accomplishments.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
    }
  ];

  const houses = [
    { name: "Phoenix House", color: "from-red-500 to-orange-600", points: 12840, rank: 1, students: 156 },
    { name: "Dragon House", color: "from-green-500 to-emerald-600", points: 11920, rank: 2, students: 142 },
    { name: "Griffin House", color: "from-blue-500 to-cyan-600", points: 10650, rank: 3, students: 138 },
    { name: "Eagle House", color: "from-purple-500 to-violet-600", points: 9840, rank: 4, students: 134 }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <AnimatedBackground />

      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full text-sm font-medium border border-purple-500/30">
              🏆 APSIT House Cup
            </span>
          </motion.div>

          <BlurText
            text="Welcome to DocsDepot"
            delay={300}
            className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Your ultimate platform for certificate management and house competition.
            Upload certificates, earn points, and help your house climb to victory!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <StarBorder className="text-xl px-12 py-4"
            onClick={() => navigate("/auth")}>
              Get Started
            </StarBorder>
            <motion.button
              className="flex items-center gap-2 text-lg text-gray-300 hover:text-white transition-colors"
              whileHover={{ x: 5 }}
            >
              Learn More <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Platform Statistics
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See how our community is growing and achieving together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatsCounter end={2840} label="Certificates Uploaded" icon={Award} />
            <StatsCounter end={580} label="Active Students" icon={Users} />
            <StatsCounter end={45} label="Different Certifications" icon={BookOpen} />
            <StatsCounter end={120} label="Events Tracked" icon={Calendar} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to manage certificates and compete with your house
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              House Leaderboard
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See which house is leading the competition and where your house stands
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {houses.map((house, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <HouseCard {...house} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Simple steps to start earning points for your house
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Certificates",
                description: "Upload your internal college certifications, external certifications like AWS, Google Cloud, or event participation certificates.",
                icon: Upload,
                color: "from-blue-500 to-purple-600"
              },
              {
                step: "02",
                title: "Earn Points",
                description: "Each certificate has a point value based on its type and difficulty. Accumulate points for your personal achievement tracker.",
                icon: Star,
                color: "from-green-500 to-teal-600"
              },
              {
                step: "03",
                title: "Boost Your House",
                description: "Your earned points automatically contribute to your house's total score. Help your house climb up the leaderboard!",
                icon: Trophy,
                color: "from-orange-500 to-red-600"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center group"
              >
                <div className="relative">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Certificate Categories
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Different types of certificates you can upload and their point values
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Internal Certifications",
                description: "College-provided certificates and internal course completions",
                points: "20-50 points",
                icon: Shield,
                color: "from-blue-500 to-cyan-600",
                examples: ["Course Completion", "Workshop Certificates", "Lab Certifications"]
              },
              {
                title: "External Certifications",
                description: "Industry-recognized certifications from major tech companies",
                points: "30-100 points",
                icon: Globe,
                color: "from-green-500 to-emerald-600",
                examples: ["AWS Solutions Architect", "Google Cloud Professional", "Microsoft Azure"]
              },
              {
                title: "Event Participation",
                description: "Participation and achievement certificates from events",
                points: "10-30 points",
                icon: Medal,
                color: "from-purple-500 to-pink-600",
                examples: ["Hackathons", "Technical Competitions", "Workshops"]
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{category.title}</h3>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 font-semibold">{category.points}</span>
                </div>
                <div className="space-y-2">
                  {category.examples.map((example, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <Check size={14} className="text-green-400" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              Join thousands of students already earning points and competing for their houses.
              Upload your first certificate today!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <StarBorder className="text-xl px-12 py-4">
                Sign In & Start
              </StarBorder>
              <motion.button
                className="flex items-center gap-2 text-lg text-purple-400 hover:text-purple-300 transition-colors"
                whileHover={{ x: 5 }}
              >
                View Leaderboard <Trophy size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="text-yellow-400" size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CertHub
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 APSIT House Cup. Empowering students through achievement recognition.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Lander;