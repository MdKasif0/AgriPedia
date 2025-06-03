import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function MyPlantsOverview() {
  const { plants } = useStore();
  const router = useRouter();

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <Leaf size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">My Plants Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {plants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven't added any plants yet. Start your gardening journey by adding your first plant!
          </p>
        ) : (
          <div className="space-y-4">
            {plants.slice(0, 3).map((plant) => (
              <div key={plant.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    {plant.imageUrl ? (
                      <img
                        src={plant.imageUrl}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${getHealthColor(plant.health)}`} />
                  </div>
                  <div>
                    <p className="font-medium">{plant.name}</p>
                    <p className="text-sm text-muted-foreground">{plant.species}</p>
                  </div>
                </div>
                <Badge variant={plant.health === 'healthy' ? 'default' : 'destructive'}>
                  {plant.health}
                </Badge>
              </div>
            ))}
            {plants.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                +{plants.length - 3} more plants
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => router.push('/garden')}
        >
          View My Garden
        </Button>
      </CardFooter>
    </Card>
  );
}
