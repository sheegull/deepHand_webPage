import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestFormSchema } from "../../../../lib/schema";
import { API_ENDPOINTS, apiCall } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";

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
  const [showValidation, setShowValidation] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(requestFormSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setShowValidation(true);

    // Validate data types selection
    if (selectedDataTypes.length === 0) {
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        ...data,
        dataType: selectedDataTypes.includes("other") 
          ? [...selectedDataTypes.filter(t => t !== "other"), `other: ${otherDataType}`]
          : selectedDataTypes
      };

      const result = await apiCall(API_ENDPOINTS.requestData, formData);
      console.log('Data request form submitted successfully:', result);
      setSubmitStatus("success");
      reset();
      setSelectedDataTypes([]);
      setOtherDataType("");
    } catch (error) {
      console.error('Data request form submission failed:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form field data for mapping
  const formFields = [
    {
      id: "name",
      label: `${t('request.name')} *`,
      placeholder: t('request.placeholder.name'),
      required: true,
    },
    {
      id: "organization",
      label: t('request.organization'),
      placeholder: t('request.placeholder.organization'),
      required: false,
    },
    {
      id: "email",
      label: `${t('request.email')} *`,
      placeholder: t('request.placeholder.email'),
      required: true,
    },
  ];

  const [selectedDataTypes, setSelectedDataTypes] = React.useState<string[]>([]);
  const [otherDataType, setOtherDataType] = React.useState("");

  const dataTypeOptions = [
    { id: "text", label: t('request.dataTypeOptions.text') },
    { id: "image", label: t('request.dataTypeOptions.image') },
    { id: "video", label: t('request.dataTypeOptions.video') },
    { id: "audio", label: t('request.dataTypeOptions.audio') },
    { id: "other", label: t('request.dataTypeOptions.other') },
  ];

  const handleDataTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, typeId]);
    } else {
      setSelectedDataTypes(prev => prev.filter(id => id !== typeId));
      if (typeId === "other") {
        setOtherDataType("");
      }
    }
  };

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
          <CardContent className="flex flex-col gap-8 p-6 md:p-20">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
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
                    className={`h-12 bg-white font-light text-gray-900 placeholder:text-gray-400 text-sm ${
                      errors[field.id] && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors[field.id] && showValidation && (
                    <span className="text-red-500 text-sm">
                      {t(`validation.${errors[field.id]?.type}`, {
                        field: t(`request.${field.id}`),
                        max: field.id === 'name' ? 100 : undefined
                      })}
                    </span>
                  )}
                </div>
              ))}

              {/* Background and Purpose field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="backgroundPurpose"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.backgroundPurpose')} *
                </Label>
                <Textarea
                  id="backgroundPurpose"
                  {...register("backgroundPurpose")}
                  placeholder={t('request.placeholder.backgroundPurpose')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.backgroundPurpose && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.backgroundPurpose && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.backgroundPurpose') })}
                  </span>
                )}
              </div>

              {/* Data type checkboxes */}
              <div className="flex flex-col gap-2">
                <Label className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]">
                  {t('request.dataType')} *
                </Label>
                <div className="flex flex-col gap-3">
                  {dataTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedDataTypes.includes(option.id)}
                        onCheckedChange={(checked) => handleDataTypeChange(option.id, checked as boolean)}
                      />
                      <Label
                        htmlFor={option.id}
                        className="font-alliance font-normal text-gray-700 text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                  {selectedDataTypes.includes("other") && (
                    <Input
                      placeholder="具体的な内容をご記入ください / Please specify"
                      value={otherDataType}
                      onChange={(e) => setOtherDataType(e.target.value)}
                      className="ml-6 h-10 bg-white font-light text-gray-900 placeholder:text-gray-400 text-sm border-gray-200"
                    />
                  )}
                </div>
                {selectedDataTypes.length === 0 && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.dataType') })}
                  </span>
                )}
              </div>

              {/* Data details field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="dataDetails"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.dataDetails')}
                </Label>
                <Textarea
                  id="dataDetails"
                  {...register("dataDetails")}
                  placeholder={t('request.placeholder.dataDetails')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.dataDetails && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.dataDetails && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.maxLength', {
                      field: t('request.dataDetails'),
                      max: 1000
                    })}
                  </span>
                )}
              </div>

              {/* Data volume field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="dataVolume"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.dataVolume')} *
                </Label>
                <Textarea
                  id="dataVolume"
                  {...register("dataVolume")}
                  placeholder={t('request.placeholder.dataVolume')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.dataVolume && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.dataVolume && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.dataVolume') })}
                  </span>
                )}
              </div>

              {/* Deadline field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="deadline"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.deadline')} *
                </Label>
                <Textarea
                  id="deadline"
                  {...register("deadline")}
                  placeholder={t('request.placeholder.deadline')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.deadline && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.deadline && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.deadline') })}
                  </span>
                )}
              </div>

              {/* Budget field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="budget"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.budget')} *
                </Label>
                <Textarea
                  id="budget"
                  {...register("budget")}
                  placeholder={t('request.placeholder.budget')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.budget && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.budget && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.required', { field: t('request.budget') })}
                  </span>
                )}
              </div>

              {/* Other requirements field */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="otherRequirements"
                  className="font-alliance font-normal text-gray-700 text-sm leading-[16.8px]"
                >
                  {t('request.otherRequirements')}
                </Label>
                <Textarea
                  id="otherRequirements"
                  {...register("otherRequirements")}
                  placeholder={t('request.placeholder.otherRequirements')}
                  className={`h-[100px] bg-white font-alliance font-light text-gray-900 placeholder:text-gray-400 text-sm resize-none ${
                    errors.otherRequirements && showValidation ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.otherRequirements && showValidation && (
                  <span className="text-red-500 text-sm">
                    {t('validation.maxLength', {
                      field: t('request.otherRequirements'),
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
              className="h-12 font-alliance font-medium text-white text-base bg-[#234ad9] hover:bg-[#1e3eb8] active:bg-[#183099] transition-colors"
            >
              {isSubmitting ? t('request.submitting') : t('request.submit')}
            </Button>

            {/* Form status messages */}
            {submitStatus === "success" && (
              <div className="text-green-500 text-sm text-center mt-2">
                {t('request.success')}
              </div>
            )}
            {submitStatus === "error" && (
              <div className="text-red-500 text-sm text-center mt-2">
                {t('request.error')}
              </div>
            )}
            </form>
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