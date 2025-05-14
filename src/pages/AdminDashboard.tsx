
import React, { useEffect, useState } from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getEmployee, getShiftType } from "@/services/mockData";
import { Employee, ShiftType } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AdminDashboard: React.FC = () => {
  const {
    employees,
    shiftTypes,
    shifts,
    selectedYear,
    selectedMonth,
    selectedEmployee,
    setSelectedMonth,
    setSelectedYear,
    setSelectedEmployee,
    loadShifts,
    updateEmployeeShift,
    saveShiftType,
    removeShiftType
  } = useSchedule();

  const [currentCalendar, setCurrentCalendar] = useState<Date[][]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);
  const [newShiftType, setNewShiftType] = useState<Partial<ShiftType>>({
    code: "",
    description: "",
    color: "#6366f1",
    startTime: "",
    endTime: ""
  });
  const [isShiftManagementOpen, setIsShiftManagementOpen] = useState(false);

  useEffect(() => {
    loadShifts();
  }, [selectedYear, selectedMonth, loadShifts]);

  useEffect(() => {
    generateCalendar(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    // Filter employees based on search and department filters
    let filtered = [...employees];
    
    if (searchTerm) {
      filtered = filtered.filter(
        emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter]);

  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Calculate the first day of the week (0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    const calendar: Date[][] = [];
    let week: Date[] = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(new Date(year, month, -firstDayOfWeek + i + 1));
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(year, month, day));
      
      // If it's the end of a week or the last day, start a new week
      if (week.length === 7 || day === daysInMonth) {
        calendar.push(week);
        week = [];
      }
    }
    
    // If the last week is not complete, add empty cells
    while (week.length > 0 && week.length < 7) {
      const lastDate = week[week.length - 1];
      const nextDay = new Date(lastDate);
      nextDay.setDate(lastDate.getDate() + 1);
      week.push(nextDay);
    }
    
    setCurrentCalendar(calendar);
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleShiftChange = (employeeId: string, date: string, shiftTypeId: string) => {
    updateEmployeeShift(employeeId, date, shiftTypeId);
  };

  const getShiftForDay = (employeeId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.find(s => s.userId === employeeId && s.date === dateStr);
  };

  // Get unique departments for filtering
  const departments = [...new Set(employees.map(emp => emp.department))];

  const handleAddOrUpdateShiftType = () => {
    if (editingShiftType) {
      // Update existing shift type
      saveShiftType({
        ...editingShiftType,
        code: newShiftType.code || editingShiftType.code,
        description: newShiftType.description || editingShiftType.description,
        color: newShiftType.color || editingShiftType.color,
        startTime: newShiftType.startTime,
        endTime: newShiftType.endTime
      });
    } else {
      // Add new shift type
      saveShiftType({
        id: `shift-new-${Date.now()}`,
        code: newShiftType.code || "",
        description: newShiftType.description || "",
        color: newShiftType.color || "#6366f1",
        startTime: newShiftType.startTime,
        endTime: newShiftType.endTime
      });
    }

    // Reset the form
    setEditingShiftType(null);
    setNewShiftType({
      code: "",
      description: "",
      color: "#6366f1",
      startTime: "",
      endTime: ""
    });
  };

  const handleEditShiftType = (shiftType: ShiftType) => {
    setEditingShiftType(shiftType);
    setNewShiftType({
      code: shiftType.code,
      description: shiftType.description,
      color: shiftType.color,
      startTime: shiftType.startTime || "",
      endTime: shiftType.endTime || ""
    });
  };

  const handleDeleteShiftType = (shiftTypeId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este turno?")) {
      removeShiftType(shiftTypeId);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="schedule">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Escala</TabsTrigger>
          <TabsTrigger value="shifts">Gestão de Turnos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Escala de Trabalho - Admin</h1>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[220px]"
              />
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePreviousMonth}>
                  ←
                </Button>
                <CardTitle className="text-xl">
                  {months[selectedMonth]} {selectedYear}
                </CardTitle>
                <Button variant="outline" onClick={handleNextMonth}>
                  →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 px-2 text-left font-medium">Colaborador</th>
                      {currentCalendar.flat().map((date, index) => (
                        <th key={index} className="p-2 text-center min-w-10">
                          <div className="text-xs font-bold">{weekdays[date.getDay()]}</div>
                          <div className="text-xs">{date.getDate()}</div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-t">
                      <td className="py-1 px-2 whitespace-nowrap">
                       <div className="text-sm font-semibold">
                       {employee.name} <span className="text-xs text-gray-500">({employee.position})</span>
                       </div>
                      </td>
                      {currentCalendar.flat().map((date, dayIndex) => {
                        const isCurrentMonth = date.getMonth() === selectedMonth;
                        const shift = getShiftForDay(employee.id, date);
                        const shiftType = shift ? getShiftType(shift.shiftTypeId) : null;
                        const dateStr = date.toISOString().split('T')[0];
                        
                        return (
                          <td
                            key={dayIndex}
                            className={`p-1 text-center border-l ${
                              isCurrentMonth ? "" : "bg-gray-100"
                            }`}
                          >
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className={`w-full h-8 rounded-md ${
                                    shiftType
                                      ? "text-white"
                                      : "border border-dashed border-gray-300 hover:border-gray-500"
                                  }`}
                                  style={{
                                    backgroundColor: shiftType ? shiftType.color : "transparent",
                                  }}
                                >
                                  {shiftType ? shiftType.code : "+"}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2">
                                <div className="grid grid-cols-5 gap-2">
                                  {shiftTypes.map((type) => (
                                    <button
                                      key={type.id}
                                      className="w-10 h-10 rounded-md text-white flex items-center justify-center"
                                      style={{ backgroundColor: type.color }}
                                      onClick={() => {
                                        handleShiftChange(employee.id, dateStr, type.id);
                                      }}
                                      title={type.description}
                                    >
                                      {type.code}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Legenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {shiftTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-md text-white text-sm font-medium"
                        style={{ backgroundColor: type.color }}
                      >
                        {type.code}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{type.description}</p>
                        <p className="text-xs text-gray-500">
                          {type.startTime && type.endTime
                            ? `${type.startTime} - ${type.endTime}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="shifts">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Turnos</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Adicionar Novo Turno</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingShiftType ? "Editar Turno" : "Novo Turno"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Código (Sigla)</label>
                        <Input
                          value={newShiftType.code}
                          onChange={(e) =>
                            setNewShiftType({ ...newShiftType, code: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cor</label>
                        <Input
                          type="color"
                          value={newShiftType.color}
                          onChange={(e) =>
                            setNewShiftType({ ...newShiftType, color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descrição</label>
                      <Input
                        value={newShiftType.description}
                        onChange={(e) =>
                          setNewShiftType({ ...newShiftType, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hora de Início</label>
                        <Input
                          type="time"
                          value={newShiftType.startTime}
                          onChange={(e) =>
                            setNewShiftType({ ...newShiftType, startTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hora de Término</label>
                        <Input
                          type="time"
                          value={newShiftType.endTime}
                          onChange={(e) =>
                            setNewShiftType({ ...newShiftType, endTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setEditingShiftType(null);
                        setNewShiftType({
                          code: "",
                          description: "",
                          color: "#6366f1",
                          startTime: "",
                          endTime: ""
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddOrUpdateShiftType}>
                        {editingShiftType ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Código</th>
                        <th className="text-left py-2 px-4">Cor</th>
                        <th className="text-left py-2 px-4">Descrição</th>
                        <th className="text-left py-2 px-4">Horário</th>
                        <th className="text-right py-2 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftTypes.map((type) => (
                        <tr key={type.id} className="border-b">
                          <td className="py-2 px-4">
                            <span
                              className="inline-block w-8 h-8 rounded-md text-white text-center leading-8"
                              style={{ backgroundColor: type.color }}
                            >
                              {type.code}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div
                              className="w-8 h-8 rounded-md"
                              style={{ backgroundColor: type.color }}
                            ></div>
                          </td>
                          <td className="py-2 px-4">{type.description}</td>
                          <td className="py-2 px-4">
                            {type.startTime && type.endTime
                              ? `${type.startTime} - ${type.endTime}`
                              : "—"}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditShiftType(type)}
                                >
                                  Editar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Turno</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Código (Sigla)</label>
                                      <Input
                                        value={newShiftType.code}
                                        onChange={(e) =>
                                          setNewShiftType({ ...newShiftType, code: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Cor</label>
                                      <Input
                                        type="color"
                                        value={newShiftType.color}
                                        onChange={(e) =>
                                          setNewShiftType({ ...newShiftType, color: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Descrição</label>
                                    <Input
                                      value={newShiftType.description}
                                      onChange={(e) =>
                                        setNewShiftType({
                                          ...newShiftType,
                                          description: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Hora de Início</label>
                                      <Input
                                        type="time"
                                        value={newShiftType.startTime}
                                        onChange={(e) =>
                                          setNewShiftType({
                                            ...newShiftType,
                                            startTime: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Hora de Término</label>
                                      <Input
                                        type="time"
                                        value={newShiftType.endTime}
                                        onChange={(e) =>
                                          setNewShiftType({
                                            ...newShiftType,
                                            endTime: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => {
                                      setEditingShiftType(null);
                                      setNewShiftType({
                                        code: "",
                                        description: "",
                                        color: "#6366f1",
                                        startTime: "",
                                        endTime: ""
                                      });
                                    }}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleAddOrUpdateShiftType}>
                                      Atualizar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteShiftType(type.id)}
                              className="text-destructive"
                            >
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
