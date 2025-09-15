import Link from 'next/link'
import Layout from '@/components/Layout'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Contact</span>
        </div>
        
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our products, sustainability practices, or need help with an order? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-support">Order Support</option>
                  <option value="sustainability">Sustainability Questions</option>
                  <option value="partnerships">Partnerships</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-hemp-green-dark text-white font-bold py-4 rounded-full hover:bg-opacity-90 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-hemp-green-light rounded-full p-3 mr-4">
                    <Mail className="h-6 w-6 text-hemp-green-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">hello@hempco.com</p>
                    <p className="text-gray-600">support@hempco.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-hemp-green-light rounded-full p-3 mr-4">
                    <Phone className="h-6 w-6 text-hemp-green-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-hemp-green-light rounded-full p-3 mr-4">
                    <MapPin className="h-6 w-6 text-hemp-green-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">
                      123 Sustainable Street<br />
                      Hemp Valley, CA 90210<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-hemp-green-light rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-hemp-green-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-hemp-green-light rounded-lg p-8">
              <h3 className="text-xl font-semibold text-hemp-text mb-4">Quick Support</h3>
              <p className="text-hemp-accent mb-4">
                Looking for quick answers? Check out our FAQ section or live chat support.
              </p>
              <div className="space-y-3">
                <a href="#" className="block text-hemp-green-dark font-semibold hover:underline">
                  View FAQ →
                </a>
                <a href="#" className="block text-hemp-green-dark font-semibold hover:underline">
                  Start Live Chat →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
