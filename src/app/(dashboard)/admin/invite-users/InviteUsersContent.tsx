"use client";
import { useState, useTransition, useEffect } from "react";
import { createInvitation, getPendingInvitations, deleteInvitation } from "@/actions/invitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Send, Loader2, CheckCircle, AlertCircle, Trash2, Calendar } from "lucide-react";

type Role = "hr" | "employee";

interface InvitationForm {
  email: string;
  role: Role | "";
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invitedAt: Date;
  expiresAt: Date;
  status: string;
  invitedBy: string;
}

export default function InviteUsersContent() {
  const [form, setForm] = useState<InvitationForm>({ email: "", role: "" });
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPendingInvitations = async () => {
    try {
      const invitations = await getPendingInvitations();
      setPendingInvitations(invitations);
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.role) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    if (!isValidEmail(form.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createInvitation(form.email, form.role as Role);
        
        if (result.success) {
          setMessage({ type: "success", text: result.message || "Invitation sent successfully!" });
          setForm({ email: "", role: "" });
          // Reload invitations
          loadPendingInvitations();
        } else {
          setMessage({ type: "error", text: result.error || "Failed to send invitation" });
        }
      } catch {
        setMessage({ type: "error", text: "An unexpected error occurred" });
      }
    });
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    setDeletingId(invitationId);
    try {
      const result = await deleteInvitation(invitationId);
      if (result.success) {
        setMessage({ type: "success", text: "Invitation cancelled successfully" });
        loadPendingInvitations();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to cancel invitation" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to cancel invitation" });
    } finally {
      setDeletingId(null);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Invitation Form */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="border-blue-200">
          <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send New Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.role}
                  onValueChange={(value: Role) => setForm({ ...form, role: value })}
                  disabled={isPending}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                The invitee will receive an email with instructions to set up their account.
              </div>
              <Button
                type="submit"
                disabled={isPending || !form.email || !form.role}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Message Display */}
          {message && (
            <div
              className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="border-gray-200">
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending Invitations ({pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading invitations...</p>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No pending invitations</p>
              <p className="text-sm">Send your first invitation using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => {
                const daysLeft = getDaysUntilExpiry(invitation.expiresAt);
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{invitation.email}</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          {invitation.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            daysLeft <= 1
                              ? "border-red-200 text-red-700"
                              : daysLeft <= 3
                              ? "border-yellow-200 text-yellow-700"
                              : "border-green-200 text-green-700"
                          }`}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {daysLeft} days left
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Invited by: {invitation.invitedBy}</p>
                        <p>Sent: {formatDate(invitation.invitedAt)}</p>
                        <p>Expires: {formatDate(invitation.expiresAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        disabled={deletingId === invitation.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {deletingId === invitation.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration Notice */}
      {/* <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Email Configuration Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                To send invitation emails, you need to configure SMTP settings in your environment variables:
              </p>
              <div className="bg-yellow-100 p-3 rounded-md">
                <code className="text-xs text-yellow-800 block space-y-1">
                  <div>SMTP_HOST=smtp.gmail.com</div>
                  <div>SMTP_PORT=587</div>
                  <div>SMTP_USER=your-email@gmail.com</div>
                  <div>SMTP_PASSWORD=your-app-password</div>
                  <div>SMTP_FROM=your-email@gmail.com</div>
                  <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
} 