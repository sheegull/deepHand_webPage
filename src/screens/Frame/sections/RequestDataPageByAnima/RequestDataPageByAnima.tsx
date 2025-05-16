import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestFormSchema } from "../../../../lib/schema";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";

interface RequestDataPageByAnimaProps {
  onLogoClick: () => void;
  onFooterClick: (element: string) => void;
}

export const RequestDataPageByAnima = ({
  onLogoClick,
  onFooterClick,
}: RequestDataPageByAnimaProps): JSX.Element => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(requestFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://deephand-forms.workers.dev/api/request-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form field data for mapping
  const formFields = [
    {
      id: "fullName",
      label: `${t('request.fullName')} *`,
      placeholder: t('request.placeholder.fullName'),
      required: true,
    },
    {
      id: "companyName",
      label: t('request.companyName'),
      placeholder: t('request.placeholder.companyName'),
      required: false,
    },
    {
      id: "workEmail",
      label: `${t('request.workEmail')} *`,
      placeholder: t('request.placeholder.workEmail'),
      required: true,
    },
    {
      id: "dataAmount",
      label: `${t('request.dataAmount')} *`,
      placeholder: t('request.placeholder.dataAmount'),
      required: true,
    },
    {
      id: "deadline",
      label: `${t('request.deadline')} *`,
      placeholder: t('request.placeholder.deadline'),
      required: true,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full bg-[#1e1e1e] min-h-screen">
      {/* Left side with logo */}
      <div className="hidden md:flex w-full md:w-1/2 h-full">
        <div className="flex items-center mt-12 ml-4 md:ml-14 cursor-pointer" onClick={onLogoClick}>
          <img className="w-[40px] h-[40px] object-cover" alt="Icon" src="/logo.png" />
          <div className="ml-1 font-alliance font-light text-white text-[32px] leading-[28.8px] whitespace-nowrap">
            DeepHand
          </div>
        </div>

        {/* Footer for desktop */}
        <footer className="hidden md:flex flex-col absolute bottom-8 left-[92px] gap-4">
          <div className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]">
            © 2025 DeepHand. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <a
              onClick={() => onFooterClick('terms-of-service')}
              className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]"
            >
              {t('footer.termsOfService')}
            </a>
            <a
              onClick={() => onFooterClick('privacy-policy')}
              className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]"
            >
              {t('footer.privacyPolicy')}
            </a>
          </div>
        </footer>
      </div>

      {/* Mobile header */}
      <div
        className="flex justify-center items-center md:hidden mt-6 mb-6 cursor-pointer"
        onClick={onLogoClick}
      >
        <img className="w-[24px] h-[24px] object-cover" src="/logo.png" alt="Icon" />
        <div className="ml-0.5 font-alliance font-light text-white text-[24px] leading-[20px] whitespace-nowrap">
          DeepHand
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full md:w-1/2 bg-white flex-1">
        <Card className="border-0 shadow-none h-full">
          <CardContent
            className="flex flex-col gap-8 p-6 md:p-20"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="font-alliance font-semibold text-gray-900 text-xl md:text-2xl leading-[28.8px]">
                {t('request.title')}
              </h2>
              <p className="font-alliance font-normal text-gray-500 text-base leading-[19.2px]">
                {t('request.subtitle')}
              </p>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-6">
              {/* Map through standard input fields */}
              {formFields.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <Label
                    htmlFor={field.id}
                    className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    {...register(field.id)}
                    placeholder={field.placeholder}
                    aria-invalid={errors[field.id] ? "true" : "false"}
                    aria-describedby={`${field.id}-error`}
                    className={`h-12 bg-white border-gray-200 font-light text-gray-900 placeholder:text-gray-400 text-sm ${
                      errors[field.id] ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                  />
                  {errors[field.id] && (
                    <span id={`${field.id}-error`} role="alert" className="text-red-500 text-sm">
                      {t(`validation.${errors[field.id]?.type}`, {
                        field: t(`request.${field.id}`),
                        max: field.id === 'fullName' ? 100 : undefined
                      })}
                    </span>
                  )}
                </div>
              ))}

              {/* Data type field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="dataType"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.dataType')} *
                </Label>
                <Textarea
                  id="dataType"
                  {...register("dataType")}
                  aria-invalid={errors.dataType ? "true" : "false"}
                  aria-describedby="dataType-error"
                  placeholder={t('request.placeholder.dataType')}
                  className={`h-[100px] bg-white border-gray-200 font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.dataType ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.dataType && (
                  <span id="dataType-error" role="alert" className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.dataType') })}
                  </span>
                )}
              </div>

              {/* Additional details field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="additionalDetails"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.additionalDetails')}
                </Label>
                <Textarea
                  id="additionalDetails"
                  {...register("additionalDetails")}
                  aria-invalid={errors.additionalDetails ? "true" : "false"}
                  aria-describedby="additionalDetails-error"
                  placeholder={t('request.placeholder.additionalDetails')}
                  className={`h-[100px] bg-white border-gray-200 font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.additionalDetails ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.additionalDetails && (
                  <span id="additionalDetails-error" role="alert" className="text-red-500 text-sm">
                    {t('validation.maxLength', {
                      field: t('request.additionalDetails'),
                      max: 1000
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-12 font-alliance font-medium text-white text-base transition-colors
                ${isSubmitting ? "bg-[#234ad9]/70" : "bg-[#234ad9] hover:bg-[#1e3eb8] active:bg-[#183099]"}`}
            >
              {isSubmitting ? t('request.submitting') : t('request.submit')}
            </Button>

            {/* Form status messages */}
            {submitStatus === "success" && (
              <div role="alert" className="text-green-500 text-sm text-center mt-2">
                {t('request.success')}
              </div>
            )}
            {submitStatus === "error" && (
              <div role="alert" className="text-red-500 text-sm text-center mt-2">
                {t('request.error')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile footer */}
      <div className="md:hidden w-full bg-[#1e1e1e] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]">
            © 2025 DeepHand. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]"
            >
              {t('footer.termsOfService')}
            </a>
            <a
              href="#"
              className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]"
            >
              {t('footer.privacyPolicy')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};