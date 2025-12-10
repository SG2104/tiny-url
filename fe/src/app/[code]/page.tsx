"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { urlService } from "../../lib/api";

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    const fetchRedirect = async () => {
      if (!code) return;

      try {
        const result = await urlService.getRedirectUrl(code);
        if (result.url) {
          window.location.href = result.url;
        } else {
          router.replace("/not-found");
        }
      } catch (err) {
        console.error("Redirect error:", err);
        router.replace("/not-found");
      }
    };

    fetchRedirect();
  }, [code, router]);

  return <p>Loading...</p>;
}
