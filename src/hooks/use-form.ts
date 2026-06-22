import { useForm as useReactHookForm, type UseFormProps, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodError, ZodType } from "zod";

export interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, "resolver"> {
  schema: ZodType<T>;
}

export interface UseFormResult<T extends FieldValues> extends UseFormReturn<T> {
  getFieldError: (name: keyof T) => string | undefined;
}

export function useForm<T extends FieldValues>({ schema, ...options }: UseFormOptions<T>): UseFormResult<T> {
  const form = useReactHookForm<T>({
    ...options,
    resolver: zodResolver(schema as any) as any,
  });

  const getFieldError = (name: keyof T): string | undefined => {
    const error = form.formState.errors[name];
    if (!error) return undefined;
    return error.message as string;
  };

  return { ...form, getFieldError };
}

export function getZodErrorMessages(error: ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!messages[path]) {
      messages[path] = issue.message;
    }
  }
  return messages;
}
