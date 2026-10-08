import { z } from "zod";

export const contactFormSchema = z.object({
  companyId: z.string().min(1, "Company is required.").transform(Number),
  name: z.string().trim().min(2, "Contact name is required.").max(150, "Contact name is too long."),
  designation: z.string().trim().max(150, "Designation is too long.").optional(),
  phone: z.string().trim().refine(value => value === "" || /^[6-9]\d{9}$/.test(value), {
    message: "Enter a valid 10-digit mobile number.",
  }).optional(),
  email: z.string().trim().refine(value => value === "" || (value.length <= 190 && z.string().email().safeParse(value).success), {
    message: "Enter a valid email address.",
  }).optional(),
  isDecisionMaker: z.enum(["false", "true"]).transform(value => value === "true"),
});

export const defaultContactValues = {
  companyId: "", name: "", designation: "", phone: "", email: "", isDecisionMaker: "false",
};