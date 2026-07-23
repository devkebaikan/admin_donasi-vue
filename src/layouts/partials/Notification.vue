<template>
  <DropDown class="topbar-item">
    <button
      type="button"
      class="topbar-button position-relative"
      id="page-header-notifications-dropdown"
      data-bs-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
      @click="handleBellClick"
    >
      <Icon icon="solar:bell-bing-broken" class="fs-24 align-middle" />
      <span
        v-if="unreadCount > 0"
        class="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill"
        >{{ unreadCount > 99 ? "99+" : unreadCount
        }}<span class="visually-hidden">notifikasi belum dibaca</span></span
      >
    </button>
    <div
      class="dropdown-menu py-0 dropdown-lg dropdown-menu-end"
      aria-labelledby="page-header-notifications-dropdown"
    >
      <div
        class="p-3 border-top-0 border-start-0 border-end-0 border-dashed border"
      >
        <b-row class="align-items-center">
          <div class="col">
            <h6 class="m-0 fs-16 fw-semibold">Notifikasi</h6>
          </div>
          <div class="col-auto">
            <a
              href="javascript: void(0);"
              class="text-dark text-decoration-underline"
              :class="{ disabled: isReadAllPending || unreadCount === 0 }"
              @click="handleReadAll"
            >
              <small>Tandai Semua Dibaca</small>
            </a>
          </div>
        </b-row>
      </div>
      <simplebar data-simplebar style="max-height: 280px">
        <div v-if="isLoading" class="text-center p-4">
          <b-spinner small />
          <p class="mt-2 mb-0 text-muted small">Memuat...</p>
        </div>
        <div v-else-if="notifications.length === 0" class="text-center p-4">
          <p class="mb-0 text-muted small">Tidak ada notifikasi</p>
        </div>
        <a
          v-for="item in notifications"
          v-else
          :key="item.id"
          href="javascript:void(0);"
          class="dropdown-item py-3 border-bottom text-wrap"
          :class="{ 'bg-light': !item.read_at }"
          @click="openDetail(item)"
        >
          <div class="d-flex">
            <div class="flex-shrink-0">
              <div class="avatar-sm me-2">
                <span
                  class="avatar-title fs-20 rounded-circle"
                  :class="
                    item.read_at
                      ? 'bg-soft-secondary text-secondary'
                      : 'bg-soft-warning text-warning'
                  "
                >
                  <Icon icon="solar:bell-bing-broken" />
                </span>
              </div>
            </div>

            <div class="flex-grow-1">
              <p
                v-if="item.parsed_data?.title"
                class="mb-0 fw-semibold text-wrap"
              >
                {{ item.parsed_data.title }}
              </p>

              <p v-if="item.parsed_data?.body" class="mb-0 text-wrap">
                {{ item.parsed_data.body }}
              </p>

              <small class="text-muted">{{
                formatDateTime(item.created_at)
              }}</small>
            </div>
          </div>
        </a>
      </simplebar>
    </div>
  </DropDown>

  <!-- Detail Offcanvas -->
  <b-offcanvas
    v-model="showDetailOffcanvas"
    placement="end"
    :bodyScrolling="true"
    :backdrop="true"
    style="--bs-offcanvas-width: 680px"
    @hide="selectedId = ''"
  >
    <template #header="{ hide }">
      <div
        class="d-flex align-items-center justify-content-between w-100 gap-2"
      >
        <h5 class="mb-0 fw-semibold text-truncate">
          <i class="bx bx-bell me-1 text-primary"></i>Detail Notifikasi
        </h5>
        <b-button size="sm" variant="outline-secondary" @click="hide">
          <i class="bx bx-x fs-18"></i>
        </b-button>
      </div>
    </template>

    <div v-if="isDetailLoading" class="text-center py-5">
      <b-spinner />
      <p class="mt-2 text-muted">Memuat...</p>
    </div>
    <div v-else-if="!notificationDetail" class="alert alert-danger m-0">
      Gagal memuat detail.
    </div>
    <div v-else class="pb-4">
      <h5 class="fw-bold mb-2">{{ notificationDetail.parsed_data?.title }}</h5>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span
          class="badge"
          :class="notificationDetail.read_at ? 'bg-secondary' : 'bg-warning'"
          >{{
            notificationDetail.read_at ? "Sudah dibaca" : "Belum dibaca"
          }}</span
        >
      </div>

      <template v-if="notificationDetail.parsed_data?.extra?.url">
        <b-button
          variant="primary"
          size="sm"
          class="mb-3"
          @click="goToRelatedPage(notificationDetail.parsed_data.extra.url)"
        >
          <i class="bx bx-link-external me-1"></i>Buka Halaman Terkait
        </b-button>
      </template>

      <hr class="my-3" />

      <p class="text-wrap">{{ notificationDetail.parsed_data?.body }}</p>

      <hr class="my-3" />
      <div class="d-flex gap-3">
        <div>
          <small class="text-muted d-block">Dibuat</small>
          <small class="fw-semibold">{{
            formatDateTime(notificationDetail.created_at)
          }}</small>
        </div>
        <div>
          <small class="text-muted d-block">Dibaca</small>
          <small class="fw-semibold">{{
            notificationDetail.read_at
              ? formatDateTime(notificationDetail.read_at)
              : "-"
          }}</small>
        </div>
      </div>
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import simplebar from "simplebar-vue";
import { Icon } from "@iconify/vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import {
  getNotifications,
  getNotificationById,
  getUnreadCount,
  readAllNotifications,
  readNotification,
} from "@/services/notificationService";
import type { NotificationItemType } from "@/layouts/partials/types";
import { formatDateTime } from "@/helpers/format";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const queryClient = useQueryClient();

// List notifikasi hanya di-fetch saat icon lonceng diklik
const isNotificationListEnabled = ref(false);

const {
  data: notificationData,
  isLoading,
  refetch: refetchNotifications,
} = useQuery({
  queryKey: ["notifications"],
  queryFn: () => getNotifications({ limit: 10 }),
  enabled: isNotificationListEnabled,
});

const notifications = computed<NotificationItemType[]>(
  () => notificationData.value?.data ?? [],
);

const handleBellClick = () => {
  if (isNotificationListEnabled.value) {
    refetchNotifications();
    return;
  }
  isNotificationListEnabled.value = true;
};

const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
  queryKey: ["notifications-unread-count"],
  queryFn: getUnreadCount,
});

const unreadCount = computed(() => unreadCountData.value ?? 0);

const invalidateNotifications = () => {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
};

const { mutate: mutateRead } = useMutation({
  mutationFn: (id: string) => readNotification(id),
  onSuccess: invalidateNotifications,
});

const { mutate: mutateReadAll, isPending: isReadAllPending } = useMutation({
  mutationFn: () => readAllNotifications(),
  onSuccess: () => {
    invalidateNotifications();
    toast("Semua notifikasi ditandai sudah dibaca", {
      type: "success",
      position: "top-center",
    });
  },
  onError: (err: any) => {
    toast(err?.response?.data?.message ?? "Gagal menandai notifikasi", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleReadAll = () => {
  if (isReadAllPending.value || unreadCount.value === 0) return;
  mutateReadAll();
};

// Detail offcanvas
const showDetailOffcanvas = ref(false);
const selectedId = ref("");

const { data: notificationDetail, isLoading: isDetailLoading } = useQuery({
  queryKey: computed(() => ["notification-detail", selectedId.value]),
  queryFn: () => getNotificationById(selectedId.value),
  enabled: computed(() => !!selectedId.value),
});

const openDetail = (item: NotificationItemType) => {
  selectedId.value = item.id;
  showDetailOffcanvas.value = true;
  if (!item.read_at) {
    mutateRead(item.id);
  }
};

const goToRelatedPage = (url: string) => {
  showDetailOffcanvas.value = false;
  router.push(url);
};

// SSE — live notification baru
const authStore = useAuthStore();
let notificationStream: EventSource | null = null;

const getAccessToken = () => {
  if (!authStore.user || typeof authStore.user !== "string") return null;
  try {
    const parsed = JSON.parse(authStore.user);
    return parsed?.token || parsed?.data?.access_token || null;
  } catch (error) {
    console.warn("Invalid auth data in storage", error);
    return null;
  }
};

const handleIncomingNotification = async (notification: NotificationItemType) => {
  queryClient.setQueryData(["notifications"], (old: any) => {
    if (!old) return old;
    return {
      ...old,
      data: [
        notification,
        ...old.data.filter(
          (n: NotificationItemType) => n.id !== notification.id,
        ),
      ],
    };
  });

  const previousUnreadCount = unreadCount.value;
  const { data: freshUnreadCount } = await refetchUnreadCount();

  if ((freshUnreadCount ?? 0) <= previousUnreadCount) return;

  toast(
    `${notification.parsed_data?.title ?? "Notifikasi baru"}${
      notification.parsed_data?.body ? `: ${notification.parsed_data.body}` : ""
    }`,
    {
      type: "info",
      position: "top-right",
      onClick: () => openDetail(notification),
    },
  );
};

const connectNotificationStream = () => {
  const token = getAccessToken();
  if (!token) return;

  notificationStream = new EventSource(
    `${API_BASE_URL}/sse/notifications?token=${encodeURIComponent(token)}`,
  );

  notificationStream.onmessage = (event) => {
    try {
      const notification: NotificationItemType = JSON.parse(event.data);
      handleIncomingNotification(notification);
    } catch (error) {
      console.error("Error parsing notification stream payload:", error);
    }
  };

  notificationStream.onerror = (error) => {
    console.error("Notification stream error:", error);
  };
};

onMounted(() => {
  connectNotificationStream();
});

onBeforeUnmount(() => {
  notificationStream?.close();
  notificationStream = null;
});
</script>
