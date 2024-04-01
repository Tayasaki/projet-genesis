"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "../ui/auto-form";
import { buttonVariants } from "../ui/button";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  return (
    <AutoForm
      formSchema={userSchema}
      onSubmit={(values) => {
        setIsLoading(true);
        console.log(values);
        setIsLoading(false);
      }}
      className="-p-4 border-none"
      fieldConfig={{
        password: {
          inputProps: {
            type: "password",
          },
          renderParent: ({ children }) => (
            <div>
              {children}
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "ml-36 items-end",
                )}
              >
                Forgot your password?
              </Link>
            </div>
          ),
        },
      }}
    >
      <AutoFormSubmit isLoading={isLoading}>Login</AutoFormSubmit>
    </AutoForm>
  );
};
