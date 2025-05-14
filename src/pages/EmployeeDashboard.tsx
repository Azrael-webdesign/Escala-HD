
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchedule } from "@/contexts/ScheduleContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEmployee, getShiftType } from "@/services/mockData";
import { Employee } from "@/types";

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    shiftTypes,
    shifts,
    selectedYear,
    selectedMonth,
    selectedEmployee,
    setSelectedMonth,
    setSelectedYear,
    setSelectedEmployee,
    loadShifts,
    employees,
  } = useSchedule();
  const [currentCalendar, setCurrentCalendar] = useState<Date[][]>([]);

  useEffect(() => {
    // Initialize with current user if they are an employee
    if (user && user.role === "employee" && !selectedEmployee) {
      setSelectedEmployee(user.id);
    }
  }, [user, selectedEmployee, setSelectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      loadShifts(selectedEmployee);
    }
  }, [selectedEmployee, selectedYear, selectedMonth, loadShifts]);

  useEffect(() => {
    generateCalendar(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

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

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const getShiftForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.find(s => s.date === dateStr);
  };

  const employeeDetails = selectedEmployee ? getEmployee(selectedEmployee) : null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Escala de Trabalho</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select value={selectedEmployee || ""} onValueChange={handleEmployeeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecionar colaborador" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {employeeDetails && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{employeeDetails.name}</CardTitle>
              <CardDescription>
                {employeeDetails.position} - {employeeDetails.department}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <Card>
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
              <table className="min-w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 font-medium">Dia</th>
                    {currentCalendar.flat().map((date, index) => (
                      <th key={index} className="text-xs text-center px-2">
                        <div className="font-semibold">{weekdays[date.getDay()]}</div>
                        <div>{date.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-2 whitespace-nowrap text-left text-sm font-semibold">
                      {employeeDetails?.name}{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        ({employeeDetails?.position})
                      </span>
                    </td>
                    {currentCalendar.flat().map((date, index) => {
                      const isCurrentMonth = date.getMonth() === selectedMonth;
                      const shift = getShiftForDay(date);
                      const shiftType = shift ? getShiftType(shift.shiftTypeId) : null;

                      return (
                        <td
                          key={index}
                          className={`p-1 text-center border ${
                            isCurrentMonth ? "" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {shift && shiftType ? (
                            <div
                              className="mx-auto w-10 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: shiftType.color }}
                            >
                              {shiftType.code}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-300">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </CardContent>
        </Card>
      </div>
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
    </div>
  );
};

export default EmployeeDashboard;
