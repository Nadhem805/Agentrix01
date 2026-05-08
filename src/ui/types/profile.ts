export interface Profile {
  id: string
  name: string
  avatarPath?: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  profileId: string
  name: string
  timezone: string
  defaultLanguage: string
  createdAt: string
  updatedAt: string
}

export interface CreateProfileData {
  name: string
  avatarPath?: string
}

export interface CreateWorkspaceData {
  name: string
  timezone: string
  defaultLanguage: string
}
