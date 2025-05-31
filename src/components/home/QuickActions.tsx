// src/components/home/QuickActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ScanLine, CalendarCheck } from 'lucide-react'; // Example icons

export default function QuickActions() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center py-3">
          <PlusCircle size={20} className="mr-2" />
          Add New Plant
        </Button>
        <Button className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center py-3">
          <ScanLine size={20} className="mr-2" />
          Scan Plant Health
        </Button>
        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center py-3">
          <CalendarCheck size={20} className="mr-2" />
          View Tasks
        </Button>
      </div>
    </div>
  );
}
