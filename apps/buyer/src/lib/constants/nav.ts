import {
  IconBasket,
  IconHelp,
  IconHome,
  IconMessageChatbot,
  IconRoute,
  IconSettings,
  IconTools,
  IconWallet,
} from "@tabler/icons-react";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Home",
          url: "/home",
          icon: IconHome,
        },
        {
          title: "Plan",
          url: "/plan",
          icon: IconTools,
        },
        {
          title: "Sourcing",
          url: "/sourcing",
          icon: IconBasket,
        },
        {
          title: "Monitoring",
          url: "/monitoring",
          icon: IconRoute,
        },
        {
          title: "Payments",
          url: "/payments",
          icon: IconWallet,
        },
      ],
    },
    {
      title: "Utilities",
      items: [
        {
          title: "Help & Support",
          url: "/support",
          icon: IconHelp,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: IconSettings,
        },
        {
          title: "Chat bot",
          url: "/chat-bot",
          icon: IconMessageChatbot,
        },
      ],
    },
  ],
};
