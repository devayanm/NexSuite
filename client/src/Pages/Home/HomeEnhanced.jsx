import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, List, Clock, TrendingUp, Send } from "lucide-react";

const HomeEnhanced = () => {
  const user = useSelector((state) => state.user.user);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/home?adminId=${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    {
      title: "Mails Sent",
      value: data.mailsSent || 0,
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Contacts Stored",
      value: data.totalContacts || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Lists",
      value: data.totalContactList || 0,
      icon: List,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Email Jobs",
      value: data.totalActiveScheduledMails || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your email management overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 border-none"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span>Active</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/send-email"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="p-3 bg-blue-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Send Email</h3>
                  <p className="text-sm text-gray-600">Compose new email</p>
                </div>
              </a>

              <a
                href="/templates"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <div className="p-3 bg-purple-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <List className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-600">Manage templates</p>
                </div>
              </a>

              <a
                href="/groups"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <div className="p-3 bg-green-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Groups</h3>
                  <p className="text-sm text-gray-600">Manage groups</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeEnhanced;
