'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Star,
  Download,
  Upload,
  Save,
  Trash2,
  Edit2,
  Eye,
  Send,
  Sparkles,
  BookmarkPlus,
  Bookmark,
  X,
  TrendingUp,
  Award,
  Building2,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  summary: string | null;
  location: string | null;
  availability_status: 'available' | 'placed' | 'interviewing' | 'on_hold' | 'not_available';
  desired_rate_min: number | null;
  desired_rate_max: number | null;
  rate_type: 'hourly' | 'annual' | null;
  years_experience: number | null;
  skills: string[] | null;
  certifications: any[] | null;
  work_authorization: string | null;
  willing_to_relocate: boolean | null;
  remote_preference: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null;
  tags: string[] | null;
  rating: number | null;
  created_at: string;
  recruiter?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  created_at: string;
}

interface SearchFilters {
  searchTerm: string;
  statusFilter: string;
  locationFilter: string;
  skillsFilter: string[];
  experienceMin: number;
  experienceMax: number;
  rateMin: number;
  rateMax: number;
  remotePreference: string;
  availabilityFilter: string;
}

interface TalentManagementProps {
  initialCandidates: Candidate[];
}

interface AIMatchResult {
  candidateId: string;
  score: number;
  matchReasons: string[];
}

export default function TalentManagement({ initialCandidates }: TalentManagementProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState([0, 20]);
  const [rateRange, setRateRange] = useState([0, 200]);
  const [remotePreference, setRemotePreference] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveSearchDialog, setShowSaveSearchDialog] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAIMatchDialog, setShowAIMatchDialog] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [aiMatching, setAIMatching] = useState(false);
  const [aiMatchResults, setAIMatchResults] = useState<AIMatchResult[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Get all unique skills from candidates
  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach(candidate => {
      candidate.skills?.forEach(skill => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  // Get all unique locations
  const allLocations = useMemo(() => {
    const locationSet = new Set<string>();
    candidates.forEach(candidate => {
      if (candidate.location) locationSet.add(candidate.location);
    });
    return Array.from(locationSet).sort();
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        candidate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || candidate.availability_status === statusFilter;
      const matchesLocation = locationFilter === 'all' || candidate.location === locationFilter;
      const matchesSkills = skillsFilter.length === 0 || 
        skillsFilter.every(skill => candidate.skills?.includes(skill));
      const matchesExperience = 
        !candidate.years_experience || 
        (candidate.years_experience >= experienceRange[0] && candidate.years_experience <= experienceRange[1]);
      const matchesRate = 
        !candidate.desired_rate_min || 
        (candidate.desired_rate_min >= rateRange[0] && candidate.desired_rate_min <= rateRange[1]);
      const matchesRemote = remotePreference === 'all' || candidate.remote_preference === remotePreference;
      const matchesAvailability = availabilityFilter === 'all' || candidate.availability_status === availabilityFilter;

      return matchesSearch && matchesStatus && matchesLocation && matchesSkills && 
             matchesExperience && matchesRate && matchesRemote && matchesAvailability;
    });
  }, [candidates, searchTerm, statusFilter, locationFilter, skillsFilter, experienceRange, rateRange, remotePreference, availabilityFilter]);

  // Sort candidates by AI match score if active
  const sortedCandidates = useMemo(() => {
    if (aiMatchResults.length === 0) return filteredCandidates;
    
    return [...filteredCandidates].sort((a, b) => {
      const scoreA = aiMatchResults.find(r => r.candidateId === a.id)?.score || 0;
      const scoreB = aiMatchResults.find(r => r.candidateId === b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }, [filteredCandidates, aiMatchResults]);

  // Get statistics
  const stats = useMemo(() => {
    const available = candidates.filter(c => c.availability_status === 'available').length;
    const placed = candidates.filter(c => c.availability_status === 'placed').length;
    const avgRate = candidates
      .filter(c => c.desired_rate_min)
      .reduce((sum, c) => sum + (c.desired_rate_min || 0), 0) / 
      candidates.filter(c => c.desired_rate_min).length || 0;
    const topRated = candidates.filter(c => c.rating && c.rating >= 4).length;

    return {
      total: candidates.length,
      available,
      placed,
      avgRate,
      topRated,
      placementRate: candidates.length > 0 ? (placed / candidates.length) * 100 : 0
    };
  }, [candidates]);

  // Save current search
  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for this search');
      return;
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: {
        searchTerm,
        statusFilter,
        locationFilter,
        skillsFilter,
        experienceMin: experienceRange[0],
        experienceMax: experienceRange[1],
        rateMin: rateRange[0],
        rateMax: rateRange[1],
        remotePreference,
        availabilityFilter
      },
      created_at: new Date().toISOString()
    };

    setSavedSearches([...savedSearches, newSearch]);
    setSearchName('');
    setShowSaveSearchDialog(false);
    toast.success('Search saved successfully');
  };

  // Load saved search
  const loadSavedSearch = (search: SavedSearch) => {
    setSearchTerm(search.filters.searchTerm);
    setStatusFilter(search.filters.statusFilter);
    setLocationFilter(search.filters.locationFilter);
    setSkillsFilter(search.filters.skillsFilter);
    setExperienceRange([search.filters.experienceMin, search.filters.experienceMax]);
    setRateRange([search.filters.rateMin, search.filters.rateMax]);
    setRemotePreference(search.filters.remotePreference);
    setAvailabilityFilter(search.filters.availabilityFilter);
    setShowSavedSearches(false);
    toast.success(`Loaded search: ${search.name}`);
  };

  // AI-powered candidate matching
  const handleAIMatch = async () => {
    if (!jobRequirements.trim()) {
      toast.error('Please enter job requirements');
      return;
    }

    setAIMatching(true);
    try {
      // Call AI matching API
      const response = await fetch('/api/admin/ai/match-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobRequirements,
          candidates: filteredCandidates,
          topN: 20
        })
      });

      if (!response.ok) {
        throw new Error('AI matching failed');
      }

      const { matches } = await response.json();
      setAIMatchResults(matches);
      setShowAIMatchDialog(false);
      toast.success(`Found ${matches.length} matching candidates`);
    } catch (error) {
            
      // Fallback to simple keyword matching
      const mockResults: AIMatchResult[] = filteredCandidates.map(candidate => {
        const keywords = jobRequirements.toLowerCase().split(/\s+/);
        const candidateText = `
          ${candidate.title} 
          ${candidate.summary} 
          ${candidate.skills?.join(' ')}
        `.toLowerCase();

        let score = 0;
        const matchReasons: string[] = [];

        keywords.forEach(keyword => {
          if (candidateText.includes(keyword)) {
            score += 10;
            if (candidate.skills?.some(skill => skill.toLowerCase().includes(keyword))) {
              matchReasons.push(`Has ${keyword} skill`);
            }
          }
        });

        if (candidate.years_experience && candidate.years_experience > 5) {
          score += 20;
          matchReasons.push(`${candidate.years_experience} years of experience`);
        }

        if (candidate.availability_status === 'available') {
          score += 15;
          matchReasons.push('Immediately available');
        }

        if (candidate.rating && candidate.rating >= 4) {
          score += 10;
          matchReasons.push(`High rating: ${candidate.rating}/5`);
        }

        return {
          candidateId: candidate.id,
          score: Math.min(score, 100),
          matchReasons: matchReasons.slice(0, 3)
        };
      }).filter(result => result.score > 0);

      setAIMatchResults(mockResults.sort((a, b) => b.score - a.score));
      setShowAIMatchDialog(false);
      toast.success(`Found ${mockResults.length} matching candidates (using fallback matching)`);
    } finally {
      setAIMatching(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLocationFilter('all');
    setSkillsFilter([]);
    setExperienceRange([0, 20]);
    setRateRange([0, 200]);
    setRemotePreference('all');
    setAvailabilityFilter('all');
    setAIMatchResults([]);
  };

  // Export candidates
  const exportCandidates = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Title', 'Location', 'Status', 'Experience', 'Rate', 'Skills'],
      ...sortedCandidates.map(c => [
        `${c.first_name} ${c.last_name}`,
        c.email,
        c.phone || '',
        c.title || '',
        c.location || '',
        c.availability_status,
        c.years_experience?.toString() || '',
        c.desired_rate_min ? `$${c.desired_rate_min}` : '',
        c.skills?.join('; ') || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${sortedCandidates.length} candidates`);
  };

  // Get AI match score for a candidate
  const getMatchScore = (candidateId: string) => {
    return aiMatchResults.find(r => r.candidateId === candidateId);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'placed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'on_hold':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'not_available':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Talent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.avgRate)}</div>
            <p className="text-xs text-muted-foreground">per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.placementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.placed} placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topRated}</div>
            <p className="text-xs text-muted-foreground">4+ stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMatchResults.length}</div>
            <p className="text-xs text-muted-foreground">active</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Main Search Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, skills, title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAIMatchDialog(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Match
              </Button>

              <Button variant="outline" onClick={() => setShowSavedSearches(true)}>
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </Button>

              <Button onClick={exportCandidates}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button asChild>
                <Link href="/admin/talent/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Link>
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {allLocations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Remote Preference</Label>
                    <Select value={remotePreference} onValueChange={setRemotePreference}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="remote">Remote Only</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="placed">Placed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Years of Experience: {experienceRange[0]} - {experienceRange[1]}</Label>
                    <Slider
                      value={experienceRange}
                      onValueChange={setExperienceRange}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hourly Rate: ${rateRange[0]} - ${rateRange[1]}</Label>
                    <Slider
                      value={rateRange}
                      onValueChange={setRateRange}
                      min={0}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowSaveSearchDialog(true)}>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save This Search
                  </Button>
                </div>
              </div>
            )}

            {/* Active AI Match Banner */}
            {aiMatchResults.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    AI Matching Active - Showing {aiMatchResults.length} candidates sorted by match score
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAIMatchResults([])}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {sortedCandidates.length} of {candidates.length} candidates
        </p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Candidates Grid/List */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedCandidates.map((candidate) => {
          const matchResult = getMatchScore(candidate.id);
          
          return (
            <Card key={candidate.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {matchResult && matchResult.score > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-semibold">AI Match: {matchResult.score}%</span>
                    </div>
                    <Progress value={matchResult.score} className="w-24 h-2 bg-white/30" />
                  </div>
                </div>
              )}

              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-lg font-bold">
                      {candidate.first_name.charAt(0)}{candidate.last_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {candidate.first_name} {candidate.last_name}
                      </h3>
                      <p className="text-sm text-indigo-600 font-medium">
                        {candidate.title || 'No title'}
                      </p>
                      {candidate.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < candidate.rating! 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(candidate.availability_status)}>
                    {candidate.availability_status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </div>
                  )}
                  {candidate.years_experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {candidate.years_experience} years experience
                    </div>
                  )}
                  {candidate.desired_rate_min && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      ${candidate.desired_rate_min} - ${candidate.desired_rate_max}/{candidate.rate_type}
                    </div>
                  )}
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Match Reasons */}
                {matchResult && matchResult.matchReasons.length > 0 && (
                  <div className="mb-3 p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="text-xs font-medium text-purple-900 mb-1">Why this match:</p>
                    <ul className="text-xs text-purple-700 space-y-0.5">
                      {matchResult.matchReasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/admin/talent/${candidate.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/admin/talent/${candidate.id}/edit`}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Search Dialog */}
      <Dialog open={showSaveSearchDialog} onOpenChange={setShowSaveSearchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save your current search filters for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Available Senior Developers"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveSearchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSearch}>
              <Save className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Searches Dialog */}
      <Dialog open={showSavedSearches} onOpenChange={setShowSavedSearches}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saved Searches</DialogTitle>
            <DialogDescription>
              Load a previously saved search
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedSearches.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No saved searches yet</p>
            ) : (
              savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{search.name}</p>
                    <p className="text-xs text-gray-500">
                      Saved {new Date(search.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadSavedSearch(search)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSavedSearches(savedSearches.filter(s => s.id !== search.id));
                        toast.success('Search deleted');
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Match Dialog */}
      <Dialog open={showAIMatchDialog} onOpenChange={setShowAIMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-Powered Candidate Matching</DialogTitle>
            <DialogDescription>
              Describe the job requirements and we'll find the best matching candidates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-requirements">Job Requirements</Label>
              <textarea
                id="job-requirements"
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                placeholder="e.g., Looking for a senior developer with 5+ years of React and TypeScript experience, familiar with AWS..."
                className="w-full h-32 p-3 border rounded-lg resize-none"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>AI analyzes job requirements</li>
                    <li>Matches skills and experience</li>
                    <li>Scores each candidate 0-100</li>
                    <li>Shows top reasons for each match</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIMatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIMatch} disabled={aiMatching}>
              {aiMatching ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Matches
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
