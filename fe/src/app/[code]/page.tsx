"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
  const fetchRedirect = async () => {
    if (!code) return;

    try {
      const res = await axios.get(`http://localhost:8000/redirect/${code}`);
      if (res.status === 200 && res.data.url) {
        window.location.href = res.data.url;
      } else {
        router.replace("/not-found");
      }
    } catch (err) {
      console.error("Redirect error:", err);
      router.replace("/not-found");
    }
  };

  fetchRedirect();
}, [code]);

  return <p>Loading...</p>;
}
