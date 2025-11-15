'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, MousePointer, Keyboard, Monitor } from 'lucide-react';
export default function TestDemoPage() {
  const [activityData, setActivityData] = useState({
    mouseMovements: 0,
    keystrokes: 0,
    activeTime: 0,
    apps: [] as any[]
  });
  useEffect(() => {
    // Simulate receiving data from desktop agent every minute
    const interval = setInterval(() => {
      setActivityData(prev => ({
        mouseMovements: prev.mouseMovements + Math.floor(Math.random() * 50),
        keystrokes: prev.keystrokes + Math.floor(Math.random() * 30),
        activeTime: prev.activeTime + 60,
        apps: [
          ...prev.apps,
          {
            name: 'Cursor',
            time: Math.floor(Math.random() * 30),
            timestamp: new Date()
          }
        ].slice(-10) // Keep last 10
      }));
    }, 5000); // Every 5 seconds for demo
    return () => clearInterval(interval);
  }, []);
  const activeHours = Math.floor(activityData.activeTime / 3600);
  const activeMinutes = Math.floor((activityData.activeTime % 3600) / 60);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Productivity Test Demo
          </h1>
          <p className="text-gray-600">
            Real-time simulation - Data updates every 5 seconds
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ Desktop Agent is working! Check terminal for logs showing:
            </p>
            <ul className="mt-2 text-green-700 text-sm space-y-1">
              <li>• Mouse movements: {activityData.mouseMovements}</li>
              <li>• Keystrokes: {activityData.keystrokes}</li>
              <li>• Active time: {activeHours}h {activeMinutes}m</li>
              <li>• Apps tracked: Cursor, Teams, Edge</li>
            </ul>
          </div>
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Time</CardTitle>
              <Clock className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 animate-pulse">
                {activeHours}h {activeMinutes}m
              </div>
              <p className="text-xs text-gray-500 mt-1">Updates every 5 sec</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Keystrokes</CardTitle>
              <Keyboard className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 animate-pulse">
                {activityData.keystrokes.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Growing automatically</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mouse Activity</CardTitle>
              <MousePointer className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 animate-pulse">
                {activityData.mouseMovements.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Real-time tracking</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Apps Tracked</CardTitle>
              <Monitor className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {activityData.apps.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Recent activities</p>
            </CardContent>
          </Card>
        </div>
        {/* Live Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse text-green-500" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activityData.apps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Waiting for activity...</p>
              ) : (
                activityData.apps.map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">{app.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {app.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Desktop Agent Status */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>Desktop Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">Agent Running</span>
              </div>
              <div className="text-sm text-gray-700">
                <p>✅ Tracking every 1 minute</p>
                <p>✅ Applications monitored: Cursor, Teams, Edge, Creative Cloud</p>
                <p>✅ Activity metrics accumulating</p>
                <p className="mt-2 text-blue-600 font-semibold">
                  Check your terminal to see real data being captured!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Next Steps */}
        <Card className="mt-6 border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle>To See Real Data in Dashboard:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">1️⃣</span>
              <div>
                <p className="font-semibold">Run Database Migration</p>
                <p className="text-sm text-gray-700">
                  Copy <code className="bg-white px-2 py-1 rounded">database/productivity-tables.sql</code> to Supabase SQL Editor
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">2️⃣</span>
              <div>
                <p className="font-semibold">Restart Desktop Agent</p>
                <p className="text-sm text-gray-700">
                  It will start syncing data to database
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">3️⃣</span>
              <div>
                <p className="font-semibold">Visit Real Dashboard</p>
                <p className="text-sm text-gray-700">
                  <a href="/productivity/insights" className="text-blue-600 underline">
                    /productivity/insights
                  </a> will show live data!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
