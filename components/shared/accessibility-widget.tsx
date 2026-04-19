"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AccessibilityWidgetProps {
  // UserWay account ID - get this from your UserWay dashboard
  accountId?: string;
}

export function AccessibilityWidget({ accountId }: AccessibilityWidgetProps) {
  const userWayAccountId = accountId || process.env.NEXT_PUBLIC_USERWAY_ACCOUNT_ID;

  useEffect(() => {
    if (!userWayAccountId && process.env.NODE_ENV === "development") {
      console.warn(
        "UserWay account ID not configured. Set NEXT_PUBLIC_USERWAY_ACCOUNT_ID in your environment variables."
      );
    }
  }, [userWayAccountId]);

  if (!userWayAccountId) {
    return null;
  }

  return (
    <Script
      id="userway-widget"
      strategy="lazyOnload"
      src="https://cdn.userway.org/widget.js"
      data-account={userWayAccountId}
    />
  );
}
