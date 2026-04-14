export type Group = {
  id: string
  name: string
  slug: string
  banner_url: string | null
  max_members: number
  delivery_frequency: string
  delivery_day: string | null
  delivery_time: string
  delivery_timezone: string
  is_active: boolean
  created_at: string
}

export type Member = {
  id: string
  group_id: string
  email: string
  name: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  birthday: string | null
  role: 'owner' | 'admin' | 'member'
  invited_by: string | null
  joined_at: string
  onboarded: boolean
  is_active: boolean
}

export type Issue = {
  id: string
  group_id: string
  issue_number: number
  month: string
  banner_url: string | null
  questions_sent_at: string | null
  scheduled_send_date: string | null
  newsletter_sent_at: string | null
  reminder_sent_at: string | null
  minimum_response_rate: number
  pushed_from_issue_id: string | null
  created_at: string
}

export type Question = {
  id: string
  text: string
  category: string
  group_id: string | null
  is_rotating: boolean
  created_at: string
}

export type Answer = {
  id: string
  issue_question_id: string
  member_id: string
  response: string | null
  image_url: string | null
  submitted_at: string
}

export type Photo = {
  id: string
  issue_id: string
  member_id: string
  url: string
  caption: string | null
  uploaded_at: string
}