
import React, { createContext, useContext, useState } from "react";
import { 
  Employee, Shift, ShiftType,
  addShift, updateShift, updateShiftType, deleteShiftType,
  getAllEmployees, getAllShiftTypes, getShiftsByMonth
} from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";

interface ScheduleContextType {
  employees: Employee[];
  shiftTypes: ShiftType[];
  shifts: Shift[];
  selectedYear: number;
  selectedMonth: number;
  selectedEmployee: string | null;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedEmployee: (employeeId: string | null) => void;
  loadShifts: (userId?: string) => void;
  updateEmployeeShift: (userId: string, date: string, shiftTypeId: string) => void;
  saveShiftType: (shiftType: ShiftType) => void;
  removeShiftType: (shiftTypeId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(getAllEmployees());
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>(getAllShiftTypes());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const { toast } = useToast();

  const loadShifts = (userId?: string) => {
    const shiftsData = getShiftsByMonth(selectedYear, selectedMonth, userId || selectedEmployee || undefined);
    setShifts(shiftsData);
  };

  const updateEmployeeShift = (userId: string, date: string, shiftTypeId: string) => {
    try {
      const shiftId = `shift-${userId}-${date}`;
      const updatedShift = updateShift(shiftId, shiftTypeId);
      
      if (!updatedShift) {
        // Shift doesn't exist yet, create it
        addShift(userId, date, shiftTypeId);
      }
      
      // Reload shifts
      loadShifts();
      
      toast({
        title: "Escala atualizada",
        description: "A jornada foi atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a escala",
        variant: "destructive",
      });
    }
  };

  const saveShiftType = (shiftType: ShiftType) => {
    try {
      const updatedShiftType = updateShiftType(shiftType);
      setShiftTypes(getAllShiftTypes());
      
      toast({
        title: "Turno salvo",
        description: `O turno ${updatedShiftType.code} foi salvo com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o turno",
        variant: "destructive",
      });
    }
  };

  const removeShiftType = (shiftTypeId: string) => {
    try {
      const success = deleteShiftType(shiftTypeId);
      
      if (success) {
        setShiftTypes(getAllShiftTypes());
        
        toast({
          title: "Turno removido",
          description: "O turno foi removido com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível remover o turno",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover o turno",
        variant: "destructive",
      });
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        employees,
        shiftTypes,
        shifts,
        selectedYear,
        selectedMonth,
        selectedEmployee,
        setSelectedYear,
        setSelectedMonth,
        setSelectedEmployee,
        loadShifts,
        updateEmployeeShift,
        saveShiftType,
        removeShiftType,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  
  return context;
};
