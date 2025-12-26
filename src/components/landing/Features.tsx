'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Smartphone, CreditCard, MessageSquare, Layout } from 'lucide-react'

const features = [
  {
    icon: <Layout className="w-6 h-6 text-blue-500" />,
    title: 'Modern Admin Dashboard',
    description:
      'Complete overview of your properties, maintenance requests, and staff performance in one unified interface.',
  },
  {
    icon: <Users className="w-6 h-6 text-purple-500" />,
    title: 'Resident Management',
    description: 'Digital resident profiles, document storage, and automated onboarding workflows.',
  },
  {
    icon: <Smartphone className="w-6 h-6 text-pink-500" />,
    title: 'Native Mobile Apps',
    description:
      'iOS and Android apps for residents to pay rent, book amenities, and report issues.',
  },
  {
    icon: <Shield className="w-6 h-6 text-green-500" />,
    title: 'Advanced Security',
    description: 'Role-based access control, visitor management, and secure data encryption.',
  },
  {
    icon: <CreditCard className="w-6 h-6 text-orange-500" />,
    title: 'Seamless Payments',
    description:
      'Automated rent collection, payment tracking, and financial reporting integration.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
    title: 'Communication Hub',
    description: 'Real-time chat, community announcements, and automated notifications.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to run <br />
            <span className="gradient-text">World-Class Communities</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Eden Avenue provides a comprehensive suite of tools designed to modernize every aspect
            of property management.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="bg-card hover:bg-card/80 p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
