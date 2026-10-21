'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Shirt, Calculator, ShieldCheck, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-input bg-background/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-primary">FreshmCalc</Link>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
          <Link to="/login" className="text-sm font-medium hover:text-primary">Log in</Link>
          <Button>Get started</Button>
        </div>
      </nav>

      <section className="px-6 py-20 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Dubai fresh produce market rates & India-to-Dubai export costing
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Built for fruit and vegetable traders, wholesalers, suppliers and exporters. Live Dubai market rates (AED) and a full export cost engine from India to Dubai — Jebel Ali and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto"><Link to="/register">Start calculating</Link></Button>
          <Button variant="outline" asChild size="lg" className="w-full sm:w-auto"><Link to="/pricing">View pricing</Link></Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/30 px-6 py-16">
        <h2 className="text-center text-xl font-semibold mb-10">Why traders use FreshmCalc</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard icon={<Shirt size={28} />} title="Dubai market rates (AED)" desc="Published Dubai wholesale rates for pomegranate, green chilli and more — with units, origin, source and last-updated time." />
          <FeatureCard icon={<Globe size={28} />} title="India → Dubai export costing" desc="Complete cost engine: product, packing, inland transport, CHA, ocean freight, insurance, duties, commission and currency conversion to AED." />
          <FeatureCard icon={<Calculator size={28} />} title="Profit analysis" desc="Cost per box, per kg, per tonne, expected Dubai revenue, gross profit and margin — saved as immutable cost sheets." />
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to trade?</h2>
          <p className="text-muted-foreground mb-8">Choose a monthly, quarterly or yearly plan and unlock Dubai rates and the export calculator.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/pricing">See plans & pricing</Link></Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="p-6">
      <CardHeader>
        <div className="rounded-lg bg-primary/10 p-3 mb-4 text-primary">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}
