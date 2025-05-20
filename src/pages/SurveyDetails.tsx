import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Link as LinkIcon,
  QrCode,
  Users,
  BarChart,
  Edit,
  Trash,
  Plus,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Survey, SurveyStatus, User } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";

// Define the COLORS array for rating visualization
const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71'];

// Mock survey data
const mockSurvey: Survey = {
  id: "1",
  name: "Projektstartbesprechung Feedback",
  status: "Active",
  template: { 
    id: "1", 
    name: "Besprechungs-Feedback", 
    questions: [], 
    createdAt: "2025-05-10", 
    updatedAt: "2025-05-10", 
    isUsedInSurveys: true 
  },
  questions: [
    { id: "q1", text: "Wie würden Sie die Klarheit der Kommunikation während des Meetings bewerten?", createdAt: "", updatedAt: "" },
    { id: "q2", text: "Wie effektiv war das Meeting bei der Erreichung der angegebenen Ziele?", createdAt: "", updatedAt: "" },
    { id: "q3", text: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?", createdAt: "", updatedAt: "" },
    { id: "q4", text: "Wie gut wurde das Meeting moderiert oder geleitet?", createdAt: "", updatedAt: "" },
  ],
  assignedEmployees: [
    { id: "1", name: "John Smith", email: "john@example.com" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com" }
  ],
  responses: 12,
  createdAt: "2025-05-10T10:00:00Z",
  updatedAt: "2025-05-10T10:00:00Z",
  shareLink: "https://survey.example.com/s/1",
  dueDate: "2025-06-10",
  description: "Feedback zur ersten Projektsitzung sammeln",
  isAnonymous: true
};

// Mock all employees data for assigning
const mockAllEmployees: User[] = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "User", active: true },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "User", active: true },
  { id: "3", name: "Michael Brown", email: "michael@example.com", role: "User", active: true },
  { id: "4", name: "Emily Davis", email: "emily@example.com", role: "User", active: true },
  { id: "5", name: "Robert Wilson", email: "robert@example.com", role: "User", active: true }
];

// Mock report data
const mockReport = {
  averageRating: 3.4,
  totalResponses: 12,
  questionRatings: [
    {
      questionId: "q1",
      questionText: "Wie würden Sie die Klarheit der Kommunikation während des Meetings bewerten?",
      averageRating: 3.8,
      distribution: { 1: 0, 2: 1, 3: 4, 4: 7 }
    },
    {
      questionId: "q2",
      questionText: "Wie effektiv war das Meeting bei der Erreichung der angegebenen Ziele?",
      averageRating: 3.2,
      distribution: { 1: 1, 2: 2, 3: 5, 4: 4 }
    },
    {
      questionId: "q3",
      questionText: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?",
      averageRating: 3.0,
      distribution: { 1: 1, 2: 3, 3: 5, 4: 3 }
    },
    {
      questionId: "q4",
      questionText: "Wie gut wurde das Meeting moderiert oder geleitet?",
      averageRating: 3.5,
      distribution: { 1: 0, 2: 1, 3: 6, 4: 5 }
    }
  ],
  employeeRatings: [
    { employeeId: "1", employeeName: "John Smith", averageRating: 3.6 },
    { employeeId: "2", employeeName: "Sarah Johnson", averageRating: 3.2 }
  ]
};

interface EditSurveyFormData {
  name: string;
  description: string;
  dueDate: string;
  isAnonymous: boolean;
  status: SurveyStatus;
  assignedEmployeeIds: string[];
}

const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // Edit survey state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<EditSurveyFormData>({
    name: "",
    description: "",
    dueDate: "",
    isAnonymous: false,
    status: "Draft",
    assignedEmployeeIds: []
  });

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setSurvey(mockSurvey);
      setReport(mockReport);
      
      // Initialize edit form data
      if (mockSurvey) {
        setEditFormData({
          name: mockSurvey.name,
          description: mockSurvey.description || "",
          dueDate: mockSurvey.dueDate || "",
          isAnonymous: mockSurvey.isAnonymous || false,
          status: mockSurvey.status,
          assignedEmployeeIds: mockSurvey.assignedEmployees.map(emp => emp.id)
        });
      }
      
      setLoading(false);
    }, 1000);
  }, [id]);

  useEffect(() => {
    // Generate QR code when survey data is loaded
    if (survey && survey.shareLink) {
      generateQrCode(survey.shareLink);
    }
  }, [survey]);

  const generateQrCode = async (url: string) => {
    try {
      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(dataUrl);
      
      // Also render to canvas for direct download
      if (qrCodeCanvasRef.current) {
        await QRCode.toCanvas(qrCodeCanvasRef.current, url, {
          width: 240,
          margin: 2
        });
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
      toast({
        title: "Fehler",
        description: "QR-Code konnte nicht generiert werden.",
        variant: "destructive",
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-amber-100 text-amber-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleCopyLink = () => {
    if (!survey) return;
    
    navigator.clipboard.writeText(survey.shareLink);
    setCopySuccess(true);
    toast({
      title: "Link kopiert!",
      description: "Umfragelink in die Zwischenablage kopiert.",
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) {
      toast({
        title: "Fehler",
        description: "QR-Code ist noch nicht generiert.",
        variant: "destructive",
      });
      return;
    }

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = qrCodeUrl;
    downloadLink.download = `umfrage-qr-${id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      description: "QR-Code wurde heruntergeladen.",
    });
  };

  const handleEditSurvey = () => {
    setOpenEditDialog(true);
  };

  const handleEditFormChange = (field: keyof EditSurveyFormData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEditedSurvey = () => {
    if (!editFormData.name.trim()) {
      toast({
        title: "Fehler",
        description: "Der Umfragename darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    if (survey) {
      // Find assigned employees from the IDs
      const assignedEmployees = mockAllEmployees.filter(emp => 
        editFormData.assignedEmployeeIds.includes(emp.id)
      );

      const updatedSurvey: Survey = {
        ...survey,
        name: editFormData.name,
        description: editFormData.description,
        dueDate: editFormData.dueDate,
        isAnonymous: editFormData.isAnonymous,
        status: editFormData.status,
        assignedEmployees,
        updatedAt: new Date().toISOString()
      };

      setSurvey(updatedSurvey);
      toast({
        description: "Umfrage wurde aktualisiert.",
      });
      setOpenEditDialog(false);
    }
  };

  const handleDeleteSurvey = () => {
    toast({
      description: "Umfrage wurde gelöscht. Sie werden zur Übersichtsseite weitergeleitet.",
    });
    
    setTimeout(() => {
      navigate("/app");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Umfrage wird geladen...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg text-red-500">Umfrage nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{survey.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <Badge className={getStatusColor(survey.status)}>
              {survey.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Basierend auf: {survey.template.name}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditSurvey}
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-survey-closed hover:text-white hover:bg-survey-closed"
              >
                <Trash className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Umfrage löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie diese Umfrage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSurvey} className="bg-red-600 hover:bg-red-700">
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="flex-grow">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="share">Teilen</TabsTrigger>
          <TabsTrigger value="results" disabled={survey.responses === 0}>Ergebnisse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Umfrageinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {survey.description && (
                <div>
                  <h3 className="font-medium text-gray-700">Beschreibung</h3>
                  <p className="mt-1 text-gray-600">{survey.description}</p>
                </div>
              )}
              
              {survey.status === "Active" && (
                <div>
                  <h3 className="font-medium text-gray-700">Status</h3>
                  <p className="mt-1 text-gray-600">
                    Aktiv - Antworten werden gesammelt bis die Umfrage geschlossen wird
                  </p>
                </div>
              )}
              
              {survey.isAnonymous !== undefined && (
                <div>
                  <h3 className="font-medium text-gray-700">Anonymität</h3>
                  <p className="mt-1 text-gray-600">
                    {survey.isAnonymous ? "Anonym - Teilnehmer werden nicht identifiziert" : "Nicht anonym - Teilnehmer werden identifiziert"}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-gray-700">Zugewiesene Mitarbeiter</h3>
                <div className="flex flex-wrap mt-2 gap-2">
                  {survey.assignedEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-primary-blue text-white">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{employee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Fragen</h3>
                <div className="mt-2 space-y-2">
                  {survey.questions.map((question, index) => (
                    <div key={question.id} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        {question.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Umfrage teilen</CardTitle>
              <CardDescription>
                Verteilen Sie diese Umfrage an Kunden für Feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Umfragelink</h3>
                <div className="flex items-center">
                  <div className="flex-grow p-2 bg-gray-50 rounded-l-md truncate text-sm">
                    {survey.shareLink}
                  </div>
                  <Button 
                    className={copySuccess ? "rounded-l-none bg-green-600" : "rounded-l-none bg-primary-blue"}
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copySuccess ? "Kopiert!" : "Kopieren"}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">QR-Code</h3>
                <div className="flex justify-center p-6 bg-gray-50 rounded-md">
                  <div className="w-40 h-40 bg-white p-2 flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" width={120} height={120} />
                    ) : (
                      <div className="animate-pulse bg-gray-200 w-[120px] h-[120px]"></div>
                    )}
                  </div>
                </div>
                <canvas ref={qrCodeCanvasRef} className="hidden" width={240} height={240}></canvas>
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadQR}
                    disabled={!qrCodeUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    QR-Code herunterladen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {report && (
            <>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Durchschnittliche Bewertung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {report.averageRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Von 4,0 maximal</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Gesamtantworten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {report.totalResponses}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Abschlussrate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {/* This would be calculated in a real app */}
                      100%
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Alle Befragten haben die Umfrage abgeschlossen</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fragenbewertungen</CardTitle>
                  <CardDescription>
                    Durchschnittliche Bewertungen und Verteilung nach Fragen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {report.questionRatings.map((q: any) => (
                    <div key={q.questionId} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium">{q.questionText}</h3>
                        <span className="text-lg font-bold text-primary-blue">
                          {q.averageRating.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map(rating => {
                          const count = q.distribution[rating];
                          const percentage = (count / report.totalResponses) * 100;
                          
                          return (
                            <div 
                              key={rating} 
                              className="h-8 flex-grow"
                              style={{ 
                                background: COLORS[rating - 1],
                                width: `${percentage}%`,
                                minWidth: count > 0 ? '1rem' : '0'
                              }}
                              title={`Bewertung ${rating}: ${count} Antworten (${percentage.toFixed(1)}%)`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Schlecht (1)</span>
                        <span>Ausgezeichnet (4)</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mitarbeiterbewertungen</CardTitle>
                  <CardDescription>
                    Durchschnittliche Bewertungen für zugewiesene Mitarbeiter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.employeeRatings.map((er: any) => (
                      <div key={er.employeeId} className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-primary-blue text-white">
                            {er.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-medium">{er.employeeName}</span>
                            <span className="font-bold text-primary-blue">
                              {er.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-blue h-2 rounded-full"
                              style={{ width: `${(er.averageRating / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Survey Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Umfrage bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details Ihrer Umfrage hier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="survey-name" className="text-right">
                Name
              </Label>
              <Input
                id="survey-name"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="survey-description" className="text-right">
                Beschreibung
              </Label>
              <Textarea
                id="survey-description"
                value={editFormData.description}
                onChange={(e) => handleEditFormChange("description", e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="survey-due-date" className="text-right">
                Fälligkeitsdatum
              </Label>
              <Input
                id="survey-due-date"
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => handleEditFormChange("dueDate", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="survey-status" className="text-right">
                Status
              </Label>
              <Select 
                value={editFormData.status}
                onValueChange={(value) => handleEditFormChange("status", value as SurveyStatus)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Entwurf</SelectItem>
                  <SelectItem value="Active">Aktiv</SelectItem>
                  <SelectItem value="Closed">Geschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="survey-anonymous" className="text-right">
                Anonymität
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="survey-anonymous"
                  checked={editFormData.isAnonymous}
                  onChange={(e) => handleEditFormChange("isAnonymous", e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="survey-anonymous">
                  Antworten anonym sammeln
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Zugewiesene Mitarbeiter
              </Label>
              <div className="col-span-3 space-y-2">
                {mockAllEmployees.map(employee => (
                  <div key={employee.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`employee-${employee.id}`}
                      checked={editFormData.assignedEmployeeIds.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleEditFormChange("assignedEmployeeIds", [
                            ...editFormData.assignedEmployeeIds,
                            employee.id
                          ]);
                        } else {
                          handleEditFormChange("assignedEmployeeIds", 
                            editFormData.assignedEmployeeIds.filter(id => id !== employee.id)
                          );
                        }
                      }}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`employee-${employee.id}`} className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-primary-blue text-white">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {employee.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEditedSurvey}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveyDetails;
