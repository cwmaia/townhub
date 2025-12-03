export const MOCK_AUTH_COOKIE_NAME = "mock_auth_user";

export type DemoUserRole = "SUPER_ADMIN" | "TOWN_ADMIN" | "BUSINESS_OWNER";

export type DemoUserOption = {
  userId: string;
  email: string;
  firstName: string;
  role: DemoUserRole;
  label: string;
  description: string;
  redirectPath: string;
};

export const DEMO_USER_OPTIONS: DemoUserOption[] = [
  {
    userId: "demo-super-admin",
    email: "super@townhub.demo",
    firstName: "Super",
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Sees everything across the platform.",
    redirectPath: "/admin",
  },
  {
    userId: "demo-town-admin",
    email: "town@townhub.demo",
    firstName: "Town",
    role: "TOWN_ADMIN",
    label: "Town Admin",
    description: "Scoped to Stykkishólmur/own town.",
    redirectPath: "/admin",
  },
  {
    userId: "demo-business-owner",
    email: "business@townhub.demo",
    firstName: "Business",
    role: "BUSINESS_OWNER",
    label: "Business Owner",
    description: "Manages a demo business and promotions.",
    redirectPath: "/admin/business",
  },
];
