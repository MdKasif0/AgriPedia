"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Community</h1>
      
      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>Discussions</CardTitle>
              <CardDescription>Join the conversation with other farmers and experts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Upcoming agricultural events and workshops</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Helpful resources and guides for farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 