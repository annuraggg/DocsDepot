import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardBody, CardHeader } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Award, Building2, Calendar, ChevronRight } from "lucide-react";
import { House, Point } from "@shared-types/House";
import { Certificate } from "@shared-types/Certificate";
import useAxios from "@/config/axios";

interface DashboardData {
  houses: House[];
  certificates: Certificate[];
  user: any;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateMonthlyPoints = (points: Point[]) => {
  const monthlyPointsMap = points.reduce((acc, point) => {
    const date = new Date(point.createdAt);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (!acc[monthKey]) acc[monthKey] = 0;
    acc[monthKey] += point.points;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(monthlyPointsMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, points]) => ({ month, points }))
    .slice(-6);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-blue-600">{`Points: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [houseMonthlyData, setHouseMonthlyData] = useState<
    { month: string; points: number }[]
  >([]);

  const axios = useAxios();
  useEffect(() => {
    axios
      .get("/dashboard/admin")
      .then((res) => {
        setDashboardData(res.data.data);
        if (res.data.data.houses?.length) {
          const firstHouseId = res.data.data.houses[0]._id;
          setSelectedHouse(firstHouseId);

          const firstHouse = res.data.data.houses.find(
            (h: House) => h._id === firstHouseId
          );
          if (firstHouse?.points) {
            setHouseMonthlyData(
              generateMonthlyPoints(firstHouse.points as Point[])
            );
          }
        }
      })
      .catch((error) => {
        console.error("Dashboard data fetch error:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedHouse) {
      const house = dashboardData?.houses.find((h) => h._id === selectedHouse);
      if (house?.points) {
        setHouseMonthlyData(generateMonthlyPoints(house.points));
      }
    }
  }, [selectedHouse]);

  const getBadgeVariant = (type: string) => {
    const variants: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      external: "bg-purple-100 text-purple-800",
      internal: "bg-blue-100 text-blue-800",
      beginner: "bg-emerald-100 text-emerald-800",
      intermediate: "bg-orange-100 text-orange-800",
      advanced: "bg-red-100 text-red-800",
    };
    return variants[type.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const housePointsData =
    dashboardData?.houses?.map((house) => ({
      name: house.name,
      points: house.points?.reduce((sum, p) => sum + p.points, 0) || 0,
      color: house.color,
    })) || [];

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-full md:col-span-1">
          <CardHeader className="pb-2">
            <p className="text-lg font-medium">Points Distribution</p>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              {housePointsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={housePointsData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="points"
                      fill="#3b82f6"
                      radius={[100, 100, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium min-w-40">House Progress</p>
              <Select
                value={selectedHouse || undefined}
                onChange={(e) => setSelectedHouse(e.target.value)}
                placeholder="Select House"
              >
                {dashboardData.houses.map((house) => (
                  <option key={house._id} value={house._id}>
                    {house.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {houseMonthlyData.length > 2 ? (
                  <LineChart
                    data={houseMonthlyData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="text-lg font-medium">Certifications Overview</p>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            {dashboardData.certificates.length > 0 ? (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Certificate</Th>
                    <Th>Organization</Th>
                    <Th>Issue Date</Th>
                    <Th>Type</Th>
                    <Th>Level</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dashboardData.certificates.map((cert) => (
                    <Tr key={cert._id}>
                      <Td className="font-medium">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          {cert.name}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          {cert.issuingOrganization}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {cert.issueDate.month} {cert.issueDate.year}
                        </div>
                      </Td>
                      <Td>
                        <Badge className={getBadgeVariant(cert.type)}>
                          {cert.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge className={getBadgeVariant(cert.level)}>
                          {cert.level}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge className={getBadgeVariant(cert.status)}>
                          {cert.status}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <Button variant="outline" size="sm" className="gap-2">
                          Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
