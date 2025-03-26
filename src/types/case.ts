export interface Case {
  id: string;
  caseType: string;
  registrationYear: number;
  registrationNum: number;
  title: string;
  courtName: string;
  userId: string | null;
  updatedAt?: Date;
  isCompleted: boolean;
  petitioners: Array<{ name: string }>;
  respondents: Array<{ name: string }>;
  hearings: Array<{ date: Date; nextDate: Date | null }>;
  user?: {
    name: string;
    id: string;
  } | null;
} 