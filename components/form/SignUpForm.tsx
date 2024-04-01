"use client";

import { useState } from "react";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";
import { DependencyType } from "../ui/auto-form/types";

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const signUpSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  });
  return (
    <AutoForm
      formSchema={signUpSchema}
      onSubmit={(values) => {
        setIsLoading(true);
        console.log(values);
        setIsLoading(false);
      }}
      fieldConfig={{
        password: {
          inputProps: {
            type: "password",
          },
        },
        passwordConfirmation: {
          inputProps: {
            type: "password",
          },
        },
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Créer votre compte</AutoFormSubmit>
    </AutoForm>
  );
};
