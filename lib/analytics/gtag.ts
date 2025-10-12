export const GA_TRACKING_ID: string | null =
  process.env.NEXT_PUBLIC_GOOGLE_ID ?? null;

const getGtag = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.gtag;
};

export const pageview = (url: string) => {
  const gtag = getGtag();
  if (!GA_TRACKING_ID || !gtag) {
    return;
  }

  gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

type EventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export const event = ({ action, category, label, value }: EventParams) => {
  const gtag = getGtag();
  if (!GA_TRACKING_ID || !gtag) {
    return;
  }

  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
