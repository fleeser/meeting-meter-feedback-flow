
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock data for the charts
const surveyTrendsData = [
  { month: 'Jan', responses: 12, avgRating: 3.2 },
  { month: 'Feb', responses: 19, avgRating: 3.4 },
  { month: 'Mär', responses: 15, avgRating: 3.1 },
  { month: 'Apr', responses: 25, avgRating: 3.6 },
  { month: 'Mai', responses: 32, avgRating: 3.5 },
];

const questionAveragesData = [
  { name: 'Klarheit', rating: 3.8 },
  { name: 'Ziele', rating: 3.2 },
  { name: 'Zeitnutzung', rating: 2.9 },
  { name: 'Moderation', rating: 3.5 },
];

const ratingDistributionData = [
  { name: 'Schlecht (1)', value: 8 },
  { name: 'Ausreichend (2)', value: 15 },
  { name: 'Gut (3)', value: 42 },
  { name: 'Ausgezeichnet (4)', value: 35 },
];

const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71'];

const Reports = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Berichte werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Berichte & Analysen</h1>
        <p className="text-gray-500 mt-1">
          Einblicke aus allen Ihren Besprechungsumfragen
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="flex-grow">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <PieChart className="h-4 w-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="questions">
            <BarChart className="h-4 w-4 mr-2" />
            Fragen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="flex-grow">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gesamtumfragen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-blue">24</div>
                <p className="text-sm text-gray-500 mt-1">12 aktiv, 8 Entwurf, 4 geschlossen</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gesamtantworten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-blue">187</div>
                <p className="text-sm text-gray-500 mt-1">+23% vom Vormonat</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Durchschnittsbewertung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-blue">3,4</div>
                <p className="text-sm text-gray-500 mt-1">Von 4,0 maximal</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Bewertungsverteilung</CardTitle>
                <CardDescription>Antworten nach Bewertungsstufe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={ratingDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label
                      >
                        {ratingDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Fragenleistung</CardTitle>
                <CardDescription>Durchschnittliche Bewertungen nach Fragentyp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={questionAveragesData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#3498db" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="flex-grow">
          <Card>
            <CardHeader>
              <CardTitle>Umfrageantwortentrends</CardTitle>
              <CardDescription>Monatliche Antworten und Durchschnittsbewertungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={surveyTrendsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 4]} />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="responses"
                      stroke="#3498db"
                      fill="#3498db"
                      fillOpacity={0.3}
                      activeDot={{ r: 8 }}
                      name="Antworten"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#2ecc71"
                      fill="#2ecc71"
                      fillOpacity={0.3}
                      name="Durchschn. Bewertung"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Fragenleistungsanalyse</CardTitle>
              <CardDescription>Durchschnittliche Bewertungen über alle Umfragen</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)]">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { question: "Wie bewerten Sie die Klarheit der Kommunikation während des Meetings?", rating: 3.8 },
                      { question: "Wie effektiv war das Meeting bei der Behandlung seiner angegebenen Ziele?", rating: 3.2 },
                      { question: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?", rating: 2.9 },
                      { question: "Wie gut wurde das Meeting moderiert?", rating: 3.5 },
                      { question: "Wie bewerten Sie die Relevanz der Meetinginhalte?", rating: 3.7 },
                      { question: "Wie zufrieden waren Sie mit den Ergebnissen des Meetings?", rating: 3.1 },
                    ]}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 4]} />
                    <YAxis
                      type="category"
                      width={300}
                      dataKey="question"
                      tickFormatter={(value) => 
                        value.length > 40 ? `${value.substring(0, 40)}...` : value
                      }
                    />
                    <Tooltip />
                    <Bar dataKey="rating" name="Bewertung" fill="#3498db" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
