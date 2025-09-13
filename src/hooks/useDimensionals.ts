import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService, dimensionalService } from '@/services/api';
import { Dimensional, DimensionalWithDetails } from '@/types';

// Query keys for better cache management
const DIMENSIONAL_KEYS = {
  all: ['dimensionals'] as const,
  lists: () => [...DIMENSIONAL_KEYS.all, 'list'] as const,
  list: (filters: any) => [...DIMENSIONAL_KEYS.lists(), { filters }] as const,
  details: () => [...DIMENSIONAL_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DIMENSIONAL_KEYS.details(), id] as const,
  withDetails: (groupId?: number) => [...DIMENSIONAL_KEYS.all, 'with-details', { groupId }] as const,
  byGroup: (groupId: number) => [...DIMENSIONAL_KEYS.all, 'by-group', groupId] as const,
  byParent: (parentId: number) => [...DIMENSIONAL_KEYS.all, 'by-parent', parentId] as const,
  followData: (dimensionalId: number) => 
    [...DIMENSIONAL_KEYS.all, 'follow-data', dimensionalId] as const,
  paginated: (page: number, pageSize: number, options?: any) => 
    [...DIMENSIONAL_KEYS.all, 'paginated', { page, pageSize, options }] as const,
  hierarchy: (groupId: number) => [...DIMENSIONAL_KEYS.all, 'hierarchy', groupId] as const,
};

// Get all dimensionals
export const useDimensionals = (options?: {
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.list(options),
    queryFn: () => dimensionalService.getAll(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional by ID
export const useDimensional = (id: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.detail(id),
    queryFn: () => dimensionalService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensionals with details
export const useDimensionalsWithDetails = (groupId?: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.withDetails(groupId),
    queryFn: () => ApiService.getDimensionalsWithDetails(groupId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensionals by group
export const useDimensionalsByGroup = (groupId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.byGroup(groupId),
    queryFn: () => dimensionalService.getAll({ 
      filters: { dimensional_group_id: groupId },
      orderBy: 'dimensional_sort'
    }),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get child dimensionals
export const useChildDimensionals = (parentId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.byParent(parentId),
    queryFn: () => dimensionalService.getAll({ 
      filters: { dimensional_father_id: parentId },
      orderBy: 'dimensional_sort'
    }),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional hierarchy (tree structure)
export const useDimensionalHierarchy = (groupId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.hierarchy(groupId),
    queryFn: async () => {
      const dimensionals = await dimensionalService.getAll({ 
        filters: { dimensional_group_id: groupId },
        orderBy: 'dimensional_sort'
      });
      
      // Build hierarchy tree
      const buildTree = (items: Dimensional[], parentId: number | null = null): Dimensional[] => {
        return items
          .filter(item => item.dimensional_father_id === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.dimensional_id)
          }));
      };
      
      return buildTree(dimensionals);
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get paginated dimensionals
export const useDimensionalsPaginated = (
  page: number = 1,
  pageSize: number = 10,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  }
) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.paginated(page, pageSize, options),
    queryFn: () => ApiService.getPaginatedData(dimensionalService, page, pageSize, options),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Count dimensionals
export const useDimensionalsCount = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: [...DIMENSIONAL_KEYS.all, 'count', { filters }],
    queryFn: () => dimensionalService.count(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create dimensional mutation
export const useCreateDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Dimensional, 'dimensional_id'>) => 
      dimensionalService.create(data),
    onSuccess: (newDimensional, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.all });
      
      // Update group-specific caches
      if (variables.dimensional_group_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.byGroup(variables.dimensional_group_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.hierarchy(variables.dimensional_group_id) 
        });
      }
      
      // Update parent-specific cache
      if (variables.dimensional_father_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.byParent(variables.dimensional_father_id) 
        });
      }
      
      // Add to cache
      queryClient.setQueryData(
        DIMENSIONAL_KEYS.detail(newDimensional.dimensional_id),
        newDimensional
      );
    },
    onError: (error) => {
      console.error('Error creating dimensional:', error);
    },
  });
};

// Update dimensional mutation
export const useUpdateDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Dimensional> }) =>
      dimensionalService.update(id, data),
    onSuccess: (updatedDimensional, { id, data }) => {
      // Update cache
      queryClient.setQueryData(
        DIMENSIONAL_KEYS.detail(id),
        updatedDimensional
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.lists() });
      
      // Update group-specific caches
      if (data.dimensional_group_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.byGroup(data.dimensional_group_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.hierarchy(data.dimensional_group_id) 
        });
      }
      
      // Update parent-specific cache
      if (data.dimensional_father_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_KEYS.byParent(data.dimensional_father_id) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating dimensional:', error);
    },
  });
};

// Delete dimensional mutation
export const useDeleteDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dimensionalService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: DIMENSIONAL_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.all });
    },
    onError: (error) => {
      console.error('Error deleting dimensional:', error);
    },
  });
};

// Follow data hooks
export const useDimensionalFollowData = (dimensionalId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_KEYS.followData(dimensionalId),
    queryFn: () => ApiService.getDimensionalFollowData(dimensionalId),
    enabled: !!dimensionalId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Bulk operations
export const useBulkDeleteDimensionals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => dimensionalService.delete(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: DIMENSIONAL_KEYS.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.all });
    },
    onError: (error) => {
      console.error('Error bulk deleting dimensionals:', error);
    },
  });
};

// Update dimensional sort order
export const useUpdateDimensionalSort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: number; sort: number }[]) => {
      const promises = items.map(({ id, sort }) =>
        dimensionalService.update(id, { dimensional_sort: sort })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, items) => {
      // Update each item in cache
      items.forEach(({ id }) => {
        queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.detail(id) });
      });
      
      // Invalidate lists to refresh order
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Error updating dimensional sort order:', error);
    },
  });
};

// Search dimensionals
export const useSearchDimensionals = (searchTerm: string, groupId?: number) => {
  return useQuery({
    queryKey: [...DIMENSIONAL_KEYS.all, 'search', searchTerm, { groupId }],
    queryFn: () => dimensionalService.getAll({
      filters: {
        dimensional_name: searchTerm,
        ...(groupId && { dimensional_group_id: groupId })
      }
    }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Toggle active status
export const useToggleDimensionalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      dimensionalService.update(id, { is_active: isActive }),
    onSuccess: (updatedDimensional, { id }) => {
      queryClient.setQueryData(
        DIMENSIONAL_KEYS.detail(id),
        updatedDimensional
      );
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Error toggling dimensional status:', error);
    },
  });
};

// Move dimensional to different group
export const useMoveDimensional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newGroupId }: { id: number; newGroupId: number }) =>
      dimensionalService.update(id, { 
        dimensional_group_id: newGroupId,
        dimensional_father_id: null // Reset parent when moving to new group
      }),
    onSuccess: (updatedDimensional, { id, newGroupId }) => {
      // Update cache
      queryClient.setQueryData(
        DIMENSIONAL_KEYS.detail(id),
        updatedDimensional
      );
      
      // Invalidate affected caches
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_KEYS.lists() });
      queryClient.invalidateQueries({ 
        queryKey: DIMENSIONAL_KEYS.byGroup(newGroupId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: DIMENSIONAL_KEYS.hierarchy(newGroupId) 
      });
    },
    onError: (error) => {
      console.error('Error moving dimensional:', error);
    },
  });
};

export default {
  useDimensionals,
  useDimensional,
  useDimensionalsWithDetails,
  useDimensionalsByGroup,
  useChildDimensionals,
  useDimensionalHierarchy,
  useDimensionalsPaginated,
  useDimensionalsCount,
  useCreateDimensional,
  useUpdateDimensional,
  useDeleteDimensional,
  useDimensionalFollowData,
  useBulkDeleteDimensionals,
  useUpdateDimensionalSort,
  useSearchDimensionals,
  useToggleDimensionalStatus,
  useMoveDimensional,
};