import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'primary' | 'accent' | 'success' | 'info' | 'warning';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
  accent: 'bg-accent/10 text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground',
  success: 'bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground',
  info: 'bg-info/10 text-info group-hover:bg-info group-hover:text-info-foreground',
  warning: 'bg-warning/10 text-warning-foreground group-hover:bg-warning group-hover:text-warning-foreground',
};

export function FeatureCard({ title, description, icon: Icon, href, color }: FeatureCardProps) {
  return (
    <Link
      to={href}
      className="group block p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${colorClasses[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
