"use client";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createEmployeeProfile, getUserForOnboarding } from "@/actions/employee";
import type { EmployeeOnboardingData } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCheck, User, Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<UserData | null>(null);
  
  const [formData, setFormData] = useState<EmployeeOnboardingData>({
    empId: "",
    designation: "",
    joinDate: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    contactInfo: "",
  });

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const result = await getUserForOnboarding(userId);
        
        if (result.success && result.user) {
          setUser(result.user);

          // Generate employee ID
          const empId = `SYN${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          setFormData(prev => ({ ...prev, empId }));
          
          setLoading(false);
        } else {
          setError(result.error || "Failed to load user data");
          setLoading(false);
        }
      } catch {
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.designation || !formData.joinDate || !formData.dateOfBirth || !formData.gender) {
      setError("Please fill in all required fields");
      return;
    }

    if (!userId) {
      setError("Invalid user ID");
      return;
    }

    if (!formData.empId) {
      setError("Employee ID is required");
      return;
    }

    // Validate date formats
    const joinDate = new Date(formData.joinDate);
    const birthDate = new Date(formData.dateOfBirth);
    
    if (isNaN(joinDate.getTime()) || isNaN(birthDate.getTime())) {
      setError("Please enter valid dates");
      return;
    }

    if (birthDate >= joinDate) {
      setError("Birth date must be before join date");
      return;
    }

    startTransition(async () => {
      try {
        setError(null); // Clear any previous errors
        
        const result = await createEmployeeProfile(userId, formData);
        
        if (result.success) {
          // Redirect to appropriate dashboard based on role
          let dashboardPath; // default
          
          switch (user?.role) {
            case 'superadmin':
              dashboardPath = '/superadmin';
              break;
            case 'admin':
              dashboardPath = '/admin';
              break;
            case 'hr':
              dashboardPath = '/hr';
              break;
            case 'employee':
            default:
              dashboardPath = '/employee';
              break;
          }
          
          router.push(dashboardPath);
        } else {
          setError(result.error || "Failed to create employee profile");
        }
      } catch (error) {
        console.error("Onboarding form error:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  if (loading) {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Setup Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center border-green-200 pb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-900">Complete Your Profile</CardTitle>
        <p className="text-gray-600 mt-2">
          Just a few more details to get you started
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Welcome to Synvibes HRMS!</h3>
          <div className="space-y-1 text-sm text-green-700">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <Badge className="bg-green-100 text-green-800">{user.role}</Badge></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Employee Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="empId" className="text-sm font-medium text-gray-700">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                  id="empId"
                  type="text"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="designation" className="text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="e.g. Software Engineer, HR Manager"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="joinDate" className="text-sm font-medium text-gray-700">
                  Join Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={isPending}
              >
                <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contactInfo" className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="contactInfo"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isPending}
              className="flex-1 border-gray-300"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            You can update your profile information later from your dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 