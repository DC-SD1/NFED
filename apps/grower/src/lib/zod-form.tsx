import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormProps, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form"
import type { z } from "zod"

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema
  }
): UseFormReturn<TSchema["_input"]> {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  })

  return form
}