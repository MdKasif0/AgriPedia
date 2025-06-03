import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to AgriPedia</h1>
        <p className="text-center mb-12 text-lg">Your comprehensive agricultural knowledge platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grow Planner</CardTitle>
              <CardDescription>Create and manage your personalized growing plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/grow-plan">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plant Library</CardTitle>
              <CardDescription>Explore our extensive collection of plant guides</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plants">
                <Button variant="outline" className="w-full">Browse Plants</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 