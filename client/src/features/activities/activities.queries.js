import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createActivityRequest,
  getActivitiesRequest,
} from "./activities.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const activityKeys = {
  all: [
    "activities",
  ],

  lists: () => [
    ...activityKeys.all,
    "list",
  ],

  list: (params) => [
    ...activityKeys.lists(),
    params,
  ],
};

/*
|--------------------------------------------------------------------------
| Activities Query
|--------------------------------------------------------------------------
|
| Works in both places:
|
| /activities
|   → GET /api/activities
|
| /leads/:leadId
|   → GET /api/activities?leadId=2
|
*/

export const useActivitiesQuery = (
  params = {}
) => {
  return useQuery({
    queryKey:
      activityKeys.list(
        params
      ),

    queryFn: () =>
      getActivitiesRequest(
        params
      ),

    placeholderData:
      (previousData) =>
        previousData,
  });
};

/*
|--------------------------------------------------------------------------
| Create Activity
|--------------------------------------------------------------------------
*/

export const useCreateActivityMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createActivityRequest,

      onSuccess:
        async () => {
          /*
          |--------------------------------------------------------------------------
          | Refresh Activity Log
          |--------------------------------------------------------------------------
          */

          await queryClient.invalidateQueries({
            queryKey:
              activityKeys.all,
          });

          /*
          |--------------------------------------------------------------------------
          | Activity May Update Lead:
          |
          | - Last touch
          | - Next action
          | - Follow-up
          |--------------------------------------------------------------------------
          */

          await queryClient.invalidateQueries({
            queryKey: [
              "leads",
            ],
          });

          /*
          |--------------------------------------------------------------------------
          | Activity May Create A Follow-up
          |--------------------------------------------------------------------------
          */

          await queryClient.invalidateQueries({
            queryKey: [
              "followups",
            ],
          });
        },
    });
  };