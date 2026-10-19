import React from 'react';
import { AppShell } from './AppShell';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ElementType;
}

interface LayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export function Layout({ children, navItems, title, subtitle, breadcrumbs, actions }: LayoutProps) {
  return (
    <AppShell 
      navItems={navItems} 
      pageTitle={title} 
      pageSubtitle={subtitle} 
      breadcrumbs={breadcrumbs} 
      actions={actions}
    >
      {children}
    </AppShell>
  );
}
