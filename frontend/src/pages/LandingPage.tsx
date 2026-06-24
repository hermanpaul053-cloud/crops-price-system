// frontend/src/pages/LandingPage.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Users,
  Smartphone,
  MessageSquare,
  BarChart3,
  Leaf,
  Truck,
  Clock,
  Quote,
  Mail,
  Phone as PhoneIcon,
  Map,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

interface PriceItem {
  crop: string;
  price: string;
  change: string;
  market: string;
}

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  image: string;
}

const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const todayPrices: PriceItem[] = [
    { crop: 'Maize', price: '850 TZS/kg', change: '+5.2%', market: 'Kariakoo' },
    { crop: 'Rice', price: '2,500 TZS/kg', change: '+2.1%', market: 'Mbeya' },
    { crop: 'Beans', price: '1,200 TZS/kg', change: '-1.3%', market: 'Morogoro' },
    { crop: 'Cassava', price: '450 TZS/kg', change: '+3.8%', market: 'Dodoma' },
  ];

  const benefits: BenefitItem[] = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: 'Real-time Prices',
      description: 'Get current crop prices from markets across Tanzania instantly'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-secondary" />,
      title: 'Multiple Channels',
      description: 'Access prices via web, SMS, and USSD on any phone'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-accent" />,
      title: 'Market Insights',
      description: 'View price trends, comparisons, and market analytics'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'John Mwangi',
      location: 'Arusha',
      quote: 'This system has helped me get the best prices for my maize. I no longer sell at a loss.',
      image: '/api/placeholder/100/100'
    },
    {
      name: 'Sarah Kipande',
      location: 'Mbeya',
      quote: 'The SMS alerts keep me updated on market changes. I can plan my harvest better now.',
      image: '/api/placeholder/100/100'
    },
    {
      name: 'David Ochieng',
      location: 'Morogoro',
      quote: 'USSD service is so easy to use. Even without internet, I can check prices anywhere.',
      image: '/api/placeholder/100/100'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-orange-500/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-medium">Tanzania's No.1 Crop Price Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-primary">Know Market Prices</span>
                <br />
                <span className="text-gray-800">Before Selling Your Crops</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg">
                Get real-time crop prices from markets across Tanzania. Make informed decisions and maximize your profits.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
                >
                  <Users className="w-5 h-5" />
                  Farmer Registration
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg shadow-secondary/30"
                >
                  <Shield className="w-5 h-5" />
                  Admin Login
                </Link>
              </div>
              
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>500+ Markets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>50,000+ Farmers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span>Real-time Updates</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-in">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Today's Market Prices</h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Live</span>
                  </div>
                  
                  {todayPrices.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div>
                        <p className="font-medium text-gray-800">{item.crop}</p>
                        <p className="text-xs text-gray-500">{item.market}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{item.price}</p>
                        <p className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white animate-on-scroll opacity-0">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About Crop Price System</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Empowering Tanzanian farmers with real-time market information to maximize their agricultural income
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((item, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white animate-on-scroll opacity-0">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                SMS Service
              </h3>
              <p className="text-gray-600">Subscribe to crop price alerts via SMS and get updates directly on your phone</p>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                    <span className="text-gray-700">Subscribe by sending SMS to short code</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                    <span className="text-gray-700">Select your preferred crops and markets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</div>
                    <span className="text-gray-700">Get price alerts automatically</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                <Phone className="w-6 h-6" />
                USSD Service
              </h3>
              <p className="text-gray-600">Check crop prices using USSD on any mobile phone, even without internet</p>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">*</div>
                    <span className="text-gray-700">Dial *15000# from any phone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">1</div>
                    <span className="text-gray-700">Select "Check Crop Prices"</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">2</div>
                    <span className="text-gray-700">Choose crop and market</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">3</div>
                    <span className="text-gray-700">Receive price information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white animate-on-scroll opacity-0">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Benefits for Farmers</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="w-6 h-6 text-primary" />,
                title: 'Better Prices',
                description: 'Get the best prices for your crops'
              },
              {
                icon: <Clock className="w-6 h-6 text-secondary" />,
                title: 'Save Time',
                description: 'No need to travel to check prices'
              },
              {
                icon: <MapPin className="w-6 h-6 text-accent" />,
                title: 'Find Markets',
                description: 'Discover nearest markets with best prices'
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-primary" />,
                title: 'Plan Better',
                description: 'Make informed decisions about your harvest'
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-orange-50 to-white animate-on-scroll opacity-0">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">What Farmers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <Quote className="w-8 h-8 text-primary/40 mb-4" />
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white animate-on-scroll opacity-0">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Get In Touch</h2>
            <p className="text-xl text-center text-gray-600 mb-12">
              Have questions about our services? We're here to help
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">info@cropprice.co.tz</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">+255 712 345 678</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Map className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Office</p>
                    <p className="text-gray-600">Dar es Salaam, Tanzania</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                  <button 
                    type="submit"
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Crop Price System</h3>
              <p className="text-gray-400">Empowering Tanzanian farmers with real-time market information</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/services" className="hover:text-white transition">Services</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/sms" className="hover:text-white transition">SMS Alerts</Link></li>
                <li><Link to="/ussd" className="hover:text-white transition">USSD Service</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Farmer Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Crop Price System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
