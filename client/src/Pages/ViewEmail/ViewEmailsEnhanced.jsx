import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Search, Clock, CheckCircle, XCircle, Send } from "lucide-react";

const ViewEmailsEnhanced = () => {
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;

      try {
        const response = await fetch(`${apiUrl}/api/emails/admin/${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
        } else {
          console.error("Failed to fetch emails. Status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [user]);

  const filteredEmails = emails.filter((email) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(search) ||
      email.to?.some((recipient) => recipient.toLowerCase().includes(search)) ||
      email.status?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Sent",
      },
      scheduled: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        label: "Scheduled",
      },
      failed: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Failed",
      },
      repeat: {
        color: "bg-purple-100 text-purple-800",
        icon: Clock,
        label: "Recurring",
      },
    };

    const config = statusConfig[status] || statusConfig.sent;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-none`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email History
          </h1>
          <p className="text-gray-600">View all sent and scheduled emails</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                All Emails ({filteredEmails.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No emails found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmails.map((email) => (
                      <TableRow
                        key={email._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/email/${email._id}`)}
                      >
                        <TableCell className="font-medium">
                          {email.subject}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {email.to?.slice(0, 2).map((recipient, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {recipient}
                              </Badge>
                            ))}
                            {email.to?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{email.to.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/email/${email._id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewEmailsEnhanced;
