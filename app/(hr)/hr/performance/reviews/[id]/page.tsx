'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, Save, Send, Star, Plus, Trash2, CheckCircle, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CompetencyRating {
  code: string;
  name: string;
  rating: number;
  comment: string;
}

interface Goal {
  id?: string;
  title: string;
  description: string;
  target_date: string;
  weight: number;
  status?: string;
  achievement_pct?: number;
}

export default function ConductReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Section 1: Previous Goals
  const [previousGoals, setPreviousGoals] = useState<Goal[]>([]);

  // Section 2: Competency Ratings
  const [competencies, setCompetencies] = useState<CompetencyRating[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  // Section 3: Qualitative Assessment
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  // Section 4: Overall Rating
  const [overallRating, setOverallRating] = useState(3);
  const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
  const [salaryIncrease, setSalaryIncrease] = useState(0);

  // Section 5: New Goals
  const [newGoals, setNewGoals] = useState<Goal[]>([{ title: '', description: '', target_date: '', weight: 0 }]);

  // Section 6: Manager Comments
  const [managerComments, setManagerComments] = useState('');

  const sections = [
    { num: 1, name: 'Goal Achievement', complete: previousGoals.some(g => g.status) },
    { num: 2, name: 'Competency Ratings', complete: competencies.some(c => c.rating > 0) },
    { num: 3, name: 'Strengths & Improvements', complete: strengths.length > 0 },
    { num: 4, name: 'Overall Rating', complete: overallRating > 0 },
    { num: 5, name: 'Goals for Next Period', complete: newGoals.some(g => g.title) },
    { num: 6, name: 'Manager Comments', complete: managerComments.length > 0 },
    { num: 7, name: 'Review Summary', complete: false },
  ];

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  useEffect(() => {
    // Calculate average rating
    const validRatings = competencies.filter(c => c.rating > 0);
    if (validRatings.length > 0) {
      const avg = validRatings.reduce((sum, c) => sum + c.rating, 0) / validRatings.length;
      setAverageRating(Math.round(avg * 100) / 100);
    }
  }, [competencies]);

  const loadReview = async () => {
    setLoading(true);
    try {
      // Load review
      const { data: reviewData, error: reviewError } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employees!performance_reviews_employee_id_fkey(*),
          performance_review_cycles(*)
        `)
        .eq('id', reviewId)
        .single();

      if (reviewError) throw reviewError;
      setReview(reviewData);
      setEmployee(reviewData.employees);

      // Load existing data if review is in progress
      if (reviewData.previous_goals) setPreviousGoals(reviewData.previous_goals);
      if (reviewData.competency_ratings || reviewData.competency_comments) {
        // Reconstruct competencies from stored data
        const ratings = reviewData.competency_ratings || {};
        const comments = reviewData.competency_comments || {};
        // Load default competencies or reconstruct from saved data
      }
      if (reviewData.strengths) setStrengths(reviewData.strengths);
      if (reviewData.areas_for_improvement) setImprovements(reviewData.areas_for_improvement);
      if (reviewData.overall_rating) setOverallRating(reviewData.overall_rating);
      if (reviewData.recommended_actions) setRecommendedActions(reviewData.recommended_actions);
      if (reviewData.suggested_salary_increase) setSalaryIncrease(reviewData.suggested_salary_increase);
      if (reviewData.new_goals) setNewGoals(reviewData.new_goals);
      if (reviewData.manager_comments) setManagerComments(reviewData.manager_comments);

      // Load competency definitions
      const { data: compDefs } = await supabase
        .from('competency_definitions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (compDefs) {
        setCompetencies(compDefs.map(c => ({
          code: c.code,
          name: c.name,
          rating: reviewData.competency_ratings?.[c.code] || 0,
          comment: reviewData.competency_comments?.[c.code] || '',
        })));
      }

      // Load employee's current active goals for Section 1
      const { data: activeGoals } = await supabase
        .from('performance_goals')
        .select('*')
        .eq('employee_id', reviewData.employee_id)
        .lte('active_from', reviewData.review_period_end)
        .or(`active_to.is.null,active_to.gte.${reviewData.review_period_start}`)
        .order('created_at');

      if (activeGoals && previousGoals.length === 0) {
        setPreviousGoals(activeGoals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          target_date: g.target_date,
          weight: g.weight || 0,
          status: g.status,
          achievement_pct: g.progress_percentage,
        })));
      }

    } catch (error) {
      toast.error('Failed to load review');
      router.push('/hr/performance');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // TC-PERF-011
    setSaving(true);
    try {
      const competencyRatings: any = {};
      const competencyComments: any = {};
      competencies.forEach(c => {
        if (c.rating > 0) competencyRatings[c.code] = c.rating;
        if (c.comment) competencyComments[c.code] = c.comment;
      });

      const updateData = {
        previous_goals: previousGoals,
        competency_ratings: competencyRatings,
        competency_comments: competencyComments,
        average_rating: averageRating,
        strengths,
        areas_for_improvement: improvements,
        overall_rating: overallRating,
        overall_rating_label: getRatingLabel(overallRating),
        recommended_actions: recommendedActions,
        suggested_salary_increase: salaryIncrease,
        new_goals: newGoals.filter(g => g.title),
        manager_comments: managerComments,
        status: 'InReview',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('performance_reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review saved as draft');
    } catch (error) {
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    // TC-PERF-012, TC-PERF-013
    // Validate all sections complete
    if (!previousGoals.some(g => g.status)) {
      toast.error('Please complete Goal Achievement section');
      setCurrentSection(1);
      return;
    }
    if (!competencies.some(c => c.rating > 0)) {
      toast.error('Please rate at least one competency');
      setCurrentSection(2);
      return;
    }
    if (!strengths || !improvements) {
      toast.error('Please complete Strengths & Improvements section');
      setCurrentSection(3);
      return;
    }
    if (!overallRating) {
      toast.error('Please set an overall rating');
      setCurrentSection(4);
      return;
    }
    if (!newGoals.some(g => g.title)) {
      toast.error('Please set at least one goal for next period');
      setCurrentSection(5);
      return;
    }

    setSaving(true);
    try {
      // Save complete review
      await handleSaveDraft();

      // Submit to employee
      const { error } = await supabase
        .from('performance_reviews')
        .update({
          status: 'SubmittedToEmployee',
          submitted_to_employee_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Note: Email notification will be sent via server-side webhook

      toast.success('Review submitted to employee for acknowledgment!');
      setShowSubmitDialog(false);
      router.push('/hr/performance');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return 'Outstanding';
    if (rating === 4) return 'Exceeds Expectations';
    if (rating === 3) return 'Meets Expectations';
    if (rating === 2) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const updateCompetencyRating = (code: string, rating: number) => {
    setCompetencies(prev => prev.map(c => 
      c.code === code ? { ...c, rating } : c
    ));
  };

  const updateCompetencyComment = (code: string, comment: string) => {
    setCompetencies(prev => prev.map(c => 
      c.code === code ? { ...c, comment } : c
    ));
  };

  const addNewGoal = () => {
    setNewGoals([...newGoals, { title: '', description: '', target_date: '', weight: 0 }]);
  };

  const removeNewGoal = (index: number) => {
    setNewGoals(newGoals.filter((_, i) => i !== index));
  };

  const updateNewGoal = (index: number, field: string, value: any) => {
    setNewGoals(prev => prev.map((g, i) => 
      i === index ? { ...g, [field]: value } : g
    ));
  };

  const getCompletedSections = () => {
    return sections.filter(s => s.complete).length;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading review...</div>;
  }

  if (!review || !employee) {
    return <div className="text-center py-12">Review not found</div>;
  }

  const isLocked = review.status === 'Completed' || review.status === 'Acknowledged';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/performance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Review - {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {review.performance_review_cycles?.name} • {review.performance_review_cycles?.review_type}
            </p>
          </div>
        </div>
        <Badge className={review.status === 'Draft' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
          {review.status}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Progress: {getCompletedSections()}/{sections.length} Sections Complete
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((getCompletedSections() / sections.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(getCompletedSections() / sections.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee & Review Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{employee.first_name} {employee.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">{employee.employee_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{employee.departments?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Position:</span>
              <span className="font-medium">{employee.designation || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Review Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Period:</span>
              <span className="font-medium">{review.performance_review_cycles?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{review.performance_review_cycles?.review_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">
                {new Date(review.performance_review_cycles?.due_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant="outline">{review.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.num}
                variant={currentSection === section.num ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSection(section.num)}
                className="relative"
              >
                {section.num}. {section.name}
                {section.complete && (
                  <CheckCircle className="h-3 w-3 ml-2 text-green-600" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      <Card>
        <CardHeader>
          <CardTitle>Section {currentSection}: {sections[currentSection - 1].name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* SECTION 1: Goal Achievement - TC-PERF-005 */}
          {currentSection === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Review goals set in the previous review period and rate achievement.
              </p>
              {previousGoals.map((goal, index) => (
                <div key={goal.id || index} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Achievement Status</Label>
                      <select
                        value={goal.status || ''}
                        onChange={(e) => setPreviousGoals(prev => prev.map((g, i) => 
                          i === index ? { ...g, status: e.target.value } : g
                        ))}
                        className="w-full border rounded-md px-3 py-2 mt-1"
                        disabled={isLocked}
                      >
                        <option value="">Select status</option>
                        <option value="Exceeded">Exceeded (120%+)</option>
                        <option value="Achieved">Achieved (100%)</option>
                        <option value="Partially">Partially Achieved (50-99%)</option>
                        <option value="NotAchieved">Not Achieved (&lt;50%)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Achievement %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="200"
                        value={goal.achievement_pct || 0}
                        onChange={(e) => setPreviousGoals(prev => prev.map((g, i) => 
                          i === index ? { ...g, achievement_pct: Number(e.target.value) } : g
                        ))}
                        disabled={isLocked}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Manager Comments</Label>
                    <Textarea
                      placeholder="Explain achievement level..."
                      rows={2}
                      disabled={isLocked}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
              {previousGoals.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No previous goals found for this review period
                </p>
              )}
            </div>
          )}

          {/* SECTION 2: Competency Ratings - TC-PERF-006 */}
          {currentSection === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Rate the employee on each competency using a 1-5 scale.
              </p>
              {competencies.map((comp) => (
                <div key={comp.code} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{comp.name}</h4>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => !isLocked && updateCompetencyRating(comp.code, rating)}
                          className={`p-1 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={isLocked}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              rating <= comp.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-medium">{comp.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      value={comp.comment}
                      onChange={(e) => updateCompetencyComment(comp.code, e.target.value)}
                      placeholder="Provide specific examples..."
                      rows={2}
                      disabled={isLocked}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-semibold text-indigo-900">
                  Average Rating: {averageRating.toFixed(2)}/5
                </p>
              </div>
            </div>
          )}

          {/* SECTION 3: Strengths & Improvements - TC-PERF-007 */}
          {currentSection === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="What are the employee's main strengths? Provide specific examples..."
                  rows={5}
                  disabled={isLocked}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="improvements">Areas for Improvement</Label>
                <Textarea
                  id="improvements"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="What areas need development? How can the employee improve?"
                  rows={5}
                  disabled={isLocked}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* SECTION 4: Overall Rating - TC-PERF-008, TC-PERF-009 */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Overall Performance Rating</Label>
                <div className="space-y-3">
                  {[
                    { value: 5, label: 'Outstanding', desc: 'Far Exceeds Expectations' },
                    { value: 4, label: 'Exceeds', desc: 'Consistently Above Standards' },
                    { value: 3, label: 'Meets', desc: 'Satisfactory Performance' },
                    { value: 2, label: 'Needs Improvement', desc: 'Below Standards' },
                    { value: 1, label: 'Unsatisfactory', desc: 'Significantly Below Standards' },
                  ].map((rating) => (
                    <label
                      key={rating.value}
                      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        overallRating === rating.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="overallRating"
                        value={rating.value}
                        checked={overallRating === rating.value}
                        onChange={(e) => setOverallRating(Number(e.target.value))}
                        disabled={isLocked}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">{rating.label} ({rating.value})</p>
                        <p className="text-sm text-gray-600">{rating.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Recommended Actions</Label>
                <div className="space-y-2">
                  {[
                    'Promotion Consideration',
                    'Salary Increase',
                    'Additional Training Required',
                    'Performance Improvement Plan',
                    'No Action Required',
                  ].map((action) => (
                    <label key={action} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={recommendedActions.includes(action)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecommendedActions([...recommendedActions, action]);
                          } else {
                            setRecommendedActions(recommendedActions.filter(a => a !== action));
                          }
                        }}
                        disabled={isLocked}
                        className="rounded"
                      />
                      <span>{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              {recommendedActions.includes('Salary Increase') && (
                <div>
                  <Label htmlFor="salaryIncrease">Suggested Salary Increase (%)</Label>
                  <Input
                    id="salaryIncrease"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={salaryIncrease}
                    onChange={(e) => setSalaryIncrease(Number(e.target.value))}
                    disabled={isLocked}
                    className="mt-2 max-w-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: New Goals - TC-PERF-010 */}
          {currentSection === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Set goals for the next review period.
                </p>
                <Button onClick={addNewGoal} size="sm" disabled={isLocked}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
              {newGoals.map((goal, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label>Goal Title *</Label>
                        <Input
                          value={goal.title}
                          onChange={(e) => updateNewGoal(index, 'title', e.target.value)}
                          placeholder="e.g., Lead new feature development"
                          disabled={isLocked}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={goal.description}
                          onChange={(e) => updateNewGoal(index, 'description', e.target.value)}
                          placeholder="Detailed description of the goal..."
                          rows={2}
                          disabled={isLocked}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Target Date *</Label>
                          <Input
                            type="date"
                            value={goal.target_date}
                            onChange={(e) => updateNewGoal(index, 'target_date', e.target.value)}
                            disabled={isLocked}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Weight (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={goal.weight}
                            onChange={(e) => updateNewGoal(index, 'weight', Number(e.target.value))}
                            disabled={isLocked}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    {!isLocked && newGoals.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNewGoal(index)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Total Weight:</strong> {newGoals.reduce((sum, g) => sum + (g.weight || 0), 0)}%
                  {newGoals.reduce((sum, g) => sum + (g.weight || 0), 0) !== 100 && (
                    <span className="ml-2">(Should total 100%)</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 6: Manager Comments */}
          {currentSection === 6 && (
            <div>
              <Label htmlFor="managerComments">Overall Manager Comments</Label>
              <Textarea
                id="managerComments"
                value={managerComments}
                onChange={(e) => setManagerComments(e.target.value)}
                placeholder="Provide overall assessment and any additional comments..."
                rows={8}
                disabled={isLocked}
                className="mt-2"
              />
            </div>
          )}

          {/* SECTION 7: Summary */}
          {currentSection === 7 && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-indigo-900 mb-4">Review Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Employee:</p>
                    <p className="font-semibold">{employee.first_name} {employee.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Review Period:</p>
                    <p className="font-semibold">{review.performance_review_cycles?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Overall Rating:</p>
                    <p className="font-semibold text-xl text-indigo-600">
                      {overallRating}/5 - {getRatingLabel(overallRating)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Average Competency Rating:</p>
                    <p className="font-semibold text-xl text-indigo-600">{averageRating.toFixed(2)}/5</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Goals Achieved:</p>
                    <p className="font-semibold">
                      {previousGoals.filter(g => g.status === 'Achieved' || g.status === 'Exceeded').length}/{previousGoals.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">New Goals Set:</p>
                    <p className="font-semibold">{newGoals.filter(g => g.title).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Once submitted, the employee will be notified to review and acknowledge.
                  The review cannot be edited after submission.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isLocked && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
          >
            Previous
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            {currentSection < sections.length ? (
              <Button onClick={() => setCurrentSection(Math.min(sections.length, currentSection + 1))}>
                Next Section
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitDialog(true)} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Employee Review
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog - TC-PERF-012 */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Review for Employee Acknowledgment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the review to {employee.first_name} {employee.last_name} for their acknowledgment and signature.
              <br /><br />
              <strong>Review Summary:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Overall Rating: {overallRating}/5 ({getRatingLabel(overallRating)})</li>
                <li>• Competencies Rated: {competencies.filter(c => c.rating > 0).length}/{competencies.length}</li>
                <li>• Goals Achieved: {previousGoals.filter(g => g.status).length}/{previousGoals.length}</li>
                <li>• New Goals Set: {newGoals.filter(g => g.title).length}</li>
              </ul>
              <br />
              You will not be able to edit the review after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

