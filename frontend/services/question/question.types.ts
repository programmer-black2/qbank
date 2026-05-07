export interface Question {
  id: number;

  question_text: string;

  question_type: "mcq" | "descriptive";

  difficulty: "easy" | "medium" | "hard";

  created_at: string;

  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;

  correct_option?: string;

  suggested_time?: number;

  course?: {
    id: number;
    title: string;
  };
}

export interface Category {
  id: number;
  title: string;
}