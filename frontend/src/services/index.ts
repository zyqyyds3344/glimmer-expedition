// service 层：所有领域 API 调用统一封装，便于未来替换为真实接口
import { api } from '../api/client';

export interface Me {
  id: number;
  nickname: string;
  avatar: string;
  preference: string;
  energy: number;
  level: number;
  currentInLevel: number;
  needForNext: number;
  shields: number;
  shield_fragments: number;
  title: string;
  stage: 'sprout' | 'growth' | 'legend';
  stageName: string;
  onboarded: boolean;
  onboarding: any | null;
  plan: PlanDay[] | null;
}

export interface PlanDay {
  day: number;
  title: string;
  task: string;
  minutes: number;
  energy: number;
  type: string;
  completed?: boolean;
}

export interface DailyTask {
  id: number;
  card_id: string;
  date: string;
  completed: number;
  card: {
    id: string;
    name: string;
    minutes: number;
    energy: number;
    icon: string;
    desc: string;
    scene?: string;
  };
}

export interface DailyPreview {
  tasks: DailyTask[];
  completed: number;
  total: number;
  rewardEnergy: number;
  rewardFragment: number;
  rewardGrowthPct: number;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  category: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: number | null;
  current: number;
  target: number;
  hint: string;
  ratio: number;
}

// ============ User ============
export const userService = {
  me: () => api.get<Me>('/user/me'),
  list: () => api.get<any[]>('/user/list'),
  updateProfile: (body: { avatar?: string; preference?: string }) => api.put('/user/me', body),
};

// ============ Onboarding ============
export interface OnboardingInput {
  goal: string;
  level: string;
  minutes: number;
  scenes: string[];
  prefs: string[];
}
export const onboardingService = {
  submit: (data: OnboardingInput) => api.post<{ onboarding: OnboardingInput; plan: PlanDay[] }>('/onboarding/submit', data),
  getPlan: () => api.get<{ onboarding: OnboardingInput | null; plan: PlanDay[] | null }>('/onboarding/plan'),
  completeDay: (day: number) => api.post<{ plan: PlanDay[] }>(`/onboarding/plan/complete/${day}`),
};

// ============ Tasks ============
export const taskService = {
  todayPreview: () => api.get<DailyPreview>('/tasks/today/preview'),
  complete: (id: number) => api.post<{ energy: number; fragments: number; shields: number; synthesized: boolean; card: any }>(`/tasks/complete/${id}`),
};

// ============ Sports ============
export const sportService = {
  record: (body: { type: string; duration: number; hour?: number; note?: string }) =>
    api.post<{ energy: number; base: number; multiplier: number; critical: boolean; newAchievements: any[] }>('/sports/record', body),
  list: () => api.get<any[]>('/sports/list'),
  stats: () => api.get<{ byType: Record<string, number>; byDay: Record<string, number>; total: number }>('/sports/stats'),
};

// ============ Achievements ============
export const achievementService = {
  list: () => api.get<Badge[]>('/achievements'),
  recheck: () => api.post<{ unlocked: any[] }>('/achievements/recheck'),
  triggerRain: () => api.post<{ unlocked: any | null }>('/achievements/trigger-rain'),
};

// ============ Social ============
export const socialService = {
  openTeams: () => api.get<any[]>('/teams/open'),
  createTeam: (body: { sport_type: string; duration: number }) => api.post('/teams/create', body),
  joinTeam: (id: number) => api.post<{ host: any }>(`/teams/join/${id}`),
  finishTeam: (id: number) => api.post(`/teams/finish/${id}`),
  myContracts: () => api.get<any[]>('/contracts/mine'),
  createContract: (body: any) => api.post('/contracts/create', body),
  contractCheckin: (id: number) => api.post(`/contracts/checkin/${id}`),
  contractBreach: (id: number) => api.post<{ message: string }>(`/contracts/breach/${id}`),
  contractRescue: (id: number) => api.post(`/contracts/rescue/${id}`),
};

// ============ Lumi ============
export interface LumiPrompt { id: string; q: string }
export interface LumiReply {
  reply: {
    text: string;
    action?: { type: 'soften_today'; tasks: { name: string; minutes: number; energy: number; icon: string }[] };
  };
  promptId: string | null;
}
export const lumiService = {
  prompts: () => api.get<LumiPrompt[]>('/lumi/prompts'),
  ask: (body: { id?: string; text?: string }) => api.post<LumiReply>('/lumi/ask', body),
  adoptSoften: () => api.post<{ ok: boolean }>('/lumi/adopt-soften'),
};
