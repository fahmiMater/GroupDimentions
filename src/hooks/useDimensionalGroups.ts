import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService, dimensionalGroupService } from '@/services/api';
import { DimensionalGroup, DimensionalGroupWithDetails } from '@/types';

// Query keys for better cache management
const DIMENSIONAL_GROUP_KEYS = {
  all: ['dimensional-groups'] as const,
  lists: () => [...DIMENSIONAL_GROUP_KEYS.all, 'list'] as const,
  list: (filters: any) => [...DIMENSIONAL_GROUP_KEYS.lists(), { filters }] as const,
  details: () => [...DIMENSIONAL_GROUP_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DIMENSIONAL_GROUP_KEYS.details(), id] as const,
  withDetails: (filters: any) => [...DIMENSIONAL_GROUP_KEYS.all, 'with-details', { filters }] as const,
  byCodeDefinition: (codeDefinitionId: number) => 
    [...DIMENSIONAL_GROUP_KEYS.all, 'by-code-definition', codeDefinitionId] as const,
  followData: (groupId: number) => 
    [...DIMENSIONAL_GROUP_KEYS.all, 'follow-data', groupId] as const,
  paginated: (page: number, pageSize: number, options?: any) => 
    [...DIMENSIONAL_GROUP_KEYS.all, 'paginated', { page, pageSize, options }] as const,
};

// Get all dimensional groups
export const useDimensionalGroups = (options?: {
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.list(options),
    queryFn: () => dimensionalGroupService.getAll(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional group by ID
export const useDimensionalGroup = (id: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.detail(id),
    queryFn: () => dimensionalGroupService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional groups with details
export const useDimensionalGroupsWithDetails = (filters?: {
  code_definition_id?: number;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.withDetails(filters),
    queryFn: () => ApiService.getDimensionalGroupsWithDetails(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional group with details by ID
export const useDimensionalGroupWithDetails = (id: number) => {
  return useQuery({
    queryKey: [...DIMENSIONAL_GROUP_KEYS.detail(id), 'with-details'],
    queryFn: () => ApiService.getDimensionalGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dimensional groups by code definition
export const useDimensionalGroupsByCodeDefinition = (codeDefinitionId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.byCodeDefinition(codeDefinitionId),
    queryFn: () => dimensionalGroupService.getAll({
      filters: { code_definition_id: codeDefinitionId }
    }),
    enabled: !!codeDefinitionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get paginated dimensional groups
export const useDimensionalGroupsPaginated = (
  page: number = 1,
  pageSize: number = 10,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  }
) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.paginated(page, pageSize, options),
    queryFn: () => ApiService.getPaginatedData(dimensionalGroupService, page, pageSize, options),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Count dimensional groups
export const useDimensionalGroupsCount = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: [...DIMENSIONAL_GROUP_KEYS.all, 'count', { filters }],
    queryFn: () => dimensionalGroupService.count(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create dimensional group mutation
export const useCreateDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<DimensionalGroup, 'dimensional_group_id'>) => 
      dimensionalGroupService.create(data),
    onSuccess: (newGroup, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.all });
      
      // Update code definition related cache if exists
      if (variables.code_definition_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_GROUP_KEYS.byCodeDefinition(variables.code_definition_id) 
        });
      }
      
      // Add to cache
      queryClient.setQueryData(
        DIMENSIONAL_GROUP_KEYS.detail(newGroup.dimensional_group_id),
        newGroup
      );
    },
    onError: (error) => {
      console.error('Error creating dimensional group:', error);
    },
  });
};

// Update dimensional group mutation
export const useUpdateDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DimensionalGroup> }) =>
      dimensionalGroupService.update(id, data),
    onSuccess: (updatedGroup, { id, data }) => {
      // Update cache
      queryClient.setQueryData(
        DIMENSIONAL_GROUP_KEYS.detail(id),
        updatedGroup
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.withDetails({}) });
      
      // Update code definition related cache if changed
      if (data.code_definition_id) {
        queryClient.invalidateQueries({ 
          queryKey: DIMENSIONAL_GROUP_KEYS.byCodeDefinition(data.code_definition_id) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating dimensional group:', error);
    },
  });
};

// Delete dimensional group mutation
export const useDeleteDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dimensionalGroupService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.all });
    },
    onError: (error) => {
      console.error('Error deleting dimensional group:', error);
    },
  });
};

// Follow data hooks
export const useDimensionalGroupFollowData = (groupId: number) => {
  return useQuery({
    queryKey: DIMENSIONAL_GROUP_KEYS.followData(groupId),
    queryFn: () => ApiService.getDimensionalGroupFollowData(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Bulk operations
export const useBulkDeleteDimensionalGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => dimensionalGroupService.delete(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.all });
    },
    onError: (error) => {
      console.error('Error bulk deleting dimensional groups:', error);
    },
  });
};

// Search dimensional groups
export const useSearchDimensionalGroups = (searchTerm: string) => {
  return useQuery({
    queryKey: [...DIMENSIONAL_GROUP_KEYS.all, 'search', searchTerm],
    queryFn: () => dimensionalGroupService.getAll({
      filters: {
        dimensional_group_name: searchTerm,
      }
    }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Toggle active status
export const useToggleDimensionalGroupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      dimensionalGroupService.update(id, { is_active: isActive }),
    onSuccess: (updatedGroup, { id }) => {
      queryClient.setQueryData(
        DIMENSIONAL_GROUP_KEYS.detail(id),
        updatedGroup
      );
      queryClient.invalidateQueries({ queryKey: DIMENSIONAL_GROUP_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Error toggling dimensional group status:', error);
    },
  });
};

export default {
  useDimensionalGroups,
  useDimensionalGroup,
  useDimensionalGroupsWithDetails,
  useDimensionalGroupWithDetails,
  useDimensionalGroupsByCodeDefinition,
  useDimensionalGroupsPaginated,
  useDimensionalGroupsCount,
  useCreateDimensionalGroup,
  useUpdateDimensionalGroup,
  useDeleteDimensionalGroup,
  useDimensionalGroupFollowData,
  useBulkDeleteDimensionalGroups,
  useSearchDimensionalGroups,
  useToggleDimensionalGroupStatus,
};