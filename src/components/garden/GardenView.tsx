import React from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Droplet, Sun, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function GardenView() {
  const { plants, deletePlant } = useStore();
  const router = useRouter();

  const handleDeletePlant = (id: string) => {
    deletePlant(id);
    toast.success('Plant removed from garden');
  };

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Plants</h2>
        <Button
          onClick={() => router.push('/scanner')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Plant
        </Button>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No plants in your garden yet</p>
            <Button
              onClick={() => router.push('/scanner')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Plant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <Card key={plant.id} className="overflow-hidden">
              <div className="relative h-48">
                {plant.imageUrl ? (
                  <img
                    src={plant.imageUrl}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${getHealthColor(plant.health)}`} />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plant.species}</p>
                  </div>
                  <Badge variant={plant.health === 'healthy' ? 'default' : 'destructive'}>
                    {plant.health}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      Next watering: {new Date(plant.nextWatering).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Growth stage: {plant.growthStage}</span>
                  </div>
                  {plant.notes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Care Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plant.notes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/garden/${plant.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlant(plant.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 