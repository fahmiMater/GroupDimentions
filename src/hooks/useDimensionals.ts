import { useQuery, useMutation, useQueryClient } from 'react-query';
import { dimensionalService, ApiService } from '@/services/api';
import { Dimensional, DimensionalWithDetails } from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const DIMENSIONAL_KEYS = {
  all: ['dimensionals'] as const,
  withDetails: ['dimensionals', 'with-details'] as const,
  byGroup: (groupId: number) => ['dimensionals', 'group', groupId] as const,
  byGroupWithDetails: (groupId: number) => ['dimensionals', 'group', groupId, 'with-details'] as const,
  detail: (id: number) => ['dimensionals', id] as const,
  detailWithDetails: (id: number) => ['dimensionals', id, 'with-details'] as const,
};

// Get all dimensionals
export const useDimensionals = (filters?: {
  dimensional_group_id?: number;
  is_active?: boolean;
}) => {
  return useQuery(
    filters?.dimensional_group_id 
      ? DIMENSIONAL_KEYS.byGroup(filters.dimensional_group_id)
      : DIMENSIONAL_KEYS.all,
    () => dimensionalService.getAll({
      orderBy: 'dimensional_sort',
      ascending: true,
      filters
    }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensionals with details
export const useDimensionalsWithDetails = (groupId?: number) => {
  return useQuery(
    groupId 
      ? DIMENSIONAL_KEYS.byGroupWithDetails(groupId)
      : DIMENSIONAL_KEYS.withDetails,
    () => ApiService.getDimensionalsWithDetails(groupId),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensional by ID
export const useDimensional = (id: number | undefined) => {
  return useQuery(
    DIMENSIONAL_KEYS.detail(id!),
    () => dimensionalService.getById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensional follow data
export const useDimensionalFollowData = (dimensionalId: number | undefined) => {
  return useQuery(
    ['dimensional-follow-data', dimensionalId],
    () => ApiService.getDimensionalFollowData(dimensionalId!),
    {
      enabled: !!dimensionalId,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

// Create dimensional mutation
export const useCreateDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<Dimensional, 'dimensional_id'>) => 
      dimensionalService.create({
        ...data,
        created_by: 1 // This should come from auth context
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.withDetails);
        if (data.dimensional_group_id) {
          queryClient.invalidateQueries(DIMENSIONAL_KEYS.byGroup(data.dimensional_group_id));
          queryClient.invalidateQueries(DIMENSIONAL_KEYS.byGroupWithDetails(data.dimensional_group_id));
        }
        toast.success('تم إضافة البعد بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في إضافة البعد: ${error.message}`);
        throw error;
      },
    }
  );
};

// Update dimensional mutation
export const useUpdateDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<Dimensional> }) =>
      dimensionalService.update(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.withDetails);
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.detail(variables.id));
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.detailWithDetails(variables.id));
        if (data.dimensional_group_id) {
          queryClient.invalidateQueries(DIMENSIONAL_KEYS.byGroup(data.dimensional_group_id));
          queryClient.invalidateQueries(DIMENSIONAL_KEYS.byGroupWithDetails(data.dimensional_group_id));
        }
        toast.success('تم تحديث البعد بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في تحديث البعد: ${error.message}`);
        throw error;
      },
    }
  );
};

// Delete dimensional mutation
export const useDeleteDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => dimensionalService.delete(id),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_KEYS.withDetails);
        queryClient.removeQueries(DIMENSIONAL_KEYS.detail(id));
        queryClient.removeQueries(DIMENSIONAL_KEYS.detailWithDetails(id));
        toast.success('تم حذف البعد بنجاح');
      },
      onError: (error: any) => {
        toast.error(`خطأ في حذف البعد: ${error.message}`);
        throw error;
      },
    }
  );
};