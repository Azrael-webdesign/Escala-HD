
import { Employee, Shift, ShiftType, User } from "@/types";

// Mock Shift Types
export const mockShiftTypes: ShiftType[] = [
  {
    id: "shift-1",
    code: "M",
    description: "Manhã",
    color: "#4dabf7",
    startTime: "08:00",
    endTime: "14:00"
  },
  {
    id: "shift-2",
    code: "T",
    description: "Tarde",
    color: "#fd7e14",
    startTime: "13:00",
    endTime: "19:00"
  },
  {
    id: "shift-3",
    code: "N",
    description: "Noite",
    color: "#9775fa",
    startTime: "17:00",
    endTime: "23:30"
  },
  {
    id: "shift-4",
    code: "U",
    description: "Turno Especial/Uniforme",
    color: "#1864ab",
    startTime: "17:10",
    endTime: "23:30"
  },
  {
    id: "shift-5",
    code: "Fd",
    description: "Feriado",
    color: "#fa5252"
  },
  {
    id: "shift-6",
    code: "DO",
    description: "Day Off",
    color: "#dee2e6"
  },
  {
    id: "shift-7",
    code: "DSR",
    description: "Descanso Semanal Remunerado",
    color: "#8ce99a"
  },
  {
    id: "shift-8",
    code: "Fe",
    description: "Férias",
    color: "#ffd43b"
  },
  {
    id: "shift-9",
    code: "Af",
    description: "Afastamento Médico",
    color: "#faa2c1"
  },
  {
    id: "shift-10",
    code: "Fo",
    description: "Folga Livre",
    color: "#2b8a3e"
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    position: "Gerente",
    department: "Administração"
  },
  {
    id: "user-2",
    name: "João Silva",
    email: "joao@example.com",
    role: "employee",
    position: "Analista",
    department: "TI"
  },
  {
    id: "user-3",
    name: "Maria Oliveira",
    email: "maria@example.com",
    role: "employee",
    position: "Designer",
    department: "UX/UI"
  },
  {
    id: "user-4",
    name: "Carlos Santos",
    email: "carlos@example.com",
    role: "employee",
    position: "Desenvolvedor",
    department: "TI"
  },
  {
    id: "user-5",
    name: "Ana Costa",
    email: "ana@example.com",
    role: "employee",
    position: "Analista",
    department: "RH"
  }
];

// Generate more mock employees for a total of ~40
export const mockEmployees: Employee[] = [
  ...mockUsers
    .filter(user => user.role === "employee")
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department || "",
      position: user.position || ""
    }))
];

// Add more employees to reach ~40
for (let i = mockEmployees.length + 1; i <= 40; i++) {
  const departments = ["TI", "RH", "Financeiro", "Marketing", "Vendas", "Suporte"];
  const positions = ["Analista", "Especialista", "Coordenador", "Assistente", "Técnico"];
  
  mockEmployees.push({
    id: `user-${i + 5}`,
    name: `Funcionário ${i}`,
    email: `funcionario${i}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)]
  });
}

// Generate mock shifts for all employees for current month
export const generateMockShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  mockEmployees.forEach(employee => {
    for (let day = 1; day <= daysInMonth; day++) {
      // Skip some days randomly
      if (Math.random() > 0.8) continue;
      
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip weekends - give rest days
      if (date.getDay() === 0 || date.getDay() === 6) {
        shifts.push({
          id: `shift-${employee.id}-${date.toISOString().split('T')[0]}`,
          userId: employee.id,
          date: date.toISOString().split('T')[0],
          shiftTypeId: date.getDay() === 0 ? "shift-7" : "shift-6" // DSR for Sunday, DO for Saturday
        });
        continue;
      }
      
      // Random shift type for weekdays
      const randomShiftTypeIndex = Math.floor(Math.random() * 4); // Just the actual shifts (M, T, N, U)
      
      shifts.push({
        id: `shift-${employee.id}-${date.toISOString().split('T')[0]}`,
        userId: employee.id,
        date: date.toISOString().split('T')[0],
        shiftTypeId: `shift-${randomShiftTypeIndex + 1}`
      });
    }
    
    // Add some special shifts like vacations, medical leave
    const specialShiftTypes = ["shift-8", "shift-9", "shift-10"];
    const randomSpecialShift = specialShiftTypes[Math.floor(Math.random() * specialShiftTypes.length)];
    
    // Random start day for special shift
    const randomStartDay = Math.floor(Math.random() * 20) + 1;
    const durationDays = randomSpecialShift === "shift-8" ? 5 : 2; // Vacation vs Medical leave duration
    
    for (let i = 0; i < durationDays; i++) {
      const date = new Date(currentYear, currentMonth, randomStartDay + i);
      if (date.getMonth() === currentMonth) {
        // Remove existing shift for this day
        const dateStr = date.toISOString().split('T')[0];
        const existingShiftIndex = shifts.findIndex(
          s => s.userId === employee.id && s.date === dateStr
        );
        
        if (existingShiftIndex >= 0) {
          shifts.splice(existingShiftIndex, 1);
        }
        
        // Add special shift
        shifts.push({
          id: `shift-${employee.id}-${dateStr}`,
          userId: employee.id,
          date: dateStr,
          shiftTypeId: randomSpecialShift
        });
      }
    }
  });
  
  return shifts;
};

export const mockShifts = generateMockShifts();

// Authentication
let currentUser: User | null = null;

export const login = (email: string, password: string): User | null => {
  // Simplified authentication - no actual password check for mock data
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  return null;
};

export const getShiftsByMonth = (year: number, month: number, userId?: string): Shift[] => {
  const filteredShifts = mockShifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    const isMonthMatch = shiftDate.getFullYear() === year && shiftDate.getMonth() === month;
    return userId ? (isMonthMatch && shift.userId === userId) : isMonthMatch;
  });
  
  return filteredShifts;
};

export const getShiftType = (shiftTypeId: string): ShiftType | undefined => {
  return mockShiftTypes.find(type => type.id === shiftTypeId);
};

export const getEmployee = (employeeId: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.id === employeeId);
};

export const getAllEmployees = (): Employee[] => {
  return [...mockEmployees];
};

export const getAllShiftTypes = (): ShiftType[] => {
  return [...mockShiftTypes];
};

// Function to update a shift
export const updateShift = (shiftId: string, shiftTypeId: string): Shift | null => {
  const shiftIndex = mockShifts.findIndex(s => s.id === shiftId);
  
  if (shiftIndex >= 0) {
    mockShifts[shiftIndex] = {
      ...mockShifts[shiftIndex],
      shiftTypeId
    };
    return mockShifts[shiftIndex];
  }
  
  return null;
};

// Function to add a new shift
export const addShift = (userId: string, date: string, shiftTypeId: string): Shift => {
  // Check if shift already exists for this user and date
  const existingShiftIndex = mockShifts.findIndex(
    s => s.userId === userId && s.date === date
  );
  
  if (existingShiftIndex >= 0) {
    // Update existing shift
    mockShifts[existingShiftIndex].shiftTypeId = shiftTypeId;
    return mockShifts[existingShiftIndex];
  } else {
    // Create new shift
    const newShift: Shift = {
      id: `shift-${userId}-${date}`,
      userId,
      date,
      shiftTypeId
    };
    
    mockShifts.push(newShift);
    return newShift;
  }
};

// Function to add/update a shift type
export const updateShiftType = (shiftType: ShiftType): ShiftType => {
  const index = mockShiftTypes.findIndex(st => st.id === shiftType.id);
  
  if (index >= 0) {
    mockShiftTypes[index] = shiftType;
    return mockShiftTypes[index];
  } else {
    const newShiftType = {
      ...shiftType,
      id: `shift-${mockShiftTypes.length + 1}`
    };
    mockShiftTypes.push(newShiftType);
    return newShiftType;
  }
};

// Function to delete a shift type
export const deleteShiftType = (shiftTypeId: string): boolean => {
  const index = mockShiftTypes.findIndex(st => st.id === shiftTypeId);
  
  if (index >= 0) {
    mockShiftTypes.splice(index, 1);
    return true;
  }
  
  return false;
};

// Function to export schedule data
export const exportScheduleData = (year: number, month: number): string => {
  // In a real app, this would generate a CSV or Excel file
  // Here we'll just return a JSON string
  const shifts = getShiftsByMonth(year, month);
  const data = shifts.map(shift => {
    const employee = getEmployee(shift.userId);
    const shiftType = getShiftType(shift.shiftTypeId);
    
    return {
      date: shift.date,
      employeeName: employee?.name || "",
      employeeId: employee?.id || "",
      shiftCode: shiftType?.code || "",
      shiftDescription: shiftType?.description || ""
    };
  });
  
  return JSON.stringify(data);
};
