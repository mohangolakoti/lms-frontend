import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Play,
  Users,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Globe,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { c1, c2, c3, c4, c5 } from "../constants";
import Logo from '../components/Logo';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: c5,
      title: "Master New Skills",
      subtitle: "Learn from industry experts and advance your career",
      cta: "Start Learning",
    },
    {
      id: 2,
      image: c4,
      title: "Interactive Learning",
      subtitle: "Engage with hands-on projects and real-world applications",
      cta: "Explore Courses",
    },
    {
      id: 3,
      image: c3,
      title: "Learn Anywhere",
      subtitle: "Access your courses on any device, anytime, anywhere",
      cta: "Get Started",
    },
    {
      id: 4,
      image: c2,
      title: "Join Our Community",
      subtitle: "Connect with learners worldwide and grow together",
      cta: "Join Now",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[600px] overflow-hidden rounded-2xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide
              ? "translate-x-0"
              : index < currentSlide
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white max-w-2xl px-6">
                <h2 className="text-5xl font-bold mb-4 text-black">{slide.title}</h2>
                <p className="text-xl mb-8 opacity-90">{slide.subtitle}</p>
                <button className="px-8 py-4 bg-gradient-to-r from-[#059aef] to-[#05c1dd] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
    <div className="w-16 h-16 bg-gradient-to-r from-[#059aef] to-[#05c1dd] rounded-xl flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-[#050a30] mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:scale-105">
    <div className="relative">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-[#059aef] text-white text-sm font-semibold rounded-full">
          {course.category}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center space-x-1 mb-2">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-semibold">{course.rating}</span>
        <span className="text-sm text-gray-500">({course.students})</span>
      </div>
      <h3 className="text-lg font-semibold text-[#050a30] mb-2">
        {course.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4">{course.description}</p>
      <div className="flex items-center justify-center">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-[#059aef] to-[#05c1dd] text-white rounded-lg hover:shadow-md transition-all duration-200">
          Enroll Now
        </button>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center space-x-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
    <div className="flex items-center space-x-4">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h4 className="font-semibold text-[#050a30]">{testimonial.name}</h4>
        <p className="text-sm text-gray-600">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const LandingPage = ({ onSignIn, onSignUp }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description:
        "Learn from industry professionals with years of real-world experience in their fields.",
    },
    {
      icon: Play,
      title: "Interactive Learning",
      description:
        "Engage with hands-on projects, quizzes, and practical exercises to reinforce your knowledge.",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Join a vibrant community of learners and get help from peers and instructors.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Content",
      description:
        "Courses are vetted by experts and continuously updated to reflect the latest standards.",
    },

    {
      icon: Globe,
      title: "Learn Anywhere",
      description:
        "Access your courses on any device, anytime, anywhere with our mobile-friendly platform.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description:
        "Gain skills that directly impact your career trajectory, from promotions to new opportunities.",
    },
  ];

  const popularCourses = [
    {
      id: 1,
      title: "BackEnd",
      description:
        "Learn the complete flow of VLSI physical design, including floorplanning, placement, routing, and timing closure.",
      image: c5,
      category: "VLSI",
      rating: 4.8,
      students: 1234,
    },
    {
      id: 2,
      title: "Design Verification",
      description:
        "Master verification methodologies such as UVM and SystemVerilog to ensure robust chip design and functionality.",
      image: c4,
      category: "VLSI",
      rating: 4.9,
      students: 856,
    },
    {
      id: 3,
      title: "Design for Testability",
      description:
        "Understand DFT concepts including scan insertion, ATPG, and BIST to improve chip test coverage and reliability.",
      image: c3,
      category: "VLSI",
      rating: 4.7,
      students: 2341,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
      comment:
        "The courses here transformed my career. The instructors are knowledgeable and the content is always up-to-date.",
    },
    {
      name: "Michael Chen",
      role: "Data Analyst",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
      comment:
        "I love the flexibility of learning at my own pace. The community support is incredible too!",
    },
    {
      name: "Emily Davis",
      role: "UX Designer",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      comment:
        "The practical projects helped me build a portfolio that landed me my dream job. Highly recommended!",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Students Enrolled" },
    { number: "200+", label: "Expert Instructors" },
    { number: "500+", label: "Courses Available" },
    { number: "95%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/60'
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo variant="full" alt="SiliconMeta Learning" className="h-10 w-auto max-w-[11rem] sm:max-w-[14rem]" />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-[#059aef] transition-colors"
              >
                Home
              </a>
              <a
                href="#courses"
                className="text-gray-700 hover:text-[#059aef] transition-colors"
              >
                Courses
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-[#059aef] transition-colors"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-[#059aef] transition-colors"
              >
                Reviews
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-[#059aef] transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => (onSignIn ? onSignIn() : navigate('/login'))}
                className="px-4 py-2 text-[#059aef] hover:text-[#1b75bc] font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => (onSignUp ? onSignUp() : navigate('/register'))}
                className="px-6 py-2 bg-gradient-to-r from-[#059aef] to-[#05c1dd] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section
        id="home"
        className="pt-32 pb-20 bg-gradient-to-br from-[#cae8ff] via-[#b2e4ff] to-[#acf4ff]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#050a30] mb-6">
              Transform Your Future with
              <span className="bg-gradient-to-r from-[#059aef] to-[#05c1dd] bg-clip-text text-transparent">
                {" "}
                Expert Learning
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Join thousands of learners worldwide and master new skills with
              our comprehensive online courses taught by industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#059aef] to-[#05c1dd] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                Start Learning Today
              </button>
              <button className="px-8 py-4 border-2 border-[#059aef] text-[#059aef] font-semibold rounded-xl hover:bg-[#059aef] hover:text-white transition-all duration-200">
                Browse Courses
              </button>
            </div>
          </div>

          <Carousel />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#059aef] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#050a30] mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey
              with cutting-edge technology and expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
 
      {/* Popular Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#050a30] mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular courses that have helped thousands of
              students achieve their goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-[#059aef] to-[#05c1dd] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#050a30] mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our successful
              students have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#059aef] to-[#05c1dd]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful students and transform your career with
            our expert-led courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (onSignUp ? onSignUp() : navigate('/register'))}
              className="px-8 py-4 bg-white text-[#059aef] font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-[#059aef] transition-all duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#050a30] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Logo variant="full" alt="SiliconMeta Learning" className="h-12 w-auto max-w-[15rem]" />
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering learners worldwide with high-quality education and
                expert instruction. Transform your future with us.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <MessageCircle className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Award className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <ShieldCheck className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#courses"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Courses
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Reviews
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#05c1dd]" />
                  <span className="text-gray-300">
                    info@SiliconMetaSystems.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#05c1dd]" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#05c1dd]" />
                  <span className="text-gray-300">
                    123 Education St, Learning City
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SiliconMetaSystems. All rights reserved. | Privacy Policy |
              Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
