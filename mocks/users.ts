export interface User {
  email: string;
  password: string;
  role: "client" | "provider" | "owner";
  name: string;
  id: string;
  profileImage?: string;
  phone?: string;
}

export const testUsers: User[] = [
  {
    id: "client-1",
    email: "client@test.com",
    password: "client123",
    role: "client",
    name: "Test Client",
    phone: "2125551234",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "provider-1",
    email: "provider@test.com",
    password: "provider123",
    role: "provider",
    name: "Test Provider",
    phone: "2125552345",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "owner-1",
    email: "owner@test.com",
    password: "owner123",
    role: "owner",
    name: "Test Owner",
    phone: "2125553456",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  }
];