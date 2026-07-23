const setTitle = (title: string) => {
  return title
    ? `${title} | Admin Beramalbersama.com`
    : "Dashboard Beramalbersama.com";
};

const authRoutes = [
  {
    path: "/auth/sign-in",
    name: "auth.sign-in",
    meta: {
      title: setTitle("Sign In"),
    },
    component: () => import("@/views/auth/sign-in.vue"),
  },
  {
    path: "/auth/sign-up",
    name: "auth.sign-up",
    meta: {
      title: setTitle("Sign Up"),
    },
    component: () => import("@/views/auth/sign-up.vue"),
  },
  {
    path: "/auth/reset-password",
    name: "auth.reset-password",
    meta: {
      title: setTitle("Reset Password"),
    },
    component: () => import("@/views/auth/reset-password.vue"),
  },
  {
    path: "/auth/lock-screen",
    name: "auth.lock-screen",
    meta: {
      title: setTitle("Lock Screen"),
    },
    component: () => import("@/views/auth/lock-screen.vue"),
  },
];

const errorRoutes = [
  {
    path: "/404",
    name: "error.404",
    meta: {
      title: setTitle("Error 404"),
    },
    component: () => import("@/views/pages/error-404.vue"),
  },
  {
    path: "/404-alt",
    name: "error.404-alt",
    meta: {
      title: setTitle("Error 404 Alt"),
    },
    component: () => import("@/views/pages/error-404-alt.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "404",
  },
];

const dashboardRoutes = [
  {
    path: "/",
    name: "dashboards.index",
    meta: {
      title: setTitle("Dashboard"),
      authRequired: true,
    },
    component: () => import("@/views/dashboards/index.vue"),
  },
];

// Program Routes
const programRoutes = [
  {
    path: "/programs",
    name: "programs.list",
    meta: {
      title: setTitle("Programs"),
      authRequired: true,
    },
    component: () => import("@/views/programs/listProgram.vue"),
  },
  {
    path: "/programs/create",
    name: "programs.create",
    meta: {
      title: setTitle("Create Program"),
      authRequired: true,
    },
    component: () => import("@/views/programs/createProgram.vue"),
  },
  {
    path: "/programs/:id/edit",
    name: "programs.edit",
    meta: {
      title: setTitle("Edit Program"),
      authRequired: true,
    },
    component: () => import("@/views/programs/editProgram.vue"),
  },
  {
    path: "/programs/:id/projects",
    name: "programs-projects.list",
    meta: {
      title: setTitle("Program Project"),
      authRequired: true,
      menuModule: "programs",
    },
    component: () =>
      import("@/views/programs/projectProgram/listProjectProgram.vue"),
  },
];

// Mitra Routes
const mitraRoutes = [
  {
    path: "/mitra",
    name: "mitra.list",
    meta: {
      title: setTitle("Mitra"),
      authRequired: true,
    },
    component: () => import("@/views/mitra/listMitra.vue"),
  },
  {
    path: "/mitra/create",
    name: "mitra.create",
    meta: {
      title: setTitle("CreateMitra"),
      authRequired: true,
    },
    component: () => import("@/views/mitra/createMitra.vue"),
  },
  {
    path: "/mitra/:id/edit",
    name: "mitra.edit",
    meta: {
      title: setTitle("Edit Mitra"),
      authRequired: true,
    },
    component: () => import("@/views/mitra/editMitra.vue"),
  },
];

// Category Routes
const categoryRoutes = [
  {
    path: "/category",
    name: "category.list",
    meta: {
      title: setTitle("Category"),
      authRequired: true,
    },
    component: () => import("@/views/programs/categories/listCategory.vue"),
  },
  {
    path: "/category/create",
    name: "category.create",
    meta: {
      title: setTitle("Create Category"),
      authRequired: true,
    },
    component: () => import("@/views/programs/categories/createCategory.vue"),
  },
  {
    path: "/category/:id/edit",
    name: "category.edit",
    meta: {
      title: setTitle("Edit Category"),
      authRequired: true,
    },
    component: () => import("@/views/programs/categories/editCategory.vue"),
  },
];

// Percentage Routes
const percentageRoutes = [
  {
    path: "/percentage",
    name: "percentage.list",
    meta: {
      title: setTitle("Percentage"),
      authRequired: true,
    },
    component: () => import("@/views/programs/percentage/listPercentage.vue"),
  },
  {
    path: "/percentage/create",
    name: "percentage.create",
    meta: {
      title: setTitle("Create Percentage"),
      authRequired: true,
    },
    component: () => import("@/views/programs/percentage/createPercentage.vue"),
  },
  {
    path: "/percentage/:id/edit",
    name: "percentage.edit",
    meta: {
      title: setTitle("Edit Percentage"),
      authRequired: true,
    },
    component: () => import("@/views/programs/percentage/editPercentage.vue"),
  },
];

// Default Nominal Routes
const defaultNominalRoutes = [
  {
    path: "/nominal",
    name: "nominal.list",
    meta: {
      title: setTitle("Default Nominal"),
      authRequired: true,
    },
    component: () =>
      import("@/views/programs/default-noninal/listDafaultNominal.vue"),
  },
  {
    path: "/nominal/create",
    name: "nominal.create",
    meta: {
      title: setTitle("Create Default Nominal"),
      authRequired: true,
    },
    component: () =>
      import("@/views/programs/default-noninal/createDafaultNominal.vue"),
  },
  {
    path: "/nominal/:id/edit",
    name: "nominal.edit",
    meta: {
      title: setTitle("Edit Default Nominal"),
      authRequired: true,
    },
    component: () =>
      import("@/views/programs/default-noninal/editDafaultNominal.vue"),
  },
];

// Program type routes
const programTypeRoutes = [
  {
    path: "/program-type",
    name: "program-type.list",
    meta: {
      title: setTitle("Program Type"),
      authRequired: true,
    },
    component: () => import("@/views/programs/type/listType.vue"),
  },
  {
    path: "/program-type/create",
    name: "program-type.create",
    meta: {
      title: setTitle("Create Program Type"),
      authRequired: true,
    },
    component: () => import("@/views/programs/type/createType.vue"),
  },
  {
    path: "/program-type/:id/edit",
    name: "program-type.edit",
    meta: {
      title: setTitle("Edit Program Type"),
      authRequired: true,
    },
    component: () => import("@/views/programs/type/edit.vue"),
  },
];

// Setting Image Routes
const settingImageRoutes = [
  {
    path: "/image",
    name: "image.list",
    meta: {
      title: setTitle("Image"),
      authRequired: true,
    },
    component: () => import("@/views/setting-image/listImage.vue"),
  },
  {
    path: "/image/create",
    name: "image.create",
    meta: {
      title: setTitle("Create Image"),
      authRequired: true,
    },
    component: () => import("@/views/setting-image/createImage.vue"),
  },
  {
    path: "/image/:id/edit",
    name: "image.edit",
    meta: {
      title: setTitle("Edit Image"),
      authRequired: true,
    },
    component: () => import("@/views/setting-image/editImage.vue"),
  },
];

// Bank Reference Routes
const bankReferenceRoutes = [
  {
    path: "/bank-reference",
    name: "bank-reference.list",
    meta: {
      title: setTitle("Bank Reference"),
      authRequired: true,
    },
    component: () => import("@/views/bank-reference/listBankReference.vue"),
  },
  {
    path: "/bank-reference/create",
    name: "bank-reference.create",
    meta: {
      title: setTitle("Create Bank Reference"),
      authRequired: true,
    },
    component: () => import("@/views/bank-reference/createBankReference.vue"),
  },
  {
    path: "/bank-reference/:id/edit",
    name: "bank-reference.edit",
    meta: {
      title: setTitle("Edit Bank Reference"),
      authRequired: true,
    },
    component: () => import("@/views/bank-reference/editBankReference.vue"),
  },
];

// Lead Routes
const LeadRoutes = [
  {
    path: "/leads",
    name: "leads.list",
    meta: {
      title: setTitle("Leads"),
      authRequired: true,
    },
    component: () => import("@/views/leads/listLead.vue"),
  },
  {
    path: "/leads/create",
    name: "leads.create",
    meta: {
      title: setTitle("Create Leads"),
    },
    authRequired: true,
    component: () => import("@/views/leads/createLead.vue"),
  },
  {
    path: "/leads/:id/edit",
    name: "leads.edit",
    meta: {
      title: setTitle("Edit Leads"),
      authRequired: true,
    },
    component: () => import("@/views/leads/editLead.vue"),
  },
];

// Blog Routes
const blogRoutes = [
  {
    path: "/blog",
    name: "blogs.list",
    meta: {
      title: setTitle("Blogs"),
      authRequired: true,
    },
    component: () => import("@/views/blogs/listBlog.vue"),
  },
  {
    path: "/blog/create",
    name: "blogs.create",
    meta: {
      title: setTitle("Create Blogs"),
      authRequired: true,
    },
    component: () => import("@/views/blogs/createBlog.vue"),
  },
  {
    path: "/blog/:id/edit",
    name: "blogs.edit",
    meta: {
      title: setTitle("Edit Blogs"),
      authRequired: true,
    },
    component: () => import("@/views/blogs/editBlog.vue"),
  },
];

// Blog Category Routes
const blogCategoryRoutes = [
  {
    path: "/blog-category",
    name: "blog-category.list",
    meta: {
      title: setTitle("Kategori Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-category/listBlogCategory.vue"),
  },
  {
    path: "/blog-category/create",
    name: "blog-category.create",
    meta: {
      title: setTitle("Buat Kategori Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-category/createBlogCategory.vue"),
  },
  {
    path: "/blog-category/:id/edit",
    name: "blog-category.edit",
    meta: {
      title: setTitle("Edit Kategori Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-category/editBlogCategory.vue"),
  },
];

// Blog Tag Routes
const blogTagRoutes = [
  {
    path: "/blog-tag",
    name: "blog-tag.list",
    meta: {
      title: setTitle("Tag Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-tags/listBlogTag.vue"),
  },
  {
    path: "/blog-tag/create",
    name: "blog-tag.create",
    meta: {
      title: setTitle("Buat Tag Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-tags/createBlogTag.vue"),
  },
  {
    path: "/blog-tag/:id/edit",
    name: "blog-tag.edit",
    meta: {
      title: setTitle("Edit Tag Blog"),
      authRequired: true,
    },
    component: () => import("@/views/blog-tags/editBlogTag.vue"),
  },
];

// Program Show Routes
const programShowRoutes = [
  {
    path: "/program-show",
    name: "program-show.list",
    meta: {
      title: setTitle("Program Show"),
      authRequired: true,
    },
    component: () => import("@/views/program-shows/listProgramShow.vue"),
  },
  {
    path: "/program-show/create",
    name: "program-show.create",
    meta: {
      title: setTitle("Create Program Show"),
      authRequired: true,
    },
    component: () => import("@/views/program-shows/createProgramShow.vue"),
  },
  {
    path: "/program-show/:id/edit",
    name: "program-show.edit",
    meta: {
      title: setTitle("Edit Program Show"),
      authRequired: true,
    },
    component: () => import("@/views/program-shows/editProgramShow.vue"),
  },
];

// Setting Routes
const settingRoutes = [
  {
    path: "/settings",
    name: "setting.list",
    meta: {
      title: setTitle("Setting"),
      authRequired: true,
    },
    component: () => import("@/views/settings/listSetting.vue"),
  },
];

// Role Routes
const roleRoutes = [
  {
    path: "/roles",
    name: "role.list",
    meta: {
      title: setTitle("Role"),
      authRequired: true,
    },
    component: () => import("@/views/roles/listRole.vue"),
  },
  {
    path: "/roles/create",
    name: "role.create",
    meta: {
      title: setTitle("Create Role"),
      authRequired: true,
    },
    component: () => import("@/views/roles/createRole.vue"),
  },
  {
    path: "/roles/:id/edit",
    name: "role.edit",
    meta: {
      title: setTitle("Edit Role"),
      authRequired: true,
    },
    component: () => import("@/views/roles/editRole.vue"),
  },
  {
    path: "/roles/:id/users",
    name: "role.users",
    meta: {
      title: setTitle("Users by Role"),
      authRequired: true,
    },
    component: () => import("@/views/roles/usersByRole.vue"),
  },
];

// Permissions Routes
const permissionRoutes = [
  {
    path: "/permissions",
    name: "permission.list",
    meta: {
      title: setTitle("Permission"),
      authRequired: true,
    },
    component: () => import("@/views/permissions/listPermissions.vue"),
  },
  {
    path: "/permissions/create",
    name: "permission.create",
    meta: {
      title: setTitle("Create Permission"),
      authRequired: true,
    },
    component: () => import("@/views/permissions/createPermissions.vue"),
  },
  {
    path: "/permissions/:id/edit",
    name: "permission.edit",
    meta: {
      title: setTitle("Edit Permission"),
      authRequired: true,
    },
    component: () => import("@/views/permissions/editPermissions.vue"),
  },
];

// Menu Routes
const menuRoutes = [
  {
    path: "/menus",
    name: "menu.list",
    meta: {
      title: setTitle("RBAC Menu"),
      authRequired: true,
    },
    component: () => import("@/views/menus/listMenu.vue"),
  },
  {
    path: "/menus/create",
    name: "menu.create",
    meta: {
      title: setTitle("Buat Menu"),
      authRequired: true,
    },
    component: () => import("@/views/menus/createMenu.vue"),
  },
  {
    path: "/menus/:id/edit",
    name: "menu.edit",
    meta: {
      title: setTitle("Edit Menu"),
      authRequired: true,
    },
    component: () => import("@/views/menus/editMenu.vue"),
  },
];

// User Routes
const userRoutes = [
  {
    path: "/users",
    name: "user.list",
    meta: {
      title: setTitle("User"),
      authRequired: true,
    },
    component: () => import("@/views/users/listUsers.vue"),
  },
  {
    path: "/users/create",
    name: "user.create",
    meta: {
      title: setTitle("Tambah User"),
      authRequired: true,
    },
    component: () => import("@/views/users/createUser.vue"),
  },
  {
    path: "/users/:id/edit",
    name: "user.edit",
    meta: {
      title: setTitle("Edit User"),
      authRequired: true,
    },
    component: () => import("@/views/users/editUser.vue"),
  },
  {
    path: "/users/donatur",
    name: "user.donatur",
    meta: {
      title: setTitle("User Donatur"),
      authRequired: true,
    },
    component: () => import("@/views/users/listDonatur.vue"),
  },
];

// Transaction Routes
const transactionRoutes = [
  {
    path: "/transactions",
    name: "transaction.list",
    meta: {
      title: setTitle("Transaksi"),
      authRequired: true,
    },
    component: () => import("@/views/transactions/listTransaction.vue"),
  },
  {
    path: "/transactions/create",
    name: "transaction.create",
    meta: {
      title: setTitle("Tambah Transaksi"),
      authRequired: true,
    },
    component: () => import("@/views/transactions/createTransaction.vue"),
  },
  {
    path: "/transactions/:id",
    name: "transaction.detail",
    meta: {
      title: setTitle("Detail Transaksi"),
      authRequired: true,
    },
    component: () => import("@/views/transactions/detailTransaction.vue"),
  },
  {
    path: "/transactions/:id/edit",
    name: "transaction.edit",
    meta: {
      title: setTitle("Edit Transaksi"),
      authRequired: true,
    },
    component: () => import("@/views/transactions/editTransaction.vue"),
  },
];

// Transaction Type Routes
const transactionTypeRoutes = [
  {
    path: "/transaction-type",
    name: "transaction-type.list",
    meta: {
      title: setTitle("Tipe Transaksi"),
      authRequired: true,
    },
    component: () =>
      import("@/views/transaction-types/listTransactionType.vue"),
  },
  {
    path: "/transaction-type/create",
    name: "transaction-type.create",
    meta: {
      title: setTitle("Buat Tipe Transaksi"),
      authRequired: true,
    },
    component: () =>
      import("@/views/transaction-types/createTransactionType.vue"),
  },
  {
    path: "/transaction-type/:id/edit",
    name: "transaction-type.edit",
    meta: {
      title: setTitle("Edit Tipe Transaksi"),
      authRequired: true,
    },
    component: () =>
      import("@/views/transaction-types/editTransactionType.vue"),
  },
];

// Project Routes
const projectRoutes = [
  {
    path: "/projects",
    name: "project.list",
    meta: {
      title: setTitle("Project"),
      authRequired: true,
    },
    component: () => import("@/views/projects/listProject.vue"),
  },
  {
    path: "/projects/create",
    name: "project.create",
    meta: {
      title: setTitle("Create Project"),
      authRequired: true,
    },
    component: () => import("@/views/projects/createProject.vue"),
  },
  {
    path: "/projects/:id/edit",
    name: "project.edit",
    meta: {
      title: setTitle("Edit Project"),
      authRequired: true,
    },
    component: () => import("@/views/projects/editProject.vue"),
  },
  {
    path: "/projects/funding/:id",
    name: "project-funding.index",
    meta: {
      title: setTitle("Project Funding"),
      authRequired: true,
      menuModule: "project",
    },
    component: () => import("@/views/project-funding/project-funding.vue"),
  },
];

// Banner Routes
const bannerRoutes = [
  {
    path: "/banners",
    name: "banner.list",
    meta: {
      title: setTitle("Banner"),
      authRequired: true,
    },
    component: () => import("@/views/setting-banner/listBanner.vue"),
  },
  {
    path: "/banners/create",
    name: "banner.create",
    meta: {
      title: setTitle("Create Banner"),
      authRequired: true,
    },
    component: () => import("@/views/setting-banner/createBanner.vue"),
  },
  {
    path: "/banners/:id/edit",
    name: "banner.edit",
    meta: {
      title: setTitle("Edit Banner"),
      authRequired: true,
    },
    component: () => import("@/views/setting-banner/editBanner.vue"),
  },
];

// Event Routes
const eventRoutes = [
  {
    path: "/events",
    name: "event.list",
    meta: {
      title: setTitle("Event"),
      authRequired: true,
    },
    component: () => import("@/views/event/listEvent.vue"),
  },
  {
    path: "/events/create",
    name: "event.create",
    meta: {
      title: setTitle("Create Event"),
      authRequired: true,
    },
    component: () => import("@/views/event/createEvent.vue"),
  },
  {
    path: "/events/:id/edit",
    name: "event.edit",
    meta: {
      title: setTitle("Edit Event"),
      authRequired: true,
    },
    component: () => import("@/views/event/editEvent.vue"),
  },
];

// Event Types Routes
const eventTypeRoutes = [
  {
    path: "/event-types",
    name: "event-type.list",
    meta: {
      title: setTitle("Event Types"),
      authRequired: true,
      menuModule: "event",
    },
    component: () => import("@/views/event/types/listEventTypes.vue"),
  },
  {
    path: "/event-types/create",
    name: "event-type.create",
    meta: {
      title: setTitle("Create Event Types"),
      authRequired: true,
      menuModule: "event",
    },
    component: () => import("@/views/event/types/createEventTypes.vue"),
  },
  {
    path: "/event-types/:id/edit",
    name: "event-type.edit",
    meta: {
      title: setTitle("Edit Event Types"),
      authRequired: true,
      menuModule: "event",
    },
    component: () => import("@/views/event/types/editEventTypes.vue"),
  },
];

// Event Attribute Routes
const eventAttributeRoutes = [
  {
    path: "/event-attribute",
    name: "event-attribute.list",
    meta: {
      title: setTitle("Event Attributes"),
      authRequired: true,
      menuModule: "event",
    },
    component: () => import("@/views/event/attributes/listEventAttribute.vue"),
  },
  {
    path: "/event-attribute/create",
    name: "event-attribute.create",
    meta: {
      title: setTitle("Create Event Attributes"),
      authRequired: true,
      menuModule: "event",
    },
    component: () =>
      import("@/views/event/attributes/createEventAttribute.vue"),
  },
  {
    path: "/event-attribute/:id/edit",
    name: "event-attribute.edit",
    meta: {
      title: setTitle("Edit Event Attributes"),
      authRequired: true,
      menuModule: "event",
    },
    component: () => import("@/views/event/attributes/editEventAttribute.vue"),
  },
];

// Finanace Account Routes
const financeAccountRoutes = [
  {
    path: "/finance-account",
    name: "finance-account.list",
    meta: {
      title: setTitle("Finance Account"),
      authRequired: true,
    },
    component: () => import("@/views/finance-account/listAccount.vue"),
  },
  {
    path: "/finance-account/create",
    name: "finance-account.create",
    meta: {
      title: setTitle("Create Finance Account"),
      authRequired: true,
    },
    component: () => import("@/views/finance-account/createAccount.vue"),
  },
  {
    path: "/finance-account/:id/edit",
    name: "finance-account.edit",
    meta: {
      title: setTitle("Edit Finance Account"),
      authRequired: true,
    },
    component: () => import("@/views/finance-account/editAccount.vue"),
  },
];

// Finance Account Master Routes
const financeAccountMasterRoutes = [
  {
    path: "/finance-account-master",
    name: "finance-account-master.list",
    meta: {
      title: setTitle("Finance Account Master"),
      authRequired: true,
    },
    component: () =>
      import("@/views/finance-account-master/listAccountMaster.vue"),
  },
  {
    path: "/finance-account-master/:id/edit",
    name: "finance-account-master.edit",
    meta: {
      title: setTitle("Edit Finance Account Master"),
      authRequired: true,
    },
    component: () =>
      import("@/views/finance-account-master/editAccountMaster.vue"),
  },
];

// Finance Journal Routes
const financeJournalRoutes = [
  {
    path: "/finance-journal",
    name: "finance-journal.list",
    meta: {
      title: setTitle("Finance Journal"),
      authRequired: true,
    },
    component: () => import("@/views/finanace-journal/listFinanceJournal.vue"),
  },
];

// Ads Script Routes
const adsScriptRoutes = [
  {
    path: "/ads-scripts",
    name: "ads-script.list",
    meta: {
      title: setTitle("Ads Scripts"),
      authRequired: true,
    },
    component: () => import("@/views/setting-ads-scripts/listAdsScript.vue"),
  },
  {
    path: "/ads-scripts/create",
    name: "ads-script.create",
    meta: {
      title: setTitle("Tambah Ads Script"),
      authRequired: true,
    },
    component: () => import("@/views/setting-ads-scripts/createAdsScript.vue"),
  },
  {
    path: "/ads-scripts/:id",
    name: "ads-script.detail",
    meta: {
      title: setTitle("Detail Ads Script"),
      authRequired: true,
    },
    component: () => import("@/views/setting-ads-scripts/detailAdsScript.vue"),
  },
  {
    path: "/ads-scripts/:id/edit",
    name: "ads-script.edit",
    meta: {
      title: setTitle("Edit Ads Script"),
      authRequired: true,
    },
    component: () => import("@/views/setting-ads-scripts/editAdsScript.vue"),
  },
];

// Kegiatan Routes
const kegiatanRoutes = [
  {
    path: "/kegiatan",
    name: "kegiatan.list",
    meta: {
      title: setTitle("Program Kegiatan"),
      authRequired: true,
    },
    component: () => import("@/views/program-kegiatan/listKegiatan.vue"),
  },
  {
    path: "/kegiatan/create",
    name: "kegiatan.create",
    meta: {
      title: setTitle("Create Program Kegiatan"),
      authRequired: true,
    },
    component: () => import("@/views/program-kegiatan/createKegiatan.vue"),
  },
  {
    path: "/kegiatan/:id/edit",
    name: "kegiatan.edit",
    meta: {
      title: setTitle("Edit Program Kegiatan"),
      authRequired: true,
    },
    component: () => import("@/views/program-kegiatan/editKegiatan.vue"),
  },
];

// Project Ajuan Routes
const projectAjuanRoutes = [
  {
    path: "/ajuan",
    name: "ajuan.list",
    meta: {
      title: setTitle("Project Ajuan"),
      authRequired: true,
    },
    component: () => import("@/views/project-ajuan/listAjuan.vue"),
  },
  {
    path: "/ajuan/create",
    name: "ajuan.create",
    meta: {
      title: setTitle("Create Project Ajuan"),
      authRequired: true,
    },
    component: () => import("@/views/project-ajuan/createAjuan.vue"),
  },
  {
    path: "/ajuan/:id/edit",
    name: "ajuan.edit",
    meta: {
      title: setTitle("Edit Project Ajuan"),
      authRequired: true,
    },
    component: () => import("@/views/project-ajuan/editAjuan.vue"),
  },
];

// Project Keuangan Routes
const projectKeuanganRoutes = [
  {
    path: "/keuangan",
    name: "keuangan.list",
    meta: {
      title: setTitle("Project Keuangan"),
      authRequired: true,
    },
    component: () => import("@/views/project-keuangan/listKeuangan.vue"),
  },
  {
    path: "/keuangan/create",
    name: "keuangan.create",
    meta: {
      title: setTitle("Create Project Keuangan"),
      authRequired: true,
    },
    component: () => import("@/views/project-keuangan/createKeuangan.vue"),
  },
  {
    path: "/keuangan/:id/edit",
    name: "keuangan.edit",
    meta: {
      title: setTitle("Edit Project Keuangan"),
      authRequired: true,
    },
    component: () => import("@/views/project-keuangan/editKeuangan.vue"),
  },
];

// Payment Method Routes
const paymentMethodRoutes = [
  {
    path: "/payment-methods",
    name: "payment-method.list",
    meta: {
      title: setTitle("Payment Methods"),
      authRequired: true,
    },
    component: () => import("@/views/payment-methods/listPaymentMethod.vue"),
  },
  {
    path: "/payment-methods/create",
    name: "payment-method.create",
    meta: {
      title: setTitle("Create Payment Methods"),
      authRequired: true,
    },
    component: () => import("@/views/payment-methods/createPaymentMethod.vue"),
  },
  {
    path: "/payment-methods/:id/edit",
    name: "payment-method.edit",
    meta: {
      title: setTitle("Edit Payment Methods"),
      authRequired: true,
    },
    component: () => import("@/views/payment-methods/editPaymentMethod.vue"),
  },
];

// Project Report Routes
const projectReportRoutes = [
  {
    path: "/project-report",
    name: "project-report.list",
    meta: {
      title: setTitle("Project Report"),
      authRequired: true,
    },
    component: () => import("@/views/project-report/listReport.vue"),
  },
  {
    path: "/project-report/create",
    name: "project-report.create",
    meta: {
      title: setTitle("Create Project Report"),
      authRequired: true,
    },
    component: () => import("@/views/project-report/createReport.vue"),
  },
  {
    path: "/project-report/:id/edit",
    name: "project-report.edit",
    meta: {
      title: setTitle("Edit Project Report"),
      authRequired: true,
    },
    component: () => import("@/views/project-report/editReport.vue"),
  },
];

// ========================================================================== All Routes not use ==========================================================================
const pagesRoutes = [
  {
    path: "/pages/starter",
    name: "pages.welcome",
    meta: {
      title: setTitle("Welcome"),
      authRequired: true,
    },
    component: () => import("@/views/pages/welcome.vue"),
  },
  {
    path: "/pages/faqs",
    name: "pages.faqs",
    meta: {
      title: setTitle("FAQs"),
      authRequired: true,
    },
    component: () => import("@/views/pages/faqs.vue"),
  },
  {
    path: "/pages/coming-soon",
    name: "pages.coming-soon",
    meta: {
      title: setTitle("Coming Soon"),
      authRequired: true,
    },
    component: () => import("@/views/pages/coming-soon.vue"),
  },
  {
    path: "/pages/timeline",
    name: "pages.timeline",
    meta: {
      title: setTitle("Timeline"),
      authRequired: true,
    },
    component: () => import("@/views/pages/timeline.vue"),
  },
  {
    path: "/pages/pricing",
    name: "pages.pricing",
    meta: {
      title: setTitle("Pricing"),
      authRequired: true,
    },
    component: () => import("@/views/pages/pricing.vue"),
  },
  {
    path: "/pages/maintenance",
    name: "pages.maintenance",
    meta: {
      title: setTitle("Maintenance"),
      authRequired: true,
    },
    component: () => import("@/views/pages/maintenance.vue"),
  },
];

const appsRoutes = [
  {
    path: "/apps/chat",
    name: "apps.chat",
    meta: {
      title: setTitle("Chat"),
      authRequired: true,
    },
    component: () => import("@/views/apps/chat/index.vue"),
  },
  {
    path: "/apps/email",
    name: "apps.email",
    meta: {
      title: setTitle("Email"),
      authRequired: true,
    },
    component: () => import("@/views/apps/email/index.vue"),
  },
  {
    path: "/apps/todo",
    name: "apps.todo",
    meta: {
      title: setTitle("Todo"),
      authRequired: true,
    },
    component: () => import("@/views/apps/todo/index.vue"),
  },
  {
    path: "/apps/calendar/schedule",
    name: "apps.calendar.schedule",
    meta: {
      title: setTitle("Schedule"),
      authRequired: true,
    },
    component: () => import("@/views/apps/calendar/schedule/index.vue"),
  },
  {
    path: "/apps/calendar/integration",
    name: "apps.calendar.integration",
    meta: {
      title: setTitle("Integration"),
      authRequired: true,
    },
    component: () => import("@/views/apps/calendar/integration/index.vue"),
  },
  {
    path: "/apps/invoice",
    name: "apps.invoice.list",
    meta: {
      title: setTitle("Invoice List"),
      authRequired: true,
    },
    component: () => import("@/views/apps/invoices/index.vue"),
  },
  {
    path: "/apps/invoice/:id",
    name: "apps.invoice.details",
    params: { id: "1001" },
    meta: {
      title: setTitle("Invoice Details"),
      authRequired: true,
    },
    component: () => import("@/views/apps/invoices/[id]/index.vue"),
  },
  {
    path: "/widgets",
    name: "widgets",
    meta: {
      title: setTitle("Widgets"),
      authRequired: true,
    },
    component: () => import("@/views/widgets/index.vue"),
  },
];

const uiRoutes = [
  {
    path: "/ui/accordions",
    name: "ui.accordions",
    meta: {
      title: setTitle("Accordions"),
      authRequired: true,
    },
    component: () => import("@/views/ui/accordions.vue"),
  },
  {
    path: "/ui/alerts",
    name: "ui.alerts",
    meta: {
      title: setTitle("Alerts"),
      authRequired: true,
    },
    component: () => import("@/views/ui/alerts.vue"),
  },
  {
    path: "/ui/avatars",
    name: "ui.avatars",
    meta: {
      title: setTitle("Avatars"),
      authRequired: true,
    },
    component: () => import("@/views/ui/avatars.vue"),
  },
  {
    path: "/ui/badges",
    name: "ui.badges",
    meta: {
      title: setTitle("Badges"),
      authRequired: true,
    },
    component: () => import("@/views/ui/badges.vue"),
  },
  {
    path: "/ui/breadcrumb",
    name: "ui.breadcrumb",
    meta: {
      title: setTitle("Breadcrumb"),
      authRequired: true,
    },
    component: () => import("@/views/ui/breadcrumb.vue"),
  },
  {
    path: "/ui/buttons",
    name: "ui.buttons",
    meta: {
      title: setTitle("Buttons"),
      authRequired: true,
    },
    component: () => import("@/views/ui/buttons.vue"),
  },
  {
    path: "/ui/cards",
    name: "ui.cards",
    meta: {
      title: setTitle("Cards"),
      authRequired: true,
    },
    component: () => import("@/views/ui/cards.vue"),
  },
  {
    path: "/ui/carousel",
    name: "ui.carousel",
    meta: {
      title: setTitle("Carousel"),
      authRequired: true,
    },
    component: () => import("@/views/ui/carousel.vue"),
  },
  {
    path: "/ui/collapse",
    name: "ui.collapse",
    meta: {
      title: setTitle("Collapse"),
      authRequired: true,
    },
    component: () => import("@/views/ui/collapse.vue"),
  },
  {
    path: "/ui/dropdowns",
    name: "ui.dropdowns",
    meta: {
      title: setTitle("Dropdowns"),
      authRequired: true,
    },
    component: () => import("@/views/ui/dropdowns.vue"),
  },
  {
    path: "/ui/list-group",
    name: "ui.list-group",
    meta: {
      title: setTitle("ListGroup"),
      authRequired: true,
    },
    component: () => import("@/views/ui/listGroup.vue"),
  },
  {
    path: "/ui/modals",
    name: "ui.modals",
    meta: {
      title: setTitle("Modals"),
      authRequired: true,
    },
    component: () => import("@/views/ui/modals.vue"),
  },
  {
    path: "/ui/offcanvas",
    name: "ui.offcanvas",
    meta: {
      title: setTitle("Offcanvas"),
      authRequired: true,
    },
    component: () => import("@/views/ui/offcanvas.vue"),
  },
  {
    path: "/ui/pagination",
    name: "ui.pagination",
    meta: {
      title: setTitle("Pagination"),
      authRequired: true,
    },
    component: () => import("@/views/ui/pagination.vue"),
  },
  {
    path: "/ui/placeholders",
    name: "ui.placeholders",
    meta: {
      title: setTitle("Placeholders"),
      authRequired: true,
    },
    component: () => import("@/views/ui/placeholders.vue"),
  },
  {
    path: "/ui/popovers",
    name: "ui.popovers",
    meta: {
      title: setTitle("Popovers"),
      authRequired: true,
    },
    component: () => import("@/views/ui/popovers.vue"),
  },
  {
    path: "/ui/progress",
    name: "ui.progress",
    meta: {
      title: setTitle("Progress"),
      authRequired: true,
    },
    component: () => import("@/views/ui/progress.vue"),
  },
  {
    path: "/ui/scrollspy",
    name: "ui.scrollspy",
    meta: {
      title: setTitle("Scrollspy"),
      authRequired: true,
    },
    component: () => import("@/views/ui/scrollspy.vue"),
  },
  {
    path: "/ui/spinners",
    name: "ui.spinners",
    meta: {
      title: setTitle("Spinners"),
      authRequired: true,
    },
    component: () => import("@/views/ui/spinners.vue"),
  },
  {
    path: "/ui/tabs",
    name: "ui.tabs",
    meta: {
      title: setTitle("Tabs"),
      authRequired: true,
    },
    component: () => import("@/views/ui/tabs.vue"),
  },
  {
    path: "/ui/toasts",
    name: "ui.toasts",
    meta: {
      title: setTitle("Toasts"),
      authRequired: true,
    },
    component: () => import("@/views/ui/toasts.vue"),
  },
  {
    path: "/ui/tooltips",
    name: "ui.tooltips",
    meta: {
      title: setTitle("Tooltips"),
      authRequired: true,
    },
    component: () => import("@/views/ui/tooltips.vue"),
  },
];

const advancedUIRoutes = [
  {
    path: "/advanced/ratings",
    name: "advanced.ratings",
    meta: {
      title: setTitle("Ratings"),
      authRequired: true,
    },
    component: () => import("@/views/advanced/ratings/index.vue"),
  },
  {
    path: "/advanced/alert",
    name: "advanced.alert",
    meta: {
      title: setTitle("Sweet Alert"),
      authRequired: true,
    },
    component: () => import("@/views/advanced/alert/index.vue"),
  },
  {
    path: "/advanced/swiper",
    name: "advanced.swiper",
    meta: {
      title: setTitle("Swiper"),
      authRequired: true,
    },
    component: () => import("@/views/advanced/swiper/index.vue"),
  },
  {
    path: "/advanced/scrollbar",
    name: "advanced.scrollbar",
    meta: {
      title: setTitle("Scrollbar"),
      authRequired: true,
    },
    component: () => import("@/views/advanced/scrollbar/index.vue"),
  },
  {
    path: "/advanced/toastify",
    name: "advanced.toastify",
    meta: {
      title: setTitle("Toastify"),
      authRequired: true,
    },
    component: () => import("@/views/advanced/toastify/index.vue"),
  },
];

const chartsRoutes = [
  {
    path: "/charts/area",
    name: "charts.area",
    meta: {
      title: setTitle("Apex Area Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/area/index.vue"),
  },
  {
    path: "/charts/bar",
    name: "charts.bar",
    meta: {
      title: setTitle("Apex Bar Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/bar/index.vue"),
  },
  {
    path: "/charts/boxplot",
    name: "charts.boxplot",
    meta: {
      title: setTitle("Apex Boxplot Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/boxplot/index.vue"),
  },
  {
    path: "/charts/bubble",
    name: "charts.bubble",
    meta: {
      title: setTitle("Apex Bubble Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/bubble/index.vue"),
  },
  {
    path: "/charts/candlestick",
    name: "charts.candlestick",
    meta: {
      title: setTitle("Apex Candlestick Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/candlestick/index.vue"),
  },
  {
    path: "/charts/column",
    name: "charts.column",
    meta: {
      title: setTitle("Apex Column Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/column/index.vue"),
  },
  {
    path: "/charts/heatmap",
    name: "charts.heatmap",
    meta: {
      title: setTitle("Apex Heatmap Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/heatmap/index.vue"),
  },
  {
    path: "/charts/line",
    name: "charts.line",
    meta: {
      title: setTitle("Apex Line Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/line/index.vue"),
  },
  {
    path: "/charts/mixed",
    name: "charts.mixed",
    meta: {
      title: setTitle("Apex Mixed Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/mixed/index.vue"),
  },
  {
    path: "/charts/pie",
    name: "charts.pie",
    meta: {
      title: setTitle("Apex Pie Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/pie/index.vue"),
  },
  {
    path: "/charts/polar",
    name: "charts.polar",
    meta: {
      title: setTitle("Apex Polar Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/polar/index.vue"),
  },
  {
    path: "/charts/radar",
    name: "charts.radar",
    meta: {
      title: setTitle("Apex Radar Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/radar/index.vue"),
  },
  {
    path: "/charts/radial-bar",
    name: "charts.radial-bar",
    meta: {
      title: setTitle("Apex Radial Bar Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/radial-bar/index.vue"),
  },
  {
    path: "/charts/scatter",
    name: "charts.scatter",
    meta: {
      title: setTitle("Apex Scatter Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/scatter/index.vue"),
  },
  {
    path: "/charts/timeline",
    name: "charts.timeline",
    meta: {
      title: setTitle("Apex Timeline Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/timeline/index.vue"),
  },
  {
    path: "/charts/treemap",
    name: "charts.treemap",
    meta: {
      title: setTitle("Apex Treemap Chart"),
      authRequired: true,
    },
    component: () => import("@/views/charts/treemap/index.vue"),
  },
];

const formRoutes = [
  {
    path: "/forms/basic",
    name: "forms.basic",
    meta: {
      title: setTitle("Form Basic"),
      authRequired: true,
    },
    component: () => import("@/views/forms/basic.vue"),
  },
  {
    path: "/forms/checkbox",
    name: "forms.checkbox",
    meta: {
      title: setTitle("Form Checkbox"),
      authRequired: true,
    },
    component: () => import("@/views/forms/checkbox.vue"),
  },
  {
    path: "/forms/select",
    name: "forms.select",
    meta: {
      title: setTitle("Choice Select"),
      authRequired: true,
    },
    component: () => import("@/views/forms/select.vue"),
  },
  {
    path: "/forms/clipboard",
    name: "forms.clipboard",
    meta: {
      title: setTitle("Clipboard"),
      authRequired: true,
    },
    component: () => import("@/views/forms/clipboard.vue"),
  },
  {
    path: "/forms/flat-picker",
    name: "forms.flat-picker",
    meta: {
      title: setTitle("Flat Picker"),
      authRequired: true,
    },
    component: () => import("@/views/forms/flat-picker.vue"),
  },
  {
    path: "/forms/validation",
    name: "forms.validation",
    meta: {
      title: setTitle("Validation"),
      authRequired: true,
    },
    component: () => import("@/views/forms/validation/index.vue"),
  },
  {
    path: "/forms/wizard",
    name: "forms.wizard",
    meta: {
      title: setTitle("Wizard"),
      authRequired: true,
    },
    component: () => import("@/views/forms/wizard.vue"),
  },
  {
    path: "/forms/file-uploads",
    name: "forms.file-uploads",
    meta: {
      title: setTitle("File Uploads"),
      authRequired: true,
    },
    component: () => import("@/views/forms/file-uploads.vue"),
  },
  {
    path: "/forms/editors",
    name: "forms.editors",
    meta: {
      title: setTitle("Editors"),
      authRequired: true,
    },
    component: () => import("@/views/forms/editors.vue"),
  },
  {
    path: "/forms/input-mask",
    name: "forms.input-mask",
    meta: {
      title: setTitle("Input Mask"),
      authRequired: true,
    },
    component: () => import("@/views/forms/input-mask.vue"),
  },
  {
    path: "/forms/slider",
    name: "forms.slider",
    meta: {
      title: setTitle("Slider"),
      authRequired: true,
    },
    component: () => import("@/views/forms/slider.vue"),
  },
];

const tablesRoutes = [
  {
    path: "/tables/basic",
    name: "tables.basic",
    meta: {
      title: setTitle("Tables Basic"),
      authRequired: true,
    },
    component: () => import("@/views/tables/basic.vue"),
  },
  {
    path: "/tables/gridjs",
    name: "tables.gridjs",
    meta: {
      title: setTitle("Tables Grid Js"),
      authRequired: true,
    },
    component: () => import("@/views/tables/gridjs/index.vue"),
  },
];

const iconsRoutes = [
  {
    path: "/icons/boxicons",
    name: "icons.boxicons",
    meta: {
      title: setTitle("Boxicons Icons"),
      authRequired: true,
    },
    component: () => import("@/views/icons/boxicons.vue"),
  },
  {
    path: "/icons/solar",
    name: "icons.solar",
    meta: {
      title: setTitle("Solar Icons"),
      authRequired: true,
    },
    component: () => import("@/views/icons/solar.vue"),
  },
];

const mapsRoutes = [
  {
    path: "/maps/google",
    name: "maps.google",
    meta: {
      title: setTitle("Google Map"),
      authRequired: true,
    },
    component: () => import("@/views/maps/google.vue"),
  },
  {
    path: "/maps/vector",
    name: "maps.vector",
    meta: {
      title: setTitle("Vector Map"),
      authRequired: true,
    },
    component: () => import("@/views/maps/vector.vue"),
  },
];

export const allRoutes = [
  ...dashboardRoutes,
  ...pagesRoutes,
  ...errorRoutes,
  ...authRoutes,
  ...appsRoutes,
  ...uiRoutes,
  ...advancedUIRoutes,
  ...chartsRoutes,
  ...formRoutes,
  ...tablesRoutes,
  ...iconsRoutes,
  ...mapsRoutes,
  ...programRoutes,
  ...projectRoutes,
  ...mitraRoutes,
  ...categoryRoutes,
  ...percentageRoutes,
  ...defaultNominalRoutes,
  ...settingImageRoutes,
  ...bankReferenceRoutes,
  ...LeadRoutes,
  ...blogRoutes,
  ...blogCategoryRoutes,
  ...blogTagRoutes,
  ...programShowRoutes,
  ...settingRoutes,
  ...roleRoutes,
  ...permissionRoutes,
  ...transactionRoutes,
  ...bannerRoutes,
  ...eventRoutes,
  ...financeAccountRoutes,
  ...financeAccountMasterRoutes,
  ...financeJournalRoutes,
  ...eventTypeRoutes,
  ...eventAttributeRoutes,
  ...userRoutes,
  ...adsScriptRoutes,
  ...programTypeRoutes,
  ...kegiatanRoutes,
  ...projectAjuanRoutes,
  ...projectKeuanganRoutes,
  ...paymentMethodRoutes,
  ...projectReportRoutes,
  ...menuRoutes,
  ...transactionTypeRoutes,
];
