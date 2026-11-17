// `t` — useTranslations("Errors") nəticəsidir; server mesajı varsa o göstərilir
export const getErrorMessage = (error, t) => {
  if (error?.response?.status === 429) return t("tooManyAttempts");
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") return t("network");

  return t("generic");
};
