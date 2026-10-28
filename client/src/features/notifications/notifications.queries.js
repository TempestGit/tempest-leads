
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationRequest,
} from "./notifications.api.js";

export const notificationQueryKeys = {
  all: ["notifications"],
  lists: () => ["notifications", "list"],
  list: (params) => ["notifications", "list", params],
  unreadCount: () => ["notifications", "unread-count"],
};

export const useNotificationsQuery = ({
  filter = "all",
  unreadOnly = false,
  page = 1,
  limit = 20,
  enabled = true,
} = {}) => {
  const effectiveFilter = unreadOnly ? "unread" : filter;

  return useQuery({
    queryKey: notificationQueryKeys.list({
      filter: effectiveFilter,
      page,
      limit,
    }),
    queryFn: ({ signal }) =>
      getNotifications({
        filter: effectiveFilter,
        page,
        limit,
        signal,
      }),
    enabled,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useUnreadNotificationCountQuery = ({
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: ({ signal }) =>
      getUnreadNotificationCount({ signal }),
    enabled,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

const useNotificationMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
};

export const useMarkNotificationReadMutation = () =>
  useNotificationMutation((notificationId) =>
    markNotificationAsRead({ notificationId })
  );

export const useMarkAllNotificationsReadMutation = () =>
  useNotificationMutation(() => markAllNotificationsAsRead());

export const useDeleteNotificationMutation = () =>
  useNotificationMutation((notificationId) =>
    deleteNotificationRequest(notificationId)
  );