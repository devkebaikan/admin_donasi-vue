import type { MenuItemType } from "@/types/menu";

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: "menu",
    label: "MENU",
    isTitle: true,
  },
  {
    key: "dashboard",
    icon: "solar:home-2-broken",
    label: "Dashboard",
    badge: {
      text: "9+",
      variant: "success",
    },
    route: { name: "dashboards.index" },
  },
  {
    key: "admin",
    label: "Admin",
    isTitle: true,
  },

  {
    key: "transactions",
    icon: "mdi:bank-outline",
    label: "Transactions",
    route: { name: "transaction.list" },
  },

  {
    key: "finance",
    label: "Finance",
    isTitle: true,
  },

  {
    key: "finance-account",
    icon: "material-symbols:finance",
    label: "Finance Account",
    route: { name: "finance-account.list" },
  },
  {
    key: "finance-account-master",
    icon: "material-symbols:finance",
    label: "Finance Account Master",
    route: { name: "finance-account-master.list" },
  },
  {
    key: "finance-journal",
    icon: "material-symbols:finance",
    label: "Finance Journal",
    route: { name: "finance-journal.list" },
  },

  {
    key: "rbac",
    label: "RBAC",
    isTitle: true,
  },
  {
    key: "rbac-role",
    icon: "carbon:user-role",
    label: "Role",
    route: { name: "role.list" },
  },
  {
    key: "rbac-menu",
    icon: "carbon:user-role",
    label: "Menu",
    route: { name: "menu.list" },
  },
  {
    key: "rbac-permission",
    icon: "carbon:user-role",
    label: "Permissions",
    route: { name: "permission.list" },
  },
  {
    key: "rbac-user",
    icon: "carbon:user-role",
    label: "Users",
    route: { name: "user.list" },
  },
  {
    key: "rbac-user-donatur",
    icon: "carbon:user-role",
    label: "Donatur",
    route: { name: "user.donatur" },
  },

  {
    key: "data",
    label: "Data",
    isTitle: true,
  },
  {
    key: "programs",
    icon: "tdesign:task-filled",
    label: "Programs",
    children: [
      {
        key: "program-list",
        label: "List",
        route: { name: "programs.list" },
        parentKey: "programs",
      },
      // {
      //   key: "program-project",
      //   label: "Projects",
      //   route: { name: "project.list" },
      //   parentKey: "programs",
      // },
      {
        key: "program-category",
        label: "Categories",
        route: { name: "category.list" },
        parentKey: "category",
      },
      {
        key: "program-type",
        label: "Type",
        route: { name: "program-type.list" },
        parentKey: "type",
      },
      {
        key: "program-percentage",
        label: "Percentage",
        route: { name: "percentage.list" },
        parentKey: "percentage",
      },
      {
        key: "program-default-nominale",
        label: "Set up Nominal",
        route: { name: "nominal.list" },
        parentKey: "default-nominal ",
      },
    ],
  },

  {
    key: "projects",
    icon: "eos-icons:project-outlined",
    label: "Projects",
    children: [
      {
        key: "project-list",
        label: "List",
        route: { name: "project.list" },
        parentKey: "projects",
      },
      {
        key: "project-kegiatan",
        label: "Kegiatan",
        route: { name: "kegiatan.list" },
        parentKey: "projects",
      },
      {
        key: "project-keuangan",
        label: "keuangan",
        route: { name: "keuangan.list" },
        parentKey: "projects",
      },
      {
        key: "project-ajuan",
        label: "Ajuan",
        route: { name: "ajuan.list" },
        parentKey: "projects",
      },
      {
        key: "project-report",
        label: "Reports ",
        route: { name: "project-report.list" },
        parentKey: "projects",
      },
    ],
  },
  {
    key: "data-mitra",
    icon: "ooui:user-contributions-ltr",
    label: "Mitra",
    route: { name: "mitra.list" },
  },

  {
    key: "blogs",
    icon: "tdesign:task-filled",
    label: "Blogs",
    children: [
      {
        key: "blog-list",
        label: "List",
        route: { name: "blogs.list" },
        parentKey: "blogs",
      },
    ],
  },

  {
    key: "events",
    icon: "tdesign:task-filled",
    label: "Events",
    children: [
      {
        key: "event-list",
        label: "List",
        route: { name: "event.list" },
        parentKey: "events",
      },
      {
        key: "event-attribute",
        label: "Attribute",
        route: { name: "event-attribute.list" },
        parentKey: "events",
      },
      // {
      //   key: "event-types",
      //   label: "Types",
      //   route: { name: "event-type.list" },
      //   parentKey: "events",
      // },
    ],
  },

  {
    key: "setting",
    label: "Settings",
    isTitle: true,
  },
  {
    key: "setting-image",
    icon: "ic:baseline-image",
    label: "Image",
    route: { name: "image.list" },
  },
  {
    key: "setting-banner",
    icon: "ic:baseline-image",
    label: "Banner",
    route: { name: "banner.list" },
  },
  {
    key: "setting-ads",
    icon: "cib:google-ads",
    label: "Ads Script",
    route: { name: "ads-script.list" },
  },
  {
    key: "setting-bank",
    icon: "mdi:bank",
    label: "Bank References",
    route: { name: "bank-reference.list" },
  },
  {
    key: "setting-payment-method",
    icon: "mdi:bank",
    label: "Payment Methods",
    route: { name: "payment-method.list" },
  },
  {
    key: "setting-lead",
    icon: "material-symbols:leaderboard-rounded",
    label: "Leads",
    route: { name: "leads.list" },
  },
  {
    key: "setting-program-show",
    icon: "tdesign:task-filled",
    label: "Program Show",
    route: { name: "program-show.list" },
  },

  {
    key: "setting-setting",
    icon: "uil:setting",
    label: "Settings",
    route: { name: "setting.list" },
  },
];
