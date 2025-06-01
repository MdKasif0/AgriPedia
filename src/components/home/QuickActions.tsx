// src/components/home/QuickActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, ScanLine, CalendarCheck } from 'lucide-react'; // Example icons

export default function QuickActions() {
  return (
    <Card className="rounded-2xl h-full flex flex-col mb-6 group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="font-serif">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button className="w-full flex items-center justify-center py-3">
            <PlusCircle size={20} className="mr-2" />
            Add New Plant
          </Button>
          <Button variant="destructive" className="w-full flex items-center justify-center py-3">
            <ScanLine size={20} className="mr-2" />
            Scan Plant Health
          </Button>
          <Button variant="secondary" className="w-full flex items-center justify-center py-3">
            <CalendarCheck size={20} className="mr-2" />
            View Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
