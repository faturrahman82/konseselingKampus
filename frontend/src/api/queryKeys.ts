export const queryKeys = {
  me: ['me'] as const,
  dashboard: (role: string) => ['dashboard', role] as const,
  notifications: ['notifications'] as const,
  schedules: (search = '', specialization = '') =>
    ['schedules', { search, specialization }] as const,
  appointments: (role: string) => ['appointments', role] as const,
  chatInbox: ['chat', 'inbox'] as const,
  chatMessages: (contactId: string) => ['chat', 'messages', contactId] as const,
}
