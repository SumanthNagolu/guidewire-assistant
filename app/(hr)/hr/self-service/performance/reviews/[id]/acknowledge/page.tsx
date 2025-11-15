'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, AlertTriangle, Check, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AcknowledgeReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);

  // Acknowledgment form state - TC-PERF-022, TC-PERF-023
  const [selfAssessment, setSelfAssessment] = useState('');
  const [employeeComments, setEmployeeComments] = useState('');
  const [agreedToReview, setAgreedToReview] = useState(false);
  const [agreedToGoals, setAgreedToGoals] = useState(false);
  const [electronicSignature, setElectronicSignature] = useState('');
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState('');

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  const loadReview = async () => {
    setLoading(true);
    try {
      // Get current user's employee record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect('/hr/login');
        return;
      }

      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!empData) {
        throw new Error('Employee not found');
      }
      setEmployee(empData);

      // Load review - TC-PERF-021
      const { data: reviewData, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          performance_review_cycles(name, review_type, due_date),
          employees!performance_reviews_reviewer_id_fkey(first_name, last_name, employee_id)
        `)
        .eq('id', reviewId)
        .eq('employee_id', empData.id) // Security: can only acknowledge own review
        .single();

      if (error) throw error;

      if (reviewData.status !== 'SubmittedToEmployee' && reviewData.status !== 'ChangesRequested') {
        toast.error('This review is not available for acknowledgment');
        router.push('/hr/self-service/performance');
        return;
      }

      setReview(reviewData);
      setReviewer(reviewData.employees);

      // Pre-fill if already has comments
      if (reviewData.employee_self_assessment) setSelfAssessment(reviewData.employee_self_assessment);
      if (reviewData.employee_comments) setEmployeeComments(reviewData.employee_comments);

    } catch (error) {
      toast.error('Failed to load review');
      router.push('/hr/self-service/performance');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    // TC-PERF-023
    if (!changeRequestReason.trim()) {
      toast.error('Please explain what needs to be changed');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .update({
          status: 'ChangesRequested',
          change_request_reason: changeRequestReason,
          change_requested_at: new Date().toISOString(),
          employee_self_assessment: selfAssessment,
          employee_comments: employeeComments,
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Note: Notification will be sent via server-side webhook

      toast.success('Change request submitted to your manager');
      router.push('/hr/self-service/performance');
    } catch (error) {
      toast.error('Failed to submit change request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    // TC-PERF-024 Validation
    if (!agreedToReview || !agreedToGoals) {
      toast.error('Please check all acknowledgment boxes');
      return;
    }

    if (!electronicSignature.trim()) {
      toast.error('Please enter your electronic signature');
      return;
    }

    // Verify signature matches employee name
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    if (electronicSignature.toLowerCase() !== fullName) {
      toast.error('Electronic signature must match your full name');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .update({
          employee_self_assessment: selfAssessment,
          employee_comments: employeeComments,
          employee_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          electronic_signature: electronicSignature,
          acknowledgment_ip: 'REDACTED', // Could capture actual IP
          status: 'Acknowledged',
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Note: Notification will be sent via server-side webhook

      toast.success('Review acknowledged successfully!');
      router.push('/hr/self-service/performance');
    } catch (error) {
      toast.error('Failed to acknowledge review');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return 'Outstanding';
    if (rating === 4) return 'Exceeds Expectations';
    if (rating === 3) return 'Meets Expectations';
    if (rating === 2) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading review...</div>;
  }

  if (!review || !employee) {
    return <div className="text-center py-12">Review not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/self-service/performance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Pending Your Acknowledgment</h1>
            <p className="text-gray-600 mt-1">
              {review.performance_review_cycles?.name} • {review.performance_review_cycles?.review_type}
            </p>
          </div>
        </div>
        <Badge className="bg-amber-100 text-amber-800">Action Required</Badge>
      </div>

      {/* Alert */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                Your manager has completed your performance review
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Please read the review carefully and provide your feedback before acknowledging.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Details - READ ONLY */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <CardTitle>Performance Review Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Review Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Review Period</Label>
              <p className="font-medium">
                {new Date(review.review_period_start).toLocaleDateString()} - 
                {new Date(review.review_period_end).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-gray-500">Reviewed By</Label>
              <p className="font-medium">
                {reviewer?.first_name} {reviewer?.last_name}
              </p>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-indigo-600">Overall Performance Rating</Label>
                <p className="text-4xl font-bold text-indigo-900 mt-2">
                  {review.overall_rating}/5
                </p>
                <p className="text-lg text-indigo-700 mt-1">
                  {getRatingLabel(review.overall_rating)}
                </p>
              </div>
              {review.average_rating && (
                <div className="text-right">
                  <Label className="text-indigo-600">Average Competency Rating</Label>
                  <p className="text-3xl font-bold text-indigo-900 mt-2">
                    {review.average_rating.toFixed(2)}/5
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Competency Ratings */}
          {review.competency_ratings && Object.keys(review.competency_ratings).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Competency Ratings</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(review.competency_ratings).map(([code, rating]: [string, any]) => (
                  <div key={code} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{code.replace(/_/g, ' ')}</span>
                      <span className="text-lg font-bold text-indigo-600">{rating}/5</span>
                    </div>
                    {review.competency_comments?.[code] && (
                      <p className="text-sm text-gray-600 mt-2">
                        {review.competency_comments[code]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Key Strengths</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{review.strengths || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{review.areas_for_improvement || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Goals for Next Period */}
          {review.new_goals && review.new_goals.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Goals Set for Next Period</h3>
              <div className="space-y-3">
                {review.new_goals.map((goal: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                          {goal.weight && <span>Weight: {goal.weight}%</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manager Comments */}
          {review.manager_comments && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Manager's Overall Comments</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{review.manager_comments}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {review.recommended_actions && review.recommended_actions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions</h3>
              <div className="flex flex-wrap gap-2">
                {review.recommended_actions.map((action: string) => (
                  <Badge key={action} className="bg-indigo-100 text-indigo-800">
                    {action}
                  </Badge>
                ))}
              </div>
              {review.suggested_salary_increase > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Suggested salary increase: {review.suggested_salary_increase}%
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Feedback Section - TC-PERF-022 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Your Feedback (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="selfAssessment">Self-Assessment</Label>
            <Textarea
              id="selfAssessment"
              value={selfAssessment}
              onChange={(e) => setSelfAssessment(e.target.value)}
              placeholder="Share your perspective on your performance during this period..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="employeeComments">Additional Comments or Feedback</Label>
            <Textarea
              id="employeeComments"
              value={employeeComments}
              onChange={(e) => setEmployeeComments(e.target.value)}
              placeholder="Any additional thoughts, concerns, or feedback about this review..."
              rows={4}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Request Section - TC-PERF-023 */}
      {showChangeRequest ? (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">Request Changes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="changeReason">Explain What Needs to Be Changed *</Label>
              <Textarea
                id="changeReason"
                value={changeRequestReason}
                onChange={(e) => setChangeRequestReason(e.target.value)}
                placeholder="Please explain specifically what you believe needs to be reconsidered..."
                rows={5}
                className="mt-2"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangeRequest(false);
                  setChangeRequestReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestChanges}
                disabled={submitting || !changeRequestReason.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Change Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowChangeRequest(true)}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Changes to This Review
          </Button>
        </div>
      )}

      {/* Acknowledgment Section - TC-PERF-024 */}
      {!showChangeRequest && (
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-900">Acknowledge Review</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              By acknowledging this review, you confirm that you have read and understood the feedback provided.
            </p>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreedToReview}
                  onChange={(e) => setAgreedToReview(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm">
                  I have read and understood this performance review
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreedToGoals}
                  onChange={(e) => setAgreedToGoals(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm">
                  I agree to work towards the goals set for the next period
                </span>
              </label>
            </div>

            {/* Electronic Signature */}
            <div>
              <Label htmlFor="signature">Electronic Signature *</Label>
              <Input
                id="signature"
                value={electronicSignature}
                onChange={(e) => setElectronicSignature(e.target.value)}
                placeholder={`Type your full name: ${employee.first_name} ${employee.last_name}`}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                By typing your full name, you electronically sign this acknowledgment
              </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-600">
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p className="mt-1">
                <strong>Note:</strong> This acknowledgment indicates you have received and reviewed
                the feedback. It does not necessarily mean you agree with all assessments.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/hr/self-service/performance">
                <Button variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleAcknowledge}
                disabled={submitting || !agreedToReview || !agreedToGoals || !electronicSignature}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {submitting ? 'Acknowledging...' : 'Acknowledge & Sign'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

