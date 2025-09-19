import { useState, useEffect, useRef, Suspense, lazy, startTransition } from "react";
import { 
  Globe, 
  Mail, 
  Code, 
  Smartphone, 
  Settings, 
  Bot,
  Database,
  Star,
  ArrowRight,
  CheckCircle,
  Award,
  Users,
  TrendingUp,
  Eye,
  Download,
  MapPin,
  Phone,
  Calendar,
  Menu,
  X,
  Clock,
  Linkedin,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

// Lazy load heavy ContactForm (react-hook-form + zod + emailjs)
const ContactFormLazy = lazy(() => import("@/components/contact-form").then(module => ({ default: module.ContactForm })));

// Lazy load Dialog components - only loaded when user opens project modal
const DialogLazy = lazy(() => import("@/components/ui/dialog").then(module => ({ default: module.Dialog })));
const DialogContentLazy = lazy(() => import("@/components/ui/dialog").then(module => ({ default: module.DialogContent })));
const DialogHeaderLazy = lazy(() => import("@/components/ui/dialog").then(module => ({ default: module.DialogHeader })));
const DialogTitleLazy = lazy(() => import("@/components/ui/dialog").then(module => ({ default: module.DialogTitle })));

export default function Portfolio() {
  const [typedText, setTypedText] = useState("");
  const [currentRole, setCurrentRole] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prefetch ContactForm on idle for better UX
  useEffect(() => {
    const prefetchContactForm = () => {
      import("@/components/contact-form");
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchContactForm);
    } else {
      setTimeout(prefetchContactForm, 2000);
    }
  }, []);

  interface Project {
    id: number;
    title: string;
    description: string;
    image: string;
    tech: string[];
    category: string;
    features: string[];
  }

  const projects: Project[] = [
    {
      id: 1,
      title: "Enterprise CRM System",
      description: "Full-featured CRM with lead management, B2B meeting scheduler, analytics dashboard, and team collaboration tools.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["React.js", "Node.js", "PostgreSQL", "Chart.js"],
      category: "Web Application",
      features: ["Lead Management System", "B2B Meeting Scheduler", "Analytics Dashboard", "Team Collaboration Tools", "Real-time Data Sync"]
    },
    {
      id: 2,
      title: "WordPress Business Website",
      description: "Professional WordPress site with Elementor Pro, SEO optimization, custom themes, and mobile-responsive design.",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["WordPress", "Elementor Pro", "PHP", "MySQL"],
      category: "WordPress",
      features: ["SEO Optimization", "Custom Theme Design", "Mobile Responsive Layout", "Elementor Pro Integration", "Performance Optimization"]
    },
    {
      id: 3,
      title: "AI Q&A Chatbot",
      description: "Intelligent chatbot with OpenRouter DeepSeek AI integration, clean desktop UI using Tkinter, and natural language processing.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["Python", "Tkinter", "OpenRouter API", "AI/ML"],
      category: "AI Solution",
      features: ["Natural Language Processing", "Contextual Understanding", "Real-time AI Responses", "Clean Desktop Interface", "OpenRouter Integration"]
    },
    {
      id: 4,
      title: "Employee Management System",
      description: "Comprehensive EMS with attendance tracking, performance analytics, HR management, and administrative hierarchy features.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["React.js", "Node.js", "PostgreSQL", "Redux"],
      category: "Enterprise System",
      features: ["Attendance Tracking", "Performance Analytics", "HR Management", "Administrative Hierarchy", "Employee Dashboard"]
    },
    {
      id: 5,
      title: "Hotel Booking Platform",
      description: "Modern hotel reservation system with room management, booking calendar, payment integration, and guest management features.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["React.js", "Express.js", "MongoDB", "Stripe API"],
      category: "Web Application",
      features: ["Room Management System", "Booking Calendar", "Payment Integration", "Guest Management", "Real-time Availability"]
    },
    {
      id: 6,
      title: "E-commerce Web App",
      description: "Full-stack e-commerce platform with product catalog, shopping cart, payment processing, and admin dashboard.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?fm=webp&fit=crop&w=400&h=250&q=60",
      tech: ["React.js", "Node.js", "PostgreSQL", "PayPal API"],
      category: "E-commerce",
      features: ["Product Catalog Management", "Shopping Cart System", "Payment Processing", "Admin Dashboard", "Order Management"]
    }
  ];
  
  const roles = [
    "Full Stack Developer",
    "WordPress Expert", 
    "AI Integration Specialist",
    "BSCS Graduate"
  ];

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    // Use startTransition to prevent React suspension on click
    startTransition(() => {
      setShowModal(true);
    });
  };

  const closeModal = () => {
    startTransition(() => {
      setShowModal(false);
      setSelectedProject(null);
    });
  };

  const downloadCV = () => {
    // Convert Google Drive view link to direct download link
    const fileId = '1vNVCFRp8ziqx5NS2RZV5qC5nIcSzqX2L';
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Muhammad_Ghufran_CV.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailContact = () => {
    window.location.href = "mailto:me.ghufrannaseer@gmail.com?subject=Project Inquiry&body=Hello Muhammad, I would like to discuss a project with you.";
  };

  const handleOpenContactForm = () => {
    // Scroll to contact section and focus on it
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      
      // Improved focus timing with scroll end detection
      const focusInput = () => {
        const firstInput = contactSection.querySelector('input');
        if (firstInput) {
          requestAnimationFrame(() => {
            (firstInput as HTMLInputElement).focus();
            (firstInput as HTMLInputElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
        }
      };
      
      // Use Intersection Observer to detect when contact section is fully in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
            setTimeout(focusInput, 100); // Small delay for smooth scroll completion
            observer.disconnect(); // Cleanup observer
          }
        });
      }, { threshold: 0.8 });
      
      observer.observe(contactSection);
      
      // Fallback timeout for safety
      setTimeout(() => {
        focusInput();
        observer.disconnect();
      }, 1200);
    }
  };

  // Intersection Observer for scroll animations
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // For users who prefer reduced motion, make all sections visible immediately
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        (section as HTMLElement).style.opacity = '1';
        (section as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Make section visible and add animation class
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          element.classList.add('animate-on-scroll');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentText = roles[currentRole];
    
    if (typedText.length < currentText.length) {
      timeout = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
      }, 100);
    } else {
      timeout = setTimeout(() => {
        setTypedText("");
        setCurrentRole((prev) => (prev + 1) % roles.length);
      }, 2000);
    }
    
    return () => clearTimeout(timeout);
  }, [typedText, currentRole, roles]);

  const services = [
    {
      title: "CRM Development",
      icon: <Database size={32} className="text-primary" />,
      desc: "Custom CRM solutions with B2B meetings, analytics dashboards, and team collaboration features.",
      features: ["Lead Management", "B2B Meetings", "Analytics Dashboard", "Team Collaboration"],
      price: "$2,500+",
      timeline: "3-4 weeks"
    },
    {
      title: "WordPress Development",
      icon: <Globe size={32} className="text-primary" />,
      desc: "Professional WordPress websites with Elementor Pro, custom themes, and SEO optimization.",
      features: ["Elementor Pro", "SEO Optimization", "Custom Themes", "Mobile Responsive"],
      price: "$800+",
      timeline: "1-2 weeks"
    },
    {
      title: "EMS Solutions",
      icon: <Settings size={32} className="text-primary" />,
      desc: "Employee Management Systems with attendance tracking, performance analytics, and HR features.",
      features: ["Attendance Tracking", "Performance Analytics", "HR Management", "Admin Hierarchy"],
      price: "$4,000+",
      timeline: "5-6 weeks"
    },
    {
      title: "Web Applications",
      icon: <Code size={32} className="text-primary" />,
      desc: "Modern web applications built with React.js, Node.js, and PostgreSQL for real-time features.",
      features: ["React.js/Node.js", "PostgreSQL Database", "Real-time Features", "API Integration"],
      price: "$2,000+",
      timeline: "2-3 weeks"
    },
    {
      title: "AI Integration",
      icon: <Bot size={32} className="text-primary" />,
      desc: "AI-powered solutions including chatbots with OpenRouter DeepSeek AI, OCR, and automation.",
      features: ["ChatBot Development", "OCR Solutions", "AI Automation", "OpenRouter Integration"],
      price: "$1,500+",
      timeline: "2-3 weeks"
    },
    {
      title: "Mobile Development",
      icon: <Smartphone size={32} className="text-primary" />,
      desc: "Cross-platform mobile applications using Flutter and React Native for iOS and Android.",
      features: ["Flutter Development", "React Native", "Cross-Platform", "Mobile-First Design"],
      price: "$3,000+",
      timeline: "4-6 weeks"
    },
  ];

  const skills = [
    { name: "React.js", level: 95, color: "bg-blue-500" },
    { name: "JavaScript", level: 92, color: "bg-yellow-500" },
    { name: "WordPress", level: 90, color: "bg-indigo-500" },
    { name: "Node.js", level: 88, color: "bg-emerald-500" },
    { name: "PostgreSQL", level: 85, color: "bg-green-500" },
    { name: "Python", level: 82, color: "bg-red-500" },
    { name: "AI/ML", level: 78, color: "bg-purple-500" },
    { name: "UI/UX", level: 85, color: "bg-pink-500" },
  ];

  const testimonials = [
    {
      name: "Badar Expo",
      role: "Client - EMS/CRM Project",
      text: "Ghufran delivered an exceptional EMS/CRM system with exhibitor dashboard, B2B meetings, and performance analytics. Professional work with timely delivery and excellent client communication.",
      rating: 5,
      company: "Badar Expo"
    },
    {
      name: "SEO Client",
      role: "WordPress Project Manager",
      text: "The WordPress website with Elementor Pro significantly improved our online visibility. Excellent SEO optimization, page speed enhancement, and mobile-first design approach.",
      rating: 5,
      company: "Digital Marketing Agency"
    },
    {
      name: "University Supervisor",
      role: "Academic Project Evaluator",
      text: "Built a fully functional Q/A chatbot with OpenRouter DeepSeek AI integration. Clean desktop UI with Tkinter and seamless user experience. Impressive technical implementation.",
      rating: 5,
      company: "Iqra University"
    }
  ];

  const stats = [
    { value: "50+", label: "Projects Completed", icon: <Award size={24} /> },
    { value: "40+", label: "Happy Clients", icon: <Users size={24} /> },
    { value: "99%", label: "Success Rate", icon: <TrendingUp size={24} /> },
    { value: "3+", label: "Years Experience", icon: <Star size={24} /> }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50 w-full">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-2xl font-bold text-foreground" data-testid="header-logo">
              Muhammad Ghufran
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-services">Professional Services</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-about">About Muhammad</a>
              <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-projects">Featured Projects</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-testimonials">Client Reviews</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-contact">Get In Touch</a>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors hidden md:block"
                onClick={handleOpenContactForm}
                data-testid="button-get-quote"
              >
                Get Quote
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden text-foreground" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-6 h-6" />
                <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
              </Button>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-services">Services</a>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-about">About</a>
                <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-projects">Projects</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-testimonials">Testimonials</a>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-contact">Contact</a>
                <div className="pt-2">
                  <ThemeToggle />
                </div>
                <Button 
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full mt-4"
                  onClick={() => {
                    handleEmailContact();
                    setMobileMenuOpen(false);
                  }}
                  data-testid="mobile-button-get-quote"
                >
                  Get Quote
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted to-background py-20 px-6 w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6" data-testid="hero-title">
                Hi, I'm <span className="text-primary">Muhammad Ghufran</span>
              </h1>
              <div className="text-2xl text-muted-foreground mb-6 h-8">
                <span className="text-primary font-semibold">
                  <span data-testid="typewriter-text">{typedText}</span>
                  <span className="animate-pulse">|</span>
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-4" data-testid="hero-description">
                BSCS Graduate from Iqra University with ACCP Pro diploma. I specialize in creating modern web applications, 
                EMS/CRM systems, and AI-powered solutions that help businesses grow and succeed.
              </p>
              <p className="text-md text-muted-foreground mb-8" data-testid="hero-subtitle">
                Experienced in React.js, Node.js, PostgreSQL, WordPress with Elementor Pro, and AI integrations. 
                Strong focus on client communication, quality delivery, and ongoing support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
                  onClick={handleOpenContactForm}
                  data-testid="button-start-project"
                >
                  <Mail size={20} />
                  Start Project
                </Button>
                <Button 
                  variant="outline"
                  className="border border-border text-foreground px-8 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 justify-center"
                  onClick={downloadCV}
                  data-testid="button-download-cv"
                >
                  <Download size={20} />
                  Download CV
                </Button>
              </div>
            </div>
            {/* Stats Box Component */}
            <Card className="bg-card rounded-2xl shadow-xl border border-border">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center" data-testid={`stat-${i}`}>
                      <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
                      <div className="text-3xl font-bold text-foreground" data-testid={`stat-value-${i}`}>{stat.value}</div>
                      <div className="text-sm text-muted-foreground" data-testid={`stat-label-${i}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 bg-muted w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="services-title">Professional Services</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="services-description">
              Comprehensive development solutions tailored to your business needs with transparent pricing and clear timelines.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <Card
                key={i}
                className="bg-card rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow"
                data-testid={`service-card-${i}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-primary mr-4">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground" data-testid={`service-title-${i}`}>{service.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4" data-testid={`service-description-${i}`}>{service.desc}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground" data-testid={`service-feature-${i}-${idx}`}>
                        <CheckCircle size={16} className="text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-primary" data-testid={`service-price-${i}`}>{service.price}</div>
                    <div className="text-sm text-muted-foreground" data-testid={`service-timeline-${i}`}>{service.timeline}</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={handleEmailContact}
                    data-testid={`service-button-${i}`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="about" className="py-20 px-6 bg-background w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="skills-title">Technical Expertise</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="skills-description">
              Proficient in modern technologies with hands-on experience in building scalable applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" data-testid="skills-grid">
            {skills.map((skill, i) => (
              <div key={i} className="space-y-2" data-testid={`skill-${i}`}>
                <div className="flex justify-between text-sm">
                  <span id={`skill-label-${i}`} className="font-medium text-foreground" data-testid={`skill-name-${i}`}>{skill.name}</span>
                  <span id={`skill-value-${i}`} className="text-muted-foreground" data-testid={`skill-level-${i}`}>{skill.level}%</span>
                </div>
                <Progress 
                  value={skill.level} 
                  className="h-2" 
                  aria-labelledby={`skill-label-${i}`}
                  aria-describedby={`skill-value-${i}`}
                  aria-valuenow={skill.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                  data-testid={`skill-progress-${i}`} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 bg-muted w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="projects-title">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="projects-description">
              A showcase of recent projects demonstrating technical expertise and client satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => openProjectModal(project)}
                data-testid={`project-card-${project.id}`}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image}
                    srcSet={`${project.image}&w=200 200w, ${project.image}&w=400 400w, ${project.image}&w=600 600w`}
                    sizes="(max-width: 640px) 200px, (max-width: 1024px) 400px, 600px"
                    alt={`${project.title} - ${project.category} featuring ${project.tech.slice(0,2).join(' and ')}`}
                    width={400}
                    height={192}
                    loading={project.id <= 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    data-testid={`project-image-${project.id}`}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium" data-testid={`project-category-${project.id}`}>
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2" data-testid={`project-title-${project.id}`}>{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4" data-testid={`project-description-${project.id}`}>{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, idx) => (
                      <span key={idx} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs" data-testid={`project-tech-${project.id}-${idx}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all p-0"
                    data-testid={`project-view-button-${project.id}`}
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-background w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="testimonials-title">Client Testimonials</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="testimonials-description">
              Hear from satisfied clients who have experienced exceptional service and results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="testimonials-grid">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-card rounded-xl shadow-lg border border-border" data-testid={`testimonial-${i}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Star key={idx} size={16} className="fill-current" data-testid={`testimonial-star-${i}-${idx}`} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 italic" data-testid={`testimonial-text-${i}`}>"{testimonial.text}"</p>
                  
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-foreground" data-testid={`testimonial-name-${i}`}>{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground" data-testid={`testimonial-role-${i}`}>{testimonial.role}</p>
                    <p className="text-xs text-primary mt-1" data-testid={`testimonial-company-${i}`}>{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-muted w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="contact-title">Let's Work Together</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="contact-description">
              Ready to start your next project? Get in touch and let's discuss how I can help bring your ideas to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" data-testid="contact-grid">
            <div>
              <div className="space-y-6">
                <div className="flex items-center" data-testid="contact-email">
                  <div className="text-primary mr-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-muted-foreground">me.ghufrannaseer@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center" data-testid="contact-location">
                  <div className="text-primary mr-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Location</div>
                    <div className="text-muted-foreground">Karachi, Pakistan</div>
                  </div>
                </div>
                <div className="flex items-center" data-testid="contact-availability">
                  <div className="text-primary mr-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Availability</div>
                    <div className="text-muted-foreground">Available for new projects</div>
                  </div>
                </div>
                <div className="flex items-center" data-testid="contact-response">
                  <div className="text-primary mr-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Response Time</div>
                    <div className="text-muted-foreground">Within 24 hours</div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  onClick={handleEmailContact}
                  data-testid="button-send-message"
                >
                  <Mail className="w-5 h-5" />
                  Send Message
                </Button>
              </div>
            </div>
            <Suspense fallback={
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <ContactFormLazy />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-6 w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4" data-testid="footer-name">Muhammad Ghufran</div>
              <p className="text-muted-foreground" data-testid="footer-tagline">Full Stack Developer & AI Integration Specialist</p>
              <p className="text-muted-foreground mt-2" data-testid="footer-description">Building modern web applications that drive business success.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4" data-testid="footer-links-title">Quick Links</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-muted-foreground hover:text-background transition-colors" data-testid="footer-link-services">Services</a>
                <a href="#about" className="block text-muted-foreground hover:text-background transition-colors" data-testid="footer-link-about">About</a>
                <a href="#projects" className="block text-muted-foreground hover:text-background transition-colors" data-testid="footer-link-projects">Projects</a>
                <a href="#testimonials" className="block text-muted-foreground hover:text-background transition-colors" data-testid="footer-link-testimonials">Testimonials</a>
                <a href="#contact" className="block text-muted-foreground hover:text-background transition-colors" data-testid="footer-link-contact">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4" data-testid="footer-connect-title">Connect</h4>
              <div className="space-y-2">
                <a href="mailto:me.ghufrannaseer@gmail.com" className="flex items-center text-muted-foreground hover:text-background transition-colors" data-testid="footer-email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
                <a href="https://linkedin.com/in/muhammadghufran" className="flex items-center text-muted-foreground hover:text-background transition-colors" data-testid="footer-linkedin">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
                <a href="https://github.com/muhammadghufran" className="flex items-center text-muted-foreground hover:text-background transition-colors" data-testid="footer-github">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground" data-testid="footer-copyright">© 2024 Muhammad Ghufran. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      {showModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <DialogLazy open={showModal} onOpenChange={setShowModal}>
            <DialogContentLazy className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="project-modal">
              {selectedProject && (
                <>
                  <DialogHeaderLazy>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-sm text-primary font-medium mb-2" data-testid="modal-project-category">{selectedProject.category}</div>
                        <DialogTitleLazy className="text-3xl font-bold text-foreground" data-testid="modal-project-title">{selectedProject.title}</DialogTitleLazy>
                      </div>
                    </div>
                  </DialogHeaderLazy>
              
              <div className="mb-6">
                <img 
                  src={selectedProject.image} 
                  srcSet={`${selectedProject.image}&w=400 400w, ${selectedProject.image}&w=800 800w, ${selectedProject.image}&w=1200 1200w`}
                  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
                  alt={`${selectedProject.title} project screenshot - ${selectedProject.category} built with ${selectedProject.tech.slice(0,2).join(' and ')}`}
                  width={800}
                  height={400}
                  loading="eager"
                  decoding="async"
                  className="w-full h-64 object-cover rounded-lg" 
                  data-testid="modal-project-image" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-foreground mb-4" data-testid="modal-project-overview-title">Project Overview</h3>
                  <p className="text-muted-foreground mb-6" data-testid="modal-project-description">
                    {selectedProject.description} This project demonstrates advanced development skills with real-time features and comprehensive data management.
                  </p>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4" data-testid="modal-project-features-title">Key Features</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedProject?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-muted-foreground" data-testid={`modal-feature-${idx}`}>
                        <CheckCircle className="w-4 h-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4" data-testid="modal-tech-stack-title">Technical Stack</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.tech.map((tech, idx) => (
                      <span key={idx} className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-sm" data-testid={`modal-tech-${idx}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <Card className="bg-muted mb-4">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2" data-testid="modal-timeline-title">Project Timeline</h4>
                      <p className="text-sm text-muted-foreground" data-testid="modal-timeline-text">Completed with excellence</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2" data-testid="modal-feedback-title">Client Feedback</h4>
                      <p className="text-sm text-muted-foreground" data-testid="modal-feedback-text">"Exceptional work with timely delivery and excellent communication."</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
            </DialogContentLazy>
          </DialogLazy>
        </Suspense>
      )}
    </div>
  );
}
