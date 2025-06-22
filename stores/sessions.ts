export interface Registration {
  _id: string
  playerId: string
  status: 'confirmed' | 'waitlist'
  created: string
}

export interface Session {
  _id: string
  date: string
  capacity: number
  registation: Registration[]
}
