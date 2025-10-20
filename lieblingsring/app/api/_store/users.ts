export type User = {
  id: string;
  email: string;
  password: string;   // 데모용: 운영에선 절대 평문 저장 금지(해시 처리 필수)
  name?: string;
  phone?: string;
};

type UsersState = { users: User[] };

const g = globalThis as any;
if (!g.__USERS__) g.__USERS__ = { users: [] as User[] };

export const usersStore: UsersState = g.__USERS__;

