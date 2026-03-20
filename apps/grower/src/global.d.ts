import type enMessages from "./config/dictionaries/en.json";

type Messages = typeof enMessages;

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}
