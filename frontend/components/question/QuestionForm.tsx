"use client";

import {
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

import { useForm } from "react-hook-form";

interface Props {
  courses: any[];

  onSubmit: (data: any) => void;
}

export default function QuestionForm({
  courses,
  onSubmit,
}: Props) {
  const { register, handleSubmit } =
    useForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <TextField
        label="متن سوال"
        fullWidth
        multiline
        rows={4}
        {...register("question_text")}
      />

      <TextField
        select
        label="نوع سوال"
        fullWidth
        {...register("question_type")}
      >
        <MenuItem value="mcq">
          چهار گزینه‌ای
        </MenuItem>

        <MenuItem value="descriptive">
          تشریحی
        </MenuItem>
      </TextField>

      <TextField
        select
        label="سختی"
        fullWidth
        {...register("difficulty")}
      >
        <MenuItem value="easy">
          آسان
        </MenuItem>

        <MenuItem value="medium">
          متوسط
        </MenuItem>

        <MenuItem value="hard">
          سخت
        </MenuItem>
      </TextField>

      <TextField
        select
        label="درس"
        fullWidth
        {...register("course_id")}
      >
        {courses.map((course) => (
          <MenuItem
            key={course.id}
            value={course.id}
          >
            {course.title}
          </MenuItem>
        ))}
      </TextField>

      <Button
        type="submit"
        variant="contained"
        fullWidth
      >
        ثبت سوال
      </Button>
    </form>
  );
}