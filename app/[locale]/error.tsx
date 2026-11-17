"use client";

import { ErrorPage } from "@/views/ErrorPage";

export default function Error({ error }: { error: Error; reset: () => void }) {
  return <ErrorPage error={error} />;
}
